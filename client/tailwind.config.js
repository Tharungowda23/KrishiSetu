/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#245C3A',
          dark: '#1b462c',
          light: '#2d7348',
        },
        agrigreen: {
          50: '#F2F8F1',
          100: '#E9F3E8',
          200: '#C7E2C5',
          500: '#367A4C',
          600: '#245C3A',
          700: '#1b462c',
          800: '#153622',
        },
        cream: {
          50: '#FDFCF7',
          DEFAULT: '#F8F6EE',
          100: '#F5F1E4',
          200: '#EAE3CD',
        },
        agritext: {
          main: '#202820',
          secondary: '#687268',
          muted: '#8C968B',
        },
        agriborder: '#E3E8E1',
        agrierror: '#C0392B',
        agriwarning: '#B7791F',
        agrisuccess: '#2E7D32',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px -1px rgba(32, 40, 32, 0.06), 0 1px 3px -1px rgba(32, 40, 32, 0.04)',
        'card-hover': '0 10px 20px -3px rgba(32, 40, 32, 0.08), 0 4px 6px -2px rgba(32, 40, 32, 0.04)',
      }
    },
  },
  plugins: [],
}
