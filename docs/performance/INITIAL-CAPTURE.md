# Preliminary baseline capture

This is the original capture made before code changes. Use BASELINE.md for the corrected comparison: the first disposable build lacked its own ignore file, so Tailwind also scanned generated output. This affected CSS size and build time; the corrected run uses an original-revision Git worktree. These initial results remain here as an audit trail.

Source revision: 88e6156. Application code was unchanged for these measurements. Captured 2026-09-05 on Windows, Chrome 152.0.7977.77, Next 15.5.23, production build. No pre-existing skills were used.

## Method and limits

Lighthouse 12.8.2: three fresh Chrome profiles, desktop 1365 × 900, 4× CPU slowdown, 1.6 Mbps download, 750 Kbps upload, 40 ms configured latency, DevTools throttling. TTFB measurements are local loopback responses, not deployed-origin latency. Lighthouse diagnostic TTI is retained in JSON even though modern Lighthouse no longer includes it in the score.

Chrome DevTools Protocol captured Network responses, JavaScript coverage, a Performance trace and screenshots. Route bundles come from production webpack manifests; the table includes each route and its ancestor layouts, counts shared files once, and includes CSS. Raw, gzip and Brotli sizes are recorded in measurements/baseline.json; gzip is what the local server actually sends. Dynamic post-hydration chunks and speculative prefetch bytes are additional.

Production server starts in about 1.0 s. Server samples are five warm requests per static route. Browser load and transition figures below are single diagnostic runs; Lighthouse has three runs. Transition timings include real Playwright click dispatch, URL change, a changed visible h1 and two animation frames. They are not pure framework-router timings.

The large-history browser fixture has 500 submitted records; the real validator retains eligible records and the selected calendar range further filters them. The independent CPU benchmark has 3,000 records, seven timed repetitions after warm-up, fixed 2026-09-05 date and Asia/Kolkata zone. Do not compare these CPU milliseconds to throttled browser measurements.

## Lighthouse homepage baseline

| Metric | Median |
|---|---:|
| Performance score | 75 |
| FCP (ms) | 1098.6 |
| LCP (ms) | 2872.5 |
| TTI (ms) | 2165 |
| TBT (ms) | 143.3 |
| CLS | 0 |

The LCP element is the hero photograph. In run 2, 2,156 ms (75%) is image discovery delay; 664 ms is transfer time. It is inside an ssr:false component and is loading=lazy despite appearing in the initial viewport. Lighthouse reports 1,784,904 transferred bytes; the decorative Kiro PNG alone is 1,366,812 bytes. Short-window CDP transfer totals can exclude image bodies still downloading; use Lighthouse total-byte-weight for the complete transfer budget.

## Initial browser loads

| Route | TTFB ms | FCP ms | LCP ms | Evaluated JS bytes |
|---|---:|---:|---:|---:|
| / | 4.4 | 1036 | 3280 | 684734 |
| /product | 4.6 | 1068 | 2268 | 905316 |
| /pricing | 3.7 | 892 | 892 | 884656 |
| /sign-in | 5.6 | 672 | 1592 | 749259 |
| /app | 5.4 | 2680 | 2680 | 1434938 |
| /app/sessions | 3.6 | 2408 | 2408 | 1035877 |
| /app/analytics | 4.1 | 2472 | 2472 | 1035882 |
| /app/settings | 4.1 | 2392 | 2392 | 1035825 |

## Every menu transition exercised

| From | To | Click to visible heading ms | Document reload |
|---|---|---:|---|
| / | /product | 567.7 | Yes |
| /product | /how-it-works | 396.7 | Yes |
| /how-it-works | /for-teams | 398.8 | Yes |
| /for-teams | /pricing | 373.2 | Yes |
| /pricing | /sign-in | 436.2 | Yes |
| /app | /app/workspace | 963.8 | No |
| /app/workspace | /app/sessions | 138.5 | No |
| /app/sessions | /app/analytics | 199.1 | No |
| /app/analytics | /app/achievements | 222.6 | No |
| /app/achievements | /app/goals | 247.7 | No |
| /app/goals | /app/profile | 198.4 | No |
| /app/profile | /app/community | 156.9 | No |
| /app/community | /app/settings | 173.8 | No |
| /app/settings | /app/billing | 184.5 | No |
| /app/billing | /app | 334.8 | No |

## Bundle and server inventory

| Route | Raw JS + CSS bytes | Gzip bytes | Warm TTFB median ms |
|---|---:|---:|---:|
| /_not-found | 500866 | 134745 | 5.0 |
| /account-recovery | 776613 | 222495 | 4.9 |
| /create-account | 776613 | 222495 | 2.3 |
| /leaderboard | 500866 | 134745 | 4.4 |
| /onboarding | 776596 | 222485 | 2.2 |
| /forgot-password | 776613 | 222495 | 2.5 |
| / | 688339 | 196877 | 2.8 |
| /share/[id] | 596433 | 162588 | Dynamic parameter required |
| /profile/[handle] | 733450 | 207609 | Dynamic parameter required |
| /verify-email | 776613 | 222495 | 3.5 |
| /for-teams | 675223 | 192384 | 3.3 |
| /how-it-works | 688339 | 196876 | 2.7 |
| /product | 675223 | 192385 | 2.4 |
| /pricing | 688339 | 196876 | 2.7 |
| /privacy | 688339 | 196876 | 2.7 |
| /sign-in | 521397 | 142571 | 2.4 |
| /app | 788107 | 224498 | 2.1 |
| /app/achievements | 851633 | 248299 | 2.3 |
| /app/analytics | 856937 | 249715 | 2.2 |
| /app/billing | 850001 | 247102 | 3.1 |
| /app/profile | 862842 | 251227 | 2.7 |
| /app/community | 859148 | 250373 | 2.5 |
| /app/goals | 850173 | 247123 | 2.6 |
| /app/sessions/[id] | 857056 | 249649 | Dynamic parameter required |
| /app/sessions | 866074 | 251920 | 2.2 |
| /app/workspace | 854995 | 248469 | 3.0 |
| /app/settings | 868965 | 252587 | 2.3 |
| /app/share | 860556 | 250820 | 2.2 |

## Confirmed causes and existing good behavior

- Marketing menu uses motion.a: five measured transitions caused five document reloads (373–568 ms). Product menu already uses client routing; retain it.
- Client-only hero defers both the main heading and image discovery. The LCP photograph is incorrectly lazy-loaded.
- A 1.37 MB decorative icon bypasses Next image optimization. Other raster icon assets also use SVG image elements.
- Product shell schedules every product route for idle prefetch and also uses default viewport and hover prefetch. A settings visit evaluates about 1.04 MB of JS after hydration; this is more than its route needs.
- Opening import with a large history takes 1,089 ms: 642 DateTimeFormat constructions and 699 formatToParts calls. Closing takes 862 ms. Returning to sessions takes 1,540 ms. DOM reaches 7,719 elements with All time.
- Date filtering repeats conversion for the same record. Achievements scan and format each timestamp up to four times. Weekly personal records repeatedly copy growing arrays. Sorting scores builds full aggregates inside the comparator.
- Data hydration writes four storage resources (359,532 characters in the stress fixture), even without a user change.
- Settings schedules 305 animation frames during one idle second; the global Lenis loop is a contributor.
- Ten alternating analytics/settings visits grow collected JS heap from 7.55 MB to 8.43 MB. This alone does not establish a leak: route and framework caches can grow normally. Longer plateau checks will be used for the final audit.
- Fonts are already self-hosted, preloaded, WOFF2 and display:swap with metric fallbacks. Leave the font strategy in place.
- Production JS/CSS is already minified and tree-shaken. Static hashed assets send gzip and Cache-Control: public, max-age=31536000, immutable. Do not duplicate these controls.
- Next already provides route splitting; Recharts is already dynamically imported. Installed packages are not automatically transferred bytes; do not remove dependencies merely because package.json lists them.
- The project is browser-local demo data with no API/database layer and no analytics/chat/ad scripts. No N+1 query, database index, query-cache library or third-party deferral change is justified. No deployment target is configured, so CDN and real-origin cold starts remain unverified.

## Reproduce and inspect

Install tools separately: npm install --prefix .performance/tools --no-save --package-lock=false --ignore-scripts playwright lighthouse webpack-bundle-analyzer. Then run node scripts/perf/build.mjs; node scripts/perf/profile.mjs LABEL full; node --experimental-strip-types scripts/perf/cpu.mjs LABEL; node --experimental-strip-types scripts/perf/stress.mjs LABEL. The build uses a disposable source copy and shares installed dependencies, preserving the existing dev server.

Raw Lighthouse HTML/JSON, Chrome trace, JS coverage, Network captures, screenshots and the interactive webpack report are under .performance/results/baseline* (ignored because of size). Compact measurement JSON is committed beside this report. The package-manager build shortcut hits a pre-existing Sharp approval configuration error, so profiling directly invokes the installed Next CLI. Sandbox setup failed before executing commands; authorized commands and apply_patch ran through the escalation path.

Sources for metric interpretation: [Chrome Lighthouse TTI change](https://developer.chrome.com/blog/lighthouse-10-0?hl=en), [Next client navigation](https://nextjs.org/docs/app/getting-started/linking-and-navigating).
