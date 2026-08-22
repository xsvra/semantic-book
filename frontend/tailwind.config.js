/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#F8FAFC',
          surface: '#FFFFFF',
          muted: '#F1F5F9',
          banner: '#1E293B',
        },
        text: {
          primary: '#0F172A',
          secondary: '#475569',
          muted: '#64748B',
        },
        accent: {
          DEFAULT: '#1E293B',
          hover: '#0F172A',
          soft: '#F1F5F9',
        },
        gold: {
          DEFAULT: '#D97706',
          hover: '#B45309',
          soft: '#FEF3C7',
          light: '#FFFBEB',
        },
        success: '#10B981',
        border: '#E2E8F0',
        focusRing: '#D97706',
      },
      fontFamily: {
        serif: ['Lora', 'Fraunces', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        soft: '0 4px 20px rgba(15, 23, 42, 0.04)',
        hover: '0 12px 32px rgba(15, 23, 42, 0.08)',
        card: '0 8px 24px rgba(217, 119, 6, 0.08)',
      }
    },
  },
  plugins: [],
}
