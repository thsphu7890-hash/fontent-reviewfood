/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Dòng này cực quan trọng, để nó nhận diện file .jsx
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}