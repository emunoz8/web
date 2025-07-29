/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Adjust if your source files are elsewhere
    "./public/index.html",        // Include your public HTML if needed
  ],
  theme: {
    extend: {}, // You can customize your theme here
  },
  plugins: [],
};
