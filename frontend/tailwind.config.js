module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        pongblue: '#04809F',
        pongdark: 'rgb(17, 24, 39)',
        ponghover: 'rgb(26, 36, 58)'
      },
      fontFamily: {
        flux: ['Flux', 'sans-serif'],
      },
      animation: {
        slideUp: 'slideUp 200ms ease-out forwards',
        slideDown: 'slideDown 200ms ease-out forwards',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100%)' },
        }
      }
    },
  },
  plugins: [
    require('tailwindcss-animated'),
    // require('tailwind-scrollbar')
  ],
}
