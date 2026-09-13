import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../',import.meta.url));
const pagePrefix=(process.env.PAGE_PREFIX || '').replace(/^\/+|\/+$/g, '');
await mkdir(new URL('../.tmp/',import.meta.url),{recursive:true});
const server=spawn(process.execPath,['scripts/serve.mjs'],{cwd:root,stdio:'ignore',windowsHide:true});
const browser=spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=9333',`--user-data-dir=${root}.tmp/chrome-profile`,'about:blank'],{stdio:'ignore',windowsHide:true});
const delay=ms=>new Promise(r=>setTimeout(r,ms));
let ws;
try {
  let tabs;
  for(let i=0;i<40;i++){try{tabs=await(await fetch('http://127.0.0.1:9333/json')).json();break;}catch{await delay(250);}}
  if(!tabs)throw new Error('Headless Chrome did not start.');
  ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
  await new Promise((ok,no)=>{ws.onopen=ok;ws.onerror=no;});
  let seq=0; const pending=new Map(); const errors=[];
  ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);};
  const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
  const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
  await send('Page.enable');await send('Runtime.enable');
  const pages=['index.html','kalkulator-profit.html','kalkulator-margin.html','kalkulator-harga-jual.html','kalkulator-fee-marketplace.html','kalkulator-bep.html','kalkulator-roas.html','tentang.html','privacy-policy.html','disclaimer.html'];
  for(const width of [1440,390,320]){
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<500});
    for(const page of pages){
      await send('Page.navigate',{url:`http://127.0.0.1:4173/${pagePrefix ? `${pagePrefix}/` : ''}${page}`});
      for(let i=0;i<50;i++){await delay(40);if(await evaluate(`document.readyState === 'complete' && location.pathname.endsWith('${page}')`))break;}
      const check=await evaluate(`({width:innerWidth,scroll:document.documentElement.scrollWidth,h1:document.querySelectorAll('h1').length,result:document.getElementById('result-value')?.textContent,text:document.body.innerText})`);
      assert.equal(check.h1,1,page);
      if(check.scroll>width) console.log(await evaluate(`Array.from(document.querySelectorAll('body *')).filter(e=>e.getBoundingClientRect().right>innerWidth).map(e=>({tag:e.tagName,cls:e.className,right:e.getBoundingClientRect().right,width:e.getBoundingClientRect().width})).slice(0,20)`));
      assert.ok(check.scroll<=width,`${page} overflows at ${width}: ${check.scroll}`);
      assert.ok(!/NaN|Infinity/.test(check.text),page);
      if(page.startsWith('kalkulator'))assert.ok(check.result && check.result!=='—',`${page} default output`);
      if(page==='index.html' && width!==320){const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(new URL(`../.tmp/home-${width}.png`,import.meta.url),Buffer.from(shot.data,'base64'));}
      if(width===390 && page==='kalkulator-profit.html'){
        await evaluate(`document.getElementById('price').value='';document.getElementById('price').dispatchEvent(new Event('input',{bubbles:true}))`);await delay(250);
        assert.equal(await evaluate(`document.getElementById('result-value').textContent`),'—');
        assert.equal(await evaluate(`document.getElementById('price').getAttribute('aria-invalid')`),'true');
        await evaluate(`document.getElementById('calculator-form').reset()`);await delay(50);
        assert.ok((await evaluate(`document.getElementById('result-value').textContent`)).includes('35.000'));
        await evaluate(`document.getElementById('fee').value='101';document.getElementById('calculator-form').requestSubmit()`);
        assert.equal(await evaluate(`document.getElementById('result-value').textContent`),'—');
      }
      if(width===390 && page==='index.html'){
        await evaluate(`document.querySelector('.menu-toggle').click()`);
        assert.equal(await evaluate(`getComputedStyle(document.querySelector('.main-nav')).display`),'flex');
        await evaluate(`document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}))`);
        assert.equal(await evaluate(`document.querySelector('.menu-toggle').getAttribute('aria-expanded')`),'false');
      }
    }
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: all 10 pages at 1440px, 390px and 320px; no horizontal overflow or JS exceptions; calculator defaults, validation, reset and mobile menu work. Screenshots saved in .tmp.');
  await send('Browser.close');
} finally {ws?.close();browser.kill();server.kill();}
