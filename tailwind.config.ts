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
        primary: "#f5ebe0", // ✅ Add your primary color
        secondary: "#f5ebe0",
        textPrimary: "#f5ebe0", // ✅ Add text color
        textSecondary: "#f5ebe0",
      },
    },
  },
  plugins: [],
} satisfies Config;