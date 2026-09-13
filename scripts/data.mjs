const money = (key, label, value, help = '') => ({ key, label, value, help, kind: 'money' });
const pct = (key, label, value, help = '') => ({ key, label, value, help, kind: 'percent' });
export const calculators = [
  {
    id: 'profit', title: 'Kalkulator Profit', short: 'Profit', icon: '↗', color: 'mint', tag: 'Paling sering dipakai',
    description: 'Hitung untung bersih per pesanan setelah modal, fee marketplace, kemasan, ongkir, dan iklan.',
    intro: 'Pesanan masuk belum tentu berarti untung. Masukkan seluruh biaya per pesanan untuk melihat berapa rupiah yang benar-benar tersisa.',
    fields: [money('price', 'Harga jual setelah diskon', '100.000'), money('cost', 'Total HPP produk', '45.000', 'Modal seluruh produk dalam satu pesanan.'), money('packing', 'Biaya kemasan', '3.000'), money('shipping', 'Subsidi ongkir penjual', '2.000', 'Hanya ongkir yang menjadi beban penjual.'), pct('fee', 'Total fee marketplace', '10', 'Asumsi contoh, bukan tarif resmi. Masukkan persentase yang berlaku pada toko Anda.'), money('ads', 'Biaya iklan per pesanan', '5.000', 'Total belanja iklan dibagi pesanan yang dihasilkan.')],
    result: 'Estimasi profit per pesanan', unit: 'money', rows: [['Pendapatan', 'money'], ['Total biaya', 'money'], ['Fee marketplace', 'money'], ['Margin profit', 'percent']],
    formula: 'Profit = harga jual − HPP − kemasan − subsidi ongkir − iklan − (harga jual × fee)',
    explanation: 'Margin profit adalah profit dibagi harga jual, lalu dikalikan 100%. Gunakan harga yang dibayar setelah diskon penjual. Untuk potongan tetap marketplace, gabungkan nilainya ke biaya kemasan atau HPP dan catat penyesuaiannya.',
    example: 'Harga jual Rp100.000, HPP Rp45.000, kemasan Rp3.000, subsidi ongkir Rp2.000, iklan Rp5.000, dan asumsi fee 10% menghasilkan total biaya Rp65.000. Profit per pesanan Rp35.000 dengan margin 35%.',
    caveat: 'Hasil belum memasukkan pajak, retur, gaji, sewa, atau biaya lain yang tidak Anda input. Ini estimasi profit per pesanan, bukan laba bersih laporan keuangan.',
    faq: [['Apakah omzet sama dengan profit?', 'Tidak. Omzet adalah pendapatan penjualan sebelum biaya. Profit adalah sisanya setelah biaya yang dimasukkan dikurangi.'], ['Bagaimana jika hasilnya negatif?', 'Hasil negatif berarti pesanan rugi berdasarkan asumsi biaya Anda. Tinjau harga, promo, HPP, fee, dan biaya iklan.'], ['Apa yang terjadi jika harga jual nol?', 'Profit tetap dihitung sebagai kerugian sebesar biaya. Margin ditampilkan sebagai tidak tersedia karena tidak dapat dibagi dengan pendapatan nol.']]
  },
  {
    id: 'margin', title: 'Kalkulator Margin', short: 'Margin', icon: '%', color: 'peach',
    description: 'Cari persentase margin dan markup dari harga jual serta total biaya produk. Pahami perbedaannya.',
    intro: 'Margin dan markup memakai pembagi yang berbeda. Bandingkan keduanya supaya target keuntungan tidak salah dihitung.',
    fields: [money('price', 'Harga jual', '100.000'), money('cost', 'Total biaya per produk', '60.000', 'Masukkan HPP saja untuk margin kotor, atau seluruh biaya untuk margin setelah biaya.')],
    result: 'Margin keuntungan', unit: 'percent', rows: [['Keuntungan per produk', 'money'], ['Markup atas biaya', 'percent'], ['Harga jual', 'money'], ['Total biaya', 'money']],
    formula: 'Margin = (harga jual − biaya) ÷ harga jual × 100%\nMarkup = (harga jual − biaya) ÷ biaya × 100%',
    explanation: 'Margin mengukur porsi keuntungan dalam penjualan. Markup mengukur tambahan harga di atas biaya. Jenis margin yang dihasilkan bergantung pada biaya yang Anda masukkan.',
    example: 'Harga jual Rp100.000 dan biaya Rp60.000 menghasilkan keuntungan Rp40.000. Marginnya 40%, sedangkan markup-nya 66,67%. Menambahkan markup 40% ke biaya tidak sama dengan memperoleh margin 40%.',
    caveat: 'Biaya nol menghasilkan margin 100% pada harga jual positif, tetapi markup tidak tersedia. Harga jual nol tidak dapat digunakan untuk menghitung margin.',
    faq: [['Mengapa margin berbeda dari markup?', 'Margin membagi keuntungan dengan harga jual, sedangkan markup membaginya dengan biaya. Karena pembaginya berbeda, persentasenya juga berbeda.'], ['Apakah biaya marketplace perlu dimasukkan?', 'Ya, jika Anda ingin margin setelah fee. Tambahkan nominal fee beserta biaya lain ke total biaya per produk.'], ['Apakah margin dapat negatif?', 'Ya. Margin negatif muncul saat biaya lebih besar dari harga jual dan menunjukkan kerugian per produk.']]
  },
  {
    id: 'harga-jual', title: 'Kalkulator Harga Jual', short: 'Harga jual', icon: '⌗', color: 'lavender',
    description: 'Tentukan harga jual minimum berdasarkan modal, biaya tambahan, target margin, dan fee marketplace Anda.',
    intro: 'Mulai dari biaya dan target margin Anda. Temukan harga yang memberi ruang untuk keuntungan sekaligus potongan marketplace.',
    fields: [money('cost', 'HPP per produk', '60.000'), money('extra', 'Biaya tambahan per produk', '3.000', 'Misalnya kemasan, alokasi iklan, dan potongan tetap.'), pct('fee', 'Total fee marketplace', '10', 'Asumsi contoh. Sesuaikan dengan kategori dan program toko Anda.'), pct('target', 'Target margin', '25', 'Persentase keuntungan terhadap harga jual, bukan markup.')],
    result: 'Rekomendasi harga jual minimum', unit: 'money', rows: [['Total biaya dasar', 'money'], ['Estimasi fee', 'money'], ['Estimasi profit', 'money'], ['Margin aktual', 'percent']],
    formula: 'Harga jual = (HPP + biaya tambahan) ÷ (1 − fee / 100 − target margin / 100)',
    explanation: 'Harga dibulatkan ke atas ke rupiah penuh agar target margin tidak berkurang akibat pembulatan. Rumus mengasumsikan fee persentase dihitung dari harga jual dan tidak memiliki batas nominal.',
    example: 'HPP Rp60.000, biaya tambahan Rp3.000, asumsi fee 10%, dan target margin 25%: Rp63.000 ÷ 0,65 = Rp96.923,08. Harga minimum setelah pembulatan adalah Rp96.924.',
    caveat: 'Jumlah fee dan target margin wajib kurang dari 100%. Jika Anda memberi diskon, gunakan harga bersih sesudah diskon sebagai sasaran atau hitung kembali harga sebelum promo.',
    faq: [['Apakah harga ini harus langsung dipakai?', 'Tidak. Ini batas berdasarkan biaya dan target Anda. Pertimbangkan daya beli pelanggan, harga pesaing, serta nilai produk sebelum menentukan harga akhir.'], ['Mengapa target margin ditambah fee tidak boleh 100%?', 'Jika seluruh penjualan habis untuk margin dan fee, tidak ada bagian yang menutup biaya dasar. Tidak ada harga positif terbatas yang memenuhi kondisi tersebut.'], ['Di mana memasukkan fee tetap?', 'Tambahkan nominal fee tetap per produk pada biaya tambahan. Jika fee tetap per pesanan, alokasikan menurut jumlah produk dalam pesanan.']]
  },
  {
    id: 'fee-marketplace', title: 'Kalkulator Fee Marketplace', short: 'Fee marketplace', icon: '▤', color: 'butter',
    description: 'Simulasikan potongan marketplace menggunakan persentase fee dan biaya tetap yang Anda masukkan sendiri.',
    intro: 'Lihat estimasi potongan dan dana tersisa dari satu pesanan. Anda memegang kendali atas persentase serta biaya tetap yang digunakan.',
    fields: [money('price', 'Total harga produk sebelum diskon', '150.000', 'Total produk dalam satu pesanan, tanpa ongkir.'), money('discount', 'Diskon yang ditanggung penjual', '10.000'), pct('fee', 'Total fee persentase', '8', 'Contoh simulasi saja. Cek tarif akun seller, lalu masukkan sendiri.'), money('fixed', 'Biaya tetap per pesanan', '1.250', 'Gabungkan potongan tetap yang relevan; isi 0 jika tidak ada.')],
    result: 'Total estimasi fee', unit: 'money', rows: [['Dasar perhitungan fee', 'money'], ['Potongan persentase', 'money'], ['Potongan tetap', 'money'], ['Dana setelah fee', 'money']],
    formula: 'Dasar fee = harga produk − diskon penjual\nTotal fee = (dasar fee × persentase fee / 100) + biaya tetap\nDana setelah fee = dasar fee − total fee',
    explanation: 'Simulasi menganggap seluruh fee persentase memakai dasar harga setelah diskon penjual. Persentase hanya boleh dijumlahkan bila dasar perhitungannya sama. Voucher yang ditanggung platform tidak otomatis mengurangi pendapatan penjual.',
    example: 'Harga produk Rp150.000 dikurangi diskon penjual Rp10.000 memberi dasar fee Rp140.000. Dengan asumsi fee 8% dan potongan tetap Rp1.250, total fee Rp12.450 dan dana setelah fee Rp127.550.',
    caveat: 'Tidak ada tarif marketplace terbaru yang ditanam di situs ini. Tarif, pajak, batas maksimum, dasar biaya, dan program tiap toko bisa berbeda. Cocokkan input dengan rincian transaksi di akun seller Anda.',
    faq: [['Apakah bisa dipakai untuk Shopee, Tokopedia, atau TikTok Shop?', 'Bisa untuk simulasi umum jika struktur biayanya sesuai rumus. Masukkan fee dari akun seller masing-masing; situs ini tidak mengambil tarif resmi platform.'], ['Apakah dana setelah fee sama dengan profit?', 'Tidak. Dana setelah fee belum dikurangi HPP, kemasan, iklan, ongkir penjual, dan biaya usaha lainnya. Gunakan kalkulator profit untuk memasukkan biaya tersebut.'], ['Bagaimana jika fee memiliki batas maksimum?', 'Rumus ini tidak menerapkan batas maksimum otomatis. Hitung potongan aktual sesuai ketentuan akun, lalu gunakan fee 0% dan masukkan total potongan itu sebagai biaya tetap.']]
  },
  {
    id: 'bep', title: 'Kalkulator BEP', short: 'BEP', icon: '⚑', color: 'sky',
    description: 'Hitung jumlah unit dan omzet minimum untuk menutup biaya tetap dari harga jual, biaya variabel, dan fee.',
    intro: 'Berapa produk perlu terjual supaya biaya usaha tertutup? Hitung titik impas untuk satu jenis produk dalam periode yang Anda pilih.',
    fields: [money('fixed', 'Biaya tetap per periode', '1.500.000', 'Misalnya total sewa dan gaji per bulan. Gunakan satu periode yang konsisten.'), money('price', 'Harga jual per unit', '100.000'), money('variable', 'Biaya variabel per unit', '60.000', 'HPP, kemasan, dan biaya per unit lainnya; belum termasuk fee persentase.'), pct('fee', 'Fee dari harga jual', '5', 'Asumsi contoh. Isi 0 jika fee sudah termasuk biaya variabel.')],
    result: 'Target penjualan untuk impas', unit: 'units', rows: [['Kontribusi per unit', 'money'], ['Biaya tetap', 'money'], ['Omzet pada target unit', 'money'], ['Sisa setelah biaya pada target', 'money']],
    formula: 'Kontribusi per unit = harga jual × (1 − fee / 100) − biaya variabel\nBEP unit = biaya tetap ÷ kontribusi per unit, dibulatkan ke atas',
    explanation: 'Kontribusi adalah uang dari satu unit yang tersedia untuk menutup biaya tetap. Omzet pada target unit dihitung dari unit bulat dikali harga jual, sehingga mungkin sedikit di atas titik impas teoritis.',
    example: 'Biaya tetap Rp1.500.000, harga jual Rp100.000, biaya variabel Rp60.000, dan asumsi fee 5% memberi kontribusi Rp35.000. BEP teoritis 42,86 unit, sehingga minimal terjual 43 unit dengan omzet Rp4.300.000.',
    caveat: 'Model ini mengasumsikan harga, biaya, dan semua unit terjual tetap konsisten. Untuk banyak jenis produk, hitung kontribusi rata-rata tertimbang berdasarkan komposisi penjualan Anda terlebih dahulu.',
    faq: [['Apa bedanya biaya tetap dan variabel?', 'Biaya tetap tidak langsung berubah karena satu unit tambahan terjual, misalnya sewa bulanan. Biaya variabel mengikuti unit penjualan, misalnya HPP dan kemasan.'], ['Mengapa BEP bisa tidak tercapai?', 'Jika kontribusi per unit nol atau negatif, tambahan penjualan tidak membantu menutup biaya tetap. Harga atau struktur biaya perlu diubah.'], ['Bagaimana jika biaya tetap nol?', 'Dengan kontribusi positif, BEP adalah 0 unit karena tidak ada biaya tetap yang perlu ditutup. Setiap unit berikutnya menambah keuntungan dalam model ini.']]
  },
  {
    id: 'roas', title: 'Kalkulator Break-even ROAS', short: 'Break-even ROAS', icon: '◎', color: 'rose',
    description: 'Hitung ROAS minimum dan biaya iklan maksimal per pesanan agar kontribusi produk setelah iklan tidak rugi.',
    intro: 'ROAS tinggi belum tentu menguntungkan. Cari batas impas iklan berdasarkan ruang margin produk Anda sebelum belanja iklan.',
    fields: [money('price', 'Pendapatan per pesanan', '100.000', 'Harga bersih setelah diskon penjual.'), money('cost', 'HPP per pesanan', '45.000'), money('extra', 'Biaya lain di luar iklan', '5.000', 'Kemasan, subsidi ongkir, atau biaya tetap per pesanan.'), pct('fee', 'Total fee marketplace', '10', 'Asumsi contoh. Isi persentase sesuai akun seller Anda.')],
    result: 'Break-even ROAS', unit: 'ratio', rows: [['Kontribusi sebelum iklan', 'money'], ['Margin sebelum iklan', 'percent'], ['Biaya iklan maksimal / pesanan', 'money'], ['Fee marketplace', 'money']],
    formula: 'Kontribusi = pendapatan − HPP − biaya lain − (pendapatan × fee / 100)\nBreak-even ROAS = pendapatan ÷ kontribusi\nBiaya iklan maksimal per pesanan = kontribusi',
    explanation: 'ROAS adalah pendapatan yang diatribusikan ke iklan dibagi biaya iklan. Pada batas impas, semua kontribusi sebelum iklan habis untuk biaya iklan. Target di atas angka ini memberi ruang profit pada asumsi biaya yang sama.',
    example: 'Pendapatan Rp100.000, HPP Rp45.000, biaya lain Rp5.000, dan asumsi fee 10% menyisakan kontribusi Rp40.000 atau 40%. Break-even ROAS adalah 2,5× dengan biaya iklan maksimal Rp40.000 per pesanan.',
    caveat: 'Ini titik impas kontribusi pesanan, bukan keseluruhan bisnis. Hasil belum memperhitungkan biaya tetap usaha yang tidak dialokasikan, retur, dan perbedaan atribusi iklan. Gunakan angka pendapatan dan iklan dari periode yang sama.',
    faq: [['Apa arti ROAS 2,5×?', 'Setiap Rp1 biaya iklan menghasilkan Rp2,50 pendapatan teratribusi. Pada margin sebelum iklan 40%, angka tersebut tepat menutup biaya iklan.'], ['Apakah ROAS sama dengan ROI?', 'Tidak. ROAS membandingkan pendapatan dengan biaya iklan. ROI membandingkan keuntungan dengan investasi atau biaya yang menjadi dasar pengukuran.'], ['Mengapa hasil tidak tersedia jika margin nol?', 'Tanpa kontribusi positif sebelum iklan, tidak ada anggaran iklan positif yang dapat ditutup oleh penjualan tersebut. Kalkulator menampilkan penjelasan, bukan angka tak terhingga.']]
  }
];
