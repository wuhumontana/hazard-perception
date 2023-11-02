import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  server: {
    port: 5000,
  },
  // Backend URL
  define: {
    'process.env.BACKEND_URL': JSON.stringify(process.env.BACKEND_URL || 'http://localhost:3000')
  }
});
