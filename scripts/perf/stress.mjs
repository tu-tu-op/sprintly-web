import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from '../../.performance/tools/node_modules/playwright/index.mjs';
import { DEMO_SESSIONS } from '../../lib/sprintly/demo-data.ts';

const label = process.argv[2] || 'baseline';
const root = process.cwd(), base = 'http://127.0.0.1:3101';
const out = path.join(root, '.performance/results', label);
fs.mkdirSync(out, {recursive:true});
const now = new Date('2026-09-05T12:00:00+05:30');
const records = Array.from({length:500}, (_,i) => {
  const record = DEMO_SESSIONS[i % DEMO_SESSIONS.length];
  const start = now.getTime() - (i % 7) * 86400000;
  return {record:{...record,sessionId:`stress-${i}`,startedAt:new Date(start).toISOString(),endedAt:new Date(start+record.activeDurationSeconds*1000).toISOString()},source:'imported',importedAt:now.toISOString(),verified:false};
});
const server = spawn(process.execPath, [path.join(root,'node_modules/next/dist/bin/next'),'start','-p','3101'], {cwd:process.env.PERF_APP_DIR || path.join(root,'.performance/app'),windowsHide:true,stdio:'ignore'});
const wait = ms => new Promise(r=>setTimeout(r,ms));
let browser;
const results = {label,sessions:records.length,actions:[]};
try {
  for(let i=0;i<120;i++){try{if((await fetch(base)).ok)break;}catch{} await wait(500);}
  browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  const context=await browser.newContext({viewport:{width:1365,height:900}});
  await context.addInitScript(records=>{
    // Freeze Date only. Keep native timers and RAF so their work is measured.
    const NativeDate = Date;
    const fixedNow = NativeDate.parse('2026-09-05T12:00:00+05:30');
    window.Date = new Proxy(NativeDate, {
      construct(target, args) { return Reflect.construct(target, args.length ? args : [fixedNow]); },
      apply() { return new NativeDate(fixedNow).toString(); },
      get(target, property, receiver) { return property === 'now' ? () => fixedNow : Reflect.get(target, property, receiver); },
    });
    localStorage.setItem('sprintly:auth:v1',JSON.stringify({userId:'demo-user',email:'demo@sprintly.local',displayName:'Alex Rivera',mode:'demo',issuedAt:new Date().toISOString()}));
    localStorage.setItem('sprintly:demo-user:sessions:v1',JSON.stringify(records));
    window.__stress={dateFormatters:0,numberFormatters:0,dateParts:0,writes:0,writeBytes:0,raf:0};
    for(const [key,metric] of [['DateTimeFormat','dateFormatters'],['NumberFormat','numberFormatters']]){
      const original=Intl[key];
      Intl[key]=new Proxy(original,{construct(target,args){window.__stress[metric]++;return Reflect.construct(target,args);},apply(target,self,args){window.__stress[metric]++;return Reflect.apply(target,self,args);}});
    }
    const parts=Intl.DateTimeFormat.prototype.formatToParts;
    Intl.DateTimeFormat.prototype.formatToParts=function(...args){window.__stress.dateParts++;return parts.apply(this,args);};
    const write=Storage.prototype.setItem;
    Storage.prototype.setItem=function(k,v){window.__stress.writes++;window.__stress.writeBytes+=v.length;return write.call(this,k,v);};
    const raf=window.requestAnimationFrame;
    window.requestAnimationFrame=fn=>{window.__stress.raf++;return raf(fn);};
  },records);
  const page=await context.newPage();
  const cdp=await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  async function action(name,fn){
    const before=await page.evaluate(()=>({...window.__stress}));
    const start=performance.now();await fn();
    await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    const ms=performance.now()-start;
    const after=await page.evaluate(()=>({...window.__stress,nodes:document.querySelectorAll('*').length}));
    const delta=Object.fromEntries(Object.keys(before).map(k=>[k,after[k]-before[k]]));
    const item={name,ms,...delta,nodes:after.nodes};results.actions.push(item);console.log(JSON.stringify(item));
  }
  const start=performance.now();
  await page.goto(base+'/app/sessions',{waitUntil:'load',timeout:120000});
  await page.locator('h1').waitFor({state:'visible',timeout:120000});
  results.initialMs=performance.now()-start;
  await wait(2000);
  results.initial=await page.evaluate(()=>({...window.__stress,nodes:document.querySelectorAll('*').length}));
  console.log(JSON.stringify({initial:results.initial,ms:results.initialMs}));
  await action('openImport',()=>page.getByRole('button',{name:'Import JSON',exact:true}).click());
  await action('closeImport',()=>page.getByRole('button',{name:'Close import dialog'}).click());
  await action('allSessions',()=>page.getByRole('button',{name:'All time',exact:true}).click());
  await action('sortScore',()=>page.locator('#session-sort').selectOption('score'));
  for(const route of ['/app/analytics','/app/profile','/app/settings','/app/sessions']){
    await action('navigate:'+route,async()=>{await page.locator(`nav a[href="${route}"]`).first().click();await page.waitForURL(base+route);await page.locator('h1').waitFor({state:'visible'});});
  }
  await page.goto(base+'/app/settings',{waitUntil:'load'});await page.locator('h1').waitFor({state:'visible'});await wait(1000);
  results.settingsButtons=await page.getByRole('button').allTextContents();
  await action('togglePreference',()=>page.getByRole('switch').first().click());
  await action('idleSettings1s',()=>wait(1000));
  await cdp.send('HeapProfiler.collectGarbage');results.heapBefore=(await cdp.send('Runtime.getHeapUsage')).usedSize;
  for(let i=0;i<5;i++)for(const route of ['/app/analytics','/app/settings']){await page.locator(`nav a[href="${route}"]`).first().click();await page.waitForURL(base+route);await wait(200);}
  await cdp.send('HeapProfiler.collectGarbage');results.heapAfter=(await cdp.send('Runtime.getHeapUsage')).usedSize;
  if(label === 'final') {
    results.heapSamples=[results.heapBefore,results.heapAfter];
    for(let batch=0;batch<3;batch++) {
      for(let i=0;i<5;i++)for(const route of ['/app/analytics','/app/settings']) {
        await page.locator(`nav a[href="${route}"]`).first().click();await page.waitForURL(base+route);await wait(200);
      }
      await cdp.send('HeapProfiler.collectGarbage');
      results.heapSamples.push((await cdp.send('Runtime.getHeapUsage')).usedSize);
    }
  }
  results.errors=errors;
}finally{
  fs.mkdirSync('docs/performance/measurements',{recursive:true});
  fs.writeFileSync(`docs/performance/measurements/${label}-stress.json`,JSON.stringify(results,null,2));
  if(browser)await browser.close();server.kill();
}
