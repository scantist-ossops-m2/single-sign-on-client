import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), dts()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/main.ts"),
      name: "Single Sign On React Client",
      fileName: "main",
      formats: ["es"],
    },
    rollupOptions: {
      external: ["react", "react-dom"],
    },
  },
});
