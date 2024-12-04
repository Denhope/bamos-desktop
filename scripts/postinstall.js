import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, basename } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function copyCanvasModules() {
  const sourceDir = join(dirname(__dirname), 'node_modules/@napi-rs/canvas/');
  const targetDir = join(dirname(__dirname), 'dist-electron/main');

  try {
    await fs.mkdir(targetDir, { recursive: true });

    if (
      await fs
        .access(sourceDir)
        .then(() => true)
        .catch(() => false)
    ) {
      const files = await fs.readdir(sourceDir, { recursive: true });

      for (const file of files) {
        if (typeof file === 'string' && file.endsWith('.node')) {
          const sourcePath = join(sourceDir, file);
          const targetPath = join(targetDir, basename(file));
          await fs.copyFile(sourcePath, targetPath);
        }
      }
    }
  } catch (error) {
    console.error('Error copying canvas modules:', error);
    process.exit(1);
  }
}

copyCanvasModules().catch((error) => {
  console.error('Failed to copy canvas modules:', error);
  process.exit(1);
});
