/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111827',
        mint: '#2dd4bf',
        coral: '#fb7185',
        citrus: '#facc15',
        ocean: '#38bdf8',
        plum: '#a78bfa'
      },
      boxShadow: {
        glow: '0 24px 80px rgba(45, 212, 191, 0.22)'
      }
    }
  },
  plugins: []
};
