// electron.vite.config.ts
import path from "path";
import { defineConfig, externalizeDepsPlugin, loadEnv } from "electron-vite";
import react from "@vitejs/plugin-react";
var __electron_vite_injected_dirname = "C:\\xampp\\htdocs\\myoffice_vr";
var electron_vite_config_default = defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    main: {
      plugins: [externalizeDepsPlugin()]
    },
    preload: {
      plugins: [externalizeDepsPlugin()]
    },
    renderer: {
      base: command === "serve" ? env.VITE_BASE_URL || "/" : "./",
      resolve: {
        alias: {
          "@renderer": path.resolve(__electron_vite_injected_dirname, "src/renderer/src")
        }
      },
      plugins: [react()],
      optimizeDeps: {
        include: ["react-easy-crop"]
      },
      server: {
        host: true
      }
    }
  };
});
export {
  electron_vite_config_default as default
};
