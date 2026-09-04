import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // 1Fi brand purple scale
        brand: {
          50: '#f5f0ff',
          100: '#ece5ff',
          200: '#d9c9ff',
          300: '#bfa2fb',
          400: '#9f6ff2',
          500: '#712CDC',
          600: '#5f2fd1',
          700: '#4f24b0',
          800: '#3f1d8c',
          900: '#2b1568',
          DEFAULT: '#712CDC',
        },
        ink: {
          DEFAULT: '#140e32',
          soft: '#3f3a52',
          muted: '#6b6480',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(20,14,50,0.05)',
        'card-hover': '0 10px 30px rgba(20,14,50,0.10)',
        tab: '0 1px 3px rgba(20,14,50,0.10), 0 0 0 1px rgba(113,44,220,0.08)',
        cta: '0 8px 24px rgba(113,44,220,0.40)',
        sheet: '0 -12px 40px rgba(20,14,50,0.14)',
        ring: '0 0 0 1.5px #712CDC',
      },
      borderRadius: {
        card: '18px',
        xl2: '22px',
        '3xl': '26px',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.35s ease both',
        'slide-up': 'slide-up 0.4s cubic-bezier(0.22,1,0.36,1) both',
        'scale-in': 'scale-in 0.3s cubic-bezier(0.22,1,0.36,1) both',
      },
    },
  },
  plugins: [],
};

export default config;
