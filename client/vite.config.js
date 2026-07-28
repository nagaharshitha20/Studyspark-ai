import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Proxies /api requests to the local Express server during development,
// so the frontend never needs to know the backend's port/host directly.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
