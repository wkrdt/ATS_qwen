import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    hmr: {
      port: 3000,
    },
  },
  define: {
    // Embed the ATS_sheet environment variable at build time
    "import.meta.env.ATS_sheet": JSON.stringify(process.env.ATS_sheet || ""),
  },
  test: {
    globals: true,
    environment: 'node',
  },
});
