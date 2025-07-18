/** @type {import('tailwindcss').Config} */

module.exports = {
	content: [
		'./app/**/*.{js,jsx,ts,tsx}',
		'./components/**/*.{js,jsx,ts,tsx}',
	],
	presets: [require('nativewind/preset')],
	theme: {
		extend: {
			colors: {
				primary: '#F27329',
				background: '#ECECEC',
			},
			fontFamily: {
				actonia: ['Actonia', 'sans-serif'],
				'open-sans': ['OpenSans', 'sans-serif'],
				'syne-extrabold': ['Syne-ExtraBold', 'sans-serif'],
				'syne-semibold': ['Syne-SemiBold', 'sans-serif'],
				'open-sans-bold': ['OpenSans-Bold', 'sans-serif'],
				'open-sans-bold-italic': ['OpenSans-BoldItalic', 'sans-serif'],
			},
			backgroundImage: {
				'condition-gradient':
					'linear-gradient(to right, #FF8E4C, #F27329)',
			},
			boxShadow: {
				card: '4px 6px 0px 0px #F27329',
			},
			backgroundColor: {
				'condition-gradient':
					'linear-gradient(to right, #FF8E4C, #F27329)',
			},
		},
	},
	plugins: [],
};
