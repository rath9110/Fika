/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'fika': {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0c1b3',
          400: '#d3a28e',
          500: '#c27e65',
          600: '#ae644b',
          700: '#91513c',
          800: '#784434',
          900: '#643b2e',
          950: '#351d16',
        },
        'cream': '#FDFCF0',
        'espresso': '#2C1B18',
        'brew': '#8B5E3C',
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'ritual': '0 10px 40px -10px rgba(194, 126, 101, 0.15)',
      }
    },
  },
  plugins: [],
}
