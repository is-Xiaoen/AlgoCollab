import {create } from 'zustand';
import { CollaborationManager } from '../pages/editor/class/collaboration';

interface CollaborationUser{
  id:string;
  name:string;
  color:string;
  cursor?:{
    line: number;
    column: number;
  };
  selection?:{
    startLine:number;
    startColumn:number;
    endLine:number;
    endColum:number;
  }
}

interface CollaborationState{
  manager: CollaborationManager|null;
  isConnected: boolean;
  isSynced:boolean;
  onlineUsers:CollaborationUser[];
  // messages:ChatMessage[];
  initCollaboration:(option:any)=>void;
  sendMessage:(message:string)=>void;
  updateCursor:(position:any)=>void;
  updateSelection:(selection:any)=>void;
  destroy:()=>void;
}

export const useCollaborationStore = create<CollaborationState>((set, get) => ({
  manager: null,
  isConnected: false,
  isSynced: false,
  onlineUsers: [],
  messages: [],

  initCollaboration: (options) => {
    const manager = new CollaborationManager(options);
    
    // 监听在线用户
    setInterval(() => {
      const users = manager.getOnlineUsers();
      set({ onlineUsers: users });
    }, 1000);
    
    // 监听消息
    manager.onMessage((messages) => {
      // set({ messages });
    });
    
    set({ manager, isConnected: true });
  },

  sendMessage: (message) => {
    const { manager } = get();
    manager?.sendMessage(message);
  },

  updateCursor: (position) => {
    const { manager } = get();
    // 更新光标位置
  },

  updateSelection: (selection) => {
    const { manager } = get();
    // 更新选区
  },

  destroy: () => {
    const { manager } = get();
    manager?.destroy();
    set({ 
      manager: null, 
      isConnected: false,
      onlineUsers: [],
      // messages: [],
    });
  },
}));