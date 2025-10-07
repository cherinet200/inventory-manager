/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  variants: {
    extend: {
      backgroundColor: ["odd", "even"],
    },
  },
  theme: {
    extend: {},
  },
  plugins: [],
};
