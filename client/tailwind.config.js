/** @type {import('tailwindcss').Config} */

// The whole brand scale is driven by CSS variables written by ThemeContext.
// `rgb(... / <alpha-value>)` keeps Tailwind opacity modifiers working
// (e.g. `ring-blue-500/20`).
const varScale = (name, shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]) =>
  Object.fromEntries(
    shades.map((shade) => [shade, `rgb(var(--${name}-${shade}-rgb) / <alpha-value>)`])
  );

const brandScale = varScale("brand");

// Neutral + status scales are theme-aware too. In light mode they resolve to
// the warm "Lapels" tones; in dark mode (.dark) they resolve to Tailwind's
// original values, so the dark design is untouched. See globals.css.
const FULL = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const slateScale = varScale("slate", FULL);
const grayScale = varScale("gray", FULL);
const emeraldScale = varScale("emerald", FULL);
const amberScale = varScale("amber", FULL);
const roseScale = varScale("rose", FULL);
const accentHues = Object.fromEntries(
  ["purple", "violet", "indigo", "sky", "cyan", "pink"].map((hue) => [hue, varScale(hue, FULL)])
);

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
        // CSS-variable-backed semantic tokens.
        // Note: there is intentionally no `base` colour here; it collided with
        // the `text-base` font-size utility and painted text in the page
        // background colour. `bg-base` comes from `backgroundColor` below.
        surface: "var(--bg-surface)",
        surface2: "var(--bg-surface2)",
        surface3: "var(--bg-surface3)",
        border: "var(--border)",
        "border-subtle": "var(--border-subtle)",

        // Palette-aware brand scale. `blue-*` intentionally shares the scale so
        // every legacy accent in the app follows the selected palette.
        brand: { DEFAULT: "rgb(var(--brand-rgb) / <alpha-value>)", ...brandScale },
        blue: brandScale,
        slate: slateScale,
        gray: grayScale,
        emerald: emeraldScale,
        amber: amberScale,
        rose: roseScale,
        ...accentHues,
        white: "rgb(var(--white-rgb) / <alpha-value>)",

        meesho: "rgb(var(--meesho-rgb) / <alpha-value>)",
        flipkart: "rgb(var(--flipkart-rgb) / <alpha-value>)",
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
        // Light: Instrument Sans body + Alegreya display (Lapels). Dark: original stack.
        sans: ["var(--font-sans)"],
        display: ["var(--font-display)"],
      },
      borderRadius: {
        // Light mode uses tighter, tailored corners; dark keeps Tailwind defaults.
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        "3xl": "var(--radius-3xl)",
      },
    },
  },
  plugins: [],
};
