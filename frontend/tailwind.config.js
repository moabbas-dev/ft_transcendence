module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts}"],
  theme: {
    extend: {
      colors: {
        pongblue: "#04809F",
        pongdark: "rgb(17, 24, 39)",
        ponghover: "rgb(26, 36, 58)",
      },
      boxShadow: {
        "white-glow": "0 0 50px rgba(255, 255, 255, 0.7)",
      },
      fontFamily: {
        flux: ["Flux", "sans-serif"],
      },
      animation: {
        slideUp: "slideUp 200ms ease-out forwards",
        slideDown: "slideDown 200ms ease-out forwards",
        particle: "particle 3s linear infinite alternate",
        pulse: "pulse 2s infinite",
        float: "float 3s ease-in-out infinite",
        scorePulse: "scorePulse 0.6s ease-in-out",
        borderFlash: "borderFlash 1.5s infinite",
        dividerPulse: "dividerPulse 2s ease-in-out infinite",
        shimmer: "shimmer 2s infinite linear",
      },
      keyframes: {
        slideUp: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(100%)" },
        },
        particle: {
          "0%": { transform: "translate(0, 0)", opacity: "1" },
          "100%": {
            transform: "translate(var(--tx), var(--ty))",
            opacity: "0",
          },
        },
        pulse: {
          "0%": { transform: "scale(1)", opacity: "0.8" },
          "50%": { transform: "scale(1.05)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "0.8" },
        },
        float: {
          "0%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
          "100%": { transform: "translateY(0px)" },
        },
        scorePulse: {
          "0%": { transform: "scale(1)", filter: "brightness(1)" },
          "50%": { transform: "scale(1.3)", filter: "brightness(1.5)" },
          "100%": { transform: "scale(1)", filter: "brightness(1)" },
        },
        borderFlash: {
          "0%": { borderColor: "gold" },
          "50%": {
            borderColor: "yellow",
            boxShadow: "0 0 20px rgba(255, 215, 0, 0.8)",
          },
          "100%": { borderColor: "gold" },
        },
        dividerPulse: {
          "0%": { opacity: "0.6", height: "60%" },
          "50%": { opacity: "1", height: "90%" },
          "100%": { opacity: "0.6", height: "60%" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animated"),
    // require('tailwind-scrollbar')
  ],
};
