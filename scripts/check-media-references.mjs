import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourceRoots = ['client/src', 'client/index.html'];
const mediaExt = '(?:png|jpe?g|webp|gif|svg|avif|ico|mp4|mov|webm|m4v)';
const absoluteMedia = new RegExp(String.raw`["'\x60](\/(?!\/)[^"'\x60?#\s]+\.${mediaExt})(?:\?[^"'\x60]*)?["'\x60]`, 'gi');
const storagePath = new RegExp(String.raw`["'\x60](\/manus-storage\/[^"'\x60?#\s]+)["'\x60]`, 'gi');
const sourceExt = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.scss', '.html', '.json']);

function walk(target) {
  if (!fs.existsSync(target)) return [];
  const stat = fs.statSync(target);
  if (stat.isFile()) return [target];
  return fs.readdirSync(target, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(target, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const files = sourceRoots.flatMap((item) => walk(path.join(root, item)))
  .filter((file) => sourceExt.has(path.extname(file).toLowerCase()));
const references = new Map();
const storageReferences = new Map();

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  for (const match of content.matchAll(absoluteMedia)) {
    const ref = match[1];
    if (!references.has(ref)) references.set(ref, new Set());
    references.get(ref).add(path.relative(root, file));
  }
  for (const match of content.matchAll(storagePath)) {
    const ref = match[1];
    if (!storageReferences.has(ref)) storageReferences.set(ref, new Set());
    storageReferences.get(ref).add(path.relative(root, file));
  }
}

const missing = [];
for (const [ref, owners] of references) {
  const diskPath = path.join(root, 'client/public', ref.slice(1));
  if (!fs.existsSync(diskPath) || !fs.statSync(diskPath).isFile() || fs.statSync(diskPath).size === 0) {
    missing.push({ ref, owners: [...owners], diskPath: path.relative(root, diskPath) });
  }
}

const report = {
  scannedSourceFiles: files.length,
  localMediaReferences: references.size,
  localMediaReferenceList: [...references.keys()].sort(),
  storageReferences: storageReferences.size,
  missingLocalMedia: missing,
  unresolvedStorageReferences: [...storageReferences.entries()].map(([ref, owners]) => ({ ref, owners: [...owners] })),
};

fs.mkdirSync(path.join(root, 'artifacts'), { recursive: true });
fs.writeFileSync(path.join(root, 'artifacts/media-reference-report.json'), JSON.stringify(report, null, 2) + '\n');

console.log(`Arquivos-fonte verificados: ${report.scannedSourceFiles}`);
console.log(`Referências locais de mídia: ${report.localMediaReferences}`);
console.log(`Referências de storage: ${report.storageReferences}`);
console.log(`Mídias locais ausentes: ${missing.length}`);
if (report.unresolvedStorageReferences.length) {
  console.error('\nReferências /manus-storage não permitidas neste deploy Railway:');
  for (const item of report.unresolvedStorageReferences) console.error(`- ${item.ref} (${item.owners.join(', ')})`);
}
if (missing.length) {
  console.error('\nMídias locais ausentes:');
  for (const item of missing) console.error(`- ${item.ref} -> ${item.diskPath} (${item.owners.join(', ')})`);
}

if (missing.length || report.unresolvedStorageReferences.length) process.exit(1);
console.log('VALIDAÇÃO DE MÍDIA APROVADA');
