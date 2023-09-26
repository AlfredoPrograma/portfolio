/** @type {import('tailwindcss.Config} */

const colors = require('tailwindcss/colors')

module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		fontFamily: {
			'body': ['Mukta']
		},
		extend: {
			animation: {
				'colorized-ping': 'colorized-ping 12s ease-in-out infinite',
			},
			keyframes: {
				'colorized-ping': {
					'0%': { color: colors.blue[500] },
					'25%': { color: colors.orange[500] },
					'50%': { color: colors.emerald[500] },
					'75%': { color: colors.red[500] },
					'100%': { color: colors.blue[500] },
				}
			}
		},
	},
	plugins: [],
}
