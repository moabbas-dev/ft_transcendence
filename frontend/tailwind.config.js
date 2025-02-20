/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'custom-gradient': "radial-gradient(at 11% 41%, var(--main-color) 0%, transparent 60%), radial-gradient(at 33% 40%, #41c9e2 0%, transparent 50%), radial-gradient(at 19% 55%, #ace2e1 0%, transparent 40%), radial-gradient(at 5% 64%, #f7eedd 0%, transparent 30%)"
      },
      animation: {
        buttonEntrance: "buttonEntrance 0.5s ease forwards",
      },
      keyframes: {
        buttonEntrance: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
}

