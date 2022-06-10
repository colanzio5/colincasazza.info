const defaultTheme = require("tailwindcss/defaultTheme");
const themeColors = require("./src/styles/theme.js");

const fontFamily = defaultTheme.fontFamily;
fontFamily["sans"] = ["Courier New", "Roboto", "system-ui"];

module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  purge: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  plugins: [
    require("postcss-import"),
    require("autoprefixer"),
    require("@tailwindcss/aspect-ratio"),
  ],
  theme: {
    fontFamily,
    extend: {
      colors: themeColors,
    },
  },
  darkMode: false,
  variants: {},
};
