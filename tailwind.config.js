/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fredoka One"', 'cursive'],
        body: ['"Nunito"', 'sans-serif'],
        pixel: ['"Press Start 2P"', 'monospace'],
      },
      colors: {
        forest: {
          darkest: '#050f05',
          dark: '#0d1f0d',
          mid: '#1a3a1a',
          light: '#2d5a27',
          bright: '#22c55e',
          pale: '#86efac',
        },
        sky: {
          dawn: '#fbbf24',
          day: '#0ea5e9',
          dusk: '#7c3aed',
          mist: '#d1fae5',
        },
        wood: {
          dark: '#451a03',
          mid: '#92400e',
          light: '#d97706',
        },
        gold: {
          dark: '#b45309',
          mid: '#f59e0b',
          bright: '#fcd34d',
          glow: '#fef9c3',
        },
        danger: '#ef4444',
        success: '#22c55e',
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'float-slow': 'float 7s ease-in-out infinite',
        'sway': 'sway 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'bounce-gentle': 'bounceGentle 1.5s ease-in-out infinite',
        'cloud-drift': 'cloudDrift 20s linear infinite',
        'descend': 'descend 1.2s cubic-bezier(0.4,0,0.2,1) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        sway: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(34,197,94,0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(34,197,94,0.8), 0 0 60px rgba(34,197,94,0.3)' },
        },
        slideUp: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          from: { transform: 'translateY(-20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        cloudDrift: {
          from: { transform: 'translateX(-200px)' },
          to: { transform: 'translateX(calc(100vw + 200px))' },
        },
        descend: {
          from: { transform: 'translateY(0)' },
          to: { transform: 'translateY(-40%)' },
        },
      },
      backgroundImage: {
        'forest-gradient': 'linear-gradient(180deg, #0d1f0d 0%, #1a3a1a 50%, #2d5a27 100%)',
        'sky-gradient': 'linear-gradient(180deg, #0ea5e9 0%, #7dd3fc 40%, #fbbf24 80%, #fde68a 100%)',
        'hero-gradient': 'linear-gradient(180deg, #0ea5e9 0%, #fbbf24 35%, #2d5a27 65%, #0d1f0d 100%)',
      },
    },
  },
  plugins: [],
}
