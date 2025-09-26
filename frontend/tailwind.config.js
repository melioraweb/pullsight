import colors from 'tailwindcss/colors'

/** @type {import('tailwindcss').Config} */
export default {
	content: [
		'./resources/**/*.blade.php',
		'./resources/**/*.js',
		'./resources/**/*.vue',
	],
	theme: {
		container: {
			center: true,
			padding: '1rem',
			screens: {
				sm: '640px',
				md: '768px',
				lg: '1024px',
				xl: '1280px',
				'2xl': '1577px',
			},
		},
		extend: {
			colors: {
			},
			keyframes: {
				'stripes': {
					'0%': { backgroundPosition: '0 0' },
					'100%': { backgroundPosition: '1rem 0' },
				},
			},
			animation: {
				'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'stripes': 'stripes 1s linear infinite',
			},
			backgroundImage: {
				'stripes': `linear-gradient(
					135deg,
					rgba(24,24,24,1) 25%,
					transparent 25%,
					transparent 50%,
					rgba(24,24,24,1) 50%,
					rgba(24,24,24,1) 75%,
					transparent 75%,
					transparent
				)`,
			},
		},
	},
	plugins: [],
};