/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#0f1115',
          800: '#141821',
          700: '#1a1f2b',
          600: '#222836',
          500: '#3a4150',
          400: '#6b7280'
        },
        mist: {
          50: '#f7f8fb',
          100: '#eef1f7',
          200: '#dbe2ee',
          300: '#c0cada'
        },
        accent: {
          500: '#ff5f3a',
          600: '#e94a28'
        }
      },
      boxShadow: {
        soft: '0 10px 30px rgba(15, 17, 21, 0.08)',
        glow: '0 0 0 1px rgba(255, 95, 58, 0.25), 0 10px 30px rgba(255, 95, 58, 0.2)'
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
