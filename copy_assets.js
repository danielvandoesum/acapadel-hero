const fs = require('fs');
const path = require('path');

const sourceDir = 'C:\\Users\\danie\\OneDrive - pragmatiQ B.V\\Bureaublad\\Aca-padel';
const destDir = path.join(__dirname, 'assets', 'sequence');

// Ensure destination exists
if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
    console.log(`Created directory: ${destDir}`);
}

// Get all files
try {
    const files = fs.readdirSync(sourceDir)
        .filter(file => file.endsWith('.jpg'))
        .sort(); // Default sort should handle frame_000, frame_001 correctly

    console.log(`Found ${files.length} files.`);

    files.forEach((file, index) => {
        const srcPath = path.join(sourceDir, file);
        const destPath = path.join(destDir, `frame_${index}.jpg`);
        fs.copyFileSync(srcPath, destPath);

        if (index % 50 === 0) {
            console.log(`Copied ${file} -> frame_${index}.jpg`);
        }
    });

    console.log('Done.');
} catch (err) {
    console.error('Error:', err);
}
