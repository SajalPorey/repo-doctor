const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const OUT_DIR = path.join(__dirname, '../out');
const ZIP_PATH = path.join(__dirname, '../repodoctor-extension.zip');

async function bundleExtension() {
  if (!fs.existsSync(OUT_DIR)) {
    console.error('❌ out/ directory not found! Run npm run build first.');
    process.exit(1);
  }

  console.log('📦 Bundling extension...');

  const output = fs.createWriteStream(ZIP_PATH);
  const archive = new archiver.ZipArchive({
    zlib: { level: 9 }, // Maximum compression
  });

  return new Promise((resolve, reject) => {
    output.on('close', () => {
      console.log(`✅ Extension successfully bundled: ${path.basename(ZIP_PATH)}`);
      console.log(`📊 Size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
      resolve();
    });

    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn('Warning:', err);
      } else {
        reject(err);
      }
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);

    // Append everything from the 'out' directory
    archive.directory(OUT_DIR, false);

    archive.finalize();
  });
}

bundleExtension().catch((err) => {
  console.error('❌ Failed to bundle extension:', err);
  process.exit(1);
});
