# Sprintly Design System

Generated from the UI/UX Pro Max repository and refined against the Sprintly product brief.

## Product direction

- Product: developer productivity operating system with fitness-style progression.
- Audience: developers working in focused desktop sessions, with companion mobile review.
- Personality: precise, competitive, composed, private by default.
- Density: 8/10 for authenticated surfaces; 5/10 for public pages.
- Motion: 6/10, limited to state changes, progress, and spatial continuity.

The generator's documentation-landing pattern was rejected after a narrower retry still returned the same mismatch. Public-page structure and application information architecture therefore follow the supplied product requirements; the verified style, typography, accessibility, and interaction results below remain in force.

## Visual system

- Style: OLED dark, layered graphite surfaces, minimal glow, crisp separators.
- Display type: JetBrains Mono for metrics, eyebrow labels, and developer-native moments.
- UI type: IBM Plex Sans for controls and readable dense content.
- Radius: 8px controls, 12px panels, 16px feature surfaces. Avoid pill-shaped containers except statuses.
- Elevation: use surface contrast and one restrained shadow scale, not glassmorphism.
- Icons: Lucide outline icons at 1.75px stroke. Never use emoji as structural icons.

## Semantic colors

| Token | Value | Usage |
|---|---:|---|
| `--background` | `#07080A` | app canvas |
| `--surface-1` | `#0D0F12` | sidebar and inset zones |
| `--surface-2` | `#12151A` | cards and panels |
| `--surface-3` | `#191D24` | elevated controls |
| `--foreground` | `#F4F2ED` | primary text |
| `--muted-foreground` | `#9299A6` | secondary text |
| `--border` | `#292E37` | separators |
| `--primary` | `#7C6CF2` | navigation, focus, key progress |
| `--primary-strong` | `#9B8CFF` | hover and highlighted data |
| `--cyan` | `#32C7D9` | focus and sync data |
| `--success` | `#36C98F` | completed, up to date |
| `--energy` | `#F6A94A` | streak and achievement |
| `--danger` | `#F06464` | destructive and error |

Normal text must reach 4.5:1 contrast. Charts pair color with labels, shape, or line style.

## Layout

- Desktop app: 248px expanded sidebar, 76px collapsed sidebar, persistent 64px top bar.
- Main content: max 1440px, 24-32px gutters, dense 12-column grid.
- Tablet: compact sidebar or drawer, two-column cards.
- Mobile: 375px baseline, top bar plus drawer, single-column priority order, no hidden primary action.
- Spacing: 4/8px base rhythm; common steps 8, 12, 16, 24, 32, 48, 64.

## Interaction

- All actionable elements use native links/buttons and visible `:focus-visible` rings.
- Minimum pointer target is 44px for primary mobile controls.
- Hover/press transitions are 150-240ms; content entrances 300-450ms with 30-50ms stagger.
- Animate transform and opacity only; disable non-essential motion under `prefers-reduced-motion`.
- Modals trap focus, close on Escape, expose a labelled close control, and never obscure focused content.
- Data sync state must always state whether data is Local, Synced, or Leaderboard eligible.

## Chart language

- Trends use line/area charts with direct labels and text summaries.
- Activity uses a heatmap with an explicit intensity legend and accessible per-cell labels.
- Targets use compact progress/bullet charts with visible numeric target text.
- Tooltips work on pointer and keyboard focus; key insights remain readable without interaction.

## Anti-patterns

- No generic purple gradient across every card.
- No excessive glass, neon, giant empty hero, decorative dashboard widgets, or fake metrics.
- No raw source-code analysis claims or implication that the website reads extension storage directly.
- No achievement UI that feels childish or relies on color alone.

## Delivery checks

- Verify 375, 768, 1024, and 1440px layouts.
- Verify keyboard-only navigation, visible focus, labelled icon controls, and reduced motion.
- Confirm no horizontal page overflow and no sticky UI obscures focus.
- Confirm charts include a visible legend/text summary and mobile simplification.
- Confirm every sharing/community surface identifies data eligibility.
