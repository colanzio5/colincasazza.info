const defaultTheme = require("tailwindcss/defaultTheme");
const themeColors = import("./src/styles/theme.colors.mjs");

const fontFamily = defaultTheme.fontFamily;
fontFamily["sans"] = ["Courier New", "Roboto", "system-ui"];

module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  plugins: [
    require("postcss-import"),
    require("autoprefixer"),
    require("@tailwindcss/aspect-ratio"),
  ],
  theme: {
    fontFamily, // <-- this is where the override is happening
    extend: {
      colors: await themeColors,
    },
  },
  darkMode: false, // or 'media' or 'class'
  variants: {},
  purge: [
    // "./index.html",
    // "./src/**/*.{vue,js,ts,jsx,tsx,css,scss,postcss}",
    // "./wasm-lib/pkg/**/*.{vue,js,ts,jsx,tsx,.wasm",
  ],
};
