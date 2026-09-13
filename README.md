# CuanSeller

Situs statis HTML, CSS, dan JavaScript vanilla. Buka `index.html` langsung di browser, atau jalankan `npm start` lalu kunjungi `http://127.0.0.1:4173`. Tidak perlu instalasi dependency, backend aplikasi, atau database. Server lokal hanya menyajikan berkas untuk pratinjau.

## Struktur

- `index.html`: beranda di root.
- `kalkulator-*.html`: enam halaman kalkulator lengkap.
- `tentang.html`, `privacy-policy.html`, `disclaimer.html`: halaman informasi dan legal.
- `assets/`: CSS, JavaScript browser, dan favicon lokal.
- `scripts/data.mjs`: sumber teks, rumus, contoh, FAQ, dan input kalkulator.
- `scripts/build.mjs`: pembuat HTML statis; tidak dijalankan oleh pengunjung.
- `tests/`: verifikasi perhitungan dan kasus batas.

## Mengubah konten dan memeriksa situs

Ubah sumber di `scripts/data.mjs` atau template di `scripts/build.mjs`, lalu jalankan:

```sh
npm run build
npm test
npm run audit
```

## Publikasi gratis dengan GitHub Pages

Project ini adalah situs statis vanilla. Node.js hanya digunakan saat build dan audit; hasil di folder `dist/` tidak memerlukan server aplikasi, dependency runtime, atau database.

Buat production build lokal dengan:

```sh
npm run build:pages
node scripts/audit-dist.mjs
```

Folder final yang dipublikasikan adalah `dist/`. Isinya mencakup seluruh HTML, CSS, JavaScript browser, favicon, `robots.txt`, `sitemap.xml`, `CNAME`, dan `.nojekyll`. Production build memakai `https://profitjualan.my.id` dengan base path `/`, termasuk untuk semua asset dan navigasi internal. Jangan mengunggah folder `scripts/`, `tests/`, atau file server lokal ke Pages.

Workflow `.github/workflows/deploy-pages.yml` membangun dan memublikasikan `dist/` setiap kali branch `main` diperbarui. Setelah project menjadi repository GitHub, buka **Settings → Pages**, lalu pilih **Source: GitHub Actions**. Build menghasilkan canonical, Open Graph URL, structured data, sitemap, dan robots untuk custom domain serta menyertakan `CNAME` secara otomatis.

Pastikan custom domain `profitjualan.my.id` tercatat pada **Settings → Pages** dan DNS mengarah ke GitHub Pages.

## Domain produksi

Konfigurasi produksi memakai `https://profitjualan.my.id` sebagai URL tetap dan root `/`:

```sh
npm run build:pages
node scripts/audit-dist.mjs
```

Build mengisi canonical unik, metadata URL, breadcrumb terstruktur, sitemap, robots, dan `CNAME` sesuai custom domain.

## Privasi

Tidak ada font CDN, analitik, cookie aplikasi, localStorage, atau permintaan API. Hosting dapat memiliki log akses tersendiri; hal ini dijelaskan di kebijakan privasi.

## Ketentuan perhitungan

Input rupiah menerima `100000`, `100.000`, dan `100.000,50`. Persentase menerima `10,5` atau `10.5`. Input kosong, negatif, format keliru, lebih dari satu triliun, atau persentase di atas 100 ditolak. Nilai awal fee hanya contoh. Pembagi nol dan kontribusi tidak positif ditangani dengan pesan, bukan NaN/Infinity. Harga rekomendasi dan BEP unit dibulatkan ke atas; tampilan angka lain maksimal dua desimal.
