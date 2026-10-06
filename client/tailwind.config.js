/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                navy: {
                    900: '#0a0f1e',
                    800: '#0d1426',
                    700: '#111827',
                    600: '#1a2235',
                    500: '#1e2a3d',
                },
                brand: {
                    blue: '#2563eb',
                    'blue-hover': '#1d4ed8',
                    'blue-light': '#3b82f6',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}