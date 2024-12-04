const fs = require('fs');
const path = require('path');

function copyCanvasModules() {
  const sourceDir = path.join(
    __dirname,
    '../node_modules/node-canvas-webgl/build/Release'
  );
  const targetDir = path.join(__dirname, '../dist-electron/main');

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  if (fs.existsSync(sourceDir)) {
    fs.readdirSync(sourceDir).forEach((file) => {
      if (file.endsWith('.node')) {
        fs.copyFileSync(path.join(sourceDir, file), path.join(targetDir, file));
      }
    });
  }
}

copyCanvasModules();
