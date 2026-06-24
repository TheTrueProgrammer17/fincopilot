/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0F172A',
        card: '#1E293B',
        border: '#334155',
        green: {
          DEFAULT: '#22C55E',
          400: '#4ade80',
          500: '#22C55E',
          600: '#16a34a',
          700: '#15803d',
        },
        yellow: { DEFAULT: '#F59E0B' },
        red: { DEFAULT: '#EF4444' },
        textPrimary: '#F8FAFC',
        textSecondary: '#94A3B8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
