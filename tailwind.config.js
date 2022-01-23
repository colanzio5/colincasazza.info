const defaultTheme = require('tailwindcss/defaultTheme')

const fontFamily = defaultTheme.fontFamily;
fontFamily['sans'] = [
  'Courier New',
  'Roboto',
  'system-ui',
];


module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    fontFamily, // <-- this is where the override is happening
    extend: {},
  },
  variants: {},
  plugins: [
    require('postcss-import'),
    require('autoprefixer')
  ],
};