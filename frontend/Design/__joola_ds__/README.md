# JOOLA Design System

A design system for **JOOLA** — a racket-sports brand best known for professional pickleball paddles and table tennis equipment. Source of truth: the public storefront at **https://joola.com/** (Shopify Dawn-derived theme).

> **Note on source access**: This system was built primarily from the public storefront. No Figma file, internal codebase, or brand-guide PDF was provided. Product photography, type choices, and layout patterns are observed from the live site. Fonts are **best-match Google Fonts substitutes** — flagged below. Ask the brand team for the real webfonts to swap in.

---

## Index

| File / folder                  | What's in it                                                                 |
| ------------------------------ | ---------------------------------------------------------------------------- |
| `README.md`                    | This document — brand overview, content rules, visual foundations, iconography |
| `SKILL.md`                     | Agent Skills manifest (lets this folder be used as a Claude Code skill)       |
| `colors_and_type.css`          | CSS custom properties: colors, type scale, spacing, radii, shadows, motion  |
| `assets/logos/`                | JOOLA wordmark + trinity lockup (PNG + SVG, black and white variants)        |
| `assets/imagery/`              | Product photography (paddles on white) + lifestyle hero crops                |
| `preview/`                     | Self-contained card HTML files that render in the Design System tab          |
| `ui_kits/storefront/`          | React + HTML recreation of the joola.com storefront (header, hero, PDP, grid) |

---

## Brand at a glance

**Who**: JOOLA is a heritage racket-sports brand (founded 1952 in Germany, now prominent in the U.S. market). Two sport verticals share the same visual system:
- **Pickleball** — the growth engine. Pro paddle lines (Pro V, Pro IV, 3S, Gen 1, Vision) in "shapes" named Perseus, Hyperion, Scorpeus, Agassi, Kosmos, Magnus, Graf. Signature paddles for pros (Ben Johns, Anna Bright, Simone Jardim, Collin Johns, Tyson McGuffin, Federico Staksrud, Andre Agassi, Steffi Graf).
- **Table Tennis** — the heritage line. Tables, balls, nets, rackets, blades, rubbers, robots. Athletes: Hugo Calderano, Marty Supreme.

Plus apparel, accessories, bags, headwear, footwear (R4LLY shoe).

**Products represented in this system**:
1. **joola.com storefront** — single e-commerce site covering both sports. This is the only "product" surface; there is no native app in the public domain.

---

## CONTENT FUNDAMENTALS

### Voice
Confident, athlete-led, performance-forward. Copy speaks to **the player who wants to win** — not the weekend beginner. Short, declarative. The product is the hero; the words point at it.

### Tone
- **Active, not descriptive** — "Energy Unlocked", "Order your Pro V", "Shop All", "Get free balls".
- **Direct imperative** — almost every CTA is a verb: *Shop*, *Explore*, *Order*, *Get*, *Add to Cart*.
- **Minimal**. Headlines are 1–3 words. Subheads are one short sentence. Never a paragraph where a phrase will do.

### Casing
- **Wordmark is always UPPERCASE**: `JOOLA` (never "Joola" in logo contexts, though "Joola" appears in prose).
- **Headlines**: Title Case *or* ALL CAPS display (`PRO PADDLE SERIES`, `NOW AVAILABLE`). Display copy is frequently caps.
- **Eyebrows / labels**: ALL CAPS with wide tracking (`NEW`, `SALE`, `NOW AVAILABLE`).
- **Body**: Sentence case.
- **Nav**: Title Case (`Pickleball Paddles`, `Table Tennis`).

### Person
- **You / your** — addressing the player directly ("Order your Pro V now", "your cart").
- **JOOLA** (not "we") when referring to the brand as a noun.

### Emoji
**Never**. No emoji anywhere in marketing, nav, or product copy. The brand is serious-performance.

### Vibe
Think **athletic equipment catalog crossed with performance automotive**. Hard-edged, high-contrast, product-first. Every page leads with a hero product shot or athlete in motion. Flash sales and new drops are announced in thin horizontal marquee bars above the nav.

### Example copy (observed on joola.com)
- **Hero**: "NOW AVAILABLE" / "Energy Unlocked" / "Order your Pro V now for free two-day shipping"
- **Marquee announcements**: "Get free balls with any full-price pro paddle", "Just dropped: New pickleball accessories"
- **Product label**: "JOOLA Perseus Pro V Pickleball Paddle — $299.95"
- **CTA**: "Shop Pro V", "Explore Pro V", "Add To Cart", "Quick View"
- **Section header**: "PRO PADDLE SERIES" with tabbed sub-nav (Pro V / Pro IV / 3S)
- **Status pill**: "NEW", "Out Of Stock"
- **Color names are named after athletes**: "Blaze Red (Ben Johns)", "Breeze Blue (Simone Jardim)", "Surge Green (Federico Staksrud)", "JOOLA Yellow (Anna Bright)", "Club Green (Collin Johns)".

---

## VISUAL FOUNDATIONS

### Color
The brand is fundamentally **black-and-white**. The wordmark is always black on white (or reversed: white on black). Color enters **only through product accents** — each signature paddle has its own color, and that color is used sparingly: an edge guard, a pill badge, a single rule-line. There are **no brand gradients**, no purples, no pastels.

**Core**
- Black `#000000` — wordmark, CTAs, heading text, borders.
- White `#FFFFFF` — backgrounds, inverse text.

**Paddle accents** (use one at a time, never as a palette):
- Blaze Red `#D9232B`, Breeze Blue `#2A5FAE`, Surge Green `#7CB342`, JOOLA Yellow `#F4C021`, Club Green `#1F5A3A`, Bolt Blue `#1E9BD7`, Royal Blue `#1F3A8A`, Seaside Green `#2FB8A8`.

**Neutrals**: a straight gray ramp (`--ink-100` → `--ink-900`) for text hierarchy and soft dividers.

### Type
- **Display**: `Archivo` (900 / 800). Best-match substitute for JOOLA's custom wordmark lettering — a bold industrial grotesque with tall x-height, slight condensation, razor-straight terminals. **Substitute — flag for real font**.
- **Body**: `Inter` (400 / 500 / 600 / 700). Best-match substitute for the Shopify Dawn-derived body font.
- **Mono**: system mono stack.

Display copy is **set TIGHT** (`letter-spacing: -0.02em`), **oversized** (hero headlines 72–128px), and often in **ALL CAPS**. Eyebrow/label text goes the other way: small, caps, wide tracking (`+0.12em`).

### Spacing
8-point base. Pages breathe vertically: section padding is usually `96–128px`; cards use `24–32px`. The grid is **edge-to-edge on mobile, 1280px max on desktop**, with heroes running **full-bleed**.

### Backgrounds
- **Product photography on pure white** (`#FFFFFF`) — catalog shots are spec-sheet clean, no drop shadows, paddles floating on stark white. This is the single most consistent visual pattern.
- **Lifestyle photography full-bleed** — athletes in motion on court, often warm-toned gym light (tungsten-ish, slightly desaturated), occasionally cool daylight. Imagery is **photographic, never illustrated**.
- **Video backgrounds** on the homepage hero (MP4 loops — paddle swinging, ball impact).
- No patterns, no textures, no gradients, no noise, no hand-drawn illustration.

### Animation
Minimal and **functional only**. Fades on image carousels, instant hover states on nav. No bounces, no parallax, no springy enters. Durations in the 120–200ms range, ease-out.

### Hover states
- **Links**: underline on hover (nav has no underline by default).
- **Buttons**: color inversion (black → white-on-black outlined, or vice versa) — **not** opacity changes.
- **Product tiles**: swap to secondary image on hover; price/title do not change state.
- **Images**: slight `scale(1.02)` in fixed aspect-ratio frames, no tilt.

### Press states
Brief color inversion or `scale(0.98)` on buttons. No color *opacity* tricks.

### Borders
- **Hairline `1px` solid black or `--ink-200`**. JOOLA uses borders instead of shadows to delineate — borders on form fields, card edges, dividers under section headers.
- Dividers are full-width, 1px, `--ink-200`.

### Shadow system
Very restrained. Product photography carries its own lighting; the UI is flat. Shadows are used only for **floating UI** (mini-cart, dropdowns) — soft, cool-gray, never colored.
- `--shadow-1` / `--shadow-2` / `--shadow-3` in `colors_and_type.css`.

### Protection gradients vs capsules
**Capsules win.** Overlaid copy on imagery sits inside a solid black or white capsule, or is anchored bottom-left in a black title bar. Protection gradients exist on the homepage video hero only.

### Layout rules
- **Sticky top header** (approx 64px) with marquee announcement bar above (approx 32px).
- **Mega-menu** on nav hover (4+ columns with thumbnail).
- **Sticky product gallery** on PDP (image left, buy column right on desktop).
- Footer: dark (black), dense, link-column layout.

### Transparency / blur
Used sparingly — only on the mini-cart overlay backdrop (`rgba(0,0,0,0.4)`) and the mobile nav sheet. No glassy panels, no frosted cards.

### Imagery color vibe
- Product catalog: **cool, clinical, high-key** — paddles on white, shadowless.
- Lifestyle: **warm court-light**, slightly contrasty, photo-real. Occasional black-and-white athlete portraits. **No grain, no filter, no duotone.**

### Corner radii
**Essentially zero.** Buttons and cards are sharp-edged. `--radius-1: 2px` is reserved for very subtle softening on buttons; `--radius-2: 4px` for image tiles. Badges (`NEW`, `Out Of Stock`) may be fully pill-shaped.

### Cards
- White background, 1px `--ink-200` border, no shadow (or the lightest `--shadow-1`).
- No rounding, or 2–4px max.
- Content inside: image → title → price → size/color swatches → CTA.
- Badge overlay top-left for `NEW` / `Out Of Stock`.

---

## ICONOGRAPHY

**JOOLA's icon approach is extremely restrained.** The storefront barely uses iconography — the visual weight comes from photography, type, and borders, not from glyphs.

**What's actually on the site**:
- **Search magnifier**, **cart (shopping bag)**, **hamburger menu**, **user account**, **caret/chevron** for dropdowns, **close (×)**, **plus/minus** for quantity steppers, **social icons** (Instagram, Facebook, YouTube, TikTok) in the footer.
- **No emoji**, anywhere.
- **No unicode glyphs as icons** (no ★, no ✓, no ✗ in copy — status is done with words like "Out Of Stock" or colored pills).
- **No custom icon font**. The Shopify theme uses inline SVG sprites.

**Our choice**: **Lucide Icons** via CDN — thin-to-medium `1.5px–2px` stroke, rounded line caps, open geometry. It's the closest public match to the Shopify Dawn sprite style and is what we use in the UI kit.

```html
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
<i data-lucide="search"></i>
```

**Flagged substitution**: Lucide is a stand-in; JOOLA's actual icons are a Shopify-theme custom SVG sprite we don't have access to. Ask the brand team for the sprite and swap `lucide.js` for it.

**Logo marks** (in `assets/logos/`):
- `joola-logo-primary.png` — black wordmark + trinity on white background (the lockup you see top-left of joola.com).
- `joola-lockup-white.svg` — white-on-transparent lockup for dark backgrounds (vector — use this whenever possible).

The **trinity** (the triangle with cutouts on the left of the lockup) is the only standalone brand mark. Use it as a favicon / app icon / bullet substitute. Never redraw it — use the SVG.

---

## Font substitution — ACTION REQUESTED

We are using **Google Fonts** substitutes because we don't have the brand's real webfont files:

| Role     | Used (substitute) | Likely real choice                         |
| -------- | ----------------- | ------------------------------------------ |
| Display  | Archivo 900/800   | A custom industrial grotesque / Neue Haas Grotesk Display / similar |
| Body     | Inter             | Shopify Dawn's default system stack / Roboto |
| Mono     | system mono       | — (unused on site)                         |

**Please send the real `.woff2` files** so we can drop them into `fonts/` and flip the `@font-face` block at the top of `colors_and_type.css`.
