const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');

if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

fs.copyFileSync(path.join(__dirname, 'index.js'), path.join(distDir, 'index.js'));
fs.copyFileSync(path.join(__dirname, 'index.html'), path.join(distDir, 'index.html'));
