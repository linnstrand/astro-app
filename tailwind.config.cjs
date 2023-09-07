/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      dropShadow: {
        strong: "4px 4px 4px rgba(31, 41, 55, 0.38)",
      },
      backgroundImage: {
        rainbow: `linear-gradient(
          109.6deg,
          theme(colors.red.500) 25%,
          theme(colors.yellow.500) 35%,
          theme(colors.green.500) 45%,
          theme(colors.sky.500) 55%,
          theme(colors.indigo.500) 70%,
          theme(colors.purple.500) 85%)`,
      },
    },
  },
  plugins: ["tailwindcss/nesting", require("@tailwindcss/typography")],
};
