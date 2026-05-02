/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
      },
      colors: {
        'pixel-green': '#00ff41',
        'pixel-dark': '#0a0a0a',
        'pixel-darker': '#050505',
        'pixel-gray': '#1a1a1a',
        'pixel-border': '#00ff41',
        'pixel-red': '#ff3131',
        'pixel-yellow': '#ffd700',
        'pixel-blue': '#00bfff',
        'pixel-orange': '#ff8c00',
      },
      animation: {
        'blink': 'blink 1s step-start infinite',
        'scan': 'scan 8s linear infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}
