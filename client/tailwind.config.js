/** @type {import('tailwindcss').Config} */

// The whole brand scale is driven by CSS variables written by ThemeContext.
// `rgb(... / <alpha-value>)` keeps Tailwind opacity modifiers working
// (e.g. `ring-blue-500/20`).
const brandScale = {
  50: "rgb(var(--brand-50-rgb) / <alpha-value>)",
  100: "rgb(var(--brand-100-rgb) / <alpha-value>)",
  200: "rgb(var(--brand-200-rgb) / <alpha-value>)",
  300: "rgb(var(--brand-300-rgb) / <alpha-value>)",
  400: "rgb(var(--brand-400-rgb) / <alpha-value>)",
  500: "rgb(var(--brand-500-rgb) / <alpha-value>)",
  600: "rgb(var(--brand-600-rgb) / <alpha-value>)",
  700: "rgb(var(--brand-700-rgb) / <alpha-value>)",
  800: "rgb(var(--brand-800-rgb) / <alpha-value>)",
  900: "rgb(var(--brand-900-rgb) / <alpha-value>)",
};

module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/app/**/*.{js,jsx}",
    "./src/features/**/*.{js,jsx}",
  ],
  important: "#__next-root",
  theme: {
    extend: {
      colors: {
        // CSS-variable-backed semantic tokens
        base: "var(--bg-base)",
        surface: "var(--bg-surface)",
        surface2: "var(--bg-surface2)",
        surface3: "var(--bg-surface3)",
        border: "var(--border)",
        "border-subtle": "var(--border-subtle)",

        // Palette-aware brand scale. `blue-*` intentionally shares the scale so
        // every legacy accent in the app follows the selected palette.
        brand: { DEFAULT: "rgb(var(--brand-rgb) / <alpha-value>)", ...brandScale },
        blue: brandScale,

        meesho: "#e11d48",
        flipkart: "#2874f0",
      },
      textColor: {
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        tertiary: "var(--text-tertiary)",
      },
      borderColor: {
        DEFAULT: "var(--border)",
        subtle: "var(--border-subtle)",
      },
      backgroundColor: {
        base: "var(--bg-base)",
        surface: "var(--bg-surface)",
        surface2: "var(--bg-surface2)",
        surface3: "var(--bg-surface3)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        popover: "var(--shadow-popover)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
