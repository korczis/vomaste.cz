/** @type {import('tailwindcss').Config} */
module.exports = {
  // Flowbite se do teď importoval jen jako JS (app.js), ale nebyl zapojený
  // do Tailwindu: plugin chyběl a jeho třídy se nescanovaly. Chování
  // (dropdowny přes data-dropdown-toggle) tedy fungovalo, zatímco vzhled
  // se psal ručně z utility tříd — tedy přesně to, čemu se komponentová
  // knihovna má vyhnout. Bez téhle cesty v `content` by Tailwind třídy
  // použité uvnitř Flowbite JS odstranil jako nepoužité.
  content: [
    "./templates/**/*.html",
    "./content/**/*.md",
    "./assets/js/**/*.js",
    "./node_modules/flowbite/**/*.js",
  ],
  darkMode: "media",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("flowbite/plugin")],
};
