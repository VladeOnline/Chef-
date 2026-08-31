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
        forest: "#0f2f21",
        leaf: "#2f6b4d",
        clay: "#b86f45",
        cream: "#fbf8f1",
        ink: "#1f2933",
      },
    },
  },
  plugins: [],
};
