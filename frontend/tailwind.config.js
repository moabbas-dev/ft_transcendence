module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts}"],
  theme: {
    extend: {
      colors: {
        pongblue: "#0F6292",//#04809F
        pongdark: "rgb(17, 24, 39)",
        ponghover: "rgb(26, 36, 58)",
        // Podium colors
        gold: '#FFD700',
        silver: '#C0C0C0',
        bronze: '#CD7F32',
      },
      boxShadow: {
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
        fadeIn: 'fadeIn 0.5s ease-out',
        fadeOut: 'fadeOut 0.3s ease-out forwards',
        floatIn: 'floatIn 0.5s ease-out forwards',
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
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' }
        },
        floatIn: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        fadeOut: {
          'from': { opacity: '1' },
          'to': { opacity: '0' }
        },
      },
    },
  },
  plugins: [
    function({ addComponents }) {
      const components = {
        '.btn-shine': {
          '&::after': {
            content: "''",
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.2), transparent)',
            transform: 'rotate(45deg)',
            transition: 'all 0.3s ease',
          },
          '&:hover::after': {
            left: '100%',
          }
        }
      }
      addComponents(components)
    },
    function ({ addUtilities }) {
      const newUtilities = {
        '.animation-delay-100': { 'animation-delay': '0.1s' },
        '.animation-delay-200': { 'animation-delay': '0.2s' },
        '.animation-delay-300': { 'animation-delay': '0.3s' },
      };
      addUtilities(newUtilities, ['responsive']);
    },
    require("tailwindcss-animated"),
    function({ addVariant }) {
      addVariant('portrait', '@media (orientation: portrait)');
    }
  ],
};
