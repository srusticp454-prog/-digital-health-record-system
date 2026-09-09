/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#16302E",
        paper: "#F6F5F1",
        clinical: "#1C7C72",
        gold: "#B9862E",
        alert: "#C1443B",
        sage: "#8FB9A8",
      },
      fontFamily: {
        display: ["'IBM Plex Serif'", "serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
