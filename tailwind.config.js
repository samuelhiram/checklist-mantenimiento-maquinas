/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
    './src/store/**/*.{js,ts,jsx,tsx,mdx}',
    './src/hooks/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'bg-emerald-500/15',
    'bg-cyan-500/15',
    'bg-violet-500/15',
    'bg-blue-500/15',
    'bg-amber-500/15',
    'bg-rose-500/15',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
        display: ['var(--font-display)', 'system-ui'],
      },
      colors: {
        brand: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        surface: {
          0:   '#0a0e1a',
          50:  '#0f1422',
          100: '#141929',
          200: '#1c2235',
          300: '#242b40',
          400: '#2d364d',
          500: '#3a4460',
          600: '#4a5578',
        },
        accent: {
          cyan:    '#22d3ee',
          emerald: '#34d399',
          amber:   '#fbbf24',
          rose:    '#fb7185',
          violet:  '#a78bfa',
        },
      },
      boxShadow: {
        'glow-cyan':    '0 0 20px rgba(34,211,238,0.15)',
        'glow-emerald': '0 0 20px rgba(52,211,153,0.15)',
        'glow-amber':   '0 0 20px rgba(251,191,36,0.15)',
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")",
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-up':  'fadeUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        slideIn: {
          '0%':   { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)',     opacity: '1' },
        },
        fadeUp: {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
