/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'theme-dark': 'rgb(var(--theme-dark) / <alpha-value>)',
        'theme-panel': 'var(--theme-panel)',
        'theme-neon': 'rgb(var(--theme-neon) / <alpha-value>)',
        'theme-neon-glow': 'var(--theme-neon-glow)',
        'theme-text': 'rgb(var(--theme-text) / <alpha-value>)',
        'theme-muted': 'rgb(var(--theme-muted) / <alpha-value>)',
        'theme-danger': '#ef4444',
        'theme-success': 'rgb(var(--theme-success) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Rajdhani', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 10px var(--theme-neon-glow), inset 0 0 4px rgba(0, 0, 0, 0.3)',
        'neon-strong': '0 0 20px var(--theme-neon), inset 0 0 8px var(--theme-neon-glow)',
      }
    },
  },
  plugins: [],
}
