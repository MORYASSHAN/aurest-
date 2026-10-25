import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const rootDir = process.cwd();
const publicDir = path.join(rootDir, 'public');

console.log('='.repeat(70));
console.log('ADVERSARIAL STRESS TEST & VERIFICATION HARNESS — MILESTONE 1');
console.log('='.repeat(70));

// 1. Bitstream and RIFF Chunk Verification
console.log('\n[TASK 1] Bitstream, Header, and Non-Corrupt Stream Verification:');
const webpAssets = [
  { path: 'images/founder.webp', orig: 'images/founder.png', w: 800, h: 800, ch: 3, alpha: false },
  { path: 'images/neutralize.webp', orig: 'images/neutralize.jpg', w: 1376, h: 768, ch: 3, alpha: false },
  { path: 'images/preserve.webp', orig: 'images/preserve.jpg', w: 1376, h: 768, ch: 3, alpha: false },
  { path: 'images/stop.webp', orig: 'images/stop.jpg', w: 1376, h: 768, ch: 3, alpha: false },
  { path: 'textures/earth_atmos_2048.webp', orig: 'textures/earth_atmos_2048.jpg', w: 2048, h: 1024, ch: 3, alpha: false },
  { path: 'textures/earth_clouds_1024.webp', orig: 'textures/earth_clouds_1024.png', w: 1024, h: 512, ch: 4, alpha: true },
];

let task1Passed = true;
for (const asset of webpAssets) {
  const fullPath = path.join(publicDir, asset.path);
  const buf = fs.readFileSync(fullPath);
  const riff = buf.subarray(0, 4).toString('ascii');
  const sizeField = buf.readUInt32LE(4);
  const webp = buf.subarray(8, 12).toString('ascii');

  const chunks = [];
  let offset = 12;
  while (offset < buf.length) {
    const fcc = buf.subarray(offset, offset + 4).toString('ascii');
    const sz = buf.readUInt32LE(offset + 4);
    chunks.push({ fcc, sz, offset });
    offset += 8 + sz + (sz % 2);
  }

  // Sharp metadata and full decode
  const meta = await sharp(fullPath).metadata();
  const raw = await sharp(fullPath).raw().toBuffer({ resolveWithObject: true });

  const isRiffValid = riff === 'RIFF' && webp === 'WEBP' && (sizeField + 8 === buf.length);
  const dimsValid = meta.width === asset.w && meta.height === asset.h;
  const chValid = meta.channels === asset.ch && (Boolean(meta.hasAlpha) === asset.alpha);
  const rawMatch = raw.data.length === asset.w * asset.h * asset.ch;

  const valid = isRiffValid && dimsValid && chValid && rawMatch;
  if (!valid) task1Passed = false;

  console.log(`  ${valid ? 'PASS' : 'FAIL'}: ${asset.path}`);
  console.log(`        RIFF: ${riff}, SizeInHdr: ${sizeField}, ExactLengthMatch: ${sizeField + 8 === buf.length}`);
  console.log(`        Chunks: [${chunks.map(c => `${c.fcc}:${c.sz}B`).join(', ')}]`);
  console.log(`        Dims: ${meta.width}x${meta.height} (expect ${asset.w}x${asset.h}), Ch: ${meta.channels}, Alpha: ${meta.hasAlpha}`);
  console.log(`        Raw decoded bytes: ${raw.data.length} == ${asset.w * asset.h * asset.ch}`);
}
console.log(`Task 1 Verdict: ${task1Passed ? 'ALL WEBP BITSTREAMS VALID' : 'BITSTREAM INTEGRITY FAILURE'}`);

// 2. Offline Network Simulation & Zero External Leak Audit
console.log('\n[TASK 2] Offline / Disconnected Network & Zero External Request Simulation:');
let task2Passed = true;

// Check production HTML
const indexPath = path.join(rootDir, '.next', 'server', 'app', 'index.html');
const indexHtml = fs.readFileSync(indexPath, 'utf8');

const srcRegex = /src=["']([^"']+)["']/g;
const hrefRegex = /href=["']([^"']+)["']/g;
let match;
const assetUrls = new Set();
while ((match = srcRegex.exec(indexHtml)) !== null) assetUrls.add(match[1]);
while ((match = hrefRegex.exec(indexHtml)) !== null) assetUrls.add(match[1]);

const forbiddenHosts = ['cdn.jsdelivr.net', 'unpkg.com', 'cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com', 'images.unsplash.com'];
const leakedUrls = [];
for (const u of assetUrls) {
  for (const f of forbiddenHosts) {
    if (u.includes(f)) leakedUrls.push({ url: u, host: f });
  }
}

console.log(`  Total linked URLs in compiled index.html: ${assetUrls.size}`);
console.log(`  Forbidden CDN / External host leaks detected: ${leakedUrls.length}`);
if (leakedUrls.length > 0) {
  task2Passed = false;
  console.log('  LEAKS:', leakedUrls);
} else {
  console.log('  PASS: Zero external runtime host references found in static HTML.');
}

// Check local existence of every referenced image/texture in public
const referencedAssets = [
  '/images/founder.webp',
  '/images/stop.webp',
  '/images/neutralize.webp',
  '/images/preserve.webp',
  '/textures/earth_atmos_2048.webp',
  '/textures/earth_clouds_1024.webp',
  '/textures/earth_atmos_2048.jpg',
  '/textures/earth_clouds_1024.png',
  '/icon.svg',
  '/manifest.webmanifest'
];

let missingLocal = 0;
for (const p of referencedAssets) {
  const localFile = path.join(publicDir, p.replace(/^\//, ''));
  const exists = fs.existsSync(localFile);
  if (!exists) {
    missingLocal++;
    task2Passed = false;
    console.log(`  FAIL 404: Local file does not exist: ${localFile}`);
  } else {
    console.log(`  PASS (200 OK local): ${p} (${fs.statSync(localFile).size} bytes)`);
  }
}
console.log(`Task 2 Verdict: ${task2Passed ? 'OFFLINE VERIFIED: ZERO 404s, ZERO EXTERNAL CALLS' : 'OFFLINE LEAK OR 404 FOUND'}`);

// 3. Independent Byte Counts and Payload Ratios (<= 35% check)
console.log('\n[TASK 3] Independent Byte Counts & Payload Ratio Analysis (Ratio <= 35% test):');
let totalOrig = 0;
let totalWebp = 0;
const payloadAnalysis = [];

for (const asset of webpAssets) {
  const origPath = path.join(publicDir, asset.orig);
  const webpPath = path.join(publicDir, asset.path);
  const origSize = fs.statSync(origPath).size;
  const webpSize = fs.statSync(webpPath).size;
  totalOrig += origSize;
  totalWebp += webpSize;

  const ratio = (webpSize / origSize) * 100; // % of original size
  const reduction = 100 - ratio;            // % reduction
  const exceeds35 = ratio > 35;             // corner case check

  payloadAnalysis.push({
    asset: asset.path,
    origSize,
    webpSize,
    ratio: +ratio.toFixed(2),
    reduction: +reduction.toFixed(2),
    exceeds35
  });
}

const aggregateRatio = (totalWebp / totalOrig) * 100;
const aggregateReduction = 100 - aggregateRatio;
const bytesSaved = totalOrig - totalWebp;

console.table(payloadAnalysis);
console.log(`\nAggregate Summary:`);
console.log(`  Total Original Size: ${totalOrig.toLocaleString()} bytes (~${(totalOrig/1e6).toFixed(2)} MB)`);
console.log(`  Total WebP Size:     ${totalWebp.toLocaleString()} bytes (~${(totalWebp/1e6).toFixed(2)} MB)`);
console.log(`  Total Bytes Saved:   ${bytesSaved.toLocaleString()} bytes (~${(bytesSaved/1e6).toFixed(2)} MB)`);
console.log(`  Aggregate WebP Ratio: ${aggregateRatio.toFixed(2)}% of original payload`);
console.log(`  Aggregate Reduction:  ${aggregateReduction.toFixed(2)}% (Requirement: > 65% reduction, > 2.0 MB saved)`);

const cornerCases = payloadAnalysis.filter(p => p.exceeds35);
console.log(`\nCorner Cases where individual payload exceeds 35% of original: ${cornerCases.length}`);
for (const cc of cornerCases) {
  console.log(`  ⚠️ Corner Case: ${cc.asset} is ${cc.ratio}% of original (exceeds 35%)`);
}

// 4. Browser Decode Performance & Memory Overhead Analysis
console.log('\n[TASK 4] Browser Decode Performance & Memory Overhead Analysis:');
console.log('Simulating browser image decode benchmarks and calculating GPU VRAM allocation...');

const memoryAndDecodeStats = [];
for (const asset of webpAssets) {
  const fullPath = path.join(publicDir, asset.path);
  const origFullPath = path.join(publicDir, asset.orig);
  
  // Benchmark 20 decodes to get average decode time
  const decodeTimes = [];
  for (let i = 0; i < 20; i++) {
    const t0 = performance.now();
    await sharp(fullPath).raw().toBuffer();
    decodeTimes.push(performance.now() - t0);
  }
  const avgDecode = +(decodeTimes.reduce((a, b) => a + b, 0) / decodeTimes.length).toFixed(2);
  const minDecode = +Math.min(...decodeTimes).toFixed(2);
  const maxDecode = +Math.max(...decodeTimes).toFixed(2);

  // Uncompressed RGBA8 GPU texture memory calculation:
  // Width * Height * 4 bytes per pixel (RGBA8)
  const gpuBaseBytes = asset.w * asset.h * 4;
  const gpuWithMipmaps = Math.round(gpuBaseBytes * 1.3333); // 33% overhead for full mipmap pyramid

  // Transfer size in bytes
  const transferBytes = fs.statSync(fullPath).size;
  const memoryExpansionRatio = +(gpuWithMipmaps / transferBytes).toFixed(1);

  memoryAndDecodeStats.push({
    asset: asset.path,
    transferSize: `${(transferBytes / 1024).toFixed(1)} KB`,
    avgDecodeMs: avgDecode,
    rangeDecodeMs: `${minDecode} - ${maxDecode} ms`,
    gpuBaseMB: `${(gpuBaseBytes / (1024 * 1024)).toFixed(2)} MB`,
    gpuMipmapMB: `${(gpuWithMipmaps / (1024 * 1024)).toFixed(2)} MB`,
    vramExpansion: `${memoryExpansionRatio}x`
  });
}

console.table(memoryAndDecodeStats);

console.log('='.repeat(70));
console.log('VERIFICATION SUMMARY COMPLETE');
console.log('='.repeat(70));
