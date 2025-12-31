/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#38e07b",
        "background-light": "#f6f8f7",
        "background-dark": "#122017",
        "card-dark": "#1a2c23",
        "surface-dark": "#1c2e25",
        "input-border": "#3d5245",
        "input-bg": "#1c2620",
      },
      fontFamily: {
        "display": ["Spline Sans", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "1rem", 
        "lg": "1.5rem", 
        "xl": "3rem", 
        "full": "9999px"
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm1 1h38v38H1V1z' fill='%2338e07b' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E\")",
      }
    },
  },
  plugins: [],
}