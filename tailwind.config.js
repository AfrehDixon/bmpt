/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // BMPT Solutions brand palette (shared with bmptbooks design system)
        brand: {
          50: '#e6f7ff',
          100: '#b3e7fd',
          200: '#80d7fb',
          300: '#4dc7f9',
          400: '#1ab7f7',
          500: '#00B0F7',
          600: '#0098d6',
          700: '#0090cc',
          800: '#006fa0',
          900: '#04015A',
          950: '#02003d',
        },
        navy: {
          DEFAULT: '#04015A',
          light: '#0a0872',
          dark: '#02003d',
          mid: '#080566',
        },
        cyan: {
          brand: '#00B0F7',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-plus-jakarta)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.7s ease-out forwards',
        'fade-in': 'fade-in 0.6s ease-out forwards',
        'slide-down': 'slide-down 0.4s ease-out forwards',
        marquee: 'marquee 28s linear infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
