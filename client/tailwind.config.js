/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f4f6f5",
          100: "#e4e9e7",
          200: "#c3cec9",
          300: "#9db0a9",
          400: "#748e84",
          500: "#57746a",
          600: "#425d54",
          700: "#354a43",
          800: "#233029",
          900: "#161e19",
          950: "#0c110e",
        },
        highlight: {
          400: "#f2c94c",
          500: "#e8b022",
          600: "#c8901a",
        },
        marker: {
          500: "#e0663f",
          600: "#c34f2b",
        },
      },
      fontFamily: {
        display: ["'Source Serif 4'", "Georgia", "serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        "ruled-lines":
          "repeating-linear-gradient(to bottom, transparent, transparent 27px, rgba(87,116,106,0.10) 28px)",
      },
    },
  },
  plugins: [],
};
