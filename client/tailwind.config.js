/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAFAF9',
        surface: '#FFFFFF',
        'text-primary': '#18181B',
        'text-secondary': '#71717A',
        accent: {
          DEFAULT: '#7C6CF2',
          hover: '#6A58E8',
          subtle: '#F2F0FE',
        },
        border: '#EAEAEA',
        success: {
          DEFAULT: '#16A34A',
          subtle: '#F0FDF4',
        },
        warning: {
          DEFAULT: '#D97706',
          subtle: '#FFFBEB',
        },
        error: {
          DEFAULT: '#DC2626',
          subtle: '#FEF2F2',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        card: '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 1px 4px -1px rgba(0, 0, 0, 0.03)',
      },
    },
  },
  plugins: [],
}

