# Share Studio

The website owns source selection, derived share data, poster rendering and explicit image sharing. The extension remains a collector and sync client. Generated media never enters the database or public snapshot routes.

## Implementation checkpoints

1. Document the architecture and verification contract.
2. Add canonical share types, formats and template recommendations.
3. Derive privacy-safe sessions, records, recaps, streaks and achievements.
4. Test the domain, privacy rules and deterministic recommendations.
5. Build fixed-coordinate scene primitives and the metric-driven Devprint.
6. Design Session Hero, Minimal Stats and transparent Sticker posters.
7. Design Personal Record and Week in Code posters.
8. Add lazy PNG rendering, file sharing and download fallback.
9. Build the source-first, mobile Share Studio.
10. Connect account hydration, retention and navigation entry points.
11. Verify domain, exports, mobile layouts and production build; fix findings.

Each checkpoint is a separate commit (additional fixes may add commits).

## Boundaries

`Sprintly analytics → ShareMediaData → ShareSpec → scene → SVG preview / PNG Blob`

Templates receive normalized aggregate fields, never session packets. Sensitive field names, raw commands, prompts, paths, source code and signatures have no place in the share model. Terminal counts and token totals require the corresponding account preference and explicit studio inclusion. Unknown coding proportions remain visible rather than being reassigned to AI or manual work.

Remote Share Studio sources come from a successfully loaded account repository. Local imports remain available to the existing migration flow. Expired sessions are excluded by the account API. Calendar calculations use the account timezone; weekly bars are real per-day totals, while the Devprint is explicitly a nonchronological metric composition.

PNG rendering is loaded on Share or Download only. A slow render can outlast browser user activation; in that case the prepared file stays in memory and a second explicit Share tap opens the native sheet. Canceling never triggers an error or a download.

## Verification contract

- `pnpm lint`, `pnpm build`, `pnpm test:sprintly`.
- Domain fixtures for derivation, privacy, records/ties, recommendations, timezone weeks, empty/missing sources, remote-source selection and dimensions.
- Browser checks at 375, 768, 1024 and 1440 pixels, all five templates, three poster dimensions, transparent sticker, download, sharing fallback and cancellation.
- No generated image upload, automatic publishing, session payload in URLs, or changes to the companion extension.

## V1 limits

Recaps and records cover available retained history, not an invented all-time archive. The normalized model supports future stored summary entities without requiring their tables now. Curated graphite/paper backgrounds and transparent stickers come first; photo composition and new public-link behavior are outside V1.
