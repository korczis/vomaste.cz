/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./templates/**/*.html", "./content/**/*.md"],
  darkMode: "media",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
