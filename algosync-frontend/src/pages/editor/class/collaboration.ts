//CRDT集成
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import { editor } from 'monaco-editor';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

//定义协作模式接口
export interface CollaborationOptions {
  roomId: string;
  userId: string;
  username: string;
  color: string;
}

export class CollaborationManager {
  private ydoc: Y.Doc;
  private provider: WebsocketProvider;
  private binding: MonacoBinding | null = null;
  private awareness: any;
  private roomId: string;
  private userId: string;

  constructor(options: CollaborationOptions) {
    this.roomId = options.roomId;
    this.userId = options.userId;

    this.ydoc = new Y.Doc();
    const wsUrl = `${import.meta.env.VITE_WS_URL}/collaboration`;
    this.provider = new WebsocketProvider(
      wsUrl,
      options.roomId,
      this.ydoc,
      {
        params: {
          userId: options.userId,
          username: options.username,
        }
      }
    );
    this.awareness = this.provider.awareness;
    this.awareness.setLocalState({
      user: {
        id: options.userId,
        name: options.username,
        color: options.color,
      },
    })
    this.setupEventListeners();
  }

  //绑定到Monaco编译器
  bindMonacoEditor(
    monacoEditor: editor.IStandaloneCodeEditor,
    model: editor.ITextModel
  ): void {
    const ytext = this.ydoc.getText('monaco');
    this.binding = new MonacoBinding(
      ytext,
      model,
      new Set([monacoEditor]),
      this.awareness
    );
    //设置用户光标模式
    this.setupCursorStyles(monacoEditor);
  }

  //设置光标样式
  private setupCursorStyles(monacoEditor: editor.IStandaloneCodeEditor): void {
    this.awareness.on('change', () => {
      const status = Array.from(this.awareness.getStates().entries());
      // 优化为：
      status.forEach((entry) => {
        const [clientId, state] = entry as [number, any];
        if (clientId === this.awareness.clientID) return;
        const user = state.user;
        if (!user) return;
        this.createCursorDecoration(monacoEditor, clientId, user);
      });
    })
  }

  //设置光标装饰
  private createCursorDecoration(_monacoEditor: editor.IStandaloneCodeEditor, clientId: number, user: any): void {
    const style = document.createElement('style');
    style.textContent = `
    .yRemoteSelection-${clientId} {
        background-color: ${user.color}30;
      }
      .yRemoteSelectionHead-${clientId} {
        position: absolute;
        border-left: 2px solid ${user.color};
        border-top: 2px solid ${user.color};
        height: 20px;
        box-sizing: border-box;
      }
      .yRemoteSelectionHead-${clientId}::after {
        content: "${user.name}";
        position: absolute;
        top: -20px;
        left: 0;
        background-color: ${user.color};
        color: white;
        padding: 2px 4px;
        border-radius: 3px;
        font-size: 12px;
        white-space: nowrap;
      }
    `;
    document.head.appendChild(style);
  }

  private setupEventListeners(): void {
    this.provider.on('status', (event: any) => {
      console.log('connection status', event.status);
    })
    this.provider.on('sync', (isSynced: boolean) => {
      console.log('Sync status', isSynced);
    })
    this.ydoc.on('update', () => {
      console.log('Documet updated')
    })
  }

  getOnlineUsers(): any[] {
    const status = Array.from(this.awareness.getStates().entries());
    return status
      .filter((entry) => {
        const [clientId] = entry as [number, any];
        return clientId !== this.awareness.clientID;
      })
      .map((entry) => {
        const [, state] = entry as [number, any];
        return state.user;
      })
      .filter(Boolean);
  }
  sendMessage(message: string): void {
    const yMessage = this.ydoc.getArray('messages');
    yMessage.push([{
      id: generateId(),
      userId: this.userId,
      message,
      timestamp: Date.now()
    }])
  }

  onMessage(callback: (messages: any[]) => void): void {
    const yMessage = this.ydoc.getArray('messages');
    callback(yMessage.toArray());
    yMessage.observe(() => {
      callback(yMessage.toArray());
    })
  }

  getContent(): string {
    const ytext = this.ydoc.getText('monaco');
    return ytext.toString();
  }

  setContent(content: string): void {
    const ytext = this.ydoc.getText('monaco');
    this.ydoc.transact(() => {
      ytext.delete(0, ytext.length);
      ytext.insert(0, content);
    })
  }

  //销毁
  destroy(): void {
    if (this.binding) {
      this.binding.destroy();
    }
    this.provider.destroy();
    this.ydoc.destroy()
  }

}