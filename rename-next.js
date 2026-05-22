const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'out');
const nextDir = path.join(outDir, '_next');
const newNextDir = path.join(outDir, 'next');

// ── 1. Rename _next → next ────────────────────────────────────────────────────
function renameNextDir() {
  if (fs.existsSync(nextDir)) {
    console.log('Renaming _next → next...');
    fs.renameSync(nextDir, newNextDir);
  }
}

// ── 2. Replace /_next/ references ────────────────────────────────────────────
function replaceInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const updated = content
    .replace(/\/_next\//g, '/next/')
    .replace(/\\_next\\/g, '\\next\\');
  if (updated !== content) fs.writeFileSync(filePath, updated, 'utf8');
  return updated;
}

function walkDir(dir, cb) {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) walkDir(full, cb);
    else cb(full);
  }
}

function replaceAllReferences() {
  console.log('Replacing _next references...');
  walkDir(outDir, (f) => {
    if (/\.(html|js|css|json)$/.test(f)) replaceInFile(f);
  });
}

// ── 3. Extract inline scripts from HTML into external .js files ───────────────
// Chrome MV3 bans ALL inline scripts — even with SHA256 hashes.
// The only fix is to move inline script content into separate files
// loaded with <script src="..."> so 'self' CSP allows them.
function extractInlineScripts(htmlPath) {
  let html = fs.readFileSync(htmlPath, 'utf8');
  let counter = 0;
  const inlineDir = path.join(outDir, 'inline-scripts');

  if (!fs.existsSync(inlineDir)) fs.mkdirSync(inlineDir);

  // Match inline <script> tags (no src attribute)
  html = html.replace(/<script(?![^>]*\bsrc\b)([^>]*)>([\s\S]*?)<\/script>/gi, (match, attrs, content) => {
    if (!content.trim()) return match; // skip empty scripts
    counter++;
    const filename = `inline-scripts/script-${counter}.js`;
    const fullPath = path.join(outDir, filename);
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`  Extracted inline script #${counter} → ${filename}`);
    return `<script${attrs} src="/${filename}"></script>`;
  });

  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log(`Processed ${counter} inline script(s) in ${path.basename(htmlPath)}`);
}

function extractAllInlineScripts() {
  console.log('Extracting inline scripts...');
  walkDir(outDir, (f) => {
    if (f.endsWith('.html')) extractInlineScripts(f);
  });
}

// ── 4. Restore clean manifest CSP (no hashes needed now) ─────────────────────
function patchManifest() {
  const manifestPath = path.join(outDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) return;

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.content_security_policy = {
    extension_pages: "script-src 'self'; object-src 'self'"
  };
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log('Patched manifest.json with clean CSP (no hashes).');
}

// ── 5. Remove all files/directories starting with an underscore ───────────────
function removeUnderscoreFiles(dir) {
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    if (file.startsWith('_')) {
      console.log(`Removing forbidden file/dir: ${file}`);
      if (fs.statSync(fullPath).isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(fullPath);
      }
    } else if (fs.statSync(fullPath).isDirectory()) {
      removeUnderscoreFiles(fullPath);
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
(function main() {
  renameNextDir();
  removeUnderscoreFiles(outDir);
  replaceAllReferences();
  extractAllInlineScripts();
  patchManifest();
  console.log('\n✅ Extension build ready in out/');
})();


