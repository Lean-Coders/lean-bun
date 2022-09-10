module.exports = {
  content: ["./**/*.html"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: "#a50d73",
        secondary: "#201c21",
      },
    },
  },
  variants: {},
  plugins: [require("@tailwindcss/typography")],
};
