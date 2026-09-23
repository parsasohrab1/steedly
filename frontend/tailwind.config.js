/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Steedly brand palette — see /brand/BRAND.md
        primary: {
          50: '#effaf8',
          100: '#d5f1ec',
          200: '#abe2d9',
          300: '#74cbbe',
          400: '#3fae9f',
          500: '#1f9284',
          600: '#0f766e',
          700: '#0c5f59',
          800: '#0b4c48',
          900: '#0a3f3c',
          950: '#042624',
        },
        // Heartbeat gold: decoration and highlights only, never body text on white
        accent: {
          100: '#fcebc4',
          300: '#f7cf7a',
          400: '#f2b544',
          500: '#e09b1a',
          700: '#9a6a00',
        },
        ink: '#0b2e2c',
      },
      fontFamily: {
        sans: ['var(--font-vazir)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

