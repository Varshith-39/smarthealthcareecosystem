/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        health: {
          primary: '#0284c7', // vibrant cyan/sky blue
          secondary: '#0f766e', // deep teal
          dark: '#0f172a', // slate dark
          light: '#f8fafc',
          card: '#ffffff',
          accent: '#06b6d4',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -2px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 12px 30px -4px rgba(2, 132, 199, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}
