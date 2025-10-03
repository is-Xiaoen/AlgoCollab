import { create } from 'zustand'
import type { Language } from '../pages/editor/components/EditorToolbar';
interface CursorPosition {
  lineNumber: number;
  column: number;
}

interface EditorState {
  code: string;
  language: Language;
  theme: 'vs-dark' | 'vs-light';
  fontSize: number;
  cursorPosition: CursorPosition;
  setCode: (code: string) => void;
  setLanguage: (Language: Language) => void;
  setTheme: (theme: 'vs-dark' | 'vs-light') => void;
  setFontSize: (fontsize: number) => void;
  setCursorPosition: (position: CursorPosition) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  code: '',
  language: 'javascript',
  theme: 'vs-dark',
  fontSize: 14,
  cursorPosition: { lineNumber: 1, column: 1 },

  setCode: (code) => set({ code }),
  setLanguage: (language) => set({ language }),
  setTheme: (theme) => set({ theme }),
  setFontSize: (fontSize) => set({ fontSize }),
  setCursorPosition: (cursorPosition) => set({ cursorPosition }),
}))