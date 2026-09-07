import basicSsl from "@vitejs/plugin-basic-ssl";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const backendTarget = "http://localhost:8000";

// https://vitejs.dev/config/
export default defineConfig({
  // HTTPS is required by browsers to grant camera access to non-localhost origins (e.g. testing on your phone)
  plugins: [react(), ...(process.env.HTTPS === "true" ? [basicSsl()] : [])],
  server: {
    host: true,
    proxy: {
      "/api": {
        target: backendTarget,
        secure: false,
        changeOrigin: true,
      },
      "/ws": {
        target: backendTarget,
        secure: false,
        changeOrigin: true,
        rewriteWsOrigin: true,
        ws: true,
      },
    },
  },
});
