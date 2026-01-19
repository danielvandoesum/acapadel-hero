const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, 'aca-padel-hero-black', 'Aca-hero-black');
const destDir = path.join(__dirname, 'assets', 'sequence');

// Ensure destination exists
if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

// Get all files
try {
    const files = fs.readdirSync(sourceDir)
        .filter(file => file.endsWith('.jpg'))
        .sort();

    console.log(`Found ${files.length} files in source.`);

    files.forEach((file, index) => {
        const srcPath = path.join(sourceDir, file);
        const destPath = path.join(destDir, `frame_${index}.jpg`);
        // Overwrite existing
        fs.copyFileSync(srcPath, destPath);

        if (index % 50 === 0) {
            console.log(`Copied ${file} -> frame_${index}.jpg`);
        }
    });

    console.log('Done.');
} catch (err) {
    console.error('Error:', err);
}
