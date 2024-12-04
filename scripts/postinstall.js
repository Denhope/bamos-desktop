const fs = require('fs');
const path = require('path');

function copyCanvasModules() {
  const sourceDir = path.join(__dirname, '../node_modules/@napi-rs/canvas/');
  const targetDir = path.join(__dirname, '../dist-electron/main');

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  if (fs.existsSync(sourceDir)) {
    const files = fs.readdirSync(sourceDir, { recursive: true });
    files.forEach((file) => {
      if (typeof file === 'string' && file.endsWith('.node')) {
        const sourcePath = path.join(sourceDir, file);
        const targetPath = path.join(targetDir, path.basename(file));
        fs.copyFileSync(sourcePath, targetPath);
      }
    });
  }
}

copyCanvasModules();
