import { heroui } from "@heroui/react";

export default heroui({
  themes: {
    light: {
      colors: {
        primary: {
          DEFAULT: "#10b981", // emerald-500
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#059669", // emerald-600
          foreground: "#ffffff",
        },
      },
    },
    dark: {
      colors: {
        primary: {
          DEFAULT: "#10b981", // emerald-500
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#34d399", // emerald-400
          foreground: "#064e3b", // emerald-950
        },
      },
    },
  },
});
