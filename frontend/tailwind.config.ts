import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#005bbf',
          container: '#1a73e8',
          fixed: '#d8e2ff',
          'fixed-dim': '#adc7ff',
        },
        secondary: {
          DEFAULT: '#006972',
          container: '#8feefc',
          fixed: '#92f1fe',
          'fixed-dim': '#75d5e2',
        },
        tertiary: {
          DEFAULT: '#005ac0',
          container: '#2a73e1',
          fixed: '#d8e2ff',
          'fixed-dim': '#adc6ff',
        },
        background: '#f8f9fa',
        surface: {
          DEFAULT: '#f8f9fa',
          container: '#edeeef',
          'container-low': '#f3f4f5',
          'container-lowest': '#ffffff',
          'container-high': '#e7e8e9',
          'container-highest': '#e1e3e4',
          variant: '#e1e3e4',
          dim: '#d9dadb',
          bright: '#f8f9fa',
          tint: '#005bc0',
        },
        'on-surface': '#191c1d',
        'on-surface-variant': '#414754',
        'on-background': '#191c1d',
        'on-primary': '#ffffff',
        'on-primary-container': '#ffffff',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#006d77',
        'on-tertiary': '#ffffff',
        'on-tertiary-container': '#ffffff',
        outline: '#727785',
        'outline-variant': '#c1c6d6',
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
        },
        'on-error': '#ffffff',
        'on-error-container': '#93000a',
        inverse: '#f0f1f2',
        inverseSurface: '#2e3132',
        'inverse-on-surface': '#f0f1f2',
        inversePrimary: '#adc7ff',
        'on-primary-fixed': '#001a41',
        'on-primary-fixed-variant': '#004493',
        'on-secondary-fixed': '#001f23',
        'on-secondary-fixed-variant': '#004f56',
        'on-tertiary-fixed': '#001a41',
        'on-tertiary-fixed-variant': '#004494',
      },
      fontFamily: {
        headline: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        label: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
    },
  },
  plugins: [],
};

export default config;
