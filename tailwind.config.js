/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#F27329',
      },
      fontFamily: {
        'actonia': ['Actonia', 'sans-serif'],
        'spacemono': ['Spacemono', 'monospace'],
        'syne-extrabold': ['Syne-ExtraBold', 'sans-serif']
      },
      backgroundImage: {
        'condition-gradient': 'linear-gradient(to right, #FF8E4C, #F27329)',
      },
    },
  },
  plugins: [],
}

