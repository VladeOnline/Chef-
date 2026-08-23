/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Fraunces", "Georgia", "serif"],
      },
      colors: {
        forest: "#1f4d3a",
        leaf: "#6f8f4e",
        clay: "#b86f45",
        cream: "#fbf8f1",
        ink: "#1f2933",
      },
    },
  },
  plugins: [],
};
