/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        darkGreen: "#264653",
        green: "#2A9D8F",
        yellow: "#E9C46A",
        orange: "#F4A261",
        red: "#E76F51",
      },
    },
  },
  plugins: [],
};
