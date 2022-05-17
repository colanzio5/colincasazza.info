import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import wasmPack from "vite-plugin-wasm-pack";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [
      {
        find: "@",
        replacement: path.resolve(__dirname, "src"),
      },
    ],
  },
  build: {
    target: "esnext",
  },
  plugins: [
    vue(),
    wasmPack('./wasm-lib'),
  ],
});
