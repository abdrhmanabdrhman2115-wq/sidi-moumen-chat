import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const isProd = process.env.NODE_ENV === "production";
const REPO_NAME = "sidi-moumen-chat";

export default defineConfig({
  base: isProd ? `/${REPO_NAME}/` : "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    port: Number(process.env.PORT ?? 24341),
    strictPort: false,
    host: "0.0.0.0",
    allowedHosts: true,
  },
  preview: {
    port: Number(process.env.PORT ?? 24341),
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
