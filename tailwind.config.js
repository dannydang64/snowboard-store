/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0F4C81',
        secondary: '#3A86FF',
        accent: '#FF006E',
        background: '#F8F9FA',
        snow: '#FFFFFF',
      },
    },
  },
  plugins: [],
}
