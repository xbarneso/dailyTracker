module.exports = {
  purge: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        jungle: {
          50: '#f0f9f4',
          100: '#dcf2e3',
          200: '#bce4cb',
          300: '#8fcea8',
          400: '#5aaf7a',
          500: '#38915a',
          600: '#2a7447',
          700: '#235c3a',
          800: '#1f4a31',
          900: '#1a3e29',
          950: '#0d2116',
        },
        earth: {
          50: '#faf7f2',
          100: '#f4ede0',
          200: '#e8d9c0',
          300: '#d9be96',
          400: '#c99d6b',
          500: '#bd8449',
          600: '#ae6f3d',
          700: '#905834',
          800: '#764930',
          900: '#623e2b',
          950: '#341f15',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  variants: {},
  plugins: [],
}
