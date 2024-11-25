/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      gridTemplateColumns: {
        '25': 'repeat(25, minmax(0, 1fr))',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      colors: {
        dark: {
          bg: '#262626',
          border: '#303030',
          text: '#B2B2B2',
          heading: '#F0F6FC'
        }
      }
    },
  },
  plugins: [],
};
