import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Enterprise Pastel Palette
        'pastel-pink': '#FFADAD',
        'pastel-peach': '#FFD6A5',
        'pastel-yellow': '#FDFFB6',
        'pastel-green': '#CAFFBF',
        // Semantic colors
        primary: {
          DEFAULT: '#FFADAD',
          foreground: '#1a1a1a',
        },
        secondary: {
          DEFAULT: '#FFD6A5',
          foreground: '#1a1a1a',
        },
        tertiary: {
          DEFAULT: '#FDFFB6',
          foreground: '#1a1a1a',
        },
        accent: {
          DEFAULT: '#CAFFBF',
          foreground: '#1a1a1a',
        },
        background: '#ffffff',
        foreground: '#1a1a1a',
        muted: {
          DEFAULT: '#f5f5f5',
          foreground: '#737373',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#1a1a1a',
        },
        border: '#e5e5e5',
        input: '#e5e5e5',
        ring: '#FFADAD',
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.75rem',
        lg: '1rem',
        md: '0.5rem',
        sm: '0.25rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
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
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
    container: {
      center: true,
      padding: '1rem',
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },
    },
  },
  plugins: [],
} satisfies Config;
