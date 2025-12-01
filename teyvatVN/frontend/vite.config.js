// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: process.env.ALLOWED_HOSTS ? process.env.ALLOWED_HOSTS.split(',') : ['dept-spoken-neon-marilyn.trycloudflare.com', 'localhost'],
    host: process.env.HOST || 'localhost',
    port: parseInt(process.env.PORT) || 6001
  }
});
