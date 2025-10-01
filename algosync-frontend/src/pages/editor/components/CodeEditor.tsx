import React ,{useRef,useEffect,useState} from 'react';
import * as monaco from 'monaco-editor';
import type { Language } from './EditorToolbar';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  language: Language;
  output: string;
  isRunning: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  language,
  output,
  isRunning
}) => {
  // TODO(human): 这里需要实现代码高亮和自动补全功能
  // 可以考虑集成 Monaco Editor 或 CodeMirror
  
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-semibold text-gray-900">代码编辑器</h3>
          {output && (
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          )}
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>按 Ctrl+Enter 运行代码</span>
        </div>
      </div>
      <div className="flex-1 relative">
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-full p-4 font-mono text-sm leading-6 border-none outline-none resize-none bg-gray-50"
          style={{ 
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            tabSize: 2
          }}
          placeholder="在这里编写你的代码..."
          spellCheck={false}
          onKeyDown={(e) => {
            // 处理 Tab 键
            if (e.key === 'Tab') {
              e.preventDefault();
              const start = e.currentTarget.selectionStart;
              const end = e.currentTarget.selectionEnd;
              const newValue = code.substring(0, start) + '  ' + code.substring(end);
              onChange(newValue);
              // 设置光标位置
              setTimeout(() => {
                e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2;
              }, 0);
            }
          }}
        />
        
        <div className="absolute left-0 top-0 h-full w-12 bg-gray-100 border-r border-gray-200 flex flex-col text-xs text-gray-500 font-mono pt-4">
          {code.split('\n').map((_, index) => (
            <div key={index} className="px-2 leading-6 text-right">
              {index + 1}
            </div>
          ))}
        </div>
      </div>

      <div className="h-48 border-t bg-gray-900 flex flex-col">
        <div className="px-4 py-2 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-semibold text-gray-200">运行结果</h3>
            {isRunning && (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border border-green-400 border-t-transparent mr-1"></div>
                <span className="text-xs text-green-400">运行中...</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4 text-xs text-gray-400">
            <span className="capitalize">{language}</span>
            <span>行 {code.split('\n').length}</span>
          </div>
        </div>
        
        <div className="flex-1 p-4 text-green-400 font-mono text-sm overflow-y-auto">
          {isRunning ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border border-green-400 border-t-transparent mr-2"></div>
              <span>正在运行代码...</span>
            </div>
          ) : output ? (
            <pre className="whitespace-pre-wrap">{output}</pre>
          ) : (
            <div className="text-gray-500">
              点击运行按钮执行代码，结果将在这里显示
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;