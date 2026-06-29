/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F5F5F0',
        card: '#F0E8D8',
        border: '#2C1810',
        green: {
          DEFAULT: '#2D6A2D',
          400: '#3A8A3A',
          500: '#2D6A2D',
          600: '#1A4A1A',
          700: '#0F3A0F',
        },
        yellow: { DEFAULT: '#D4A843' },
        red: { DEFAULT: '#C0392B' },
        textPrimary: '#1A0A00',
        textSecondary: '#4A3728',
        retro: {
          bg: '#F5F5F0',
          card: '#F0E8D8',
          cream: '#E8DCC8',
          yellow: '#D4A843',
          red: '#C0392B',
          blue: '#F39C12',
          green: '#2D6A2D',
          dark: '#2C1810',
          text: '#1A0A00',
          muted: '#4A3728',
        }
      },
      fontFamily: {
        sans: ["'Space Grotesk'", 'monospace'],
        retro: ["'Space Grotesk'", 'monospace'],
        pixel: ["'Press Start 2P'", 'monospace'],
        mono: ["'VT323'", 'monospace'],
      },
      boxShadow: {
        'retro': '4px 4px 0px #2C1810',
        'retro-sm': '2px 2px 0px #2C1810',
        'retro-lg': '6px 6px 0px #2C1810',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
