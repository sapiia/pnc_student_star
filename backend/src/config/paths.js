const path = require('path');

const srcDir = path.resolve(__dirname, '..');
const projectRoot = path.resolve(srcDir, '..');
const uploadsDir = path.join(projectRoot, 'uploads');

module.exports = {
  srcDir,
  projectRoot,
  uploadsDir,
};
