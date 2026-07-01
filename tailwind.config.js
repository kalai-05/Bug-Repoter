/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx,html}', './popup.html'],
  theme: {
    extend: {
      colors: {
        mat: {
          primary: '#5B5FCF',
          'primary-dark': '#4849B8',
          'primary-light': '#EEF0FF',
          'primary-container': '#E8E7FF',
          'on-primary': '#FFFFFF',
          'on-primary-container': '#1A1A6E',
          surface: '#FFFFFF',
          bg: '#F5F5FF',
          'on-surface': '#1C1B1F',
          'on-surface-var': '#49454F',
          muted: '#9EA3AF',
          outline: '#C8C5D0',
          'outline-var': '#EAE7F2',
          error: '#B3261E',
          'error-light': '#FEE8E7',
          'error-container': '#F9DEDC',
          success: '#198754',
          'success-light': '#DCFCE7',
          'success-container': '#C3F0AB',
        },
        priority: {
          urgent: '#EF4444',
          high: '#F97316',
          normal: '#6366F1',
          low: '#9CA3AF',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      fontSize: {
        '2xs': ['10px', '14px'],
        xs: ['11px', '16px'],
        sm: ['13px', '18px'],
        base: ['14px', '20px'],
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '8px',
        md: '10px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },
      boxShadow: {
        field: '0 1px 2px rgba(0,0,0,0.06)',
        'field-focus': '0 0 0 3px rgba(91,95,207,0.18)',
        card: '0 1px 4px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.10), 0 0 1px rgba(0,0,0,0.04)',
        btn: '0 1px 3px rgba(91,95,207,0.30), 0 1px 2px rgba(91,95,207,0.20)',
        'btn-hover': '0 3px 8px rgba(91,95,207,0.36), 0 1px 3px rgba(91,95,207,0.24)',
      },
      transitionTimingFunction: {
        material: 'cubic-bezier(0.2, 0, 0, 1)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
      },
      width: {
        popup: '420px',
      },
    },
  },
  plugins: [],
};
