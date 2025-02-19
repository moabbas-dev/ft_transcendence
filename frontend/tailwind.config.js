/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}", 
    "./public/**/*.html"
  ],
  theme: {
    extend: {
      backgroundImage: {
        'custom-gradient': "radial-gradient(at 11% 41%, var(--main-color) 0%, transparent 60%), radial-gradient(at 33% 40%, #41c9e2 0%, transparent 50%), radial-gradient(at 19% 55%, #ace2e1 0%, transparent 40%), radial-gradient(at 5% 64%, #f7eedd 0%, transparent 30%)"
      }
    },
  },
  plugins: [],
}

