/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        danger: {
          DEFAULT: '#DC3444',
          dark: '#BF2D3A',
        }
      }
    },
    variants: {
      extend: {
        backgroundColor: ['hover'],
      },
    },
  },
  plugins: [],
}

