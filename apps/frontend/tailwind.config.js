/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Orbitron"', 'monospace'],
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        surface: {
          DEFAULT: 'rgba(10, 12, 16, 1)',
          card: 'rgba(15, 18, 24, 1)',
          border: 'rgba(26, 32, 48, 1)',
          hover: 'rgba(21, 27, 38, 1)',
        },
        accent: {
          cyan: 'var(--color-cyan)',
          green: 'var(--color-green)',
          amber: 'var(--color-amber)',
          red: 'var(--color-red)',
          purple: 'var(--color-purple)',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(var(--color-cyan-rgb), 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(var(--color-cyan-rgb), 0.5)' },
        },
      },
    },
  },
  plugins: [],
};
