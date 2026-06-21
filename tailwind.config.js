/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        'cert-navy': '#1e3a5f',
        'cert-navy-light': '#2a4d7a',
        'cert-navy-dark': '#152a45',
        'cert-gold': '#c9a962',
        'cert-gold-light': '#d9bc7a',
        'cert-gold-dark': '#a8894a',
        'cert-cream': '#faf8f5',
        'cert-cream-dark': '#f0ece5',
        'cert-ink': '#2d2d2d',
      },
      fontFamily: {
        'serif-display': ['"Cormorant Garamond"', 'Georgia', 'serif'],
        'sans-body': ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'certificate': '0 25px 50px -12px rgba(30, 58, 95, 0.25), 0 0 0 1px rgba(201, 169, 98, 0.1)',
        'certificate-hover': '0 35px 60px -15px rgba(30, 58, 95, 0.35), 0 0 0 1px rgba(201, 169, 98, 0.2)',
      },
      backgroundImage: {
        'cert-paper': 'linear-gradient(135deg, #faf8f5 0%, #f0ece5 50%, #faf8f5 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
