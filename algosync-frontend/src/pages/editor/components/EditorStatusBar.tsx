  import React from 'react';
  import type { Language } from './EditorToolbar';

  interface EditorStatusBarProps {
    language: Language;
    cursorPosition: { lineNumber: number; column: number };
    onlineUsers: any[];
  }

  export const EditorStatusBar: React.FC<EditorStatusBarProps> = ({
    language,
    cursorPosition,
    onlineUsers,
  }) => {
    return (
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-1 flex
  items-center justify-between text-xs text-gray-400">
        <div className="flex items-center space-x-4">
          <span>Ln {cursorPosition.lineNumber}, Col
  {cursorPosition.column}</span>
          <span>{language.toUpperCase()}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span>{onlineUsers.length} online</span>
        </div>
      </div>
    );
  };