import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(), // Add this plugin - it's CRITICAL for React apps
    tailwindcss(),
  ],
  optimizeDeps: {
    include: ["@json2csv/plainjs"],
  },
  base: "/", // Force base to root for Netlify
  build: {
    outDir: "dist", // Ensure output directory is 'dist'
    sourcemap: false, // Disable sourcemaps for smaller bundle
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          mui: ["@mui/material", "@mui/icons-material"],
        },
      },
    },
  },
  server: {
    port: 5173, // Vite default port
    host: true, // Allow external connections
  },
  // Resolve .jsx files
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
});