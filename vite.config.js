import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Any request to /api will be forwarded to your backend
      '/pantry': 'https://smart-meal-planner-backend.onrender.com',
      '/recipes': 'https://smart-meal-planner-backend.onrender.com',
      "/api": {
        target: "https://smart-meal-planner-backend.onrender.com", // Replace with your deployed backend URL
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
