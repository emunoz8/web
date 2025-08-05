/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", 
    "./public/index.html",        
  ],
  theme: {
    extend: {
      fontFamily:{
        mono: ['"Courier New"','Courier', 'monospace'],
      },
    }, 
  },
  plugins: [require('@tailwindcss/typography')],
};
