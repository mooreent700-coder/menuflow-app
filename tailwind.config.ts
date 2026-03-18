import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0b0b0d',
        gold: '#d4af37',
        panel: '#151518'
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0,0,0,.18)'
      }
    }
  },
  plugins: []
} satisfies Config;
