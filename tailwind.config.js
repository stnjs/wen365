/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				primary: {
					50: "hsl(var(--primary-50))",
					100: "hsl(var(--primary-100))",
					200: "hsl(var(--primary-200))",
					300: "hsl(var(--primary-300))",
					400: "hsl(var(--primary-400))",
					500: "hsl(var(--primary-500))",
					600: "hsl(var(--primary-600))",
					700: "hsl(var(--primary-700))",
					800: "hsl(var(--primary-800))",
					900: "hsl(var(--primary-900))",
				},
				crypto: {
					green: "hsl(var(--crypto-green))",
					red: "hsl(var(--crypto-red))",
					yellow: "hsl(var(--crypto-yellow))",
					purple: "hsl(var(--crypto-purple))",
				},
			},
			fontFamily: {
				sans: ["Inter", "system-ui", "sans-serif"],
				mono: ["JetBrains Mono", "monospace"],
			},
			animation: {
				"pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
				"bounce-slow": "bounce 2s infinite",
			},
		},
	},
	plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
