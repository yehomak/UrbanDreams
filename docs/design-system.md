# Urban Dreams — design system

**Idea: the city is asleep and the map is its dream.** The map is the only bright, paper-like surface.
Everything around it is a quiet night: warm, dark, printed-card surfaces on a curator's table.
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
| **Navigation** | Segmented pill: in the header on desktop, a floating dock on phones. |
| **Map pins** | Emoji stickers. Selected = lantern halo. |

## 2. Colour

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0e1217` | page |
| `--surface-1/2/3` | `#151b22` / `#1c242d` / `#26303b` | cards, controls, raised |
| `--surface-glass` | 86% `--surface-1` + blur | floating panels over the map |
| `--text-1/2/3` | `#ece6da` / `#b9b3a7` / `#8f897f` | primary / secondary / tertiary. All ≥ 4.5:1 on `--surface-1` |
| `--accent` (lantern) | `#f0b87a` | primary action, selected state. Ink on top: `--accent-ink` |
| `--mist` | `#93bde3` | links, focus ring, info |

States: hover = one step lighter (`--accent-hover`, or +6% white on outline); active = `--accent-press` plus a 1px press;
disabled = 40% opacity with `cursor: not-allowed`. No gradients on interactive elements.

## 3. Typography

| Role | Face | Size |
|---|---|---|
| Display XL / L / M / S | Retro Cookies | `--fs-display-*` (fluid, 360 → 1440px) |
| Lede | Outfit | `--fs-lede`, 1.55 |
| Body | Outfit | 16px, 1.65 |
| Meta / eyebrow / counters / coordinates | **Geist Mono** | 11–12px, uppercase, `--tracking-mono` |

The display face is for titles only, never for UI labels or body copy. Mono is for data, never for prose.

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

- Touch targets ≥ `--tap` (44px). Focus is a 2px mist ring (`--focus-ring`) with a background-coloured gap.
- No horizontal overflow at 320px (asserted in e2e).
