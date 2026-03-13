/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        sage: {
          DEFAULT: '#6B8F71',
          hover: '#5f8065',
          subtle: '#f0f5f1',
        },
      },
    },
  },
  plugins: [],
}
