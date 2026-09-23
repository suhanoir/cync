const config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        border: 'var(--border)',
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        cync: {
          green: {
            DEFAULT: '#10b981',
            muted: '#059669',
            light: 'rgba(16, 185, 129, 0.12)',
            border: 'rgba(16, 185, 129, 0.25)',
          },
          orange: {
            DEFAULT: '#f97316',
            muted: '#ea580c',
            light: 'rgba(249, 115, 22, 0.12)',
            border: 'rgba(249, 115, 22, 0.25)',
          },
          charcoal: {
            950: '#09090b',
            900: '#111113',
            800: '#18181b',
            700: '#27272a',
            600: '#3f3f46',
            500: '#71717a',
            400: '#a1a1aa',
            300: '#d4d4d8',
            200: '#e4e4e7',
            100: '#f4f4f5',
            50: '#fafafa',
          },
        },
      },
      borderRadius: {
        lg: '12px',
        md: '8px',
        sm: '6px',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;

