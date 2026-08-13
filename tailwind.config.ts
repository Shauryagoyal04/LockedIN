import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fff4ed',
          100: '#ffe6d4',
          200: '#ffc8a8',
          300: '#ffa172',
          400: '#ff8147',
          500: '#ff5b1f', // primary
          600: '#e64210',
          700: '#c44715',
          800: '#8a2f0e',
          900: '#3a1404',
        },
        // dark surface palette used by auth + dashboard
        ink: {
          DEFAULT: '#f5f3ee',
          muted:   '#b5b2a8',
          subtle:  '#6b6960',
        },
        surface: {
          0: '#050506',
          1: '#0a0a0b',
          2: '#0e0e11',
          3: '#18181d',
        },
        line: {
          DEFAULT: '#232328',
          2:       '#2e2e36',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter-tight)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'brand-glow': '0 8px 24px -8px rgba(255, 91, 31, 0.5)',
      },
    },
  },
  plugins: [],
}

export default config
