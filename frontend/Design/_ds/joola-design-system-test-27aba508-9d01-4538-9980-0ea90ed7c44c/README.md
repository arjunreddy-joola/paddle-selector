# JOOLA · Material Design 3

A faithful re-implementation of **Material Design 3** with a JOOLA brand layer
on top: yellow seed for the primary tonal palette and **FK Grotesk Neue** as
the brand typeface. M3 mechanics are strict — state-layer opacities, elevation
shadows, motion durations, and typescale values all match the spec.

## Files

```
JOOLA Design System/
├── tokens.css           ← M3 tokens: ref.palette, sys.color (light + dark),
│                          sys.typescale, sys.shape, sys.elevation, sys.state,
│                          sys.motion · + brand-expression extras
├── colors_and_type.css  ← Typescale utility classes + element defaults +
│                          .md-state-layer helper
├── fonts/               ← FK Grotesk Neue (Thin → Black, italics) + FK Grotesk Mono
├── assets/              ← JOOLA brand assets (logos, wordmark, imagery)
├── preview/             ← Design-system preview cards (one .html per card)
│   ├── _card.css        ← Shared chrome for the cards
│   ├── type-*.html      ← Display · Headline · Title · Body · Label
│   ├── colors-*.html    ← Tonal palettes · Neutrals & surfaces · Semantic roles
│   ├── shape.html       ← 7 corner sizes + compound (top-only) + full
│   ├── elevation.html   ← 6 levels (level0 → level5)
│   ├── state-layers.html
│   ├── motion.html      ← 16 durations + 7 easings (live)
│   ├── spacing.html
│   ├── buttons.html     ← Filled · Tonal · Outlined · Text · Elevated · FAB
│   ├── chips.html       ← Assist · Filter · Input · Suggestion
│   ├── text-fields.html ← Filled · Outlined (incl. floating label, error)
│   ├── tabs.html        ← Primary · Secondary
│   ├── list.html        ← 1-line / 2-line / 3-line
│   ├── snackbar.html
│   ├── menu.html
│   ├── badges.html
│   ├── nav-bar.html     ← Top app bar · small / center / medium / large
│   ├── product-card.html ─┐  brand-expression cards, kept for showcase
│   ├── logos.html       ─┤  but not part of the M3 component library
│   ├── trinity-symbol.html
│   └── brand/colors-accents.html
└── README.md            ← this file
```

## Theming

The default scheme is light. Add `.theme-dark` (or `[data-theme="dark"]`) to
`<html>` / `<body>` to flip every M3 role to its dark counterpart.

```html
<html class="theme-dark">…</html>
```

## Color system

Strict M3 with a JOOLA twist — the primary tonal palette is seeded by JOOLA
yellow (`~hue 95`, T90 ≈ `#EFE158`). At spec-compliant tones the role colors
are:

| Role | Light | Dark |
|---|---|---|
| Primary | P-40 olive-yellow | P-80 light olive |
| On-primary | white | P-20 |
| Primary container | P-90 brand yellow | P-30 |
| Secondary | low-chroma yellow-olive | — |
| Error | M3 standard red | — |

JOOLA bright yellow (`#F0E81F`-ish) lives in `--md-ref-palette-primary90` and
the brand-expression layer (`--joola-yellow`) — reach for those when you need
the raw brand hue rather than the spec-graded role color.

## Typography

| Family | Use |
|---|---|
| **FK Grotesk Neue** | All typescale roles — Display · Headline · Title · Body · Label |
| **FK Grotesk Mono** | Numeric specs, eyebrow overlines, code |

Type scale is exactly M3: 57/45/36 (display), 32/28/24 (headline),
22/16/14 (title), 16/14/12 (body), 14/12/11 (label).

```html
<h1 class="md-display-large">Title</h1>
<p class="md-body-large">Paragraph copy.</p>
<button class="md-label-large">Action</button>
```

## Components

All 8 components from the M3 brief are in `preview/`:

| Card | Variants |
|---|---|
| `buttons.html` | Filled · Tonal · Outlined · Text · Elevated · FAB (sm / md / lg + ext.) |
| `chips.html` | Assist · Filter · Input · Suggestion |
| `text-fields.html` | Filled · Outlined (floating label, error, disabled) |
| `tabs.html` | Primary (text · stacked icon) · Secondary |
| `list.html` | 1-line · 2-line · 3-line |
| `snackbar.html` | Single-line · with action · with close · two-line |
| `menu.html` | Standard · dense radio · disabled item |
| `nav-bar.html` | Top app bar — small / center / medium / large / scrolled |

Each card is a standalone HTML file that loads `tokens.css` + `colors_and_type.css`
+ `_card.css`. State layers are implemented with the M3-spec opacities
(0.08 hover · 0.10 focus & pressed · 0.16 dragged). Disabled = 38% on-surface
content on a 12% on-surface container.

## Motion

`md.sys.motion.duration-*` ships short1 (50ms) → extra-long4 (1000ms).
`md.sys.motion.easing-*` provides linear, standard / standard-accelerate /
standard-decelerate, and emphasized / emphasized-accelerate /
emphasized-decelerate. See `preview/motion.html` for a live demo.

## Brand layer (extra)

Beyond M3, `tokens.css` also exposes raw JOOLA brand colors under
`--joola-yellow`, `--joola-red`, `--joola-court-blue`, etc. These sit
**outside** the M3 scheme — use them for logos, marketing surfaces, and
product imagery, not application UI.
