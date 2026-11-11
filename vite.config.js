import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  root: path.resolve(__dirname, "frontend"),
  envDir: __dirname,
  plugins: [react(), tailwindcss()],
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./frontend/src"),
      "@components": path.resolve(__dirname, "./frontend/src/components"),
      "@features": path.resolve(__dirname, "./frontend/src/features"),
      "@context": path.resolve(__dirname, "./frontend/src/context"),
      "@lib": path.resolve(__dirname, "./frontend/src/lib"),
      "@types": path.resolve(__dirname, "./frontend/src/types"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    hmr: {
      port: 3000,
    },
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("error", (_err, _req, res) => {
            if (res && !res.headersSent) {
              res.writeHead(503, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ proxyUnavailable: true }));
            }
          });
        },
      },
    },
  },
});
