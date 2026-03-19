
import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import TAURI_CONF from "./src-tauri/tauri.conf.json";
import fs from "fs";

const host = process.env.TAURI_DEV_HOST;

const TAURI_CONF_VERSION = TAURI_CONF.version;


const getNPMPackageVersion = async (/** @type {string} */packageName) => {
  const jsonContent = fs.readFileSync("./node_modules/" + packageName + "/package.json").toString();
  const version = JSON.parse(jsonContent).version;
  console.log(version)
  return JSON.stringify(version);
}

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [sveltekit()],
  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host ? { protocol: "ws", host, port: 1421 } : undefined,
    watch: { // 3. tell Vite to ignore watching `src-tauri`
    ignored: ["**/src-tauri/**"] }
  },
  build: {
    minify: false,
  },
  define: {
    "__APP_VERSION": JSON.stringify(TAURI_CONF_VERSION),
    "__PLAYER_VERSION": await getNPMPackageVersion("kipphi-player"),
    "__CANVAS_EDITOR_VERSION": await getNPMPackageVersion("kipphi-canvas-editor"),
    "__KIPPHI_VERSION": await getNPMPackageVersion("kipphi"),
  }
}));
