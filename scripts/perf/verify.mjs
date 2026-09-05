import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from '../../.performance/tools/node_modules/playwright/index.mjs';
import { DEMO_SESSIONS } from '../../lib/sprintly/demo-data.ts';

const root=process.cwd(), base='http://127.0.0.1:3102';
const out=path.join(root,'.performance/results/verification');
fs.mkdirSync(out,{recursive:true});
const server=spawn(process.execPath,[path.join(root,'node_modules/next/dist/bin/next'),'start','-p','3102'],{cwd:path.join(root,'.performance/app'),windowsHide:true,stdio:'ignore'});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const checks=[];
let browser;
try {
  for(let i=0;i<120;i++){try{if((await fetch(base)).ok)break;}catch{}await wait(500);}
  browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  const noJS=await browser.newContext({javaScriptEnabled:false,viewport:{width:1365,height:900}});
  const staticPage=await noJS.newPage();await staticPage.goto(base);
  assert.match(await staticPage.locator('h1').textContent(),/Make your coding/);
  assert.equal(await staticPage.locator('h1').evaluate(el=>getComputedStyle(el.parentElement).opacity),'1');
  await staticPage.screenshot({path:path.join(out,'home-no-js.png')});checks.push('Hero heading visible without JavaScript');await noJS.close();
  for(const viewport of [{width:1365,height:900},{width:390,height:844}]){
    const context=await browser.newContext({viewport});const page=await context.newPage();
    await page.goto(base);await page.locator('h1').waitFor({state:'visible'});await wait(1200);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    const image=page.getByAltText('Developer workspace with code visible on a monitor');
    assert.equal(await image.evaluate(el=>el.complete&&el.naturalWidth>0),true);
    await page.screenshot({path:path.join(out,`home-${viewport.width}.png`)});
    checks.push(`Homepage ${viewport.width}px: no overflow, image loaded`);await context.close();
  }
  const context=await browser.newContext({viewport:{width:1365,height:900}});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);await page.locator('h1').waitFor();
  const origin=await page.evaluate(()=>performance.timeOrigin);
  for(const route of ['/product','/how-it-works','/for-teams','/pricing','/sign-in']){
    await page.locator(`nav a[href="${route}"]`).first().click();await page.waitForURL(base+route);await page.locator('h1').waitFor({state:'visible'});
    assert.equal(await page.evaluate(()=>performance.timeOrigin),origin);
  }
  checks.push('Marketing links keep the same document');
  await page.getByRole('button',{name:'Sign in',exact:true}).click();
  await page.waitForURL(base+'/app');await page.locator('h1').waitFor({state:'visible'});
  checks.push('Demo sign-in reaches the authenticated dashboard');
  await page.locator('nav a[href="/app/sessions"]').first().click();await page.waitForURL(base+'/app/sessions');
  await page.getByRole('button',{name:'All time',exact:true}).click();
  await page.getByRole('button',{name:'Import JSON',exact:true}).click();
  const imported={...DEMO_SESSIONS[0],sessionId:'perf-functional-import'};
  const payload=JSON.stringify({contract:'devstrava.session.v1',schemaVersion:1,sessions:[imported]});
  await page.locator('input[type="file"]').setInputFiles({name:'session.json',mimeType:'application/json',buffer:Buffer.from(payload)});
  await page.getByRole('button',{name:'Import validated sessions',exact:true}).click();
  assert.ok(await page.evaluate(()=>JSON.parse(localStorage.getItem('sprintly:demo-user:sessions:v1')).some(s=>s.record.sessionId==='perf-functional-import')));
  checks.push('Validated import persists a session');
  await page.getByRole('button',{name:'Import JSON',exact:true}).click();
  await page.locator('input[type="file"]').setInputFiles({name:'session.json',mimeType:'application/json',buffer:Buffer.from(payload)});
  assert.equal(await page.getByRole('button',{name:'Import validated sessions',exact:true}).isDisabled(),true);
  await page.getByRole('button',{name:'Close import dialog'}).click();checks.push('Duplicate import remains rejected');
  await page.locator('#session-sort').selectOption('score');
  await page.locator('main button[aria-expanded]').first().click();
  await page.getByRole('link',{name:'Open full session'}).first().click();
  await page.waitForURL(/\/app\/sessions\/.+/);await page.locator('h1').waitFor({state:'visible'});checks.push('Session sort, expansion and detail route work');
  for(const route of ['/app/analytics','/app/achievements','/app/profile','/app/community','/app/settings','/app/workspace','/app/goals','/app/billing']){
    await page.locator(`nav a[href="${route}"]`).first().click();await page.waitForURL(base+route);await page.locator('h1').waitFor({state:'visible'});
  }
  checks.push('Every product menu destination renders');
  await page.goto(base+'/app/settings');await page.locator('h1').waitFor({state:'visible'});
  const toggle=page.getByRole('switch').first();const previous=await toggle.getAttribute('aria-checked');await toggle.click();
  await page.reload();await page.locator('h1').waitFor({state:'visible'});assert.notEqual(await page.getByRole('switch').first().getAttribute('aria-checked'),previous);
  checks.push('Preference changes survive reload');
  await page.screenshot({path:path.join(out,'settings.png')});
  await page.goto(base+'/app/sessions');await page.getByRole('button',{name:'All time',exact:true}).click();await page.screenshot({path:path.join(out,'sessions.png')});
  assert.deepEqual(errors,[]);checks.push('No uncaught browser errors');
  console.log(JSON.stringify({checks},null,2));
}finally{
  fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify({checks},null,2));
  if(browser)await browser.close();server.kill();
}
