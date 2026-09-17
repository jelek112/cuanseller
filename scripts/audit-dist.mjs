import { access, readFile, readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const basePath = '/';
const siteURL = 'https://profitjualan.my.id';
const entries = await readdir(root, { withFileTypes: true });
const htmlFiles = entries.filter(entry => entry.isFile() && entry.name.endsWith('.html')).map(entry => entry.name);
assert.equal(htmlFiles.length, 10, 'Production build harus berisi 10 halaman HTML.');

for (const required of ['assets/style.css', 'assets/app.js', 'assets/math.js', 'assets/favicon.svg', 'robots.txt', 'sitemap.xml', 'CNAME', '.nojekyll']) {
  await access(resolve(root, required));
}

for (const file of htmlFiles) {
  const html = await readFile(resolve(root, file), 'utf8');
  const expectedURL = `${siteURL}/${file === 'index.html' ? '' : file}`;
  const canonicals = [...html.matchAll(/<link rel="canonical" href="([^"]+)">/g)];
  assert.equal(canonicals.length, 1, `${file}: harus memiliki tepat satu canonical.`);
  assert.equal(canonicals[0][1], expectedURL, `${file}: canonical salah.`);
  assert.ok(html.includes(`<meta property="og:url" content="${expectedURL}">`), `${file}: Open Graph URL salah.`);
  assert.ok(!/href="\/index\.html(?:#|\")/.test(html), `${file}: link internal tidak boleh memperkenalkan duplikat /index.html.`);
  assert.ok(!/<meta name="robots" content="[^"]*noindex/i.test(html), `${file}: halaman publik tidak boleh noindex.`);
  assert.ok(!html.includes('jelek112.github.io'), `${file}: URL GitHub Pages lama masih ada.`);
  for (const [, json] of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)) {
    JSON.parse(json);
    assert.ok(!json.includes('jelek112.github.io'), `${file}: structured data masih memakai URL lama.`);
  }
  for (const [, reference] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|data:|#)/.test(reference)) continue;
    assert.ok(reference.startsWith(basePath), `${file}: path publik harus diawali ${basePath}: ${reference}`);
    assert.ok(!reference.startsWith('/cuanseller/'), `${file}: subpath lama tidak diizinkan: ${reference}`);
    const path = reference.slice(basePath.length).split('#')[0];
    if (path) await access(resolve(dirname(resolve(root, file)), path));
  }
}

const publicFiles = [];
async function collect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = resolve(directory, entry.name);
    if (entry.isDirectory()) await collect(absolute);
    else publicFiles.push(absolute);
  }
}
await collect(root);
for (const file of publicFiles) {
  const content = await readFile(file, 'utf8');
  assert.ok(!/localhost|127\.0\.0\.1/i.test(content), `${file} mengandung alamat lokal.`);
}

const sitemap = await readFile(resolve(root, 'sitemap.xml'), 'utf8');
const robots = await readFile(resolve(root, 'robots.txt'), 'utf8');
assert.equal((sitemap.match(/<loc>/g) || []).length, 10, 'Sitemap harus memuat 10 URL.');
assert.ok([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].every(match => match[1].startsWith(`${siteURL}/`)), 'Semua URL sitemap harus memakai custom domain.');
assert.ok(robots.includes(`Sitemap: ${siteURL}/sitemap.xml`), 'Robots harus menunjuk sitemap custom domain.');
assert.equal((await readFile(resolve(root, 'CNAME'), 'utf8')).trim(), 'profitjualan.my.id', 'CNAME tidak sesuai custom domain.');
for (const asset of ['style.css', 'app.js', 'math.js', 'favicon.svg']) {
  assert.ok((await readFile(resolve(root, 'index.html'), 'utf8')).includes(`${basePath}assets/${asset}`), `index harus memuat ${asset} dari base path.`);
}
console.log(`PASS: dist berisi ${htmlFiles.length} halaman dan ${publicFiles.length} file publik; aset lengkap, link lokal tersedia, tanpa localhost/127.0.0.1.`);
