/** @type {import('tailwindcss').Config} */
import { colors } from '@tailwindcss/colors'

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // あんぴーちゃん専用カラー
        peach: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        'heart-pink': '#f472b6',
        'heart-pink-light': '#fce7f3',
      },
      fontFamily: {
        sans: ['var(--font-m-plus-rounded-1c)', 'M PLUS Rounded 1c', 'Hiragino Maru Gothic Pro', 'BIZ UDPGothic', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Yu Gothic Medium', 'Meiryo', 'sans-serif'],
      },
      borderRadius: {
        'cute': '1rem',
      },
      animation: {
        'gentle-bounce': 'gentle-bounce 2s infinite',
        'heart-beat': 'heart-beat 1.5s ease-in-out infinite',
      },
      keyframes: {
        'gentle-bounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'heart-beat': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        }
      }
    },
  },
  plugins: [],
}