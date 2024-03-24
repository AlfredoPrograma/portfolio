/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		fontFamily: {
			body: ["Outfit Variable", "sans-serif"],
		},
		extend: {
			colors: {
				content: "#374151", // text-gray-700, 
				primary: "#4338ca" // indigo-700
			}
		},
	},
	plugins: [
		require('@tailwindcss/typography')
	],
}
