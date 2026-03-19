/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        achieved: {
          DEFAULT: '#16a34a',
          bg: '#f0fdf4',
          border: '#bbf7d0',
        },
        unachieved: {
          DEFAULT: '#dc2626',
          bg: '#fef2f2',
          border: '#fecaca',
        },
        warning: {
          DEFAULT: '#d97706',
          bg: '#fffbeb',
          border: '#fde68a',
        },
      },
    },
  },
  plugins: [],
}
