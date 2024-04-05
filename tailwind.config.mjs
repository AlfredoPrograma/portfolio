/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

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
			},
			typography(theme) {
				return {
					DEFAULT: {
						css: {
							"code::before": {
								content: 'none'
							},
							"code::after": {
								content: 'none'
							},
							code: {
								color: theme("colors.primary"),
								backgroundColor: theme("colors.gray.200"),
								borderRadius: theme("borderRadius.DEFAULT"),
								paddingInline: theme("spacing[1.5]"),
								paddingBlock: theme("spacing[0.5]")
							}
						}
					}
				}
			}
		},
	},
	plugins: [
		require('@tailwindcss/typography')
	],
}
