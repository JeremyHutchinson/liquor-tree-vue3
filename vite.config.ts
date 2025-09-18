import path from "node:path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      outDir: "dist/types"
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "LiquorTree",
      fileName: (format) => `liquor-tree.${format}.js`,
      formats: ["es", "cjs", "umd"]
    },
    rollupOptions: {
      external: ["vue", "mitt"],
      output: { 
        globals: { 
          vue: "Vue",
          mitt: "mitt"
        } 
      }
    },
    sourcemap: true
  }
});
