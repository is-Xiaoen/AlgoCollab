import React, { useRef, useEffect } from 'react';
import * as monaco from 'monaco-editor';
import type { Language } from './EditorToolbar';
import { loader } from '@monaco-editor/react';
import { useCollaborationStore } from '../../../stores/collaborationStore';
import { useEditorStore } from '../../../stores/editorStore';
import { EditorToolbar } from './EditorToolbar';
import { EditorStatusBar } from './EditorStatusBar';
loader.config({ monaco })

//配置Monaco loader
interface CodeEditorProps {
  roomId: string;
  language: Language;
  theme?: 'vs-dark' | 'vs-light';
  readonly?: boolean;
  onExecute?: (code: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  roomId,
  language,
  theme = 'vs-dark',
  readonly = false,
  onExecute,
}) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { manager } = useCollaborationStore();
  const { code, setCode, cursorPosition, setCursorPosition } = useEditorStore();

  useEffect(() => {
    if (!containerRef.current) return;

    //创建编译器实例
    const editor = monaco.editor.create(containerRef.current, {
      value: code || '',
      language,
      theme,
      readOnly: readonly,
      automaticLayout: true,
      fontSize: 14,
      minimap: {
        enabled: true,
      },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      formatOnPaste: true,
      formatOnType: true,
      suggestOnTriggerCharacters: true,
      quickSuggestions: {
        other: true,
        comments: true,
        strings: true,
      },
      parameterHints: {
        enabled: true,
      },
      tabSize: 2,
    });
    editorRef.current = editor;
    if (roomId && manager) {
      const model = editor.getModel();
      if (model) {
        manager.bindMonacoEditor(editor, model);
      }
    }

    //监听编译器事件
    setupEditorEvents(editor);

    //注册快捷键
    registerShortcuts(editor);

    return () => {
      editor.dispose();
    }
  }, [roomId, language, theme])



  const setupEditorEvents = (editor: monaco.editor.IStandaloneCodeEditor) => {
    //内容变化
    editor.onDidChangeModelContent((_event) => {
      const value = editor.getValue();
      setCode(value);
    })
    //光标位置变化
    editor.onDidChangeCursorPosition((event) => {
      setCursorPosition({
        lineNumber: event.position.lineNumber,
        column: event.position.column,
      })
    })

    //选区变化
    editor.onDidChangeCursorSelection((event) => {
      const selection = event.selection;
      console.log('Selection changed:', selection);
      //更新选区状态
    })

    //焦点变化
    editor.onDidFocusEditorText(() => {
      console.log('Editor focused');
    })

    editor.onDidBlurEditorText(() => {
      console.log('Editor blurred');
    });

  }
  //注册快捷键
  const registerShortcuts = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      const code = editor.getValue();
      onExecute?.(code)
    })

    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
      () => {
        console.log('save triggered');
      }
    )

    //注释
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash,
      () => {
        editor.trigger('keyboard', 'editor.action.commentLine', {})
      }
    )

  }

  const formatCode = () => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'editor.action.formatDocument', {}
      )
    }
  }


  return (
    <div className="editor-container flex flex-col h-full">
      {/* 工具栏 */}
      <EditorToolbar
        theme={useEditorStore((state) => state.theme)}
        fontSize={useEditorStore((state) => state.fontSize)}
        language={language}
        onFormat={formatCode}
        onThemeChange={(newTheme) => {
          useEditorStore.getState().setTheme(newTheme);
          editorRef.current?.updateOptions({ theme: newTheme });
        }}
        onFontSizeChange={(newSize) => {
          useEditorStore.getState().setFontSize(newSize);
          editorRef.current?.updateOptions({ fontSize: newSize });
        }}
        onLanguageChange={(newLang) => {
          useEditorStore.getState().setLanguage(newLang);
          // 这里可能需要更新 Monaco 的语言模式
          const model = editorRef.current?.getModel();
          if (model) {
            monaco.editor.setModelLanguage(model, newLang);
          }
        }}
      />

      {/* 编辑器 */}
      <div ref={containerRef} className="flex-1" />

      {/* 状态栏 */}
      <EditorStatusBar
        language={language}
        cursorPosition={cursorPosition}
        onlineUsers={useCollaborationStore((state) => state.onlineUsers)}
      />
    </div>
  );
};

export default CodeEditor;