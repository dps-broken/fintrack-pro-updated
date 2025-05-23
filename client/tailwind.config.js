/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Light Theme (can be customized or use Tailwind defaults)
        'primary-light': '#3498db', // Example primary blue
        'secondary-light': '#2ecc71', // Example secondary green
        'background-light': '#f4f7f6', // Off-white background
        'card-light': '#ffffff',
        'text-light': '#34495e',
        'text-muted-light': '#7f8c8d',

        // Dark Theme
        'primary-dark': '#38bdf8', // Lighter blue for dark mode
        'secondary-dark': '#4ade80', // Lighter green
        'background-dark': '#1e293b', // Dark slate
        'card-dark': '#334155',       // Slightly lighter slate for cards
        'text-dark': '#e2e8f0',       // Light gray text
        'text-muted-dark': '#94a3b8',   // Muted gray
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
        // Add more custom fonts if needed
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        // Add more custom animations
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
        // Define keyframes for animations
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // For better default form styling
  ],
}