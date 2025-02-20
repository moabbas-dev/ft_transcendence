module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts}',
  ],
  theme: {
    extend: {
    },
  },
  plugins: [
    require('tailwindcss-animated')
  ],
}
