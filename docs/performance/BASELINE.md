# Baseline performance report

Original application revision: 88e6156. This controlled rerun uses a detached Git worktree with its original ignore rules. The initial report, captured before any fixes, is preserved in [INITIAL-CAPTURE.md](INITIAL-CAPTURE.md). An isolation mistake in that initial capture let Tailwind scan generated output; its large CSS/build-time figures are excluded from final real-site claims.

## Conditions

Windows; Chrome 152.0.7977.77; Next 15.5.23 production; Lighthouse 12.8.2; Playwright 1.63.0; webpack-bundle-analyzer 5.3.2. Desktop viewport 1365×900, DPR 1, 4× CPU slowdown, 1.6 Mbps download, 750 Kbps upload, 40 ms configured network latency. Three independent Lighthouse profiles. Page requests use the local loopback origin; the image optimizer may fetch remote source images. The server and image cache are warm. Server TTFB cannot establish deployed-origin or CDN performance.

Each browser cold load uses a new context. Local demo authentication is seeded only into test contexts. Initial visible loads use CDP Performance, Network and JS coverage; homepage traces can be opened in Chrome DevTools Performance. A real link click, changed visible h1 and two animation frames define a transition. Timings include browser-automation dispatch, so compare the identical method. Browser route observations are single samples; Lighthouse uses medians.

## Homepage Lighthouse

| Metric | Median |
|---|---:|
| Performance score | 77 |
| FCP ms | 969.6 |
| LCP ms | 2879.5 |
| TTI ms | 2187 |
| Blocking time ms | 115.7 |
| CLS | 0 |

TTI is the diagnostic interactive value retained in Lighthouse JSON, not a component of its current score. The LCP photograph waits for a client-only component and is lazy-loaded even though visible. The 1,366,812-byte Kiro icon uses an unoptimized SVG image. The original correctly scoped production CSS is 77,769 bytes. The initial isolation experiment reported 110,816 bytes, which is not the original real-site budget.

## Cold loads

| Route | TTFB ms | FCP ms | LCP ms | JS evaluated bytes |
|---|---:|---:|---:|---:|
| / | 5.2 | 928 | 3480 | 684223 |
| /product | 7.6 | 868 | 2300 | 904805 |
| /pricing | 3.9 | 776 | 776 | 884145 |
| /sign-in | 3.5 | 512 | 1536 | 748748 |
| /app | 4.0 | 2552 | 2552 | 1434425 |
| /app/sessions | 3.3 | 2332 | 2332 | 1035364 |
| /app/analytics | 3.8 | 2412 | 2412 | 1035369 |
| /app/settings | 4.5 | 2392 | 2392 | 1035312 |

## Menu transitions

| From | To | Click-to-heading ms | Full reload |
|---|---|---:|---|
| / | /product | 534.0 | Yes |
| /product | /how-it-works | 352.9 | Yes |
| /how-it-works | /for-teams | 358.5 | Yes |
| /for-teams | /pricing | 330.4 | Yes |
| /pricing | /sign-in | 435.7 | Yes |
| /app | /app/workspace | 986.0 | No |
| /app/workspace | /app/sessions | 128.3 | No |
| /app/sessions | /app/analytics | 175.8 | No |
| /app/analytics | /app/achievements | 197.4 | No |
| /app/achievements | /app/goals | 191.5 | No |
| /app/goals | /app/profile | 211.5 | No |
| /app/profile | /app/community | 148.8 | No |
| /app/community | /app/settings | 134.5 | No |
| /app/settings | /app/billing | 153.0 | No |
| /app/billing | /app | 316.9 | No |

## Route bundle inventory

Raw/gzip totals include JS and CSS for the route plus ancestor layouts, counting shared chunks once. Async hydration chunks and prefetch downloads are additional and appear in JS-coverage/network results. Server latency is the median of five warm responses.

| Route | Raw bytes | Gzip bytes | Server TTFB ms |
|---|---:|---:|---:|
| /_not-found | 468343 | 128308 | 4.2 |
| /account-recovery | 744090 | 216058 | 4.1 |
| /create-account | 744090 | 216058 | 2.3 |
| /forgot-password | 744090 | 216058 | 1.9 |
| /onboarding | 744069 | 216046 | 2.0 |
| / | 655816 | 190440 | 2.5 |
| /leaderboard | 468343 | 128308 | 3.6 |
| /profile/[handle] | 700927 | 201174 | Parameterized route |
| /share/[id] | 563912 | 156149 | Parameterized route |
| /for-teams | 642698 | 185948 | 2.8 |
| /how-it-works | 655816 | 190440 | 2.2 |
| /privacy | 655816 | 190439 | 2.3 |
| /product | 642700 | 185948 | 2.5 |
| /pricing | 655816 | 190440 | 2.3 |
| /verify-email | 744090 | 216058 | 2.0 |
| /sign-in | 488874 | 136135 | 1.8 |
| /app/billing | 817478 | 240664 | 2.3 |
| /app/analytics | 824414 | 243281 | 2.3 |
| /app | 755584 | 218060 | 2.1 |
| /app/achievements | 819108 | 241864 | 1.9 |
| /app/profile | 830319 | 244792 | 2.6 |
| /app/goals | 817648 | 240684 | 1.8 |
| /app/share | 828035 | 244384 | 2.2 |
| /app/sessions/[id] | 824533 | 243213 | Parameterized route |
| /app/settings | 836442 | 246150 | 2.3 |
| /app/sessions | 833551 | 245483 | 2.2 |
| /app/community | 826627 | 243936 | 2.3 |
| /app/workspace | 822470 | 242031 | 2.2 |

## CPU and interaction findings

The independent, fixed-date 3,000-session CPU baseline is in measurements/baseline-cpu.json: date filtering 28.43 ms, achievement classification 59.09 ms, personal records 26.65 ms and score sorting 75.18 ms (seven samples after warm-up). Browser stress measurements use a 500-record fixture through the real validator and a fixed September 5 calendar. Two original demo templates fail validation; the fixture retains 374 valid records and 321 rows in the week view. This validation behavior was not changed.

Opening the import dialog originally rebuilt every visible row, hundreds of Intl formatters and all filtering/aggregation results. All-time history rendered thousands of DOM nodes. Product shells prefetched all destinations even on settings visits. Data loading rewrote all four resources; preference changes rewrote unchanged session history too. A global smooth-scroll loop scheduled animation frames while settings was idle.

## Already working; retained

Client routing already works inside the product. Next already splits routes, and Recharts is dynamically imported. Fonts are self-hosted WOFF2, preloaded and display:swap. Production JS/CSS is minified/tree-shaken, static hashes receive gzip and Cache-Control: public, max-age=31536000, immutable. There is no database/API or analytics/chat/ad script in this local demo. No database indexes, query-cache dependency, blanket memoization, font replacement or manual compression server were added. CDN behavior and production cold starts are unverified because no deployment was placed in scope.

## Reproduce

For a fresh checkout, first create the original-revision control with:

    git worktree add --detach .performance/original 88e6156

Then set PERF_APP_DIR to the absolute path of that worktree before running build.mjs and profile.mjs. The build script creates its dependency junction automatically. Clear PERF_APP_DIR to build current sources again. Do not add the worktree a second time if it already exists.

Install isolated tools: npm install --prefix .performance/tools --no-save --package-lock=false --ignore-scripts playwright@1.63.0 lighthouse@12.8.2 webpack-bundle-analyzer@5.3.2. Run node scripts/perf/build.mjs, then node scripts/perf/profile.mjs LABEL full and node --experimental-strip-types scripts/perf/stress.mjs LABEL. CPU: node --experimental-strip-types scripts/perf/cpu.mjs LABEL. For the original worktree set PERF_APP_DIR to .performance/original using its absolute path. Profile outputs and interactive bundle reports are under .performance/results; compact measurements are committed here.

Use [Lighthouse metric documentation](https://developer.chrome.com/blog/lighthouse-10-0?hl=en) and [Next client-navigation documentation](https://nextjs.org/docs/app/getting-started/linking-and-navigating) to interpret the metrics. The initial capture and original-revision control preceded the required framework review applied during continuation.
