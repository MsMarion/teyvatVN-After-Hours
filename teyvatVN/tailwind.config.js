/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ["var(--font-heading)"],
        body: ["var(--font-body)"],
        quattro: ["var(--font-heading)"], // Alias for backward compatibility
        solway: ["var(--font-body)"],     // Alias for backward compatibility
      },
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
        },
        background: {
          main: "var(--color-bg-main)",
          light: "var(--color-bg-light)",
          dark: "var(--color-bg-dark)",
        },
      },
      keyframes: {
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
      },
      animation: {
        fadeOut: "fadeOut 1s ease-in forwards",
      },
    },
  },
  plugins: [],
};
