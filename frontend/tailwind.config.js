/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        uok: {
          navy: '#0c2340',
          blue: '#163a66',
          green: '#007a3d',
          gold: '#d4af37',
          light: '#f4f7fb',
        }
      }
    },
  },
  plugins: [],
};
