/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#667eea',
        'primary-dark': '#5a6fd8',
        secondary: '#764ba2',
        accent: '#8E54E9',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
        'gradient-accent': 'linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)',
      },
    },
  },
  plugins: [],
}
