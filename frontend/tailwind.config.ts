import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B82F6',
          dark: '#60A5FA',
        },
        success: {
          DEFAULT: '#10B981',
          dark: '#34D399',
        },
        warning: {
          DEFAULT: '#F59E0B',
          dark: '#FBBF24',
        },
        danger: {
          DEFAULT: '#EF4444',
          dark: '#F87171',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        cht: ['var(--font-noto-sans-sc)', 'sans-serif'],
      },
      borderRadius: {
        button: '6px',
        card: '8px',
        input: '6px',
      },
      spacing: {
        xs: '8px',
        sm: '12px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
      },
    },
  },
  plugins: [],
};

export default config;
