import fs from 'node:fs';
import path from 'node:path';

const baseUrl = (process.argv[2] || 'http://127.0.0.1:4173').replace(/\/+$/, '');
const reportPath = path.resolve('artifacts/media-reference-report.json');
if (!fs.existsSync(reportPath)) {
  console.error('Relatório de referências não encontrado. Execute check-media-references.mjs primeiro.');
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const refs = report.localMediaReferenceList || [];
const failures = [];
const results = [];

for (const ref of refs) {
  try {
    const response = await fetch(baseUrl + ref, { redirect: 'manual' });
    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    const contentLength = Number(response.headers.get('content-length') || 0);
    const isMedia = /^(image|video)\//.test(contentType) || contentType.includes('application/octet-stream');
    const ok = response.status === 200 && isMedia;
    const item = { ref, status: response.status, contentType, contentLength, ok };
    results.push(item);
    if (!ok) failures.push(item);
  } catch (error) {
    const item = { ref, status: 0, contentType: '', contentLength: 0, ok: false, error: String(error) };
    results.push(item);
    failures.push(item);
  }
}

const output = {
  baseUrl,
  tested: results.length,
  passed: results.length - failures.length,
  failed: failures.length,
  failures,
  results,
};
fs.writeFileSync('artifacts/media-http-report.json', JSON.stringify(output, null, 2) + '\n');
console.log(`Mídias testadas por HTTP: ${output.tested}`);
console.log(`Aprovadas: ${output.passed}`);
console.log(`Falhas: ${output.failed}`);
if (failures.length) {
  for (const item of failures) console.error(`- ${item.ref}: HTTP ${item.status}, ${item.contentType || 'sem content-type'}`);
  process.exit(1);
}
console.log('SMOKE TEST HTTP DE MÍDIA APROVADO');
