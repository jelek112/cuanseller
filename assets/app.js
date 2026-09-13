(function () {
  'use strict';
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
  function closeMenu() { menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); }
  nav.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
  const number = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 });
  const currency = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 2 });
  function format(n, unit) {
    if (n === null || !Number.isFinite(n)) return '—';
    if (unit === 'money') return currency.format(n);
    if (unit === 'percent') return number.format(n) + '%';
    if (unit === 'ratio') return number.format(n) + '×';
    if (unit === 'units') return number.format(n) + ' unit';
    return number.format(n);
  }
  const form = document.getElementById('calculator-form');
  if (form) {
    const inputs = Array.from(form.querySelectorAll('input'));
    const valueEl = document.getElementById('result-value');
    const status = document.getElementById('result-status');
    const note = document.getElementById('result-note');
    const rows = Array.from(document.querySelectorAll('.result-rows dd'));
    function clear(message) {
      valueEl.textContent = '—';
      rows.forEach(r => { r.textContent = '—'; });
      status.textContent = 'Periksa input Anda';
      note.textContent = message;
      document.querySelector('.result-panel').classList.add('has-error');
    }
    function update() {
      const values = {};
      let invalid = false;
      inputs.forEach(input => {
        const percent = input.dataset.kind === 'percent';
        const n = CuanMath.parse(input.value, percent);
        let message = '';
        if (n === null) message = input.value.trim() === '' ? 'Kolom ini wajib diisi. Gunakan 0 jika tidak ada.' : 'Gunakan angka positif atau 0, maksimal 1 triliun. Rupiah: 100.000,50; persen: 10,5.';
        else if (percent && n > 100) message = 'Persentase harus di antara 0 dan 100.';
        input.setAttribute('aria-invalid', String(Boolean(message)));
        document.getElementById(input.id + '-error').textContent = message;
        invalid ||= Boolean(message);
        values[input.name] = n;
      });
      if (invalid) { clear('Perbaiki kolom yang ditandai. Hasil diperbarui setelah semua input valid.'); return; }
      try {
        const result = CuanMath.calculate(form.dataset.calculator, values);
        document.querySelector('.result-panel').classList.remove('has-error');
        valueEl.textContent = format(result.main, valueEl.dataset.unit);
        status.textContent = result.status;
        rows.forEach((r, i) => { r.textContent = format(result.rows[i], r.dataset.unit); });
        note.textContent = result.note || (result.rows.includes(null) ? 'Tanda — berarti rasio tidak tersedia karena pembaginya nol.' : 'Berdasarkan input Anda. Nilai awal adalah contoh, bukan tarif resmi.');
      } catch (err) { clear(err.message); }
    }
    let timer;
    form.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(update, 200); });
    form.addEventListener('submit', event => { event.preventDefault(); clearTimeout(timer); update(); const invalid = form.querySelector('[aria-invalid="true"]'); if (invalid) invalid.focus(); });
    form.addEventListener('reset', () => { clearTimeout(timer); setTimeout(update, 0); });
    update();
  }
})();
