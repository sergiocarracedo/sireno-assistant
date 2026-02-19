import { heroui } from "@heroui/react";

export default heroui({
  themes: {
    light: {
      colors: {
        primary: {
          DEFAULT: "#92400e", // amber-800 (coffee brown)
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#78350f", // amber-900 (darker coffee)
          foreground: "#ffffff",
        },
      },
    },
    dark: {
      colors: {
        primary: {
          DEFAULT: "#d97706", // amber-600 (warm coffee)
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#f59e0b", // amber-500 (lighter coffee accent)
          foreground: "#451a03", // amber-950
        },
      },
    },
  },
});
