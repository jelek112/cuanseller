# Hasil audit CuanSeller

Audit dilakukan pada 13 September 2026.

- 10 halaman HTML tersedia, termasuk `index.html` di root.
- Setiap halaman memiliki satu H1, bahasa Indonesia, viewport, title, dan meta description unik.
- Semua halaman selain beranda memiliki breadcrumb; semua halaman memiliki navigasi internal.
- Seluruh referensi internal termasuk tautan fragmen dan aset diperiksa tanpa target hilang.
- Keenam kalkulator memiliki rumus, asumsi, contoh, dan FAQ yang sesuai dengan contoh input.
- Sembilan pengujian logika lulus, termasuk 6.000 skenario deterministik, pembagi nol, kerugian, fee tetap, pembulatan, serta format input Indonesia.
- Chrome headless memeriksa seluruh halaman pada lebar 1440, 390, dan 320 piksel. Tidak ada overflow horizontal atau exception JavaScript.
- Nilai awal seluruh kalkulator tampil. Input kosong, fee di atas 100%, reset, pembukaan menu mobile, dan penutupan dengan Escape diperiksa di browser.
- Dekorasi homepage yang sempat melebar pada layar ponsel diperbaiki dan audit browser diulang hingga lulus.
- JSON-LD FAQ dapat diparse; ID tidak duplikat dan seluruh label formulir merujuk input yang tersedia.
- Sitemap berisi 10 URL. Robots mengizinkan penelusuran dan mencantumkan sitemap.
- Aset disajikan lokal, tanpa dependency runtime, backend, database, atau API eksternal.

## Konfigurasi publikasi yang belum diberikan

Domain produksi belum dikonfirmasi. Sitemap dan robots memakai asumsi `https://cuanseller.id`; canonical dan breadcrumb JSON-LD akan ditambahkan saat build menggunakan `SITE_URL`. Ikuti README sebelum publikasi.

Audit ini memeriksa fungsi dan struktur situs, bukan menjamin peringkat mesin pencari atau performa jaringan penyedia hosting. Screenshot hasil pemeriksaan tersimpan lokal di `.tmp/` dan tidak termasuk berkas publikasi.
