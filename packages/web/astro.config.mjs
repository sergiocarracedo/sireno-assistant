import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://sirenoassistant.xyz",
  vite: {
    plugins: [tailwindcss()],
  },
});
