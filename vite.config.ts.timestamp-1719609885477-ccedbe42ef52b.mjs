var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// package.json
var require_package = __commonJS({
  "package.json"(exports, module) {
    module.exports = {
      name: "bamos",
      version: "0.0.17",
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
        "@faker-js/faker": "^8.4.1",
        "@geoffcox/react-splitter": "^2.1.2",
        "@react-pdf/renderer": " ^3.3.4",
        "@reduxjs/toolkit": "^2.1.0",
        "@types/jspdf": "^2.0.0",
        "@types/lodash.get": "^4.4.9",
        "@types/qrcode": "^1.5.5",
        "@types/react-highlight-words": "^0.16.7",
        "@types/react-pdf": "^7.0.0",
        "@types/react-router-dom": "^5.3.3",
        "ag-grid-community": "^31.3.2",
        "ag-grid-react": "^31.3.2",
        antd: "^5.13.2",
        "antd-table-saveas-excel": "^2.2.1",
        axios: "^1.6.5",
        "date-fns": "^3.6.0",
        "electron-fetch": "^1.9.1",
        "electron-pdf-window": "^1.0.12",
        "electron-updater": "^6.1.1",
        "file-saver": "^2.0.5",
        i18next: "^23.7.19",
        jsbarcode: "^3.11.6",
        jspdf: "^2.5.1",
        localforage: "^1.10.0",
        "lodash.get": "^4.4.2",
        "match-sorter": "^6.3.3",
        pdfmake: "^0.2.10",
        qrcode: "^1.5.3",
        "react-dnd": "^16.0.1",
        "react-dnd-html5-backend": "^16.0.1",
        "react-highlight-words": "^0.20.0",
        "react-hot-toast": "^2.4.1",
        "react-i18next": "^14.0.1",
        "react-live-clock": "^6.1.19",
        "react-moment": "^1.1.3",
        "react-qr-code": "^2.0.12",
        "react-redux": "^9.1.0",
        "react-resizable": "^3.0.5",
        "react-router-dom": "^6.21.3",
        "react-table": "^7.8.0",
        redux: "^5.0.1",
        "sort-by": "^0.0.2",
        "umi-request": "^1.2.3",
        uuid: "^9.0.1",
        xlsx: "^0.18.5",
        "xlsx-style": "^0.8.13",
        xml2js: "^0.6.2"
      },
      devDependencies: {
        "@playwright/test": "^1.37.1",
        "@types/jsbarcode": "^3.11.4",
        "@types/pdfmake": "^0.2.9",
        "@types/react": "^18.2.48",
        "@types/react-dom": "^18.2.7",
        "@types/react-redux": "^7.1.33",
        "@types/react-resizable": "^3.0.7",
        "@types/react-table": "^7.7.20",
        "@types/uuid": "^9.0.7",
        "@types/xml2js": "^0.4.14",
        "@typescript-eslint/eslint-plugin": "^6.19.1",
        "@vitejs/plugin-react": "^4.3.1",
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
        "vite-plugin-commonjs": "^0.10.1",
        "vite-plugin-electron": "^0.28.7",
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
  }
});

// vite.config.ts
var import_package = __toESM(require_package(), 1);
import path from "node:path";
import { defineConfig } from "file:///D:/DEVELOP/BAMOS407T/node_modules/vite/dist/node/index.js";
import react from "file:///D:/DEVELOP/BAMOS407T/node_modules/@vitejs/plugin-react/dist/index.mjs";
import electron from "file:///D:/DEVELOP/BAMOS407T/node_modules/vite-plugin-electron/dist/simple.mjs";
import { nodePolyfills } from "file:///D:/DEVELOP/BAMOS407T/node_modules/vite-plugin-node-polyfills/dist/index.js";
import commonjs from "file:///D:/DEVELOP/BAMOS407T/node_modules/vite-plugin-commonjs/dist/index.mjs";
var __vite_injected_original_dirname = "D:\\DEVELOP\\BAMOS407T";
var vite_config_default = defineConfig(({ command }) => {
  const isServe = command === "serve";
  const isBuild = command === "build";
  const sourcemap = isServe || !!process.env.VSCODE_DEBUG;
  return {
    resolve: {
      alias: {
        "@": path.join(__vite_injected_original_dirname, "src")
        // pdfmake: path.resolve(__dirname, 'node_modules/pdfmake/build/pdfmake.js'),
        // 'pdfmake-vfs': path.resolve(__dirname, 'node_modules/pdfmake/build/vfs_fonts.js'),
      }
    },
    plugins: [
      react(),
      nodePolyfills(),
      commonjs(),
      electron({
        main: {
          entry: "electron/main/index.ts",
          onstart(args) {
            if (process.env.VSCODE_DEBUG) {
              console.log("[startup] Electron App");
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
                external: [
                  ...Object.keys(require_package().dependencies || {}),
                  "pdfmake",
                  "pdfmake/build/vfs_fonts"
                ]
              }
            }
          }
        },
        preload: {
          input: "electron/preload/index.ts",
          vite: {
            build: {
              sourcemap: sourcemap ? "inline" : void 0,
              minify: isBuild,
              outDir: "dist-electron/preload",
              rollupOptions: {
                external: [
                  ...Object.keys(require_package().dependencies || {}),
                  "pdfmake",
                  "pdfmake/build/vfs_fonts"
                ]
              },
              commonjsOptions: {
                include: /node_modules/,
                transformMixedEsModules: true
              }
            }
          }
        }
      })
    ],
    server: process.env.VSCODE_DEBUG && (() => {
      const url = new URL(import_package.default.debug.env.VITE_DEV_SERVER_URL);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsicGFja2FnZS5qc29uIiwgInZpdGUuY29uZmlnLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJ7XHJcbiAgXCJuYW1lXCI6IFwiYmFtb3NcIixcclxuICBcInZlcnNpb25cIjogXCIwLjAuMTdcIixcclxuICBcInByaXZhdGVcIjogdHJ1ZSxcclxuICBcImRlc2NyaXB0aW9uXCI6IFwiQmFtb3MuXCIsXHJcbiAgXCJsaWNlbnNlXCI6IFwiTUlUXCIsXHJcbiAgXCJhdXRob3JcIjogXCJEemlhbmlzIEthdmFsY2h1a1wiLFxyXG4gIFwidHlwZVwiOiBcIm1vZHVsZVwiLFxyXG4gIFwibWFpblwiOiBcImRpc3QtZWxlY3Ryb24vbWFpbi9pbmRleC5qc1wiLFxyXG4gIFwic2NyaXB0c1wiOiB7XHJcbiAgICBcImJ1aWxkXCI6IFwidHNjICYmIHZpdGUgYnVpbGQgJiYgZWxlY3Ryb24tYnVpbGRlclwiLFxyXG4gICAgXCJkZXZcIjogXCJ2aXRlXCIsXHJcbiAgICBcInByZWUyZVwiOiBcInZpdGUgYnVpbGQgLS1tb2RlPXRlc3RcIixcclxuICAgIFwiZTJlXCI6IFwicGxheXdyaWdodCB0ZXN0XCIsXHJcbiAgICBcImZvcm1hdFwiOiBcInByZXR0aWVyIC0td3JpdGUgLS1jYWNoZSAuXCIsXHJcbiAgICBcImxpbnRcIjogXCJlc2xpbnQgLS1jYWNoZSAuXCIsXHJcbiAgICBcImxpbnQtZml4XCI6IFwiZXNsaW50IC0tZml4XCIsXHJcbiAgICBcInByZXZpZXdcIjogXCJ2aXRlIHByZXZpZXdcIixcclxuICAgIFwidHlwZWNoZWNrXCI6IFwidHNjIC1wIHNjcmlwdHMgLS1ub0VtaXQgJiYgcG5wbSAtciAtLXBhcmFsbGVsIHJ1biB0eXBlY2hlY2tcIlxyXG4gIH0sXHJcbiAgXCJkZXBlbmRlbmNpZXNcIjoge1xyXG4gICAgXCJAYW50LWRlc2lnbi9jaGFydHNcIjogXCJeMi4wLjJcIixcclxuICAgIFwiQGFudC1kZXNpZ24vcHJvLWNvbXBvbmVudHNcIjogXCJeMi42LjQ4XCIsXHJcbiAgICBcIkBmYWtlci1qcy9mYWtlclwiOiBcIl44LjQuMVwiLFxyXG4gICAgXCJAZ2VvZmZjb3gvcmVhY3Qtc3BsaXR0ZXJcIjogXCJeMi4xLjJcIixcclxuICAgIFwiQHJlYWN0LXBkZi9yZW5kZXJlclwiOiBcIiBeMy4zLjRcIixcclxuICAgIFwiQHJlZHV4anMvdG9vbGtpdFwiOiBcIl4yLjEuMFwiLFxyXG4gICAgXCJAdHlwZXMvanNwZGZcIjogXCJeMi4wLjBcIixcclxuICAgIFwiQHR5cGVzL2xvZGFzaC5nZXRcIjogXCJeNC40LjlcIixcclxuICAgIFwiQHR5cGVzL3FyY29kZVwiOiBcIl4xLjUuNVwiLFxyXG4gICAgXCJAdHlwZXMvcmVhY3QtaGlnaGxpZ2h0LXdvcmRzXCI6IFwiXjAuMTYuN1wiLFxyXG4gICAgXCJAdHlwZXMvcmVhY3QtcGRmXCI6IFwiXjcuMC4wXCIsXHJcbiAgICBcIkB0eXBlcy9yZWFjdC1yb3V0ZXItZG9tXCI6IFwiXjUuMy4zXCIsXHJcbiAgICBcImFnLWdyaWQtY29tbXVuaXR5XCI6IFwiXjMxLjMuMlwiLFxyXG4gICAgXCJhZy1ncmlkLXJlYWN0XCI6IFwiXjMxLjMuMlwiLFxyXG4gICAgXCJhbnRkXCI6IFwiXjUuMTMuMlwiLFxyXG4gICAgXCJhbnRkLXRhYmxlLXNhdmVhcy1leGNlbFwiOiBcIl4yLjIuMVwiLFxyXG4gICAgXCJheGlvc1wiOiBcIl4xLjYuNVwiLFxyXG4gICAgXCJkYXRlLWZuc1wiOiBcIl4zLjYuMFwiLFxyXG4gICAgXCJlbGVjdHJvbi1mZXRjaFwiOiBcIl4xLjkuMVwiLFxyXG4gICAgXCJlbGVjdHJvbi1wZGYtd2luZG93XCI6IFwiXjEuMC4xMlwiLFxyXG4gICAgXCJlbGVjdHJvbi11cGRhdGVyXCI6IFwiXjYuMS4xXCIsXHJcbiAgICBcImZpbGUtc2F2ZXJcIjogXCJeMi4wLjVcIixcclxuICAgIFwiaTE4bmV4dFwiOiBcIl4yMy43LjE5XCIsXHJcbiAgICBcImpzYmFyY29kZVwiOiBcIl4zLjExLjZcIixcclxuICAgIFwianNwZGZcIjogXCJeMi41LjFcIixcclxuICAgIFwibG9jYWxmb3JhZ2VcIjogXCJeMS4xMC4wXCIsXHJcbiAgICBcImxvZGFzaC5nZXRcIjogXCJeNC40LjJcIixcclxuICAgIFwibWF0Y2gtc29ydGVyXCI6IFwiXjYuMy4zXCIsXHJcbiAgICBcInBkZm1ha2VcIjogXCJeMC4yLjEwXCIsXHJcbiAgICBcInFyY29kZVwiOiBcIl4xLjUuM1wiLFxyXG4gICAgXCJyZWFjdC1kbmRcIjogXCJeMTYuMC4xXCIsXHJcbiAgICBcInJlYWN0LWRuZC1odG1sNS1iYWNrZW5kXCI6IFwiXjE2LjAuMVwiLFxyXG4gICAgXCJyZWFjdC1oaWdobGlnaHQtd29yZHNcIjogXCJeMC4yMC4wXCIsXHJcbiAgICBcInJlYWN0LWhvdC10b2FzdFwiOiBcIl4yLjQuMVwiLFxyXG4gICAgXCJyZWFjdC1pMThuZXh0XCI6IFwiXjE0LjAuMVwiLFxyXG4gICAgXCJyZWFjdC1saXZlLWNsb2NrXCI6IFwiXjYuMS4xOVwiLFxyXG4gICAgXCJyZWFjdC1tb21lbnRcIjogXCJeMS4xLjNcIixcclxuICAgIFwicmVhY3QtcXItY29kZVwiOiBcIl4yLjAuMTJcIixcclxuICAgIFwicmVhY3QtcmVkdXhcIjogXCJeOS4xLjBcIixcclxuICAgIFwicmVhY3QtcmVzaXphYmxlXCI6IFwiXjMuMC41XCIsXHJcbiAgICBcInJlYWN0LXJvdXRlci1kb21cIjogXCJeNi4yMS4zXCIsXHJcbiAgICBcInJlYWN0LXRhYmxlXCI6IFwiXjcuOC4wXCIsXHJcbiAgICBcInJlZHV4XCI6IFwiXjUuMC4xXCIsXHJcbiAgICBcInNvcnQtYnlcIjogXCJeMC4wLjJcIixcclxuICAgIFwidW1pLXJlcXVlc3RcIjogXCJeMS4yLjNcIixcclxuICAgIFwidXVpZFwiOiBcIl45LjAuMVwiLFxyXG4gICAgXCJ4bHN4XCI6IFwiXjAuMTguNVwiLFxyXG4gICAgXCJ4bHN4LXN0eWxlXCI6IFwiXjAuOC4xM1wiLFxyXG4gICAgXCJ4bWwyanNcIjogXCJeMC42LjJcIlxyXG4gIH0sXHJcbiAgXCJkZXZEZXBlbmRlbmNpZXNcIjoge1xyXG4gICAgXCJAcGxheXdyaWdodC90ZXN0XCI6IFwiXjEuMzcuMVwiLFxyXG4gICAgXCJAdHlwZXMvanNiYXJjb2RlXCI6IFwiXjMuMTEuNFwiLFxyXG4gICAgXCJAdHlwZXMvcGRmbWFrZVwiOiBcIl4wLjIuOVwiLFxyXG4gICAgXCJAdHlwZXMvcmVhY3RcIjogXCJeMTguMi40OFwiLFxyXG4gICAgXCJAdHlwZXMvcmVhY3QtZG9tXCI6IFwiXjE4LjIuN1wiLFxyXG4gICAgXCJAdHlwZXMvcmVhY3QtcmVkdXhcIjogXCJeNy4xLjMzXCIsXHJcbiAgICBcIkB0eXBlcy9yZWFjdC1yZXNpemFibGVcIjogXCJeMy4wLjdcIixcclxuICAgIFwiQHR5cGVzL3JlYWN0LXRhYmxlXCI6IFwiXjcuNy4yMFwiLFxyXG4gICAgXCJAdHlwZXMvdXVpZFwiOiBcIl45LjAuN1wiLFxyXG4gICAgXCJAdHlwZXMveG1sMmpzXCI6IFwiXjAuNC4xNFwiLFxyXG4gICAgXCJAdHlwZXNjcmlwdC1lc2xpbnQvZXNsaW50LXBsdWdpblwiOiBcIl42LjE5LjFcIixcclxuICAgIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjogXCJeNC4zLjFcIixcclxuICAgIFwiYXV0b3ByZWZpeGVyXCI6IFwiXjEwLjQuMTZcIixcclxuICAgIFwiZWxlY3Ryb25cIjogXCJeMjguMS4wXCIsXHJcbiAgICBcImVsZWN0cm9uLWJ1aWxkZXJcIjogXCJeMjQuNi4zXCIsXHJcbiAgICBcImVzbGludFwiOiBcIl44LjU2LjBcIixcclxuICAgIFwiZXNsaW50LWNvbmZpZy1zdGFuZGFyZC13aXRoLXR5cGVzY3JpcHRcIjogXCJeNDMuMC4xXCIsXHJcbiAgICBcImVzbGludC1wbHVnaW4taW1wb3J0XCI6IFwiXjIuMjkuMVwiLFxyXG4gICAgXCJlc2xpbnQtcGx1Z2luLW5cIjogXCJeMTYuNi4yXCIsXHJcbiAgICBcImVzbGludC1wbHVnaW4tcHJvbWlzZVwiOiBcIl42LjEuMVwiLFxyXG4gICAgXCJlc2xpbnQtcGx1Z2luLXJlYWN0XCI6IFwiXjcuMzMuMlwiLFxyXG4gICAgXCJwb3N0Y3NzXCI6IFwiXjguNC4zMVwiLFxyXG4gICAgXCJyZWFjdFwiOiBcIl4xOC4yLjBcIixcclxuICAgIFwicmVhY3QtZG9tXCI6IFwiXjE4LjIuMFwiLFxyXG4gICAgXCJ0YWlsd2luZGNzc1wiOiBcIl4zLjMuM1wiLFxyXG4gICAgXCJ0cmVlLWtpbGxcIjogXCJeMS4yLjJcIixcclxuICAgIFwidHlwZXNjcmlwdFwiOiBcIl41LjMuM1wiLFxyXG4gICAgXCJ2aXRlXCI6IFwiXjUuMC4xMFwiLFxyXG4gICAgXCJ2aXRlLXBsdWdpbi1jb21tb25qc1wiOiBcIl4wLjEwLjFcIixcclxuICAgIFwidml0ZS1wbHVnaW4tZWxlY3Ryb25cIjogXCJeMC4yOC43XCIsXHJcbiAgICBcInZpdGUtcGx1Z2luLWVsZWN0cm9uLXJlbmRlcmVyXCI6IFwiXjAuMTQuNVwiLFxyXG4gICAgXCJ2aXRlLXBsdWdpbi1ub2RlLXBvbHlmaWxsc1wiOiBcIl4wLjE5LjBcIixcclxuICAgIFwidml0ZS1wbHVnaW4tcmVxdWlyZS10cmFuc2Zvcm1cIjogXCJeMS4wLjIxXCJcclxuICB9LFxyXG4gIFwiZGVidWdcIjoge1xyXG4gICAgXCJlbnZcIjoge1xyXG4gICAgICBcIlZJVEVfREVWX1NFUlZFUl9VUkxcIjogXCJodHRwOi8vMTI3LjAuMC4xOjc3NzcvXCJcclxuICAgIH1cclxuICB9XHJcbn1cclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxERVZFTE9QXFxcXEJBTU9TNDA3VFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcREVWRUxPUFxcXFxCQU1PUzQwN1RcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L0RFVkVMT1AvQkFNT1M0MDdUL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgcm1TeW5jIH0gZnJvbSAnbm9kZTpmcyc7XHJcbmltcG9ydCBwYXRoIGZyb20gJ25vZGU6cGF0aCc7XHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xyXG5pbXBvcnQgZWxlY3Ryb24gZnJvbSAndml0ZS1wbHVnaW4tZWxlY3Ryb24vc2ltcGxlJztcclxuaW1wb3J0IHBrZyBmcm9tICcuL3BhY2thZ2UuanNvbic7XHJcbmltcG9ydCB7IG5vZGVQb2x5ZmlsbHMgfSBmcm9tICd2aXRlLXBsdWdpbi1ub2RlLXBvbHlmaWxscyc7XHJcbmltcG9ydCBjb21tb25qcyBmcm9tICd2aXRlLXBsdWdpbi1jb21tb25qcyc7XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgY29tbWFuZCB9KSA9PiB7XHJcbiAgLy8gcm1TeW5jKCdkaXN0LWVsZWN0cm9uJywgeyByZWN1cnNpdmU6IHRydWUsIGZvcmNlOiB0cnVlIH0pO1xyXG5cclxuICBjb25zdCBpc1NlcnZlID0gY29tbWFuZCA9PT0gJ3NlcnZlJztcclxuICBjb25zdCBpc0J1aWxkID0gY29tbWFuZCA9PT0gJ2J1aWxkJztcclxuICBjb25zdCBzb3VyY2VtYXAgPSBpc1NlcnZlIHx8ICEhcHJvY2Vzcy5lbnYuVlNDT0RFX0RFQlVHO1xyXG5cclxuICByZXR1cm4ge1xyXG4gICAgcmVzb2x2ZToge1xyXG4gICAgICBhbGlhczoge1xyXG4gICAgICAgICdAJzogcGF0aC5qb2luKF9fZGlybmFtZSwgJ3NyYycpLFxyXG4gICAgICAgIC8vIHBkZm1ha2U6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdub2RlX21vZHVsZXMvcGRmbWFrZS9idWlsZC9wZGZtYWtlLmpzJyksXHJcbiAgICAgICAgLy8gJ3BkZm1ha2UtdmZzJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ25vZGVfbW9kdWxlcy9wZGZtYWtlL2J1aWxkL3Zmc19mb250cy5qcycpLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHBsdWdpbnM6IFtcclxuICAgICAgcmVhY3QoKSxcclxuICAgICAgbm9kZVBvbHlmaWxscygpLFxyXG4gICAgICBjb21tb25qcygpLFxyXG4gICAgICBlbGVjdHJvbih7XHJcbiAgICAgICAgbWFpbjoge1xyXG4gICAgICAgICAgZW50cnk6ICdlbGVjdHJvbi9tYWluL2luZGV4LnRzJyxcclxuICAgICAgICAgIG9uc3RhcnQoYXJncykge1xyXG4gICAgICAgICAgICBpZiAocHJvY2Vzcy5lbnYuVlNDT0RFX0RFQlVHKSB7XHJcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tzdGFydHVwXSBFbGVjdHJvbiBBcHAnKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBhcmdzLnN0YXJ0dXAoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHZpdGU6IHtcclxuICAgICAgICAgICAgYnVpbGQ6IHtcclxuICAgICAgICAgICAgICBzb3VyY2VtYXAsXHJcbiAgICAgICAgICAgICAgbWluaWZ5OiBpc0J1aWxkLFxyXG4gICAgICAgICAgICAgIG91dERpcjogJ2Rpc3QtZWxlY3Ryb24vbWFpbicsXHJcbiAgICAgICAgICAgICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICAgICAgICAgICAgZXh0ZXJuYWw6IFtcclxuICAgICAgICAgICAgICAgICAgLi4uT2JqZWN0LmtleXMocmVxdWlyZSgnLi9wYWNrYWdlLmpzb24nKS5kZXBlbmRlbmNpZXMgfHwge30pLFxyXG4gICAgICAgICAgICAgICAgICAncGRmbWFrZScsXHJcbiAgICAgICAgICAgICAgICAgICdwZGZtYWtlL2J1aWxkL3Zmc19mb250cycsXHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcHJlbG9hZDoge1xyXG4gICAgICAgICAgaW5wdXQ6ICdlbGVjdHJvbi9wcmVsb2FkL2luZGV4LnRzJyxcclxuICAgICAgICAgIHZpdGU6IHtcclxuICAgICAgICAgICAgYnVpbGQ6IHtcclxuICAgICAgICAgICAgICBzb3VyY2VtYXA6IHNvdXJjZW1hcCA/ICdpbmxpbmUnIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgIG1pbmlmeTogaXNCdWlsZCxcclxuICAgICAgICAgICAgICBvdXREaXI6ICdkaXN0LWVsZWN0cm9uL3ByZWxvYWQnLFxyXG4gICAgICAgICAgICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICAgIGV4dGVybmFsOiBbXHJcbiAgICAgICAgICAgICAgICAgIC4uLk9iamVjdC5rZXlzKHJlcXVpcmUoJy4vcGFja2FnZS5qc29uJykuZGVwZW5kZW5jaWVzIHx8IHt9KSxcclxuICAgICAgICAgICAgICAgICAgJ3BkZm1ha2UnLFxyXG4gICAgICAgICAgICAgICAgICAncGRmbWFrZS9idWlsZC92ZnNfZm9udHMnLFxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIGNvbW1vbmpzT3B0aW9uczoge1xyXG4gICAgICAgICAgICAgICAgaW5jbHVkZTogL25vZGVfbW9kdWxlcy8sXHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1NaXhlZEVzTW9kdWxlczogdHJ1ZSxcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICB9KSxcclxuICAgIF0sXHJcbiAgICBzZXJ2ZXI6XHJcbiAgICAgIHByb2Nlc3MuZW52LlZTQ09ERV9ERUJVRyAmJlxyXG4gICAgICAoKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHVybCA9IG5ldyBVUkwocGtnLmRlYnVnLmVudi5WSVRFX0RFVl9TRVJWRVJfVVJMKTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgaG9zdDogdXJsLmhvc3RuYW1lLFxyXG4gICAgICAgICAgcG9ydDogK3VybC5wb3J0LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0pKCksXHJcbiAgICBjbGVhclNjcmVlbjogZmFsc2UsXHJcbiAgfTtcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBLE1BQ0UsTUFBUTtBQUFBLE1BQ1IsU0FBVztBQUFBLE1BQ1gsU0FBVztBQUFBLE1BQ1gsYUFBZTtBQUFBLE1BQ2YsU0FBVztBQUFBLE1BQ1gsUUFBVTtBQUFBLE1BQ1YsTUFBUTtBQUFBLE1BQ1IsTUFBUTtBQUFBLE1BQ1IsU0FBVztBQUFBLFFBQ1QsT0FBUztBQUFBLFFBQ1QsS0FBTztBQUFBLFFBQ1AsUUFBVTtBQUFBLFFBQ1YsS0FBTztBQUFBLFFBQ1AsUUFBVTtBQUFBLFFBQ1YsTUFBUTtBQUFBLFFBQ1IsWUFBWTtBQUFBLFFBQ1osU0FBVztBQUFBLFFBQ1gsV0FBYTtBQUFBLE1BQ2Y7QUFBQSxNQUNBLGNBQWdCO0FBQUEsUUFDZCxzQkFBc0I7QUFBQSxRQUN0Qiw4QkFBOEI7QUFBQSxRQUM5QixtQkFBbUI7QUFBQSxRQUNuQiw0QkFBNEI7QUFBQSxRQUM1Qix1QkFBdUI7QUFBQSxRQUN2QixvQkFBb0I7QUFBQSxRQUNwQixnQkFBZ0I7QUFBQSxRQUNoQixxQkFBcUI7QUFBQSxRQUNyQixpQkFBaUI7QUFBQSxRQUNqQixnQ0FBZ0M7QUFBQSxRQUNoQyxvQkFBb0I7QUFBQSxRQUNwQiwyQkFBMkI7QUFBQSxRQUMzQixxQkFBcUI7QUFBQSxRQUNyQixpQkFBaUI7QUFBQSxRQUNqQixNQUFRO0FBQUEsUUFDUiwyQkFBMkI7QUFBQSxRQUMzQixPQUFTO0FBQUEsUUFDVCxZQUFZO0FBQUEsUUFDWixrQkFBa0I7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
