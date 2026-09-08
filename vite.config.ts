import fs from "node:fs";
import path from "node:path";
import basicSsl from "@vitejs/plugin-basic-ssl";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const backendTarget = "http://localhost:8000";

function swVersionPlugin(): Plugin {
  return {
    name: "sw-version-stamp",
    apply: "build",
    closeBundle() {
      const distSwPath = path.resolve(import.meta.dirname, "dist/sw.js");
      if (fs.existsSync(distSwPath)) {
        let content = fs.readFileSync(distSwPath, "utf-8");
        const buildVersion = Date.now().toString(36);
        content = content.replace(/__BUILD_HASH__/g, buildVersion);
        fs.writeFileSync(distSwPath, content, "utf-8");
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  // HTTPS is required by browsers to grant camera access to non-localhost origins (e.g. testing on your phone)
  plugins: [
    react(),
    swVersionPlugin(),
    ...(process.env.HTTPS === "true" ? [basicSsl()] : []),
  ],
  server: {
    host: true,
    proxy: {
      "/api": {
        target: backendTarget,
        secure: false,
        changeOrigin: true,
        // changeOrigin only rewrites the outgoing Host header — Django's
        // CSRF middleware checks the Origin header instead, so without also
        // rewriting that we get "CSRF Failed: Origin checking failed" when
        // the dev server runs on a different scheme/port than the backend
        // (e.g. https://localhost:5173).
        configure: (proxy: any) => {
          proxy.on("proxyReq", (proxyReq: import("http").ClientRequest) => {
            if (proxyReq.getHeader("origin")) {
              proxyReq.setHeader("origin", backendTarget);
            }
          });
        },
      },
      // The login endpoint lives outside of /api on the Django backend
      // (see web/academy/urls.py), so it needs its own proxy entry with
      // the same Origin-header rewrite as /api above.
      "/api-token-auth": {
        target: backendTarget,
        secure: false,
        changeOrigin: true,
        configure: (proxy: any) => {
          proxy.on("proxyReq", (proxyReq: import("http").ClientRequest) => {
            if (proxyReq.getHeader("origin")) {
              proxyReq.setHeader("origin", backendTarget);
            }
          });
        },
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
