import { rmSync } from 'fs';
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron/simple';
import pkg from './package.json';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig(({ command }) => {
  if (command === 'build') {
    rmSync('dist-electron', { recursive: true, force: true });
  }

  const isServe = command === 'serve';
  const isBuild = command === 'build';
  const sourcemap = isServe || !!process.env.VSCODE_DEBUG;

  return {
    optimizeDeps: {
      include: ['pdfmake', 'pdfmake/build/vfs_fonts'],
      exclude: ['canvas'],
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    plugins: [
      react(),
      nodePolyfills(),
      electron({
        main: {
          entry: 'electron/main/index.ts',
          onstart(args) {
            if (process.env.VSCODE_DEBUG) {
              console.log('[startup] Electron App');
            } else {
              args.startup();
            }
          },
          vite: {
            build: {
              sourcemap,
              minify: isBuild,
              outDir: 'dist-electron/main',
              rollupOptions: {
                external: [
                  ...Object.keys(pkg.dependencies || {}),
                  'pdfmake',
                  'pdfmake/build/vfs_fonts',
                ],
              },
            },
          },
        },
        preload: {
          input: 'electron/preload/index.ts',
          vite: {
            build: {
              sourcemap: sourcemap ? 'inline' : undefined,
              minify: isBuild,
              outDir: 'dist-electron/preload',
              rollupOptions: {
                external: [
                  ...Object.keys(pkg.dependencies || {}),
                  'pdfmake',
                  'pdfmake/build/vfs_fonts','electron', 'canvas'
                ],
              },
            },
          },
        },
      }),
    ],
    server: process.env.VSCODE_DEBUG
      ? {
          host: new URL(pkg.debug.env.VITE_DEV_SERVER_URL).hostname,
          port: +new URL(pkg.debug.env.VITE_DEV_SERVER_URL).port,
        }
      : undefined,
    clearScreen: false,
  };
});
