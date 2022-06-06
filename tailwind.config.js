/* eslint-env node */

const defaultTheme = require("tailwindcss/defaultTheme");

const fontFamily = defaultTheme.fontFamily;
fontFamily["sans"] = ["Courier New", "Roboto", "system-ui"];

module.exports = {
  purge: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx,css,scss,postcss}",
    "./wasm-lib/pkg/**/*.{vue,js,ts,jsx,tsx,.wasm",
  ],
  theme: {
    fontFamily, // <-- this is where the override is happening
    extend: {
      colors: require("./src/styles/theme.colors.js"),
    },
  },
  variants: {},
  plugins: [require("postcss-import"), require("autoprefixer")],
};
