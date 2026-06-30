import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    hmr: { host: "localhost" },
    proxy: {
      "/api": {
        target: "https://blog.081531.xyz",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/rss.*/, "/rss.xml"),
      },
      "/live-api": {
        target: "https://live.081531.xyz",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/live-api/, "/api"),
      },
    },
  },
});
