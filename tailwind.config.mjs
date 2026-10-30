/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        palette: {
          alabaster: '#EFECE3',
          sky: '#8FABD4',
          cobalt: '#4A70A9',
          obsidian: '#000000',
          darkCard: '#111823',
          darkBox: '#0B1017',
        },
        theme: {
          bg: 'var(--color-bg)',
          card: 'var(--color-card)',
          box: 'var(--color-box)',
          text: 'var(--color-text)',
          muted: 'var(--color-muted)',
          accent: 'var(--color-accent)',
          border: 'var(--color-border)',
          btn: 'var(--color-btn)',
          btnHover: 'var(--color-btn-hover)',
          btnText: 'var(--color-btn-text)',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'soundwave-1': 'soundwave 1.2s ease-in-out infinite',
        'soundwave-2': 'soundwave 0.9s ease-in-out 0.2s infinite',
        'soundwave-3': 'soundwave 1.4s ease-in-out 0.4s infinite',
        'soundwave-4': 'soundwave 1.1s ease-in-out 0.1s infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { transform: 'scale(1)', borderColor: '#4A70A9' },
          '50%': { transform: 'scale(1.008)', borderColor: '#8FABD4' },
        },
        soundwave: {
          '0%, 100%': { height: '15%' },
          '50%': { height: '95%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
};
