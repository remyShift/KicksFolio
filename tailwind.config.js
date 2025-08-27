/** @type {import('tailwindcss').Config} */

module.exports = {
	content: [
		'./src/styles/global.css',
		'./src/app/**/*.{js,jsx,ts,tsx}',
		'./src/components/**/*.{js,jsx,ts,tsx}',
		'./App.tsx',
	],
	presets: [require('nativewind/preset')],
	theme: {
		extend: {
			colors: {
				primary: '#F27329',
				background: '#ECECEC',
				// Nouveau background plus joyeux
				modern: '#F8FAFC',
				'gradient-start': '#F1F5F9',
				'gradient-end': '#E2E8F0',
				// Couleurs d'accent pour des touches colorées
				purple: '#8B5CF6',
				blue: '#3B82F6',
				green: '#10B981',
				pink: '#EC4899',
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
				// Gradients modernes pour le background
				'modern-gradient':
					'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)',
				'revolut-gradient':
					'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
				'warm-gradient':
					'linear-gradient(135deg, #FF9A8B 0%, #A8E6CF 50%, #FFD3A5 100%)',
				'cool-gradient':
					'linear-gradient(135deg, #667EEA 0%, #764BA2 25%, #F093FB 50%, #F5576C 100%)',
				// Gradient subtil avec la couleur primaire
				'brand-gradient':
					'linear-gradient(135deg, #FFF5F0 0%, #FEF3EC 50%, #FFEEE6 100%)',
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
