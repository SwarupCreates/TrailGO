import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Google Sans Flex"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        asphalt: '#111827',
        signal: '#f97316',
        terrain: '#22c55e',
        water: '#0ea5e9',
      },
      boxShadow: {
        panel: '0 12px 40px rgb(15 23 42 / 0.16)',
      },
    },
  },
  plugins: [],
} satisfies Config;
