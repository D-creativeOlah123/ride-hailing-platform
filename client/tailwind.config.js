/** @type {import('tailwindcss').Config} */

// Semantic colors resolve to CSS variables defined in src/index.css,
// so each theme (light / dark) is tuned independently.
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`

export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                canvas: token('canvas'),
                surface: {
                    DEFAULT: token('surface'),
                    2: token('surface-2'),
                    3: token('surface-3'),
                },
                line: {
                    DEFAULT: token('line'),
                    strong: token('line-strong'),
                },
                ink: {
                    DEFAULT: token('ink'),
                    muted: token('ink-muted'),
                    subtle: token('ink-subtle'),
                },
                accent: {
                    DEFAULT: token('accent'),
                    hover: token('accent-hover'),
                    text: token('accent-text'),
                    soft: token('accent-soft'),
                },
                success: token('success'),
                warning: token('warning'),
                danger: token('danger'),

                // Legacy names, mapped onto the new tokens
                navy: {
                    900: token('canvas'),
                    800: token('surface'),
                    700: token('surface-2'),
                    600: token('surface-3'),
                    500: token('line-strong'),
                },
                brand: {
                    blue: token('accent'),
                    'blue-hover': token('accent-hover'),
                    'blue-light': token('accent-text'),
                },
            },
            fontFamily: {
                sans: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                mono: ['"Geist Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
            },
            fontSize: {
                '2xs': ['0.6875rem', { lineHeight: '1rem' }],
            },
            letterSpacing: {
                tightest: '-0.035em',
                eyebrow: '0.08em',
            },
            borderRadius: {
                DEFAULT: '0.375rem',
                lg: '0.5rem',
                xl: '0.75rem',
                '2xl': '1rem',
            },
            boxShadow: {
                xs: 'var(--shadow-xs)',
                card: 'var(--shadow-card)',
                raised: 'var(--shadow-raised)',
                overlay: 'var(--shadow-overlay)',
            },
            maxWidth: {
                content: '72rem',
            },
            keyframes: {
                'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
                'slide-in': { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
            },
            animation: {
                'fade-in': 'fade-in 150ms ease-out',
                'slide-in': 'slide-in 200ms cubic-bezier(0.2, 0.8, 0.2, 1)',
            },
        },
    },
    plugins: [],
}
