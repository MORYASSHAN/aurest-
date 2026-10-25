import { spawn } from 'node:child_process';
import http from 'node:http';

const PORT = 3567;
const BASE = `http://127.0.0.1:${PORT}`;

function fetchUrl(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`${BASE}${urlPath}`, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const body = Buffer.concat(chunks);
        resolve({
          status: res.statusCode,
          headers: res.headers,
          length: body.length,
          bodyText: body.toString('utf8')
        });
      });
    }).on('error', reject);
  });
}

async function waitForServer(maxRetries = 40) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetchUrl('/');
      if (res.status === 200) return true;
    } catch (e) {
      // wait
    }
    await new Promise(r => setTimeout(r, 250));
  }
  throw new Error('Server did not start in time');
}

async function main() {
  console.log('Spawning next start on port ' + PORT + '...');
  const server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
    shell: true,
    stdio: 'pipe',
    cwd: process.cwd()
  });

  server.stdout.on('data', d => {
    const s = d.toString();
    if (s.includes('Ready') || s.includes('Local:')) {
      console.log('Server stdout: ' + s.trim());
    }
  });

  server.stderr.on('data', d => {
    console.error('Server stderr: ' + d.toString().trim());
  });

  try {
    await waitForServer();
    console.log('Server is responsive! Beginning HTTP verification suite...');

    const tests = [
      { path: '/', expectStatus: 200, checkHeaders: true },
      { path: '/images/founder.webp', expectStatus: 200, expectLen: 34822, expectType: 'image/webp' },
      { path: '/images/stop.webp', expectStatus: 200, expectLen: 174576, expectType: 'image/webp' },
      { path: '/images/neutralize.webp', expectStatus: 200, expectLen: 156004, expectType: 'image/webp' },
      { path: '/images/preserve.webp', expectStatus: 200, expectLen: 156130, expectType: 'image/webp' },
      { path: '/textures/earth_atmos_2048.webp', expectStatus: 200, expectLen: 285008, expectType: 'image/webp' },
      { path: '/textures/earth_clouds_1024.webp', expectStatus: 200, expectLen: 215372, expectType: 'image/webp' },
      { path: '/textures/earth_atmos_2048.jpg', expectStatus: 200, expectLen: 512606 },
      { path: '/textures/earth_clouds_1024.png', expectStatus: 200, expectLen: 260222 },
      { path: '/icon.svg', expectStatus: 200 },
      { path: '/manifest.webmanifest', expectStatus: 200 },
      { path: '/robots.txt', expectStatus: 200 },
      { path: '/sitemap.xml', expectStatus: 200 },
      { path: '/images/ghost_asset.webp', expectStatus: 404 }
    ];

    let allPassed = true;
    for (const t of tests) {
      const res = await fetchUrl(t.path);
      const statusOk = res.status === t.expectStatus;
      const lenOk = t.expectLen ? res.length === t.expectLen : true;
      const typeOk = t.expectType ? (res.headers['content-type'] && res.headers['content-type'].includes(t.expectType)) : true;
      const pass = statusOk && lenOk && typeOk;

      if (!pass) allPassed = false;
      console.log(`  ${pass ? '✓ PASS' : '✗ FAIL'}: ${t.path}`);
      console.log(`        Status: ${res.status} (expect ${t.expectStatus}), Length: ${res.length} (expect ${t.expectLen || 'any'}), Content-Type: ${res.headers['content-type']}`);
      
      if (t.checkHeaders) {
        console.log(`        CSP: ${res.headers['content-security-policy']?.substring(0, 60)}...`);
        console.log(`        Cache-Control: ${res.headers['cache-control']}`);
      }
      if (t.path.endsWith('.webp')) {
        console.log(`        Cache-Control: ${res.headers['cache-control']} (expect immutable 1-year)`);
      }
    }

    if (!allPassed) {
      console.error('\nHTTP VERIFICATION FAILED.');
      process.exitCode = 1;
    } else {
      console.log('\n✅ ALL LIVE HTTP SERVER REQUESTS PASSED WITH 100% SUCCESS.');
    }
  } finally {
    console.log('Terminating Next.js server...');
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', String(server.pid), '/f', '/t']);
    } else {
      server.kill('SIGTERM');
    }
  }
}

main().catch(err => {
  console.error('Fatal error in HTTP test:', err);
  process.exit(1);
});
