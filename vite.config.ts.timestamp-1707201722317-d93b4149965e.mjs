// vite.config.ts
import { rmSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "file:///D:/dev/bamos/bamos-desktop/node_modules/vite/dist/node/index.js";
import react from "file:///D:/dev/bamos/bamos-desktop/node_modules/@vitejs/plugin-react/dist/index.mjs";
import electron from "file:///D:/dev/bamos/bamos-desktop/node_modules/vite-plugin-electron/dist/simple.mjs";

// package.json
var package_default = {
  name: "bamos",
  version: "1.0.5",
  private: true,
  description: "Bamos.",
  license: "MIT",
  author: "Dzianis Kavalchuk",
  type: "module",
  main: "dist-electron/main/index.js",
  scripts: {
    build: "tsc && vite build && electron-builder",
    dev: "vite",
    pree2e: "vite build --mode=test",
    e2e: "playwright test",
    format: "prettier --write --cache .",
    lint: "eslint --cache .",
    "lint-fix": "eslint --fix",
    preview: "vite preview",
    typecheck: "tsc -p scripts --noEmit && pnpm -r --parallel run typecheck"
  },
  dependencies: {
    "@ant-design/charts": "^2.0.2",
    "@ant-design/pro-components": "^2.6.48",
    "@react-pdf/renderer": "^3.3.4",
    "@reduxjs/toolkit": "^2.1.0",
    "@types/lodash.get": "^4.4.9",
    "@types/react-highlight-words": "^0.16.7",
    "@types/react-pdf": "^7.0.0",
    "@types/react-router-dom": "^5.3.3",
    "@vitejs/plugin-react": "^4.0.4",
    antd: "^5.13.2",
    "antd-table-saveas-excel": "^2.2.1",
    axios: "^1.6.5",
    "electron-updater": "^6.1.1",
    "file-saver": "^2.0.5",
    i18next: "^23.7.19",
    localforage: "^1.10.0",
    "lodash.get": "^4.4.2",
    "match-sorter": "^6.3.3",
    "react-highlight-words": "^0.20.0",
    "react-hot-toast": "^2.4.1",
    "react-i18next": "^14.0.1",
    "react-live-clock": "^6.1.19",
    "react-moment": "^1.1.3",
    "react-redux": "^9.1.0",
    "react-router-dom": "^6.21.3",
    redux: "^5.0.1",
    "sort-by": "^0.0.2",
    "umi-request": "^1.2.3",
    uuid: "^9.0.1",
    "vite-plugin-electron": "^0.28.0",
    xlsx: "^0.18.5"
  },
  devDependencies: {
    "@playwright/test": "^1.37.1",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.7",
    "@types/react-redux": "^7.1.33",
    "@types/uuid": "^9.0.7",
    "@typescript-eslint/eslint-plugin": "^6.19.1",
    "@vitejs/plugin-react": "^4.0.4",
    autoprefixer: "^10.4.16",
    electron: "^28.1.0",
    "electron-builder": "^24.6.3",
    eslint: "^8.56.0",
    "eslint-config-standard-with-typescript": "^43.0.1",
    "eslint-plugin-import": "^2.29.1",
    "eslint-plugin-n": "^16.6.2",
    "eslint-plugin-promise": "^6.1.1",
    "eslint-plugin-react": "^7.33.2",
    postcss: "^8.4.31",
    react: "^18.2.0",
    "react-dom": "^18.2.0",
    tailwindcss: "^3.3.3",
    "tree-kill": "^1.2.2",
    typescript: "^5.3.3",
    vite: "^5.0.10",
    "vite-plugin-electron": "^0.28.0",
    "vite-plugin-electron-renderer": "^0.14.5",
    "vite-plugin-node-polyfills": "^0.19.0",
    "vite-plugin-require-transform": "^1.0.21"
  },
  debug: {
    env: {
      VITE_DEV_SERVER_URL: "http://127.0.0.1:7777/"
    }
  }
};

// vite.config.ts
var __vite_injected_original_dirname = "D:\\dev\\bamos\\bamos-desktop";
var vite_config_default = defineConfig(({ command }) => {
  rmSync("dist-electron", { recursive: true, force: true });
  const isServe = command === "serve";
  const isBuild = command === "build";
  const sourcemap = isServe || !!process.env.VSCODE_DEBUG;
  return {
    resolve: {
      alias: {
        "@": path.join(__vite_injected_original_dirname, "src")
      }
    },
    plugins: [
      react(),
      electron({
        main: {
          // Shortcut of `build.lib.entry`
          entry: "electron/main/index.ts",
          onstart(args) {
            if (process.env.VSCODE_DEBUG) {
              console.log(
                /* For `.vscode/.debug.script.mjs` */
                "[startup] Electron App"
              );
            } else {
              args.startup();
            }
          },
          vite: {
            build: {
              sourcemap,
              minify: isBuild,
              outDir: "dist-electron/main",
              rollupOptions: {
                external: Object.keys(
                  "dependencies" in package_default ? package_default.dependencies : {}
                )
              }
            }
          }
        },
        preload: {
          // Shortcut of `build.rollupOptions.input`.
          // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
          input: "electron/preload/index.ts",
          vite: {
            build: {
              sourcemap: sourcemap ? "inline" : void 0,
              // #332
              minify: isBuild,
              outDir: "dist-electron/preload",
              rollupOptions: {
                external: Object.keys(
                  "dependencies" in package_default ? package_default.dependencies : {}
                )
              }
            }
          }
        }
      })
    ],
    server: process.env.VSCODE_DEBUG && (() => {
      const url = new URL(package_default.debug.env.VITE_DEV_SERVER_URL);
      return {
        host: url.hostname,
        port: +url.port
      };
    })(),
    clearScreen: false
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAicGFja2FnZS5qc29uIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcZGV2XFxcXGJhbW9zXFxcXGJhbW9zLWRlc2t0b3BcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXGRldlxcXFxiYW1vc1xcXFxiYW1vcy1kZXNrdG9wXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9kZXYvYmFtb3MvYmFtb3MtZGVza3RvcC92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IHJtU3luYyB9IGZyb20gXCJub2RlOmZzXCI7XHJcbmltcG9ydCBwYXRoIGZyb20gXCJub2RlOnBhdGhcIjtcclxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xyXG5pbXBvcnQgZWxlY3Ryb24gZnJvbSBcInZpdGUtcGx1Z2luLWVsZWN0cm9uL3NpbXBsZVwiO1xyXG5pbXBvcnQgcGtnIGZyb20gXCIuL3BhY2thZ2UuanNvblwiO1xyXG5cclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBjb21tYW5kIH0pID0+IHtcclxuICBybVN5bmMoXCJkaXN0LWVsZWN0cm9uXCIsIHsgcmVjdXJzaXZlOiB0cnVlLCBmb3JjZTogdHJ1ZSB9KTtcclxuXHJcbiAgY29uc3QgaXNTZXJ2ZSA9IGNvbW1hbmQgPT09IFwic2VydmVcIjtcclxuICBjb25zdCBpc0J1aWxkID0gY29tbWFuZCA9PT0gXCJidWlsZFwiO1xyXG4gIGNvbnN0IHNvdXJjZW1hcCA9IGlzU2VydmUgfHwgISFwcm9jZXNzLmVudi5WU0NPREVfREVCVUc7XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICByZXNvbHZlOiB7XHJcbiAgICAgIGFsaWFzOiB7XHJcbiAgICAgICAgXCJAXCI6IHBhdGguam9pbihfX2Rpcm5hbWUsIFwic3JjXCIpLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHBsdWdpbnM6IFtcclxuICAgICAgcmVhY3QoKSxcclxuICAgXHJcbiAgICAgIGVsZWN0cm9uKHtcclxuICAgICAgICBtYWluOiB7XHJcbiAgICAgICAgICAvLyBTaG9ydGN1dCBvZiBgYnVpbGQubGliLmVudHJ5YFxyXG4gICAgICAgICAgZW50cnk6IFwiZWxlY3Ryb24vbWFpbi9pbmRleC50c1wiLFxyXG4gICAgICAgICAgb25zdGFydChhcmdzKSB7XHJcbiAgICAgICAgICAgIGlmIChwcm9jZXNzLmVudi5WU0NPREVfREVCVUcpIHtcclxuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcclxuICAgICAgICAgICAgICAgIC8qIEZvciBgLnZzY29kZS8uZGVidWcuc2NyaXB0Lm1qc2AgKi8gXCJbc3RhcnR1cF0gRWxlY3Ryb24gQXBwXCJcclxuICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGFyZ3Muc3RhcnR1cCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgdml0ZToge1xyXG4gICAgICAgICAgICBidWlsZDoge1xyXG4gICAgICAgICAgICAgIHNvdXJjZW1hcCxcclxuICAgICAgICAgICAgICBtaW5pZnk6IGlzQnVpbGQsXHJcbiAgICAgICAgICAgICAgb3V0RGlyOiBcImRpc3QtZWxlY3Ryb24vbWFpblwiLFxyXG4gICAgICAgICAgICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICAgIGV4dGVybmFsOiBPYmplY3Qua2V5cyhcclxuICAgICAgICAgICAgICAgICAgXCJkZXBlbmRlbmNpZXNcIiBpbiBwa2cgPyBwa2cuZGVwZW5kZW5jaWVzIDoge31cclxuICAgICAgICAgICAgICAgICksXHJcblxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcHJlbG9hZDoge1xyXG4gICAgICAgICAgLy8gU2hvcnRjdXQgb2YgYGJ1aWxkLnJvbGx1cE9wdGlvbnMuaW5wdXRgLlxyXG4gICAgICAgICAgLy8gUHJlbG9hZCBzY3JpcHRzIG1heSBjb250YWluIFdlYiBhc3NldHMsIHNvIHVzZSB0aGUgYGJ1aWxkLnJvbGx1cE9wdGlvbnMuaW5wdXRgIGluc3RlYWQgYGJ1aWxkLmxpYi5lbnRyeWAuXHJcbiAgICAgICAgICBpbnB1dDogXCJlbGVjdHJvbi9wcmVsb2FkL2luZGV4LnRzXCIsXHJcbiAgICAgICAgICB2aXRlOiB7XHJcbiAgICAgICAgICAgIGJ1aWxkOiB7XHJcbiAgICAgICAgICAgICAgc291cmNlbWFwOiBzb3VyY2VtYXAgPyBcImlubGluZVwiIDogdW5kZWZpbmVkLCAvLyAjMzMyXHJcbiAgICAgICAgICAgICAgbWluaWZ5OiBpc0J1aWxkLFxyXG4gICAgICAgICAgICAgIG91dERpcjogXCJkaXN0LWVsZWN0cm9uL3ByZWxvYWRcIixcclxuICAgICAgICAgICAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgICBleHRlcm5hbDogT2JqZWN0LmtleXMoXHJcbiAgICAgICAgICAgICAgICAgIFwiZGVwZW5kZW5jaWVzXCIgaW4gcGtnID8gcGtnLmRlcGVuZGVuY2llcyA6IHt9XHJcbiAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICB9KSxcclxuXHJcbiAgICBdLFxyXG4gICAgc2VydmVyOlxyXG4gICAgICBwcm9jZXNzLmVudi5WU0NPREVfREVCVUcgJiZcclxuICAgICAgKCgpID0+IHtcclxuICAgICAgICBjb25zdCB1cmwgPSBuZXcgVVJMKHBrZy5kZWJ1Zy5lbnYuVklURV9ERVZfU0VSVkVSX1VSTCk7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIGhvc3Q6IHVybC5ob3N0bmFtZSxcclxuICAgICAgICAgIHBvcnQ6ICt1cmwucG9ydCxcclxuICAgICAgICB9O1xyXG4gICAgICB9KSgpLFxyXG4gICAgY2xlYXJTY3JlZW46IGZhbHNlLFxyXG4gIH07XHJcbn0pO1xyXG4iLCAie1xyXG4gIFwibmFtZVwiOiBcImJhbW9zXCIsXHJcbiAgXCJ2ZXJzaW9uXCI6IFwiMS4wLjVcIixcclxuICBcInByaXZhdGVcIjogdHJ1ZSxcclxuICBcImRlc2NyaXB0aW9uXCI6IFwiQmFtb3MuXCIsXHJcbiAgXCJsaWNlbnNlXCI6IFwiTUlUXCIsXHJcbiAgXCJhdXRob3JcIjogXCJEemlhbmlzIEthdmFsY2h1a1wiLFxyXG4gIFwidHlwZVwiOiBcIm1vZHVsZVwiLFxyXG4gIFwibWFpblwiOiBcImRpc3QtZWxlY3Ryb24vbWFpbi9pbmRleC5qc1wiLFxyXG4gIFwic2NyaXB0c1wiOiB7XHJcbiAgICBcImJ1aWxkXCI6IFwidHNjICYmIHZpdGUgYnVpbGQgJiYgZWxlY3Ryb24tYnVpbGRlclwiLFxyXG4gICAgXCJkZXZcIjogXCJ2aXRlXCIsXHJcbiAgICBcInByZWUyZVwiOiBcInZpdGUgYnVpbGQgLS1tb2RlPXRlc3RcIixcclxuICAgIFwiZTJlXCI6IFwicGxheXdyaWdodCB0ZXN0XCIsXHJcbiAgICBcImZvcm1hdFwiOiBcInByZXR0aWVyIC0td3JpdGUgLS1jYWNoZSAuXCIsXHJcbiAgICBcImxpbnRcIjogXCJlc2xpbnQgLS1jYWNoZSAuXCIsXHJcbiAgICBcImxpbnQtZml4XCI6IFwiZXNsaW50IC0tZml4XCIsXHJcbiAgICBcInByZXZpZXdcIjogXCJ2aXRlIHByZXZpZXdcIixcclxuICAgIFwidHlwZWNoZWNrXCI6IFwidHNjIC1wIHNjcmlwdHMgLS1ub0VtaXQgJiYgcG5wbSAtciAtLXBhcmFsbGVsIHJ1biB0eXBlY2hlY2tcIlxyXG4gIH0sXHJcbiAgXCJkZXBlbmRlbmNpZXNcIjoge1xyXG4gICAgXCJAYW50LWRlc2lnbi9jaGFydHNcIjogXCJeMi4wLjJcIixcclxuICAgIFwiQGFudC1kZXNpZ24vcHJvLWNvbXBvbmVudHNcIjogXCJeMi42LjQ4XCIsXHJcbiAgICBcIkByZWFjdC1wZGYvcmVuZGVyZXJcIjogXCJeMy4zLjRcIixcclxuICAgIFwiQHJlZHV4anMvdG9vbGtpdFwiOiBcIl4yLjEuMFwiLFxyXG4gICAgXCJAdHlwZXMvbG9kYXNoLmdldFwiOiBcIl40LjQuOVwiLFxyXG4gICAgXCJAdHlwZXMvcmVhY3QtaGlnaGxpZ2h0LXdvcmRzXCI6IFwiXjAuMTYuN1wiLFxyXG4gICAgXCJAdHlwZXMvcmVhY3QtcGRmXCI6IFwiXjcuMC4wXCIsXHJcbiAgICBcIkB0eXBlcy9yZWFjdC1yb3V0ZXItZG9tXCI6IFwiXjUuMy4zXCIsXHJcbiAgICBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI6IFwiXjQuMC40XCIsXHJcbiAgICBcImFudGRcIjogXCJeNS4xMy4yXCIsXHJcbiAgICBcImFudGQtdGFibGUtc2F2ZWFzLWV4Y2VsXCI6IFwiXjIuMi4xXCIsXHJcbiAgICBcImF4aW9zXCI6IFwiXjEuNi41XCIsXHJcbiAgICBcImVsZWN0cm9uLXVwZGF0ZXJcIjogXCJeNi4xLjFcIixcclxuICAgIFwiZmlsZS1zYXZlclwiOiBcIl4yLjAuNVwiLFxyXG4gICAgXCJpMThuZXh0XCI6IFwiXjIzLjcuMTlcIixcclxuICAgIFwibG9jYWxmb3JhZ2VcIjogXCJeMS4xMC4wXCIsXHJcbiAgICBcImxvZGFzaC5nZXRcIjogXCJeNC40LjJcIixcclxuICAgIFwibWF0Y2gtc29ydGVyXCI6IFwiXjYuMy4zXCIsXHJcbiAgICBcInJlYWN0LWhpZ2hsaWdodC13b3Jkc1wiOiBcIl4wLjIwLjBcIixcclxuICAgIFwicmVhY3QtaG90LXRvYXN0XCI6IFwiXjIuNC4xXCIsXHJcbiAgICBcInJlYWN0LWkxOG5leHRcIjogXCJeMTQuMC4xXCIsXHJcbiAgICBcInJlYWN0LWxpdmUtY2xvY2tcIjogXCJeNi4xLjE5XCIsXHJcbiAgICBcInJlYWN0LW1vbWVudFwiOiBcIl4xLjEuM1wiLFxyXG4gICAgXCJyZWFjdC1yZWR1eFwiOiBcIl45LjEuMFwiLFxyXG4gICAgXCJyZWFjdC1yb3V0ZXItZG9tXCI6IFwiXjYuMjEuM1wiLFxyXG4gICAgXCJyZWR1eFwiOiBcIl41LjAuMVwiLFxyXG4gICAgXCJzb3J0LWJ5XCI6IFwiXjAuMC4yXCIsXHJcbiAgICBcInVtaS1yZXF1ZXN0XCI6IFwiXjEuMi4zXCIsXHJcbiAgICBcInV1aWRcIjogXCJeOS4wLjFcIixcclxuICAgIFwidml0ZS1wbHVnaW4tZWxlY3Ryb25cIjogXCJeMC4yOC4wXCIsXHJcbiAgICBcInhsc3hcIjogXCJeMC4xOC41XCJcclxuICB9LFxyXG4gIFwiZGV2RGVwZW5kZW5jaWVzXCI6IHtcclxuICAgIFwiQHBsYXl3cmlnaHQvdGVzdFwiOiBcIl4xLjM3LjFcIixcclxuICAgIFwiQHR5cGVzL3JlYWN0XCI6IFwiXjE4LjIuNDhcIixcclxuICAgIFwiQHR5cGVzL3JlYWN0LWRvbVwiOiBcIl4xOC4yLjdcIixcclxuICAgIFwiQHR5cGVzL3JlYWN0LXJlZHV4XCI6IFwiXjcuMS4zM1wiLFxyXG4gICAgXCJAdHlwZXMvdXVpZFwiOiBcIl45LjAuN1wiLFxyXG4gICAgXCJAdHlwZXNjcmlwdC1lc2xpbnQvZXNsaW50LXBsdWdpblwiOiBcIl42LjE5LjFcIixcclxuICAgIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjogXCJeNC4wLjRcIixcclxuICAgIFwiYXV0b3ByZWZpeGVyXCI6IFwiXjEwLjQuMTZcIixcclxuICAgIFwiZWxlY3Ryb25cIjogXCJeMjguMS4wXCIsXHJcbiAgICBcImVsZWN0cm9uLWJ1aWxkZXJcIjogXCJeMjQuNi4zXCIsXHJcbiAgICBcImVzbGludFwiOiBcIl44LjU2LjBcIixcclxuICAgIFwiZXNsaW50LWNvbmZpZy1zdGFuZGFyZC13aXRoLXR5cGVzY3JpcHRcIjogXCJeNDMuMC4xXCIsXHJcbiAgICBcImVzbGludC1wbHVnaW4taW1wb3J0XCI6IFwiXjIuMjkuMVwiLFxyXG4gICAgXCJlc2xpbnQtcGx1Z2luLW5cIjogXCJeMTYuNi4yXCIsXHJcbiAgICBcImVzbGludC1wbHVnaW4tcHJvbWlzZVwiOiBcIl42LjEuMVwiLFxyXG4gICAgXCJlc2xpbnQtcGx1Z2luLXJlYWN0XCI6IFwiXjcuMzMuMlwiLFxyXG4gICAgXCJwb3N0Y3NzXCI6IFwiXjguNC4zMVwiLFxyXG4gICAgXCJyZWFjdFwiOiBcIl4xOC4yLjBcIixcclxuICAgIFwicmVhY3QtZG9tXCI6IFwiXjE4LjIuMFwiLFxyXG4gICAgXCJ0YWlsd2luZGNzc1wiOiBcIl4zLjMuM1wiLFxyXG4gICAgXCJ0cmVlLWtpbGxcIjogXCJeMS4yLjJcIixcclxuICAgIFwidHlwZXNjcmlwdFwiOiBcIl41LjMuM1wiLFxyXG4gICAgXCJ2aXRlXCI6IFwiXjUuMC4xMFwiLFxyXG4gICAgXCJ2aXRlLXBsdWdpbi1lbGVjdHJvblwiOiBcIl4wLjI4LjBcIixcclxuICAgIFwidml0ZS1wbHVnaW4tZWxlY3Ryb24tcmVuZGVyZXJcIjogXCJeMC4xNC41XCIsXHJcbiAgICBcInZpdGUtcGx1Z2luLW5vZGUtcG9seWZpbGxzXCI6IFwiXjAuMTkuMFwiLFxyXG4gICAgXCJ2aXRlLXBsdWdpbi1yZXF1aXJlLXRyYW5zZm9ybVwiOiBcIl4xLjAuMjFcIlxyXG4gIH0sXHJcbiAgXCJkZWJ1Z1wiOiB7XHJcbiAgICBcImVudlwiOiB7XHJcbiAgICAgIFwiVklURV9ERVZfU0VSVkVSX1VSTFwiOiBcImh0dHA6Ly8xMjcuMC4wLjE6Nzc3Ny9cIlxyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXdRLFNBQVMsY0FBYztBQUMvUixPQUFPLFVBQVU7QUFDakIsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxXQUFXO0FB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
