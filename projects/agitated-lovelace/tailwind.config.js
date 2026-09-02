/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        titanium: {
          50: '#f8f9fa',
          100: '#e9ecef',
          200: '#dee2e6',
          300: '#ced4da',
          400: '#adb5bd',
          500: '#6c757d',
          600: '#495057',
          700: '#343a40',
          800: '#212529',
          900: '#121416',
          frame: '#2b2d31',
          bezel: '#0a0a0c'
        },
        cyber: {
          neon: '#00f3ff',
          pink: '#ff0055',
          purple: '#9d00ff',
          dark: '#070913',
          card: 'rgba(15, 23, 42, 0.75)'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Outfit', 'Pretendard', 'sans-serif'],
      },
      boxShadow: {
        's24-phone': '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 2px #3a3d45, inset 0 0 0 2px rgba(255,255,255,0.1)',
        'glow-cyan': '0 0 20px rgba(0, 243, 255, 0.4)',
        'glow-pink': '0 0 20px rgba(255, 0, 85, 0.4)',
        'glow-purple': '0 0 20px rgba(157, 0, 255, 0.4)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.8', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
      }
    },
  },
  plugins: [],
}
