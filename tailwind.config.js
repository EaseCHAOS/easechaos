/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Remove these entries
      keyframes: {
        trace: {
          // ... trace keyframes
        }
      },
      animation: {
        'trace': 'trace 4s linear infinite',
      }
      // Keep any other config entries you have
    }
  },
  plugins: [],
};
