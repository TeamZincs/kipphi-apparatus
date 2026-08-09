
import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import electron from "vite-plugin-electron";
import TAURI_CONF from "./src-tauri/tauri.conf.json";
import fs from "fs";

const host = process.env.TAURI_DEV_HOST;

const TAURI_CONF_VERSION = TAURI_CONF.version;

const noFrontend = process.argv.includes("--no-frontend");
const isElectron = process.argv.includes("--electron");


const getNPMPackageVersion = (/** @type {string} */packageName, stringified = true) => {
    const jsonContent = fs.readFileSync("./node_modules/" + packageName + "/package.json").toString();
    const version = JSON.parse(jsonContent).version;
    console.log(version)
    return stringified ? JSON.stringify(version) : version;
}

const getNPMPackageLicense = (/** @type {string} */packageName) => {
    const jsonContent = fs.readFileSync("./node_modules/" + packageName + "/package.json").toString();
    const version = JSON.parse(jsonContent).license;
    return version;
}

const getDependencies = () => {
    const jsonContent = fs.readFileSync("./package.json").toString();
    const dependencyVersions = JSON.parse(jsonContent).dependencies;
    /** @type {import("./dependency").Dependency[]} */
    const dependencies = []
    for (const name in dependencyVersions) {
        if (["kipphi", "kipphi-player", "kipphi-canvas-editor"].includes(name)) {
            continue;
        }
        dependencies.push({
            name,
            version: getNPMPackageVersion(name, false),
            license: getNPMPackageLicense(name)
        })
    }
    return JSON.stringify(dependencies);
}

// compute at top level so defineConfig stays sync
const __playerVersion = getNPMPackageVersion("kipphi-player");
const __canvasEditorVersion = getNPMPackageVersion("kipphi-canvas-editor");
const __kipphiVersion = getNPMPackageVersion("kipphi");
const __dependencies = getDependencies();



// https://vite.dev/config/
export default defineConfig(() => {

    const plugins = []

    if (!noFrontend) {
        plugins.push(sveltekit());
    }
    if (isElectron) {
        plugins.push(electron([{
            entry: "./electron/main.ts",
            vite: {
                build: {
                    outDir: 'dist-electron/main',
                },
            },
        }, {
            entry: "./electron/preload.ts",
            vite: {
                build: {
                    outDir: 'dist-electron/preload'
                },
                esbuild: {
                    format: "cjs"
                },

            },
        }]))
    }
    return {
        plugins,
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
                ignored: ["**/src-tauri/**"]
            }
        },
        build: {
            minify: false,
            sourcemap: false,
            cssMinify: false,
            target: "es2022"
        },
        define: {
            "__APP_VERSION": JSON.stringify(TAURI_CONF_VERSION),
            "__PLAYER_VERSION": __playerVersion,
            "__CANVAS_EDITOR_VERSION": __canvasEditorVersion,
            "__KIPPHI_VERSION": __kipphiVersion,
            "__DEPENDENCIES": __dependencies,
            "import.meta.env.VITE_BACKEND": isElectron ? "'electron'" : "'tauri'"
        }
    }
});
