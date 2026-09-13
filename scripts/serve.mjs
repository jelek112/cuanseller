import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const sourceRoot = fileURLToPath(new URL('../', import.meta.url));
const root = process.env.PUBLIC_DIR ? resolve(sourceRoot, process.env.PUBLIC_DIR) : sourceRoot;
const basePath = `/${(process.env.BASE_PATH || '').replace(/^\/+|\/+$/g, '')}`;
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.svg':'image/svg+xml', '.xml':'application/xml; charset=utf-8', '.txt':'text/plain; charset=utf-8' };
createServer(async (req,res) => {
  try {
    let pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if (basePath !== '/' && pathname.startsWith(`${basePath}/`)) pathname = pathname.slice(basePath.length);
    const target = resolve(root, '.' + (pathname.endsWith('/') ? pathname + 'index.html' : pathname));
    if (!target.startsWith(root.endsWith(sep) ? root : root + sep) || !types[extname(target)]) { res.writeHead(404); res.end('Tidak ditemukan'); return; }
    if (!(await stat(target)).isFile()) throw new Error('Not a file');
    res.writeHead(200, {'Content-Type':types[extname(target)], 'X-Content-Type-Options':'nosniff'});
    res.end(await readFile(target));
  } catch { res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'}); res.end('Halaman tidak ditemukan. Kembali ke beranda: /'); }
}).listen(4173,'127.0.0.1',()=>console.log('CuanSeller: http://127.0.0.1:4173'));
