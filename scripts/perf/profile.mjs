import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import { chromium } from '../../.performance/tools/node_modules/playwright/index.mjs';
import lighthouse from '../../.performance/tools/node_modules/lighthouse/core/index.js';
import * as chromeLauncher from '../../.performance/tools/node_modules/chrome-launcher/dist/index.js';

const label = process.argv[2] || 'baseline';
const mode = process.argv[3] || 'full';
const root = process.cwd();
const app = path.join(root, '.performance/app');
const out = path.join(root, '.performance/results', label);
fs.mkdirSync(out, { recursive: true });
const base = 'http://127.0.0.1:3100';
const executablePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const server = spawn(process.execPath, [path.join(root, 'node_modules/next/dist/bin/next'), 'start', '-p', '3100'], { cwd: app, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
server.stdout.on('data', data => fs.appendFileSync(path.join(out, 'server.log'), data));
server.stderr.on('data', data => fs.appendFileSync(path.join(out, 'server.log'), data));
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const median = values => [...values].sort((a,b) => a-b)[Math.floor(values.length / 2)];
const summary = { label, date: new Date().toISOString(), environment: { cpuSlowdown: 4, latencyMs: 40, downloadMbps: 1.6, viewport: '1365x900', origin: base }, routes: {}, loads: [], transitions: [], lighthouse: [] };
let browser;
try {
  for (let i = 0; i < 120; i++) {
    try { if ((await fetch(base)).ok) break; } catch {}
    if (i === 119) throw new Error('Production server did not start');
    await wait(500);
  }
  const manifest = JSON.parse(fs.readFileSync(path.join(app, '.next/app-build-manifest.json')));
  for (const [route, files] of Object.entries(manifest.pages)) {
    if (!route.endsWith('/page')) continue;
    const pathname = route.replace(/\/page$/, '') || '/';
    const chunks = [...new Set([...manifest.pages['/layout'], ...files, ...(pathname.startsWith('/app') ? manifest.pages['/app/layout'] || [] : [])])];
    summary.routes[pathname] = { chunks: chunks.map(file => {
      const data = fs.readFileSync(path.join(app, '.next', file));
      return { file, bytes: data.length, gzip: gzipSync(data).length, brotli: brotliCompressSync(data).length };
    }) };
    const item = summary.routes[pathname];
    for (const field of ['bytes', 'gzip', 'brotli']) item[field] = item.chunks.reduce((sum, chunk) => sum + chunk[field], 0);
    if (!pathname.includes('[')) {
      item.serverMs = [];
      for (let i = 0; i < 5; i++) {
        const start = performance.now();
        const response = await fetch(base + pathname);
        item.serverMs.push(performance.now() - start);
        item.headers = Object.fromEntries(response.headers);
        await response.arrayBuffer();
      }
      item.serverMedianMs = median(item.serverMs);
    }
  }
  fs.copyFileSync(path.join(app, 'client-stats.json'), path.join(out, 'client-stats.json'));
  browser = await chromium.launch({ executablePath, headless: true, args: ['--disable-extensions'] });
  summary.browser = browser.version();
  const seed = { userId: 'demo-user', email: 'demo@sprintly.local', displayName: 'Alex Rivera', mode: 'demo', issuedAt: '2026-09-05T00:00:00Z' };
  async function contextPage() {
    const context = await browser.newContext({ viewport: { width: 1365, height: 900 }, deviceScaleFactor: 1 });
    await context.addInitScript(auth => {
      localStorage.setItem('sprintly:auth:v1', JSON.stringify(auth));
      window.__perf = { lcp: 0, longTasks: [], writes: 0, writeMs: 0 };
      new PerformanceObserver(list => { for (const entry of list.getEntries()) window.__perf.lcp = entry.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver(list => { window.__perf.longTasks.push(...list.getEntries().map(e => ({ start: e.startTime, duration: e.duration }))); }).observe({ type: 'longtask', buffered: true });
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = function(...args) { const start = performance.now(); const result = original.apply(this, args); window.__perf.writes++; window.__perf.writeMs += performance.now() - start; return result; };
    }, seed);
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Performance.enable');
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 40, downloadThroughput: 200000, uploadThroughput: 93750, connectionType: 'cellular4g' });
    return { context, page, cdp };
  }
  const loadRoutes = mode === 'lighthouse' ? [] : mode === 'full' ? ['/', '/product', '/pricing', '/sign-in', '/app', '/app/sessions', '/app/analytics', '/app/settings'] : ['/'];
  for (const route of loadRoutes) {
    const {context, page, cdp} = await contextPage();
    const network = [], errors = [];
    cdp.on('Network.responseReceived', e => network.push({ url: e.response.url, type: e.type, headers: e.response.headers, timing: e.response.timing, encoded: e.response.encodedDataLength }));
    cdp.on('Network.loadingFinished', e => { network.push({ requestId: e.requestId, encodedDataLength: e.encodedDataLength }); });
    page.on('pageerror', e => errors.push(e.message));
    await page.coverage.startJSCoverage();
    if (route === '/') await cdp.send('Tracing.start', { categories: 'devtools.timeline,v8.execute,blink.user_timing,loading,disabled-by-default-v8.cpu_profiler', transferMode: 'ReturnAsStream' });
    await page.goto(base + route, { waitUntil: 'load', timeout: 90000 });
    await page.locator('h1').first().waitFor({ state: 'visible', timeout: 30000 });
    await wait(mode === 'full' ? 6000 : 3000);
    const metrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      const resources = performance.getEntriesByType('resource');
      return { ttfb: nav.responseStart, fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime, lcp: window.__perf.lcp, load: nav.loadEventEnd, ...window.__perf, resources: resources.map(r => ({ name: r.name, type: r.initiatorType, transferSize: r.transferSize, decodedBodySize: r.decodedBodySize, duration: r.duration })), nodes: document.querySelectorAll('*').length };
    });
    const coverage = await page.coverage.stopJSCoverage();
    metrics.jsBytes = coverage.reduce((sum, entry) => sum + entry.source.length, 0);
    fs.writeFileSync(path.join(out, route.replaceAll('/', '_') + '-coverage.json'), JSON.stringify(coverage));
    metrics.networkBytes = network.reduce((sum, event) => sum + (event.encodedDataLength || 0), 0);
    metrics.errors = errors;
    summary.loads.push({ route, ...metrics });
    const slug = route.replaceAll('/', '_') || 'home';
    fs.writeFileSync(path.join(out, slug + '-network.json'), JSON.stringify(network));
    await page.screenshot({ path: path.join(out, slug + '.png') });
    if (route === '/') {
      const finished = new Promise(resolve => cdp.once('Tracing.tracingComplete', resolve));
      await cdp.send('Tracing.end');
      const {stream} = await finished;
      let trace = '';
      while (true) { const item = await cdp.send('IO.read', {handle: stream}); trace += item.data; if (item.eof) break; }
      await cdp.send('IO.close', {handle: stream});
      fs.writeFileSync(path.join(out, 'home-trace.json'), trace);
    }
    console.log(JSON.stringify({ load: route, ttfb: metrics.ttfb, fcp: metrics.fcp, lcp: metrics.lcp, js: metrics.jsBytes, network: metrics.networkBytes, errors }));
    await context.close();
  }
  const sequences = mode === 'full' ? [
    ['/', '/product', '/how-it-works', '/for-teams', '/pricing', '/sign-in'],
    ['/app', '/app/workspace', '/app/sessions', '/app/analytics', '/app/achievements', '/app/goals', '/app/profile', '/app/community', '/app/settings', '/app/billing', '/app'],
  ] : mode === 'lighthouse' ? [] : [['/', '/product', '/how-it-works', '/for-teams', '/pricing']];
  for (const routes of sequences) {
    const {context,page,cdp} = await contextPage();
    await page.goto(base + routes[0], {waitUntil:'load'});
    await page.locator('h1').first().waitFor({state:'visible'});
    await wait(2000);
    for (const target of routes.slice(1)) {
      const from = new URL(page.url()).pathname;
      const beforeOrigin = await page.evaluate(() => performance.timeOrigin);
      const h1 = await page.locator('h1').first().textContent();
      let documents = 0;
      const onRequest = request => { if (request.isNavigationRequest() && request.frame() === page.mainFrame()) documents++; };
      page.on('request', onRequest);
      const start = performance.now();
      await page.locator(`a[href="${target}"]`).filter({visible:true}).first().click();
      await page.waitForURL(base + target);
      await page.waitForFunction(old => document.querySelector('h1')?.textContent !== old && !!document.querySelector('h1'), h1);
      await page.locator('h1').first().waitFor({state:'visible'});
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const elapsed = performance.now() - start;
      const afterOrigin = await page.evaluate(() => performance.timeOrigin);
      page.off('request', onRequest);
      const item = { from, to: target, ms: elapsed, documentRequests: documents, fullReload: beforeOrigin !== afterOrigin };
      summary.transitions.push(item);
      console.log(JSON.stringify(item));
      await wait(600);
    }
    await cdp.send('HeapProfiler.collectGarbage');
    summary.heapAfterNavigation = (await cdp.send('Runtime.getHeapUsage')).usedSize;
    await context.close();
  }
  await browser.close(); browser = null;
  if (mode === 'full' || mode === 'lighthouse') {
    for (let run = 0; run < 3; run++) {
      fs.mkdirSync(path.join(out, 'chrome-' + run), { recursive: true });
      const chrome = await chromeLauncher.launch({ chromePath: executablePath, chromeFlags: ['--headless', '--disable-extensions'], userDataDir: path.join(out, 'chrome-' + run) });
      try {
        const result = await lighthouse(base, { port: chrome.port, output: 'html', onlyCategories: ['performance'], formFactor: 'desktop', screenEmulation: { mobile: false, width: 1365, height: 900, deviceScaleFactor: 1, disabled: false }, throttlingMethod: 'devtools', throttling: { rttMs: 40, throughputKbps: 1600, requestLatencyMs: 40, downloadThroughputKbps: 1600, uploadThroughputKbps: 750, cpuSlowdownMultiplier: 4 } });
        fs.writeFileSync(path.join(out, `lighthouse-${run}.html`), result.report);
        fs.writeFileSync(path.join(out, `lighthouse-${run}.json`), JSON.stringify(result.lhr));
        const audits = result.lhr.audits;
        const item = { score: result.lhr.categories.performance.score, fcp: audits['first-contentful-paint'].numericValue, lcp: audits['largest-contentful-paint'].numericValue, tbt: audits['total-blocking-time'].numericValue, tti: audits.metrics.details.items[0].interactive, cls: audits['cumulative-layout-shift'].numericValue };
        summary.lighthouse.push(item); console.log(JSON.stringify({lighthouse:run,...item}));
      } finally { await chrome.kill(); }
    }
  }
} finally {
  fs.writeFileSync(path.join(out, 'summary.json'), JSON.stringify(summary, null, 2));
  fs.mkdirSync(path.join(root, 'docs/performance/measurements'), {recursive:true});
  fs.writeFileSync(path.join(root, 'docs/performance/measurements', label + '.json'), JSON.stringify({ ...summary, loads: summary.loads.map(({resources,...load}) => load), routes: Object.fromEntries(Object.entries(summary.routes).map(([route,{chunks,headers,...data}]) => [route,data])) }, null, 2));
  if (browser) await browser.close();
  server.kill();
}
