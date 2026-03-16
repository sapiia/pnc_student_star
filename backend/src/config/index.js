const path = require('path');
const fs = require('fs');

const configPath = path.resolve(__dirname, '../../config.json');
let config = {};

try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (err) {
  console.error('❌ Could not load config.json:', err.message);
  // Fallback or exit
}

module.exports = config;
