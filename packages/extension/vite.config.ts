import react from "@vitejs/plugin-react";
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from "fs";
import { join, resolve } from "path";
import { defineConfig, loadEnv } from "vite";

// Custom plugin to copy manifest and handle MV3 structure
function chromeExtension() {
  return {
    name: "chrome-extension",
    writeBundle() {
      // Copy manifest
      copyFileSync(
        resolve(__dirname, "src/manifest.json"),
        resolve(__dirname, "dist/manifest.json"),
      );

      // Create icons directory
      const iconsDir = resolve(__dirname, "dist/icons");
      mkdirSync(iconsDir, { recursive: true });

      // Copy icons from public if they exist
      const publicIconsDir = resolve(__dirname, "public/icons");
      if (existsSync(publicIconsDir)) {
        const files = readdirSync(publicIconsDir);
        files.forEach((file) => {
          const srcPath = join(publicIconsDir, file);
          if (statSync(srcPath).isFile()) {
            copyFileSync(srcPath, join(iconsDir, file));
          }
        });
      }

      // Copy images directory
      const imagesDir = resolve(__dirname, "dist/images");
      mkdirSync(imagesDir, { recursive: true });
      const publicImagesDir = resolve(__dirname, "public/images");
      if (existsSync(publicImagesDir)) {
        const files = readdirSync(publicImagesDir);
        files.forEach((file) => {
          const srcPath = join(publicImagesDir, file);
          if (statSync(srcPath).isFile()) {
            copyFileSync(srcPath, join(imagesDir, file));
          }
        });
      }

      // Copy screenshots directory
      const screenshotsDir = resolve(__dirname, "dist/screenshots");
      mkdirSync(screenshotsDir, { recursive: true });
      const publicScreenshotsDir = resolve(__dirname, "public/screenshots");
      if (existsSync(publicScreenshotsDir)) {
        const files = readdirSync(publicScreenshotsDir);
        files.forEach((file) => {
          const srcPath = join(publicScreenshotsDir, file);
          if (statSync(srcPath).isFile()) {
            copyFileSync(srcPath, join(screenshotsDir, file));
          }
        });
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), chromeExtension()],
    build: {
      outDir: "dist",
      emptyOutDir: true,
      minify: "esbuild",
      chunkSizeWarningLimit: 600, // Service worker includes AI SDK providers
      rollupOptions: {
        input: {
          // Service worker
          service_worker: resolve(__dirname, "src/background/service_worker.ts"),
          // Content script
          content_script_v2: resolve(__dirname, "src/content/content_script_v2.ts"),
          // Side panel
          sidepanel: resolve(__dirname, "src/sidepanel/index.html"),
          // Iframe chat (React-based)
          "iframe-chat": resolve(__dirname, "src/content/iframe-chat.html"),
        },
        output: {
          entryFileNames: (chunkInfo) => {
            // Keep service worker and content script at root of dist/
            if (chunkInfo.name === "service_worker") {
              return "service_worker.js";
            }
            if (chunkInfo.name === "content_script_v2") {
              return "content_script_v2.js";
            }
            return "assets/[name]-[hash].js";
          },
          chunkFileNames: "assets/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash].[ext]",
        },
      },
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
    },
    define: {
      // Make env variables available at build time
      "import.meta.env.VITE_LOG_LEVEL": JSON.stringify(env.VITE_LOG_LEVEL || "WARN"),
    },
  };
});
