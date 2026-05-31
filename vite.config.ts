import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      injectRegister: false, // we register manually in main.tsx with iframe/preview guards
      devOptions: { enabled: false },
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
        maximumFileSizeToCacheInBytes: 5_000_000,
      },
      manifest: {
        name: "NexoMind — Clarity, one thought at a time",
        short_name: "NexoMind",
        description:
          "A private AI journaling app that turns overthinking into clarity.",
        theme_color: "#1a1a2a",
        background_color: "#FFFFFF",
        display: "standalone",
        orientation: "portrait",
        start_url: "/?source=pwa",
        id: "/?source=pwa",
        scope: "/",
        categories: ["health", "lifestyle", "productivity"],
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        screenshots: [
          {
            src: "/screenshot-wide.jpg",
            sizes: "1200x630",
            type: "image/jpeg",
            form_factor: "wide",
            label: "NexoMind — Clarity, one thought at a time",
          },
          {
            src: "/screenshot-narrow.jpg",
            sizes: "720x1280",
            type: "image/jpeg",
            form_factor: "narrow",
            label: "NexoMind — Clarity, one thought at a time",
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
}));
