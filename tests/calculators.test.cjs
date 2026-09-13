const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parse, calculate } = require('../assets/math.js');
const close = (a,b) => assert.ok(Math.abs(a-b) < 1e-8, `${a} differs from ${b}`);
test('Format angka Indonesia serta input tidak valid', () => {
  for (const [s,n] of [['100.000',100000],['100000',100000],['1.234.567,89',1234567.89],['0',0],['0,50',.5],[' 15 ',15]]) assert.equal(parse(s),n);
  for (const s of ['', ' ', '-1', 'Infinity', 'NaN', '1e6', '100,000', '12.34', '1..000', 'Rp100', '1,2,3', '1000000000001', '<script>']) assert.equal(parse(s),null,s);
  assert.equal(parse('10.5',true),10.5); assert.equal(parse('10,5',true),10.5);
});
test('Contoh profit dan kerugian', () => {
  const v={price:100000,cost:45000,packing:3000,shipping:2000,fee:10,ads:5000};
  const r=calculate('profit',v); assert.equal(r.main,35000); assert.deepEqual(r.rows,[100000,65000,10000,35]);
  assert.equal(calculate('profit',{...v,price:0}).rows[3],null);
  assert.equal(calculate('profit',{...v,price:10000}).main,-46000);
});
test('Margin versus markup dan pembagi nol',()=>{
  const r=calculate('margin',{price:100000,cost:60000}); assert.equal(r.main,40); close(r.rows[1],200/3);
  assert.equal(calculate('margin',{price:100,cost:0}).rows[1],null);
  assert.equal(calculate('margin',{price:100,cost:150}).main,-50);
  assert.throws(()=>calculate('margin',{price:0,cost:50}));
});
test('Harga jual memenuhi target setelah pembulatan',()=>{
  const r=calculate('harga-jual',{cost:60000,extra:3000,fee:10,target:25}); assert.equal(r.main,96924); assert.ok(r.rows[3]>=25);
  assert.throws(()=>calculate('harga-jual',{cost:100,extra:0,fee:50,target:50}));
  assert.throws(()=>calculate('harga-jual',{cost:0,extra:0,fee:10,target:25}));
});
test('Fee memakai dasar setelah diskon serta fee tetap',()=>{
  assert.deepEqual(calculate('fee-marketplace',{price:150000,discount:10000,fee:8,fixed:1250}).rows,[140000,11200,1250,127550]);
  assert.equal(calculate('fee-marketplace',{price:150000,discount:10000,fee:8,fixed:1250}).main,12450);
  assert.equal(calculate('fee-marketplace',{price:100,discount:100,fee:8,fixed:10}).rows[3],-10);
  assert.throws(()=>calculate('fee-marketplace',{price:0,discount:1,fee:0,fixed:0}));
});
test('BEP dibulatkan ke unit utuh dan kontribusi harus positif',()=>{
  const v={fixed:1500000,price:100000,variable:60000,fee:5}; const r=calculate('bep',v);
  assert.equal(r.main,43); assert.equal(r.rows[2],4300000); assert.equal(r.rows[3],5000);
  assert.equal(calculate('bep',{...v,variable:95000}).main,null);
  assert.equal(calculate('bep',{...v,variable:100000}).main,null);
  assert.equal(calculate('bep',{...v,fixed:0}).main,0);
});
test('ROAS impas dan ruang iklan nol',()=>{
  const v={price:100000,cost:45000,extra:5000,fee:10}; const r=calculate('roas',v);
  assert.equal(r.main,2.5); assert.deepEqual(r.rows,[40000,40,40000,10000]);
  assert.equal(calculate('roas',{...v,cost:95000}).main,null);
  assert.throws(()=>calculate('roas',{...v,price:0}));
});
test('Semua hasil numerik tetap finite pada 6000 skenario deterministik',()=>{
  let seed=719; const rnd=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
  for(let i=0;i<1000;i++) {
    const price=Math.floor(rnd()*1e12), cost=Math.floor(rnd()*1e12), fee=Math.floor(rnd()*100), fixed=Math.floor(rnd()*1e12);
    const cases={profit:{price,cost,fee,packing:0,shipping:0,ads:fixed},margin:{price,cost},'harga-jual':{cost,extra:fixed,fee:fee/2,target:20},'fee-marketplace':{price,discount:price/2,fee,fixed},bep:{price,variable:cost,fee,fixed},roas:{price,cost,fee,extra:fixed}};
    for(const [type,v] of Object.entries(cases)) { const r=calculate(type,v); for(const n of [r.main,...r.rows]) assert.ok(n===null || Number.isFinite(n)); }
  }
});
test('Menolak nilai tidak finite dan di luar batas',()=>{
  for(const n of [NaN,Infinity,-1,1e13]) assert.throws(()=>calculate('margin',{price:n,cost:1}));
});
