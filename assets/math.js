(function (root) {
  'use strict';
  const MAX = 1e12;
  function parse(value, percent = false) {
    const text = String(value).trim();
    const pattern = percent ? /^\d+(?:[.,]\d{1,4})?$/ : /^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/;
    if (!pattern.test(text)) return null;
    const n = Number(percent ? text.replace(',', '.') : text.replace(/\./g, '').replace(',', '.'));
    return Number.isFinite(n) && n >= 0 && n <= MAX ? n : null;
  }
  function calculate(type, v) {
    if (Object.values(v).some(n => !Number.isFinite(n) || n < 0 || n > MAX)) throw new Error('Masukkan angka yang valid dan tidak negatif.');
    const fee = (v.fee || 0) / 100;
    if (fee > 1) throw new Error('Fee tidak boleh lebih dari 100%.');
    let out;
    switch (type) {
      case 'profit': {
        const feeCost = v.price * fee;
        const cost = v.cost + v.packing + v.shipping + v.ads + feeCost;
        const profit = v.price - cost;
        out = { main: profit, rows: [v.price, cost, feeCost, v.price > 0 ? profit / v.price * 100 : null], status: profit < 0 ? 'Rugi per pesanan' : profit === 0 ? 'Impas per pesanan' : 'Untung per pesanan' };
        break;
      }
      case 'margin': {
        if (v.price <= 0) throw new Error('Harga jual harus lebih besar dari nol untuk menghitung margin.');
        const profit = v.price - v.cost;
        out = { main: profit / v.price * 100, rows: [profit, v.cost > 0 ? profit / v.cost * 100 : null, v.price, v.cost], status: profit < 0 ? 'Margin negatif' : 'Margin dari harga jual' };
        break;
      }
      case 'harga-jual': {
        if (v.target + v.fee >= 100) throw new Error('Jumlah target margin dan fee harus kurang dari 100%.');
        const total = v.cost + v.extra;
        if (total <= 0) throw new Error('Isi setidaknya satu biaya lebih besar dari nol.');
        const price = Math.ceil(total / (1 - fee - v.target / 100));
        const feeCost = price * fee;
        out = { main: price, rows: [total, feeCost, price - total - feeCost, (price - total - feeCost) / price * 100], status: 'Harga minimum, dibulatkan ke atas' };
        break;
      }
      case 'fee-marketplace': {
        if (v.discount > v.price) throw new Error('Diskon penjual tidak boleh melebihi harga produk.');
        const base = v.price - v.discount;
        const feeCost = base * fee;
        out = { main: feeCost + v.fixed, rows: [base, feeCost, v.fixed, base - feeCost - v.fixed], status: 'Estimasi potongan per pesanan' };
        break;
      }
      case 'bep': {
        const contribution = v.price * (1 - fee) - v.variable;
        if (contribution <= 0) return { main: null, rows: [contribution, v.fixed, null, null], status: 'BEP belum dapat dicapai', note: 'Kontribusi per unit harus positif. Naikkan harga jual atau turunkan biaya variabel dan fee.' };
        const units = Math.ceil(v.fixed / contribution);
        out = { main: units, rows: [contribution, v.fixed, units * v.price, units * contribution - v.fixed], status: 'Unit minimum untuk menutup biaya tetap' };
        break;
      }
      case 'roas': {
        if (v.price <= 0) throw new Error('Harga jual harus lebih besar dari nol untuk menghitung ROAS.');
        const contribution = v.price * (1 - fee) - v.cost - v.extra;
        if (contribution <= 0) return { main: null, rows: [contribution, contribution / v.price * 100, null, v.price * fee], status: 'Belum ada ruang biaya iklan', note: 'Produk sudah impas atau rugi sebelum iklan. Perbaiki harga atau biaya terlebih dahulu.' };
        out = { main: v.price / contribution, rows: [contribution, contribution / v.price * 100, contribution, v.price * fee], status: 'ROAS minimum agar impas' };
        break;
      }
      default: throw new Error('Kalkulator tidak dikenal.');
    }
    if ([out.main, ...out.rows].some(n => n !== null && !Number.isFinite(n))) throw new Error('Angka terlalu besar. Kurangi nilai masukan.');
    return out;
  }
  const api = { parse, calculate, MAX };
  root.CuanMath = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
