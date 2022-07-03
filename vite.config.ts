import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";
import wasmPack from "vite-plugin-wasm-pack";
import { viteCommonjs } from "@originjs/vite-plugin-commonjs";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), wasmPack(["./wasm-lib"]), viteCommonjs()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  // optimizeDeps: {
  // include: ["./src/styles/theme.js"],
  // exclude: ""
  // },
  build: {
    target: "esnext",
      manifest: true,
    //   commonjsOptions: {
    //     include: ["./src/styles/theme.js"],
    //     transformMixedEsModules: true,
    //   },
  },
});
