/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      // =========================================
      // COLOR PALETTE — Verbito brand
      // =========================================
      colors: {
        terracotta: {
          50: '#FDEDE6',
          100: '#FBD7C8',
          200: '#F6B198',
          300: '#F08B67',
          400: '#EC7450',
          500: '#E8623D', // PRIMARY
          600: '#C94E2C',
          700: '#A33E22',
          800: '#7A2D17',
        },
        saffron: {
          50: '#FEF7E3',
          100: '#FCEBB7',
          200: '#F9D97A',
          300: '#F7CB5B',
          400: '#F5C04A',
          500: '#F5B948', // SECONDARY
          600: '#D89A28',
          700: '#A8761A',
        },
        sage: {
          50: '#E9F3EE',
          100: '#C9E2D4',
          200: '#A1CCB5',
          300: '#7AB89B', // ACCENT / success
          500: '#4E9978',
          700: '#2E6B52',
        },
        berry: {
          300: '#E07C99',
          500: '#C2456E', // WARN / wrong
          700: '#8C2A4D',
        },
        ink: {
          50: '#F5EEE2',
          100: '#ECE2D5',
          200: '#D6CABF',
          300: '#B5A89E',
          500: '#7A6A60',
          700: '#4D3E36',
          900: '#2A1F1A',
        },
        cream: {
          DEFAULT: '#FBF4E6',
          deep: '#F5EAD2',
        },
        paper: '#FFFBF1',
        'white-warm': '#FFFCF7',
        // Semantic warn-soft (berry doesn't map cleanly to 8% opacity)
        'warn-soft': '#FBE6EC',

        // ---- brand-* aliases (practice-page design tokens) ----
        brand: {
          dark:   '#2A1F1A', // = ink-900
          bg:     '#FBF4E6', // = cream
          card:   '#FFFBF1', // = paper
          orange: '#E8623D', // = terracotta-500
          yellow: '#F7CB5B', // = saffron-300
          muted:  '#7A6A60', // = ink-500
        },
      },

      // =========================================
      // TYPOGRAPHY
      // =========================================
      fontFamily: {
        display:    ['"Bricolage Grotesque"', 'system-ui', '-apple-system', 'sans-serif'],
        bricolage:  ['"Bricolage Grotesque"', 'system-ui', '-apple-system', 'sans-serif'],
        body:       ['Nunito', 'system-ui', '-apple-system', 'sans-serif'],
        mono:       ['"JetBrains Mono"', 'ui-monospace', '"Courier New"', 'monospace'],
      },
      fontSize: {
        micro:    ['12px', { lineHeight: '16px' }],
        overline: ['12px', { lineHeight: '14px' }],
        small:    ['14px', { lineHeight: '20px', fontWeight: '600' }],
        bodyL:    ['18px', { lineHeight: '28px' }],
        verb:     ['22px', { lineHeight: '28px', fontWeight: '700' }],
        h4:       ['18px', { lineHeight: '24px', fontWeight: '700' }],
        h3:       ['24px', { lineHeight: '30px', fontWeight: '600' }],
        h2:       ['36px', { lineHeight: '40px', fontWeight: '700' }],
        h1:       ['56px', { lineHeight: '60px', fontWeight: '700' }],
        // Hero / display sizes
        '22':     ['22px', { lineHeight: '28px' }],
        '40':     ['40px', { lineHeight: '44px' }],
        '48':     ['48px', { lineHeight: '52px' }],
        '64':     ['64px', { lineHeight: '64px' }],
      },
      letterSpacing: {
        'tightest':  '-0.03em',
        'tight-2':   '-0.02em',
        'tight-15':  '-0.015em',
        'tight-1':   '-0.01em',
        'wide-04':   '0.04em',
        'wide-08':   '0.08em',
        'wide-10':   '0.10em',
      },

      // =========================================
      // BORDER RADIUS
      // =========================================
      borderRadius: {
        'xs':   '4px',
        'sm':   '8px',
        'md':   '14px',
        'lg':   '20px',
        'xl':   '28px',
        'pill': '999px',
      },

      // =========================================
      // SHADOWS — warm-tinted + "stamped" offset
      // =========================================
      boxShadow: {
        'vb-sm': '0 1px 0 rgba(42,31,26,0.06), 0 2px 6px rgba(232,98,61,0.08)',
        'vb-md': '0 2px 0 rgba(42,31,26,0.08), 0 8px 24px rgba(232,98,61,0.10)',
        'vb-lg': '0 4px 0 rgba(42,31,26,0.10), 0 24px 48px rgba(232,98,61,0.14)',
        'stamp':                '0 3px 0 #2A1F1A',
        'stamp-sm':             '0 2px 0 #2A1F1A',
        'stamp-hover':          '0 4px 0 #2A1F1A',
        'stamp-big':            '0 4px 0 #2A1F1A',
        'stamp-big-hover':      '0 6px 0 #2A1F1A',
        'stamp-primary':        '0 3px 0 #A33E22',
        'stamp-primary-hover':  '0 4px 0 #A33E22',
        'stamp-success':        '0 3px 0 #2E6B52',
        'stamp-success-hover':  '0 4px 0 #2E6B52',
        'inset': 'inset 0 1px 0 rgba(42,31,26,0.06), inset 0 2px 4px rgba(42,31,26,0.04)',
      },

      // =========================================
      // LAYOUT
      // =========================================
      maxWidth: {
        content:  '1120px',
        app:      '420px',
        practice: '880px',
      },

      // =========================================
      // MOTION
      // =========================================
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.34, 1.4, 0.5, 1)',
        'smooth':    'cubic-bezier(0.4, 0, 0.2, 1)',
        'in-fast':   'cubic-bezier(0.4, 0, 1, 1)',
      },
      transitionDuration: {
        'micro':     '180ms',
        'base':      '280ms',
        'enter':     '480ms',
        'celebrate': '720ms',
      },
      keyframes: {
        'verbito-breathe': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%':       { transform: 'scale(1.015)' },
        },
        'verbito-think': {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%':       { transform: 'rotate(2deg)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'breathe':  'verbito-breathe 3s ease-in-out infinite',
        'think':    'verbito-think 1.6s ease-in-out infinite',
        'slide-up': 'slide-up 480ms cubic-bezier(0.34, 1.4, 0.5, 1)',
        'pop-in':   'pop-in 480ms cubic-bezier(0.34, 1.4, 0.5, 1)',
      },
    },
  },
  plugins: [],
}
