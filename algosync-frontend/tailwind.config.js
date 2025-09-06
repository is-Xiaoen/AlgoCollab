/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // 匹配 src 下的所有相关文件
  ],
  theme: {
    extend: {
      animation: {
        'checkmark': 'checkmark 200ms ease-in-out',
        'fade-in': 'fadeIn 200ms ease-in-out',
        'blink': 'blink 1.4s infinite',
      },
      keyframes: {
        checkmark: {
          '0%': { 
            transform: 'scale(0) rotate(45deg)',
            opacity: '0'
          },
          '50%': { 
            transform: 'scale(1.2) rotate(45deg)',
            opacity: '1'
          },
          '100%': { 
            transform: 'scale(1) rotate(0)',
            opacity: '1'
          },
        },
        fadeIn: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(5px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        blink: {
          '0%, 100%': { 
            opacity: '0'
          },
          '50%': { 
            opacity: '1'
          },
        },
      },
    },
  },
  plugins: [],
}