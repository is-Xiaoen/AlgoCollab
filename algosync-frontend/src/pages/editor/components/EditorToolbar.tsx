import React, { useState }  from "react";
import{
  PlayIcon,
  DocumentDuplicateIcon,
  SunIcon,
  MoonIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';

export type Language = 'cpp' | 'java' | 'javascript' | 'python';

interface EditorToolbarProps {
  onFormat:()=>void;
  onThemeChange:(theme:'vs-dark'|'vs-light') => void;
  onFontSizeChange:(size:number) => void;
  onLanguageChange:(language:Language) => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onFormat,
  onThemeChange,
  onFontSizeChange,
  onLanguageChange
})=>{
  const [theme,setTheme] = useState<'vs-dark'|'vs-light'>('vs-dark');
  const [fontSize,setFontSize] = useState(14);
  const [language,setLanguage] = useState<Language>('javascript');

  //切换主题
   const handleThemeToggle = () => {
    const newTheme = theme ==='vs-dark'? 'vs-light':'vs-dark';
    setTheme(newTheme);
    onThemeChange(newTheme);
   }

   //切换字体大小
   const handleFontSizeChange = (delta: number) => {
    const newSize = Math.max(10,Math.min(24,fontSize+delta));
    setFontSize(newSize);
    onFontSizeChange(newSize);
   }

   //切换语言
   const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    onLanguageChange(newLanguage);
   }

   // 语言显示名称映射
   const languageNames: Record<Language, string> = {
    cpp: 'C++',
    java: 'Java',
    javascript: 'JavaScript',
    python: 'Python'
   };

   return (
    <div className="editor-toolbar flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
      <div className="flex items-center space-x-2">
        {/* 语言选择器 */}
        <select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value as Language)}
          className="bg-gray-700 text-gray-300 px-3 py-1.5 rounded text-sm border border-gray-600 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          title="Select Language"
        >
          {(Object.keys(languageNames) as Language[]).map((lang) => (
            <option key={lang} value={lang}>
              {languageNames[lang]}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="toolbar-btn p-2 rounded hover:bg-gray-700 transition-colors"
          title="Run Code (Ctrl+Enter)"
        >
          <PlayIcon className="w-5 h-5 text-green-500" />
        </button>

        <button
          type="button"
          onClick={onFormat}
          className="toolbar-btn p-2 rounded hover:bg-gray-700 transition-colors"
          title="Format Code"
        >
          <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-400" />
        </button>

        <button
          type="button"
          className="toolbar-btn p-2 rounded hover:bg-gray-700 transition-colors"
          title="Copy Code"
        >
          <DocumentDuplicateIcon className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => handleFontSizeChange(-1)}
            className="px-2 py-1 text-sm text-gray-400 hover:bg-gray-700 rounded"
          >
            A-
          </button>
          <span className="text-sm text-gray-400 mx-2">{fontSize}px</span>
          <button
            type="button"
            onClick={() => handleFontSizeChange(1)}
            className="px-2 py-1 text-sm text-gray-400 hover:bg-gray-700 rounded"
          >
            A+
          </button>
        </div>

        <button
          type="button"
          onClick={handleThemeToggle}
          className="p-2 rounded hover:bg-gray-700 transition-colors"
          title="Toggle Theme"
        >
          {theme === 'vs-dark' ? (
            <SunIcon className="w-5 h-5 text-yellow-400" />
          ) : (
            <MoonIcon className="w-5 h-5 text-gray-400" />
          )}
        </button>
      </div>
    </div>
  );

}
