/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      dropShadow: {
        strong: "4px 4px 4px rgba(31, 41, 55, 0.38)",
      },
    },
  },
  plugins: ["tailwindcss/nesting"],
};
