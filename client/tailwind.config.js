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
        // Light Theme - blue to purple shades
        'primary-light': '#6EB7FA',     // Soft Sky Blue
        'secondary-light': '#9E7BFB',   // Medium Purple
        'tertiary-light': '#82DFEE',    // Light Cyan
        'background-light': '#EAF6FF',  // Very Light Blue (almost white)
        'card-light': '#FFFFFF',        // Pure White for cards
        'text-light': '#1F2937',        // Dark slate gray for text
        'text-muted-light': '#64748B',  // Muted blue-gray for secondary text

        // Dark Theme - darker blue-purple shades + black
        'primary-dark': '#3B82F6',      // Stronger Blue
        'secondary-dark': '#7C3AED',    // Dark Purple
        'tertiary-dark': '#22D3EE',     // Bright Cyan
        'background-dark': '#000000',   // Pure Black background added
        'card-dark': '#121212',         // Very dark near-black card background
        'text-dark': '#E0E7FF',         // Light blue text
        'text-muted-dark': '#94A3B8',   // Muted gray-blue
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out forwards',
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
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
