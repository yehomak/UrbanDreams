# Urban Dreams — design system

**Idea: the city is asleep and dreaming.** Everything happens at violet dusk: the map is Warsaw seen from
above with neon-pink streets, the UI is violet-ink printed cards around it, and clouds are the connective
tissue. They drift over the map, and a few keep the white rabbit company while the next dream loads.
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
| **Header** | No bar: title and nav float over the page on a soft violet scrim that fades to transparent, so the map and clouds reach the top edge. One switch on the left (**Gallery** on the map, **Map** elsewhere), **"Urban Dreams"** in big floating Retro Cookies letters in the centre (stacked on narrow phones), `ABOUT` on the right. Size from one `--header-scale` knob (1.3). |
| **Navigation** | Mono uppercase labels; the active page gets a small glowing **lamp dot** underneath. |
| **Map preview** | Minimal: one raised card with the artwork and "#17 Tea Break", sized from the artwork's aspect; the whole card opens the work. Close by clicking the map or Escape. |
| **Map pins** | Emoji stickers, each over a faint lamp glow like a lit window. Selected = full neon halo. |

## 2. Colour

| Token | Value | Use |
|---|---|---|
| `--bg` / `--ink-rgb` | `rgb(23 18 42)` | page: violet ink, a shade darker than the map so panels float above it |
| `--surface-1/2/3` | `#1e1834` / `#261f40` / `#30284d` | cards, controls, raised |
| `--surface-glass` | 84% `--surface-1` + blur | floating panels over the map |
| `--text-1/2/3` | lavender paper `rgb(239 232 247)` / `#c3b8d6` / `#9488ab` | all ≥ 4.5:1 on `--surface-1` |
| `--accent` / `--accent-rgb` | neon pink `rgb(255 159 187)` | = the map's major streets. Primary action, selection, focus, lamp dots |
| `--peach` | `#ffcea0` | = the map's motorways. Numbers and counters in metadata |
| `--river` | `#17162e` | the Vistula |

Harmony rule: **UI colours are taken from the map.** Translucent colours use the `*-rgb` channel tokens, so a
palette change is a single edit in `tokens.css`.

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
names. Over it drift the original Urban Dreams clouds (see "One sky").

## Sky and loading

**The map's sky** ([`Sky`](../src/components/Sky.tsx)) is one full-screen canvas over the city, behind the header
and panels: 45 big white clouds at 35% covering ~60–70% of the screen, evenly spaced, drifting slowly. It is
**anchored to the map** (`bindSkyToMap`): clouds pan with the ground and spread with zoom (growing a little slower,
like they float above), the sky tiles endlessly and thins when zoomed out. It only exists on the map: it gathers
once the map has opened (each cloud at its own pace) and clears on other pages.

**Loading** ([`CloudCurtain`](../src/components/curtain/CloudCurtain.tsx)) is the plain dusk backdrop, the original
white running rabbit and four little clouds drifting around it. No text. It shows while anything holds it
(first boot, the map until drawn or max 6s, slow routes) via `useCurtainHold`, never for loads under 120ms, and
for at least 600ms once shown.
