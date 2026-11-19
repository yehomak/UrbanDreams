# Urban Dreams — design system

**Idea: the city is asleep and dreaming.** Everything is one warm night, lit by a single light source:
the orange of Warsaw's sodium street lamps. The map is the city seen from above at night (streets glowing
faintly), and the UI around it is warm, dark, printed-card surfaces on a curator's table.
Tactility comes from light and material (inner highlight, soft shadow, paper grain), not decoration.
The naive touch is limited to the hand-drawn display face and the emoji pins, which read as stickers.

Tokens live in [`src/styles/tokens.css`](../src/styles/tokens.css); primitives in [`src/styles/base.css`](../src/styles/base.css).
Components use **semantic tokens only**: never raw hex, never ad-hoc shadows.

## 1. Visual taxonomy

| Role | Treatment |
|---|---|
| **Work card** ("print") | Image in a matte (thin surface frame + top highlight). Below: title in display face, one mono metadata line. The image always dominates. |
| **Work page** ("museum label") | The full artwork, never cropped. Beside it, a label block: mono number · style, display title, curatorial text, facts table, actions. |
| **Tags & metadata** | Mono only: small, uppercase, tracked. `#15 · FUTURIST · 52.22925, 20.99851`. Filters are small "tickets" (`.chip`). |
| **Buttons** | `.button--primary`: solid lantern, dark ink, **max one per view**. `.button`: outline. `.button--ghost`: text only. |
| **Header** | Three columns: `MAP · WORKS` on the left, the **UD seal** in the centre (unfolds into "Urban Dreams" on hover), a live `WAW 18:53 DUSK` clock and `ABOUT` on the right. Same header on every screen size, with no dock. |
| **Navigation** | Mono uppercase labels; the active page gets a small glowing **lamp dot** underneath. |
| **Map pins** | Emoji stickers, each over a faint lamp glow like a lit window. Selected = full sodium halo. |

## 2. Colour

| Token | Value | Use |
|---|---|---|
| `--bg` | `#131215` | page: warm ink, a hint of plum |
| `--surface-1/2/3` | `#1a191d` / `#222126` / `#2d2b31` | cards, controls, raised |
| `--surface-glass` | 84% `--surface-1` + blur | floating panels over the map |
| `--text-1/2/3` | `#f0e8d9` / `#c4baa8` / `#938a79` | paper text: primary / secondary / tertiary. All ≥ 4.5:1 on `--surface-1` |
| `--accent` (sodium) | `#f2a65a` | the one light: primary action, selection, focus, links' underline. Ink on top: `--accent-ink` |
| `--river` | `#1f2a33` | the single cool counterpoint: the Vistula on the map |

Harmony rule: **one hue family (warm) + one light source (sodium) + one cool exception (water).**

States: hover = one step lighter (`--accent-hover`, or +6% white on outline); active = `--accent-press` plus a 1px press;
disabled = 40% opacity with `cursor: not-allowed`. No gradients on interactive elements.

## 3. Typography

| Role | Face | Size |
|---|---|---|
| Display XL / L / M / S | Retro Cookies | `--fs-display-*` (fluid, 360 → 1440px) |
| Lede, body, buttons | **Fraunces** (variable, `SOFT 100`, optical sizing) | `--fs-lede` 1.55 · 16px 1.6 |
| Nav, meta, counters, coordinates, chips | **DM Mono** 400/500 | 11–12px, uppercase, `--tracking-mono` |

**Why these three:** Retro Cookies is a 70s groovy display face. Fraunces is a "wonky soft serif"
drawn after 70s typefaces like Windsor, Cooper and Souvenir, so the two share an era and a softness.
With the SOFT axis at 100 its terminals round off to rhyme with Cookies. DM Mono is a low-contrast mono
with soft curves that doesn't fight either. The display face is for titles only; mono is for data, never prose.

## 4. Shape & depth

- Radii: `--r-xs` 6 (focus, tags) · `--r-s` 12 (controls) · `--r-m` 20 (cards) · `--r-l` 28 (panels) · `--r-pill`.
- Borders: 1px `--line` (resting) / `--line-strong` (raised, hover).
- Elevation: `--elev-1` (resting card), `--elev-2` (hovered card, menus), `--elev-3` (floating panels).
  Each includes `--highlight`, a 1px inner top light that makes surfaces read as thick paper.

## 5. Motion

- Durations: `--dur-1` 140ms (state), `--dur-2` 240ms (hover/route), `--dur-3` 420ms (open/close), `--dur-slow` 700ms (image fade).
- One easing for entrances: `--ease-out`. `--ease-in-out` for loops only (pins breathing, wordmark).
- Animate only `transform` and `opacity` (plus colour/shadow on hover).
- Everything collapses under `prefers-reduced-motion` (global rule in `base.css`).

## Accessibility & touch

- Touch targets ≥ `--tap` (44px). Focus is a 2px sodium ring (`--focus-ring`) with a background-coloured gap.
- No horizontal overflow at 320px (asserted in e2e).

## Map

**Violet Dusk** ([`mapStyles.ts`](../src/components/map/mapStyles.ts)), chosen from five candidates in a temporary
style lab: a MapLibre style over OpenFreeMap vector tiles. Deep violet land, an ink-dark Vistula,
violet-grey minor streets, pink-neon major streets over a soft blurred glow, peach motorways, spaced lavender district
names. Over it drifts a thin night mist (the cloud canvas with `mix-blend-mode: screen`).
