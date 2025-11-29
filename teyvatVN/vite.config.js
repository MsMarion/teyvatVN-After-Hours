// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()], // <--- ONLY the React plugin here
  server: {
    allowedHosts: ['updates-limitations-favors-effectively.trycloudflare.com'],
    port: 6001
  }
});
