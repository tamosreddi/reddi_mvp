import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ['class'],
    content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.css',
  ],
  theme: {
  	extend: {
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
  		},
  		fontFamily: {
  			sans: [
  				'InterVariable',
  				'Inter',
  				'ui-sans-serif',
  				'system-ui',
				'MerriweatherVariable',
				'Merriweather',
  			],
  			merriweather: ['var(--font-merriweather)'],
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			'reddi-top': '#F8F8F8',
			'is-paid-toggle': '#57BAB5',
			'reddi-bottom': '#57BAB5',
			'reddi-background': '#F8F8F8',
			'reddi-bottom-text': '#E6F0EF', // Texto de los botones del bottom navigation
			'reddi-bottom-text-active': '#FACC15', // Texto de los botones del bottom navigation activos
			'reddi-balance-view-dates': '#F7F7F7',
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;

//Good reddi-bottom: #0F2A43 Like Navy Blue
// Good reddi-background: F9FAFB_ This was the pre selected color
// Notion light grey: #F8F8F7
//GOOD 'reddi-bottom': '#5A9D96'
//Navi Blue current button color: 1F2937