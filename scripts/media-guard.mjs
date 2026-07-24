#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const configPath = path.join(projectRoot, "media-guard.config.json");
const args = new Set(process.argv.slice(2));
const writeManifest = args.has("--write-manifest") || !args.has("--verify-manifest");
const verifyManifest = args.has("--verify-manifest");

const MEDIA_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".svg",
  ".avif",
  ".ico",
  ".mp4",
  ".mov",
  ".webm",
  ".m4v",
]);

const TEXT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".css",
  ".scss",
  ".sass",
  ".less",
  ".html",
  ".json",
  ".md",
]);

const FORBIDDEN_PATTERNS = [
  { id: "manus-storage", regex: /(?:https?:\/\/[^\s"'`<>)]+)?\/manus-storage(?:\/|\b)/gi, description: "storage temporário /manus-storage" },
  { id: "blob-url", regex: /blob:/gi, description: "URL temporária blob:" },
  { id: "file-url", regex: /file:\/\//gi, description: "URL local file://" },
  { id: "sandbox-home", regex: /\/home\/ubuntu\//g, description: "caminho absoluto do sandbox /home/ubuntu/" },
  { id: "temporary-directory", regex: /\/tmp\//g, description: "diretório temporário /tmp/" },
];

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function relativeToProject(absolutePath) {
  return toPosix(path.relative(projectRoot, absolutePath));
}

function readJson(absolutePath) {
  return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
}

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function writeFileIfChanged(absolutePath, content) {
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  if (fs.existsSync(absolutePath) && fs.readFileSync(absolutePath, "utf8") === content) return false;
  fs.writeFileSync(absolutePath, content);
  return true;
}

function listFiles(targetPath) {
  if (!fs.existsSync(targetPath)) return [];
  const stat = fs.statSync(targetPath);
  if (stat.isFile()) return [targetPath];

  const files = [];
  for (const entry of fs.readdirSync(targetPath, { withFileTypes: true })) {
    if (["node_modules", "dist", ".git", "artifacts"].includes(entry.name)) continue;
    const childPath = path.join(targetPath, entry.name);
    if (entry.isDirectory()) files.push(...listFiles(childPath));
    else if (entry.isFile()) files.push(childPath);
  }
  return files;
}

function lineNumberAt(content, index) {
  return content.slice(0, index).split("\n").length;
}

function stripUrlSuffix(value) {
  return value.split(/[?#]/, 1)[0];
}

function hasMediaExtension(value) {
  return MEDIA_EXTENSIONS.has(path.extname(stripUrlSuffix(value)).toLowerCase());
}

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function validateMediaContent(extension, buffer) {
  if (buffer.length === 0) return { ok: false, reason: "arquivo vazio", detectedFormat: "unknown", extensionMatchesContent: false };

  const hex = buffer.subarray(0, 16).toString("hex");
  const ascii = buffer.subarray(0, 64).toString("ascii");
  const utf8 = buffer.subarray(0, 2048).toString("utf8").replace(/^\uFEFF/, "").trimStart();
  const brand = buffer.subarray(4, 16).toString("ascii");
  let detectedFormat = "unknown";

  if (hex.startsWith("89504e470d0a1a0a")) detectedFormat = "png";
  else if (hex.startsWith("ffd8ff")) detectedFormat = "jpeg";
  else if (ascii.startsWith("GIF87a") || ascii.startsWith("GIF89a")) detectedFormat = "gif";
  else if (ascii.startsWith("RIFF") && ascii.slice(8, 12) === "WEBP") detectedFormat = "webp";
  else if (/^(?:<\?xml[^>]*>\s*)?(?:<!--[^]*?-->\s*)*<svg(?:\s|>)/i.test(utf8)) detectedFormat = "svg";
  else if (hex.startsWith("00000100")) detectedFormat = "ico";
  else if (brand.includes("ftyp") && /avif|avis/.test(brand)) detectedFormat = "avif";
  else if (buffer.subarray(4, 8).toString("ascii") === "ftyp") detectedFormat = "iso-bmff-video";
  else if (hex.startsWith("1a45dfa3")) detectedFormat = "webm";

  const expectedFormats = {
    ".png": ["png"],
    ".jpg": ["jpeg"],
    ".jpeg": ["jpeg"],
    ".gif": ["gif"],
    ".webp": ["webp"],
    ".svg": ["svg"],
    ".ico": ["ico"],
    ".avif": ["avif"],
    ".mp4": ["iso-bmff-video"],
    ".mov": ["iso-bmff-video"],
    ".m4v": ["iso-bmff-video"],
    ".webm": ["webm"],
  };
  const extensionMatchesContent = (expectedFormats[extension] || []).includes(detectedFormat);

  return {
    ok: detectedFormat !== "unknown",
    reason: detectedFormat === "unknown" ? "conteúdo não corresponde a uma imagem ou vídeo reconhecido" : "",
    detectedFormat,
    extensionMatchesContent,
  };
}

function gitRepositoryAvailable() {
  try {
    return execFileSync("git", ["rev-parse", "--is-inside-work-tree"], {
      cwd: projectRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim() === "true";
  } catch {
    return false;
  }
}

const gitMetadataAvailable = gitRepositoryAvailable();

function gitTrackedFiles(mediaRoots) {
  if (!gitMetadataAvailable) return null;

  try {
    const output = execFileSync("git", ["ls-files", "-z", "--", ...mediaRoots], {
      cwd: projectRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return new Set(output.split("\0").filter(Boolean).map((file) => toPosix(file)));
  } catch {
    return new Set();
  }
}

function normalizeAllowedHosts(values) {
  return new Set((values || []).map((host) => String(host).trim().toLowerCase()).filter(Boolean));
}

function addViolation(violations, violation) {
  violations.push({ severity: "error", ...violation });
}

if (!fs.existsSync(configPath)) {
  console.error("MEDIA GUARD REPROVADO: media-guard.config.json não encontrado.");
  process.exit(1);
}

const config = readJson(configPath);
const publicRoot = path.resolve(projectRoot, config.publicRoot || "client/public");
const manifestPath = path.resolve(projectRoot, config.manifestPath || "docs/media-manifest.json");
const reportPath = path.resolve(projectRoot, config.reportPath || "artifacts/media-guard-report.json");
const sourceRoots = (config.sourceRoots || []).map((item) => path.resolve(projectRoot, item));
const mediaRootValues = config.mediaRoots || [config.publicRoot || "client/public"];
const mediaRoots = mediaRootValues.map((item) => path.resolve(projectRoot, item));
const allowedExternalHosts = normalizeAllowedHosts(config.allowedExternalMediaHosts);
const violations = [];
const references = [];
const referenceKeys = new Set();

for (const root of [...sourceRoots, ...mediaRoots]) {
  if (!fs.existsSync(root)) {
    addViolation(violations, {
      code: "configured-root-missing",
      message: `Diretório ou arquivo configurado não existe: ${relativeToProject(root)}`,
      file: relativeToProject(root),
    });
  }
}

function registerReference({ reference, sourceFile, index, kind, resolvedFile }) {
  const cleanReference = stripUrlSuffix(reference);
  const key = `${sourceFile}:${cleanReference}:${kind}`;
  if (referenceKeys.has(key)) return;
  referenceKeys.add(key);
  references.push({
    reference: cleanReference,
    sourceFile,
    line: index,
    kind,
    resolvedFile: resolvedFile ? relativeToProject(resolvedFile) : null,
  });
}

const sourceFiles = sourceRoots
  .flatMap((root) => listFiles(root))
  .filter((file) => TEXT_EXTENSIONS.has(path.extname(file).toLowerCase()))
  .sort();

for (const sourcePath of sourceFiles) {
  const sourceFile = relativeToProject(sourcePath);
  const content = fs.readFileSync(sourcePath, "utf8");

  for (const forbidden of FORBIDDEN_PATTERNS) {
    forbidden.regex.lastIndex = 0;
    for (const match of content.matchAll(forbidden.regex)) {
      addViolation(violations, {
        code: "forbidden-path",
        message: `Referência proibida detectada: ${forbidden.description}`,
        file: sourceFile,
        line: lineNumberAt(content, match.index || 0),
        reference: match[0],
      });
    }
  }

  const externalRegex = /https?:\/\/[^\s"'`<>)\\]+/gi;
  for (const match of content.matchAll(externalRegex)) {
    const rawUrl = match[0].replace(/[.,;:]$/, "");
    let parsed;
    try {
      parsed = new URL(rawUrl);
    } catch {
      continue;
    }
    if (!hasMediaExtension(parsed.pathname)) continue;
    const host = parsed.hostname.toLowerCase();
    if (!allowedExternalHosts.has(host)) {
      addViolation(violations, {
        code: "external-media-host-not-allowed",
        message: `Mídia externa não autorizada em ${host}. A mídia deve estar versionada no repositório ou o host deve ser explicitamente permitido.`,
        file: sourceFile,
        line: lineNumberAt(content, match.index || 0),
        reference: rawUrl,
      });
    }
    registerReference({
      reference: rawUrl,
      sourceFile,
      index: lineNumberAt(content, match.index || 0),
      kind: "external",
      resolvedFile: null,
    });
  }

  const publicReferenceRegex = /["'`](\/(?!\/)[A-Za-z0-9@._~!$&()*+,;=:%/-]+\.(?:png|jpe?g|webp|gif|svg|avif|ico|mp4|mov|webm|m4v)(?:[?#][^\s"'`<>)\\]*)?)["'`]/gi;
  for (const match of content.matchAll(publicReferenceRegex)) {
    const matchIndex = match.index || 0;
    const reference = stripUrlSuffix(match[1]);
    let decodedReference = reference;
    try {
      decodedReference = decodeURI(reference);
    } catch {
      addViolation(violations, {
        code: "invalid-media-url",
        message: "Caminho de mídia contém codificação de URL inválida.",
        file: sourceFile,
        line: lineNumberAt(content, matchIndex),
        reference,
      });
    }

    const resolvedFile = path.resolve(publicRoot, `.${decodedReference}`);
    if (!resolvedFile.startsWith(`${publicRoot}${path.sep}`)) {
      addViolation(violations, {
        code: "public-path-escape",
        message: "Caminho público de mídia tenta sair de client/public.",
        file: sourceFile,
        line: lineNumberAt(content, matchIndex),
        reference,
      });
      continue;
    }

    registerReference({
      reference: decodedReference,
      sourceFile,
      index: lineNumberAt(content, matchIndex),
      kind: "public",
      resolvedFile,
    });

    if (!fs.existsSync(resolvedFile) || !fs.statSync(resolvedFile).isFile()) {
      addViolation(violations, {
        code: "referenced-media-missing",
        message: `Mídia referenciada não existe em ${relativeToProject(resolvedFile)}.`,
        file: sourceFile,
        line: lineNumberAt(content, matchIndex),
        reference: decodedReference,
      });
    }
  }

  const relativeReferenceRegex = /["'`](\.{1,2}\/[^"'`\n?#]+\.(?:png|jpe?g|webp|gif|svg|avif|ico|mp4|mov|webm|m4v))(?:[?#][^"'`\n]*)?["'`]/gi;
  for (const match of content.matchAll(relativeReferenceRegex)) {
    const reference = match[1];
    const resolvedFile = path.resolve(path.dirname(sourcePath), reference);
    const insideMediaRoot = mediaRoots.some((root) => resolvedFile.startsWith(`${root}${path.sep}`));

    registerReference({
      reference,
      sourceFile,
      index: lineNumberAt(content, match.index || 0),
      kind: "source-relative",
      resolvedFile,
    });

    if (!insideMediaRoot) {
      addViolation(violations, {
        code: "relative-media-outside-roots",
        message: `Mídia relativa está fora das raízes permitidas: ${relativeToProject(resolvedFile)}.`,
        file: sourceFile,
        line: lineNumberAt(content, match.index || 0),
        reference,
      });
    } else if (!fs.existsSync(resolvedFile) || !fs.statSync(resolvedFile).isFile()) {
      addViolation(violations, {
        code: "referenced-media-missing",
        message: `Mídia relativa não existe em ${relativeToProject(resolvedFile)}.`,
        file: sourceFile,
        line: lineNumberAt(content, match.index || 0),
        reference,
      });
    }
  }
}

for (const requiredReference of config.requiredPublicMedia || []) {
  const resolvedFile = path.resolve(publicRoot, `.${requiredReference}`);
  registerReference({
    reference: requiredReference,
    sourceFile: "media-guard.config.json",
    index: null,
    kind: "required",
    resolvedFile,
  });

  if (!fs.existsSync(resolvedFile) || !fs.statSync(resolvedFile).isFile()) {
    addViolation(violations, {
      code: "required-media-missing",
      message: `Mídia obrigatória ausente: ${requiredReference}`,
      file: "media-guard.config.json",
      reference: requiredReference,
    });
  }
}

const trackedFiles = gitTrackedFiles(mediaRootValues);
const mediaFiles = [...new Set(mediaRoots.flatMap((root) => listFiles(root)))]
  .filter((file) => MEDIA_EXTENSIONS.has(path.extname(file).toLowerCase()))
  .sort();
const lowerCasePaths = new Map();
const inventory = [];

for (const mediaPath of mediaFiles) {
  const repoPath = relativeToProject(mediaPath);
  const extension = path.extname(mediaPath).toLowerCase();
  const buffer = fs.readFileSync(mediaPath);
  const contentValidation = validateMediaContent(extension, buffer);
  const tracked = trackedFiles ? trackedFiles.has(repoPath) : true;
  const insidePublicRoot = mediaPath.startsWith(`${publicRoot}${path.sep}`);
  const publicPath = insidePublicRoot ? `/${toPosix(path.relative(publicRoot, mediaPath))}` : null;
  const referencedBy = references
    .filter((reference) => reference.resolvedFile === repoPath)
    .map((reference) => ({
      sourceFile: reference.sourceFile,
      line: reference.line,
      kind: reference.kind,
      reference: reference.reference,
    }))
    .sort((a, b) => `${a.sourceFile}:${a.line || 0}:${a.reference}`.localeCompare(`${b.sourceFile}:${b.line || 0}:${b.reference}`));

  if (!tracked) {
    addViolation(violations, {
      code: "media-not-tracked-by-git",
      message: `Arquivo de mídia não está versionado pelo Git: ${repoPath}`,
      file: repoPath,
      reference: publicPath,
    });
  }

  if (!contentValidation.ok) {
    addViolation(violations, {
      code: "invalid-media-content",
      message: `${contentValidation.reason}: ${repoPath}`,
      file: repoPath,
      reference: publicPath,
    });
  }

  const head = buffer.subarray(0, 200).toString("utf8");
  if (head.startsWith("version https://git-lfs.github.com/spec/v1")) {
    addViolation(violations, {
      code: "git-lfs-pointer-not-hydrated",
      message: `O arquivo é apenas um ponteiro Git LFS, não a mídia real: ${repoPath}`,
      file: repoPath,
      reference: publicPath,
    });
  }

  const lowerCasePath = repoPath.toLowerCase();
  if (lowerCasePaths.has(lowerCasePath) && lowerCasePaths.get(lowerCasePath) !== repoPath) {
    addViolation(violations, {
      code: "case-collision",
      message: `Colisão de maiúsculas/minúsculas entre ${lowerCasePaths.get(lowerCasePath)} e ${repoPath}.`,
      file: repoPath,
    });
  } else {
    lowerCasePaths.set(lowerCasePath, repoPath);
  }

  inventory.push({
    path: repoPath,
    publicPath,
    extension,
    detectedFormat: contentValidation.detectedFormat,
    extensionMatchesContent: contentValidation.extensionMatchesContent,
    bytes: buffer.length,
    sha256: sha256(buffer),
    gitTracked: tracked,
    referenced: referencedBy.length > 0,
    referencedBy,
  });
}

for (const reference of references.filter((item) => item.resolvedFile)) {
  const tracked = trackedFiles ? trackedFiles.has(reference.resolvedFile) : true;
  if (fs.existsSync(path.join(projectRoot, reference.resolvedFile)) && !tracked) {
    addViolation(violations, {
      code: "referenced-media-not-tracked-by-git",
      message: `Mídia referenciada existe localmente, mas não está versionada pelo Git: ${reference.resolvedFile}`,
      file: reference.sourceFile,
      line: reference.line,
      reference: reference.reference,
    });
  }
}

violations.sort((a, b) => `${a.code}:${a.file || ""}:${a.line || 0}:${a.reference || ""}`.localeCompare(`${b.code}:${b.file || ""}:${b.line || 0}:${b.reference || ""}`));
references.sort((a, b) => `${a.reference}:${a.sourceFile}:${a.line || 0}`.localeCompare(`${b.reference}:${b.sourceFile}:${b.line || 0}`));

const publicInventory = inventory.filter((item) => item.publicPath);
const manifest = {
  schemaVersion: 1,
  policy: "Toda mídia deve existir, conter dados válidos, estar versionada pelo Git e usar caminhos permanentes.",
  summary: {
    totalMediaFiles: inventory.length,
    publicMediaFiles: publicInventory.length,
    sourceMediaFiles: inventory.length - publicInventory.length,
    referencedMediaFiles: inventory.filter((item) => item.referenced).length,
    unreferencedMediaFiles: inventory.filter((item) => !item.referenced).length,
    totalBytes: inventory.reduce((sum, item) => sum + item.bytes, 0),
  },
  files: inventory,
};
const manifestContent = stableJson(manifest);
let manifestChanged = false;

if (violations.length === 0 && writeManifest) {
  manifestChanged = writeFileIfChanged(manifestPath, manifestContent);
}

if (verifyManifest) {
  const manifestRepoPath = relativeToProject(manifestPath);
  const manifestTrackedFiles = gitTrackedFiles([manifestRepoPath]);
  const manifestIsTracked = manifestTrackedFiles ? manifestTrackedFiles.has(manifestRepoPath) : true;
  if (!manifestIsTracked) {
    addViolation(violations, {
      code: "media-manifest-not-tracked-by-git",
      message: `O manifesto canônico não está versionado pelo Git: ${manifestRepoPath}. Execute git add ${manifestRepoPath}.`,
      file: manifestRepoPath,
    });
  }

  if (!fs.existsSync(manifestPath)) {
    addViolation(violations, {
      code: "media-manifest-missing",
      message: `Manifesto de mídia ausente: ${relativeToProject(manifestPath)}. Execute pnpm media:guard.`,
      file: relativeToProject(manifestPath),
    });
  } else if (fs.readFileSync(manifestPath, "utf8") !== manifestContent) {
    addViolation(violations, {
      code: "media-manifest-outdated",
      message: "O manifesto de mídia está desatualizado. Execute pnpm media:guard e inclua o manifesto atualizado no commit.",
      file: relativeToProject(manifestPath),
    });
  }
}

const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  status: violations.length === 0 ? "approved" : "rejected",
  mode: verifyManifest ? "verify" : "write",
  summary: {
    sourceFilesScanned: sourceFiles.length,
    referencesFound: references.length,
    publicReferences: references.filter((item) => item.kind === "public" || item.kind === "required").length,
    externalReferences: references.filter((item) => item.kind === "external").length,
    mediaFilesInventoried: inventory.length,
    gitTrackedMediaFiles: inventory.filter((item) => item.gitTracked).length,
    gitTrackingVerified: gitMetadataAvailable,
    violations: violations.length,
    manifestChanged,
  },
  violations,
  references,
};
writeFileIfChanged(reportPath, stableJson(report));

console.log(`Arquivos-fonte verificados: ${report.summary.sourceFilesScanned}`);
console.log(`Referências de mídia encontradas: ${report.summary.referencesFound}`);
console.log(`Arquivos de mídia inventariados: ${report.summary.mediaFilesInventoried}`);
if (gitMetadataAvailable) {
  console.log(`Mídias versionadas no Git: ${report.summary.gitTrackedMediaFiles}/${report.summary.mediaFilesInventoried}`);
} else {
  console.log("Metadados Git indisponíveis: integridade validada pelo manifesto canônico e hashes dos arquivos.");
}
console.log(`Manifesto: ${relativeToProject(manifestPath)}${manifestChanged ? " (atualizado)" : ""}`);
console.log(`Relatório: ${relativeToProject(reportPath)}`);

if (violations.length > 0) {
  console.error(`\nMEDIA GUARD REPROVADO: ${violations.length} erro(s).`);
  for (const violation of violations) {
    const location = violation.file ? `${violation.file}${violation.line ? `:${violation.line}` : ""}` : "projeto";
    console.error(`- [${violation.code}] ${location}: ${violation.message}`);
  }
  process.exit(1);
}

console.log("MEDIA GUARD APROVADO");
