import basicSsl from "@vitejs/plugin-basic-ssl";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
	// HTTPS is required by browsers to grant camera access to non-localhost origins (e.g. testing on your phone)
	plugins: [react(), ...(process.env.HTTPS === "true" ? [basicSsl()] : [])],
	server: {
		host: true,
		proxy: {
			"/api": {
				target: "http://localhost:8000",
				secure: false,
			},
		},
	},
});
