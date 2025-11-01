/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#8A2BE2', // BlueViolet
        'secondary': '#4169E1', // RoyalBlue
        'light-bg': 'rgba(255, 255, 255, 0.1)',
        'light-border': 'rgba(255, 255, 255, 0.2)',
      },
      boxShadow: {
        'neumorphic': '9px 9px 16px rgb(0 0 0 / 8%), -9px -9px 16px rgb(255 255 255 / 8%)',
        'neumorphic-inset': 'inset 9px 9px 16px rgb(0 0 0 / 8%), inset -9px -9px 16px rgb(255 255 255 / 8%)',
      }
    },
  },
  plugins: [],
}
