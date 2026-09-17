import { readFile, readdir, access } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../',import.meta.url));
const files=(await readdir(root)).filter(f=>f.endsWith('.html'));
assert.equal(files.length,10);
assert.ok(!files.includes('kontak.html'),'halaman kontak harus sudah dihapus');
const titles=new Set(), descriptions=new Set();
let links=0;
for(const file of files){
  const html=await readFile(resolve(root,file),'utf8');
  assert.equal((html.match(/<h1[ >]/g)||[]).length,1,`${file}: satu H1`);
  assert.ok(html.includes('<html lang="id">'),file);
  const title=html.match(/<title>(.*?)<\/title>/)?.[1];
  const description=html.match(/<meta name="description" content="([^"]+)"/)?.[1];
  assert.ok(title && !titles.has(title),`${file}: title unik`); titles.add(title);
  assert.ok(description && !descriptions.has(description),`${file}: description unik`); descriptions.add(description);
  assert.ok(html.includes('name="viewport"'),file);
  if(file!=='index.html')assert.ok(html.includes('aria-label="Breadcrumb"'),file);
  assert.ok(!/lorem ipsum|TODO|placeholder=/i.test(html),`${file}: tanpa placeholder`);
  assert.ok(!/kontak\.html|>Kontak</i.test(html),`${file}: tanpa tautan kontak`);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length,`${file}: unique IDs`);
  for(const [,reference] of html.matchAll(/(?:href|src)="([^"]+)"/g)){
    if(/^(https?:|mailto:|data:)/.test(reference))continue;
    const [path,fragment]=reference.split('#');
    const target=path?(path==='/'?resolve(root,'index.html'):path.startsWith('/')?resolve(root,path.slice(1)):resolve(dirname(resolve(root,file)),path)):resolve(root,file);
    await access(target); links++;
    if(fragment){const targetHtml=await readFile(target,'utf8');assert.ok(targetHtml.includes(`id="${fragment}"`),`${file}: ${reference}`);}
  }
  for(const [,json] of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g))JSON.parse(json);
  for(const [,id] of html.matchAll(/<label for="([^"]+)"/g))assert.ok(ids.includes(id),`${file}: label ${id}`);
}
const sitemap=await readFile(resolve(root,'sitemap.xml'),'utf8');
assert.equal((sitemap.match(/<loc>/g)||[]).length,10);
assert.ok(!/kontak/i.test(sitemap),'sitemap tanpa halaman kontak');
for(const file of files)assert.ok(sitemap.includes(file==='index.html'?'/</loc>':`/${file}</loc>`));
assert.ok((await readFile(resolve(root,'robots.txt'),'utf8')).includes('Allow: /'));
console.log(`PASS: ${files.length} pages, ${links} internal links/assets, unique metadata, H1, breadcrumbs, labels, structured data, sitemap and robots.`);
