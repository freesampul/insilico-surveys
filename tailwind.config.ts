import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#818D92", // ✅ Add your primary color
        secondary: "#B9A394",
        textPrimary: "#31393c", // ✅ Add text color
        textSecondary: "#B9A394",
      },
    },
  },
  plugins: [],
} satisfies Config;