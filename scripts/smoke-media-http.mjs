import fs from 'node:fs';
import path from 'node:path';

const explicitBaseUrl = process.argv.slice(2).find((argument) => argument !== '--');
const baseUrl = (explicitBaseUrl || 'http://127.0.0.1:4173').replace(/\/+$/, '');
const currentReportPath = path.resolve('artifacts/media-guard-report.json');
const legacyReportPath = path.resolve('artifacts/media-reference-report.json');
const reportPath = fs.existsSync(currentReportPath) ? currentReportPath : legacyReportPath;
if (!fs.existsSync(reportPath)) {
  console.error('Relatório de mídias não encontrado. Execute pnpm media:guard:verify primeiro.');
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const refs = report.references
  ? [...new Set(report.references
      .filter((item) => item.kind === 'public' || item.kind === 'required')
      .map((item) => item.reference))].sort()
  : [...new Set(report.localMediaReferenceList || [])].sort();
const requestMethod = process.env.MEDIA_SMOKE_METHOD || (/127\.0\.0\.1|localhost/.test(baseUrl) ? 'GET' : 'HEAD');
const concurrency = Math.max(1, Number(process.env.MEDIA_SMOKE_CONCURRENCY || 12));
const timeoutMs = Math.max(1000, Number(process.env.MEDIA_SMOKE_TIMEOUT_MS || 15000));
const results = new Array(refs.length);
let cursor = 0;

async function validate(index, ref) {
  try {
    const response = await fetch(baseUrl + ref, {
      method: requestMethod,
      redirect: 'manual',
      signal: AbortSignal.timeout(timeoutMs),
    });
    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    const contentLength = Number(response.headers.get('content-length') || 0);
    const isMedia = /^(image|video)\//.test(contentType) || contentType.includes('application/octet-stream');
    const ok = response.status === 200 && isMedia;
    results[index] = { ref, status: response.status, contentType, contentLength, ok };
  } catch (error) {
    results[index] = { ref, status: 0, contentType: '', contentLength: 0, ok: false, error: String(error) };
  }
}

async function worker() {
  while (true) {
    const index = cursor++;
    if (index >= refs.length) return;
    await validate(index, refs[index]);
  }
}

await Promise.all(Array.from({ length: Math.min(concurrency, refs.length || 1) }, () => worker()));
const failures = results.filter((item) => !item.ok);
const output = {
  baseUrl,
  requestMethod,
  timeoutMs,
  concurrency,
  tested: results.length,
  passed: results.length - failures.length,
  failed: failures.length,
  failures,
  results,
};
fs.mkdirSync('artifacts', { recursive: true });
fs.writeFileSync('artifacts/media-http-report.json', JSON.stringify(output, null, 2) + '\n');
console.log(`Mídias testadas por HTTP: ${output.tested}`);
console.log(`Aprovadas: ${output.passed}`);
console.log(`Falhas: ${output.failed}`);
if (failures.length) {
  for (const item of failures) console.error(`- ${item.ref}: HTTP ${item.status}, ${item.contentType || 'sem content-type'}${item.error ? `, ${item.error}` : ''}`);
  process.exit(1);
}
console.log('SMOKE TEST HTTP DE MÍDIA APROVADO');
