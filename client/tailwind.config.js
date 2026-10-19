/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'veltrix-bg': '#FBFBF9',
        'veltrix-card': '#F5F3EF',
        'veltrix-primary': '#2D3A2D',
        'veltrix-primary-light': '#4A5D4E',
        'veltrix-accent': '#9B5A46',
        'veltrix-charcoal': '#1A1A1A',
        'veltrix-graphite': '#706F6C',
        'veltrix-border': '#E5E2DC',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
