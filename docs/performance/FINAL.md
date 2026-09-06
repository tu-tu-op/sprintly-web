# Final performance report

Original runtime: 88e6156. Final runtime: b064205. Sixteen atomic performance commits were retained, including one scan-bound guard; fifteen remain if that guard is excluded. Supporting measurement commits are listed separately. No deployment, backend migration, or dependency upgrade was performed.

## Plain-English diagnosis

The homepage waited for JavaScript before discovering its main image, then lazy-loaded that visible image. A small decorative icon downloaded a 1.37 MB PNG. Marketing links reloaded the document, while product shells warmed almost every route. Large histories repeated calendar calculations and rebuilt hundreds of rows; preference edits rewrote the entire history. An always-running smooth-wheel loop consumed idle work.

The fixes expose and prioritize the hero earlier, serve responsive icons, keep marketing navigation client-side, bound background prefetch, remove repeated calculations/rendering, paginate history, persist only changed resources, and use native wheel scrolling.

## Conditions and measurement caveats

[BASELINE.md](BASELINE.md) contains the corrected original-revision baseline. [INITIAL-CAPTURE.md](INITIAL-CAPTURE.md) preserves the initial audit captured before changes. The first isolated build omitted its ignore rules and let Tailwind scan generated output. Its CSS/build numbers were inflated. The original revision was rerun in a detached worktree with original ignores; final headline comparisons use that control. The apparent 110,816 → 77,529 byte CSS and 161 s → 8 s compilation reductions are instrumentation artifacts, not claimed site improvements.

Chrome 152.0.7977.77, Next 15.5.23 production, desktop 1365×900/DPR 1, 4× CPU, configured 1.6 Mbps download/750 Kbps upload/40 ms latency. Lighthouse 12.8.2 uses three independent runs per revision and medians below. Browser contexts are cold; local server and image-optimizer caches are warm. This is not a deployed-origin, cold-start, mobile-vitals, or CDN benchmark. Builds and CPU benchmarks did not run concurrently with timed browser tests.

Individual route/browser-action numbers are single observations, not population estimates. Transitions measure a real click, a changed visible h1 and two animation frames, including automation dispatch. The stress test freezes Date only, preserves native timers/RAF, uses 4× CPU and an unthrottled local network. Its 500-input fixture passes through the real validator: 374 records survive, 321 in the week view. Two original demo templates fail that validator; this unrelated behavior was not changed. CPU tests use 3,000 records, a fixed date, warm-up and seven samples.

## Homepage initial load

| Metric | Before median | After median |
|---|---|---|
| Lighthouse / 100 | 77.0 | 89.0 |
| FCP ms | 969.6 | 967.0 |
| LCP ms | 2879.5 | 1588.2 |
| Diagnostic TTI ms | 2187.0 | 2092.0 |
| Total blocking time ms | 115.7 | 142.1 |
| CLS | 0.0000 | 0.0069 |

LCP improved 44.8%; TTI improved 4.3%; FCP was essentially unchanged. Complete-transfer Lighthouse run 0: 1,777,376 → 384,779 bytes (78.4% less). Blocking time regressed by 26.4 ms and CLS rose to 0.0069. Lighthouse attributes the small shifts partly to font swapping now that the heading is visible early. The earlier hero is retained for its much larger LCP benefit; not every metric improved. TTI is diagnostic, not a current score component. [Lighthouse metric guidance](https://developer.chrome.com/blog/lighthouse-10-0?hl=en).

Separate CDP cold-context observations follow. DOM load-event time can rise when a formerly lazy image becomes an initial resource even while visible content arrives much earlier.

| Route | TTFB ms B → A | FCP ms B → A | LCP ms B → A | Load event ms B → A | Evaluated JS bytes B → A |
|---|---|---|---|---|---|
| / | 5.2 → 5.8 | 928.0 → 988.0 | 3480.0 → 1552.0 | 1687.4 → 2084.5 | 684223 → 666247 |
| /product | 7.6 → 6.4 | 868.0 → 908.0 | 2300.0 → 2300.0 | 1579.5 → 1599.6 | 904805 → 886572 |
| /pricing | 3.9 → 4.1 | 776.0 → 704.0 | 776.0 → 704.0 | 1671.4 → 1680.1 | 884145 → 865550 |
| /sign-in | 3.5 → 4.0 | 512.0 → 456.0 | 1536.0 → 1564.0 | 1194.7 → 1222.0 | 748748 → 729697 |
| /app | 4.0 → 4.9 | 2552.0 → 2568.0 | 2552.0 → 2568.0 | 1663.4 → 1653.8 | 1434425 → 1279430 |
| /app/sessions | 3.3 → 3.9 | 2332.0 → 2368.0 | 2332.0 → 2368.0 | 1755.6 → 1791.2 | 1035364 → 782452 |
| /app/analytics | 3.8 → 3.4 | 2412.0 → 2408.0 | 2412.0 → 2408.0 | 1747.2 → 1749.2 | 1035369 → 810147 |
| /app/settings | 4.5 → 3.8 | 2392.0 → 2372.0 | 2392.0 → 2372.0 | 1794.3 → 1784.9 | 1035312 → 777166 |

Product cold FCP remains around 2.4 s under this profile. Reduced speculative JavaScript did not materially improve every first paint. Evaluated JS means coverage source length, not transfer bytes or executed instructions. Short-window Network captures can miss the still-downloading original PNG; use complete-transfer Lighthouse totals for the end-to-end payload comparison.

## In-app navigation

| From | To | Before ms | After ms | Reload B → A |
|---|---|---|---|---|
| / | /product | 534.0 | 468.5 | Yes → No |
| /product | /how-it-works | 352.9 | 170.3 | Yes → No |
| /how-it-works | /for-teams | 358.5 | 243.6 | Yes → No |
| /for-teams | /pricing | 330.4 | 132.0 | Yes → No |
| /pricing | /sign-in | 435.7 | 444.2 | Yes → No |
| /app | /app/workspace | 986.0 | 715.2 | No → No |
| /app/workspace | /app/sessions | 128.3 | 125.9 | No → No |
| /app/sessions | /app/analytics | 175.8 | 165.6 | No → No |
| /app/analytics | /app/achievements | 197.4 | 149.3 | No → No |
| /app/achievements | /app/goals | 191.5 | 160.0 | No → No |
| /app/goals | /app/profile | 211.5 | 155.9 | No → No |
| /app/profile | /app/community | 148.8 | 118.9 | No → No |
| /app/community | /app/settings | 134.5 | 147.0 | No → No |
| /app/settings | /app/billing | 153.0 | 139.8 | No → No |
| /app/billing | /app | 316.9 | 291.5 | No → No |

Mean across five public edges: 402.3 → 291.7 ms (27.5% lower). Mean across ten product edges: 264.4 → 216.9 ms (17.9% lower). These are sequence averages, not all link permutations or field p50 values. Pricing → sign-in and community → settings did not improve in this sample.

A blanket intent-only prefetch trial reduced settings JavaScript but pushed first product clicks toward 0.5 s; it was rejected before commit. The retained policy warms one adjacent menu destination after paint, respects Data Saver/2G for background work, cancels pending timers, and preserves hover/focus warming. [Rejected trial data](measurements/10-intent-prefetch.json).

## Large-history interactions

| Operation | Before ms | After ms |
|---|---|---|
| Initial history load | 2571.6 | 1536.0 |
| openImport | 1024.6 | 228.0 |
| closeImport | 829.1 | 104.5 |
| allSessions | 951.8 | 96.9 |
| sortScore | 869.0 | 146.8 |
| navigate:/app/analytics | 412.7 | 432.5 |
| navigate:/app/profile | 388.9 | 408.8 |
| navigate:/app/settings | 178.4 | 171.5 |
| navigate:/app/sessions | 1418.3 | 380.9 |
| togglePreference | 81.3 | 52.2 |

| Work metric | Before | After |
|---|---|---|
| All-time DOM nodes | 7713 | 1238 |
| Date formatter constructors / dialog open | 642 | 0 |
| Timezone conversions / dialog open | 699 | 1 |
| Storage writes / preference edit | 4 | 1 |
| Serialized characters / preference edit | 359531 | 190 |
| Scheduled RAF in idle 1 s observation | 305 | 2 |

Return to history improved 73.1%; opening Import JSON improved 77.7%. Totals still cover the entire filtered history; only rendering is paginated. Sort/date range/timezone/day changes reset the effective page. Calendar-relative cached results refresh on the next interaction after midnight. Other stress navigation timings increased slightly; no universal navigation improvement is claimed. Raw stress writeBytes counts JavaScript string characters, not encoded disk bytes. The final two idle RAF callbacks belong to the measurement harness, not an app loop.

## CPU algorithms

| 3,000-record operation | Before median ms | After median ms |
|---|---|---|
| aggregate | 1.714 | 1.696 |
| filter | 28.430 | 15.176 |
| achievements | 59.092 | 16.403 |
| personalRecords | 26.651 | 16.905 |
| scoreSort | 75.180 | 0.978 |

General aggregation was already efficient and remains unchanged. Targeted changes preserve fractional rounding, shipping caps, timezone boundaries and empty-history behavior. A 150,000-record regression verifies that personal-record calculations avoid spread-argument limits.

## Per-commit measurement ledger

Each row is one self-contained performance concern measured before proceeding. Step timings use the preceding build unless marked controlled/initial. Work-count savings are explicitly distinguished from latency wins.

| Commit | Conventional message | Measured effect | Evidence |
|---|---|---|---|
| a19d2b3 | perf: avoid duplicate timezone conversion in session filters | Filter: 28.43 → 15.44 ms | [JSON](measurements/01-date-filter-cpu.json) |
| 5d70c53 | perf: classify achievement calendar signals in one pass | Achievements: 58.00 → 16.52 ms | [JSON](measurements/02-achievement-calendar-cpu.json) |
| 4a5bfe0 | perf: compute personal records with linear weekly accumulators | Personal records: 26.72 → 17.02 ms; dense-history regression passes | [JSON](measurements/03-personal-records-cpu.json) |
| 369a59b | perf: avoid full aggregation inside session score comparisons | Score sorting: 73.90 → 0.97 ms | [JSON](measurements/04-direct-scoring-cpu.json) |
| 4a5c18b | perf: use client routing and intent prefetch in marketing navigation | First four public edges: ~434 → 320 ms average; 4 reloads → 0 (initial capture) | [JSON](measurements/05-client-navigation.json) |
| 9862fb4 | perf: limit Tailwind scanning to application sources | Controlled CSS: 77,769 → 77,529 bytes; guard, not a large runtime win | [JSON](measurements/06-tailwind-build.json) |
| 02a77d0 | perf: server-render the homepage hero and visible heading | CDP hero LCP: 3,292 → 2,632 ms; heading present without JS | [JSON](measurements/07-server-rendered-hero.json) |
| 892e05d | perf: preload the visible hero image for LCP | CDP hero LCP: 2,632 → 1,588 ms | [JSON](measurements/08-priority-hero-image.json) |
| e7a8ce9 | perf: serve responsive optimized hero icons | Observed transfer: 1,782,502 → 390,859 bytes; LCP unchanged | [JSON](measurements/09-responsive-icons.json) |
| 82b0c03 | perf: bound speculative route prefetch while retaining intent warming | Settings evaluated JS: 1,035,312 → 796,136 bytes; adjacent transitions ~129–215 ms | [JSON](measurements/10-bounded-prefetch.json) |
| 7d74127 | perf: reuse date and number formatters in session history | Dialog open: 1,038 → 799 ms; date formatters: 642 → 0 | [JSON](measurements/11-formatters-stress.json) |
| 2641105 | perf: cache filtered history and aggregate calculations | Timezone calls/open: 378 → 1; time 799 → 807 ms (no latency win established) | [JSON](measurements/12-derived-history-stress.json) |
| 380dcb8 | perf: skip rendering unchanged session rows | Dialog open: 807 → 667 ms; sort interaction: 614 → 506 ms | [JSON](measurements/13-memo-rows-stress.json) |
| ca4935b | perf: bound session history rendering with accessible pagination | DOM: 7,713 → 1,238 nodes; history return: 1,220 → 402 ms | [JSON](measurements/14-paginated-history-stress.json) |
| c831d47 | perf: persist only changed user data resources | Preference writes: 4 → 1; characters: 359,531 → 190; interaction: 80 → 66 ms | [JSON](measurements/15-incremental-storage-stress.json) |
| b064205 | perf: remove the perpetual smooth-wheel animation loop | Idle scheduled RAF: 306 → 2; remaining two are test frames | [JSON](measurements/16-native-scroll-stress.json) |

The scan guard is not counted toward fifteen substantial fixes. Its initial compile-time result is invalid for a real-site claim; corrected original CSS is 77,769 bytes. Calculation memoization demonstrably removes work but alone did not establish a wall-clock interaction win.

## Route build inventory and server response

Raw/gzip totals include JS+CSS from route and ancestor layouts, deduplicated by filename. Async hydration chunks and speculative routes are additional and appear in Network/coverage. Thus evaluated code can fall substantially while route envelopes stay similar. Sessions adds about 1 KB raw for pagination in exchange for bounded rendering. Brotli is computed size, not a claim of local Brotli negotiation. Server response is five-request warm-loopback TTFB median.

| Route | Raw bytes B → A | Gzip bytes B → A | After Brotli bytes | Server ms B → A |
|---|---|---|---|---|
| /_not-found | 468343 → 467436 | 128308 → 128041 | 107939 | 4.2 → 4.0 |
| /account-recovery | 744090 → 743290 | 216058 → 215821 | 185576 | 4.1 → 3.9 |
| /create-account | 744090 → 743290 | 216058 → 215821 | 185576 | 2.3 → 2.3 |
| /leaderboard | 468343 → 467436 | 128308 → 128041 | 107939 | 3.6 → 4.2 |
| /forgot-password | 744090 → 743290 | 216058 → 215821 | 185576 | 1.9 → 2.3 |
| / | 655816 → 655412 | 190440 → 190340 | 162907 | 2.5 → 3.4 |
| /onboarding | 744069 → 743273 | 216046 → 215812 | 185571 | 2.0 → 2.4 |
| /profile/[handle] | 700927 → 700589 | 201174 → 201067 | 172473 | Parameterized |
| /share/[id] | 563912 → 563098 | 156149 → 155927 | 132458 | Parameterized |
| /verify-email | 744090 → 743290 | 216058 → 215821 | 185576 | 2.0 → 2.3 |
| /for-teams | 642698 → 642285 | 185948 → 185856 | 158961 | 2.8 → 2.6 |
| /how-it-works | 655816 → 655412 | 190440 → 190341 | 162904 | 2.2 → 2.3 |
| /product | 642700 → 642285 | 185948 → 185857 | 158961 | 2.5 → 2.1 |
| /pricing | 655816 → 655412 | 190440 → 190341 | 162903 | 2.3 → 2.2 |
| /privacy | 655816 → 655412 | 190439 → 190341 | 162903 | 2.3 → 2.2 |
| /sign-in | 488874 → 487979 | 136135 → 135878 | 114842 | 1.8 → 2.2 |
| /app/billing | 817478 → 817374 | 240664 → 240662 | 207573 | 2.3 → 2.5 |
| /app/community | 826627 → 826656 | 243936 → 243982 | 210447 | 2.3 → 2.2 |
| /app/analytics | 824414 → 824445 | 243281 → 243320 | 209890 | 2.3 → 2.4 |
| /app/achievements | 819108 → 819141 | 241864 → 241910 | 208683 | 1.9 → 1.7 |
| /app/profile | 830319 → 830350 | 244792 → 244835 | 211266 | 2.6 → 2.2 |
| /app/sessions/[id] | 824533 → 824564 | 243213 → 243258 | 209886 | Parameterized |
| /app/sessions | 833551 → 834628 | 245483 → 245845 | 212222 | 2.2 → 2.7 |
| /app/goals | 817648 → 817546 | 240684 → 240683 | 207592 | 1.8 → 2.0 |
| /app/share | 828035 → 828064 | 244384 → 244420 | 210796 | 2.2 → 2.1 |
| /app | 755584 → 755122 | 218060 → 217901 | 187240 | 2.1 → 2.3 |
| /app/settings | 836442 → 836473 | 246150 → 246189 | 212426 | 2.3 → 1.8 |
| /app/workspace | 822470 → 822368 | 242031 → 242029 | 208763 | 2.2 → 2.3 |

## Already-optimal areas and bundle audit

The parsed analyzer identifies the existing 395,696-byte Recharts async chunk, already split from first paint and retained. Framework, icon and motion package versions were inspected; no removable duplicate application dependency was established as a delivered-route bottleneck. React Query is installed but absent from the emitted graph; removing it would not improve this runtime. Lenis is absent from the final module graph. Framework-owned React/React DOM entries were not force-aliased.

Minification/tree-shaking, optimized package imports, self-hosted preloaded WOFF2 fonts with display:swap/fallbacks, gzip, and hashed-asset Cache-Control: public, max-age=31536000, immutable were already working and retained. The visible Kiro PNG changed from 1,366,812 bytes to a 716-byte optimized body in the DPR-1 request (1,016 transfer bytes), with responsive candidates and a 40px size hint. Existing below-fold lazy behavior and image optimization remain.

No database queries, API endpoints, analytics/chat/ad scripts exist in this local-demo data path. There was no evidenced N+1/index/remote-data-staleness/third-party-script problem to fix. Existing router cache, validated-session reuse, loading and auth placeholders remain; no extra SWR/query-cache dependency or artificial optimistic metrics were introduced. CDN effectiveness, remote image-origin cold misses, deployment cold starts and production APIs require deployment telemetry and remain unverified.

## Memory and correctness

After GC, retained heap over 0/10/20/30/40 extra analytics/settings navigations: 7.222 MB → 7.897 MB → 8.112 MB → 8.171 MB → 8.253 MB. Growth tapers after the first framework/route-cache batch, but this short test neither establishes a leak nor proves its absence. No accumulating app RAF loop remains on idle settings. Pointer listener/timer cleanup was reviewed.

Passed: production build; source typecheck; all 19 logic tests; 13 browser checks covering no-JS hero, desktop/mobile image loading and overflow, native scrolling, client marketing navigation, sign-in, imports, duplicate rejection, storage-failure retry, sort/expansion/session detail, every product menu destination, preference persistence and 121-record pagination. Final mobile/desktop screenshots were visually inspected. No uncaught browser errors were recorded.

The existing pnpm build wrapper fails before Next runs because Sharp build approval is not boolean in its pnpm configuration. That unrelated configuration was not changed. The installed Next CLI was invoked directly by the isolated build script; production build and typechecking passed. The user’s existing port-3000 dev server was left alone; profiling servers were stopped.

Required Next.js/React review was applied during continuation without replacing measured gates. The prescribed browser CLI was unavailable, so Chrome/Playwright performed verification.

## Supporting commits

These concern evidence and verification only, not runtime fixes. This report and final measurement artifacts are a separate documentation-only commit.

| Commit | Concern | Runtime effect |
|---|---|---|
| fdac737 | test(perf): record production baseline and profiling harness | None |
| de185f2 | test(perf): keep stress calendar stable across midnight | None |
| 03eb975 | test(perf): reuse shared asset size calculations | None |
| 41f1236 | test(perf): measure preference persistence on interaction | None |
| 1d970f5 | test(perf): preserve ignore rules and support original-revision controls | None |
| 9b92179 | test(perf): add browser checks for navigation and retained product flows | None |
| e251edc | test(perf): record controlled baseline from the original revision | None |
| 60d840e | test(perf): support targeted route profiling without repeated Lighthouse runs | None |
| acd46fb | test(perf): make baseline build instrumentation idempotent | None |
| e4ee6d5 | test(perf): sample retained heap across forty navigations | None |
| d42ec72 | test(perf): verify native scrolling at desktop and mobile widths | None |
| 20bbe29 | test(perf): retain cached modules in bundle analysis | None |

## Artifacts and reproduction

- [Controlled baseline](measurements/baseline-controlled.json), [final route/Lighthouse measurements](measurements/final.json), [final stress](measurements/final-stress.json), [final CPU](measurements/final-cpu.json), [browser checks](measurements/final-verification.json).
- [Original bundle analyzer](../../.performance/results/baseline-controlled/bundle.html), [final bundle analyzer](../../.performance/results/final/bundle.html).
- [Original Chrome trace](../../.performance/results/baseline-controlled/home-trace.json), [final Chrome trace](../../.performance/results/final/home-trace.json). Open in Chrome DevTools Performance.
- Per-route Network/coverage, all Lighthouse HTML/JSON runs, screenshots and server headers remain under .performance/results/baseline-controlled and .performance/results/final as ignored generated artifacts.

Run from the repository root:

    node scripts/perf/build.mjs
    node scripts/perf/profile.mjs replay full
    node --experimental-strip-types scripts/perf/cpu.mjs replay
    node --experimental-strip-types scripts/perf/stress.mjs replay
    node --experimental-strip-types scripts/perf/verify.mjs
    node --experimental-strip-types --test lib/sprintly/logic.test.ts
    node node_modules/typescript/bin/tsc --noEmit

Tool installation and original-worktree setup are in BASELINE.md. Stress label final includes the 40-navigation heap extension. Analyzer stats include cached modules, so incremental builds remain inspectable. An analyzer-only rebuild changed build-ID manifests but all 51 measured route assets retained their names and byte sizes. [Webpack cached-module stats](https://github.com/webpack/webpack-cli/blob/main/OPTIONS.md).

