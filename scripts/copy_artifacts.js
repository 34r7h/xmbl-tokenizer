const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = path.join(__dirname, '../artifacts/contracts');
const DEST_DIR = path.join(__dirname, '../frontend/src/artifacts');

// Ensure destination directory exists
if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
}

function copyArtifacts(sourceDir) {
    const files = fs.readdirSync(sourceDir);

    files.forEach(file => {
        const filePath = path.join(sourceDir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            copyArtifacts(filePath);
        } else if (file.endsWith('.json') && !file.endsWith('.dbg.json')) {
            const destPath = path.join(DEST_DIR, file);
            fs.copyFileSync(filePath, destPath);
            console.log(`Copied: ${file}`);
        }
    });
}

console.log('Copying artifacts...');
copyArtifacts(ARTIFACTS_DIR);
console.log('Artifact copy complete.');
