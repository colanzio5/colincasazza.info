import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import wasmPack from "vite-plugin-wasm-pack";

function CustomHmr() {
  return {
    name: "custom-hmr",
    enforce: "post",
    // HMR
    handleHotUpdate({ file, server }) {
      if (
        file.endsWith(".json") ||
        file.endsWith(".ts") ||
        file.endsWith(".d.ts") ||
        file.endsWith(".rs") ||
        file.endsWith(".js")
      ) {
        server.ws.send({
          type: "full-reload",
          path: "*",
        });
      }
    },
  };
}

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
  plugins: [vue(), wasmPack("wasm-lib/"), CustomHmr()],
});
