# Urban Dreams — Telergram Mini App

Frontend App for NFT collection. Explore Warsaw locations on an interactive map and browse the full collection — all inside [Telegram](https://t.me/UrbanDreamsBot/.Explorer).

<div>
<img src="./public/demo.jpg" alt="Map View" width="220" />
<img src="./public/demo2.jpg" alt="Collection" width="220" />
<img src="./public/demo3.jpg" alt="Treasury" width="220" />
</div>

---

## What It Does

- **City Map** — Every minted NFT is a pin on a live Warsaw map. Tap a pin, see the artwork, open it on-chain or get directions to the real location.
- **Gallery** — Browse all items with metadata and attributes.
- **Treasury** — Live view of the royalty splitter contract balance, epoch snapshots, and claim history.
- **Vision & FAQ** — Project concept, roadmap, and collector guide.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 6 + SWC |
| Routing | React Router v6 |
| Map | Leaflet + react-map-gl (MapLibre) |
| Blockchain | `@ton/ton`, `@ton/core`, `@ton/crypto` |
| Wallet | TonConnect UI React |
| Telegram | `@telegram-apps/sdk-react`, `@twa-dev/sdk` |
| UI | `@telegram-apps/telegram-ui`, Framer Motion |
| Styling | Emotion + CSS modules |

---

## Project Structure

```
src/
├── pages/
│   ├── IndexPage/          # City map (main view)
│   ├── ItemsPage.tsx       # Full collection grid
│   ├── TreasuryPage.tsx    # On-chain treasury & epochs
│   ├── VisionPage.tsx      # Project concept & roadmap
│   └── FaqPage.tsx         # FAQ
│
├── components/
│   ├── LeafletMap.tsx      # Map with animated cloud overlay
│   ├── GetGemsButton.tsx   # Direct link to NFT on GetGems
│   ├── GoogleMapsButton.tsx# Directions to real location
│   ├── ExpandableMenu.tsx  # Share / on-chain / map actions
│   ├── UrbanLayout.tsx     # App shell & navigation
│   └── RunningRabbitLoading.tsx  # Loading state
│
├── constants/
│   └── collection.ts       # NFT metadata & coordinates
│
├── hooks/                  # TON contract hooks
├── wrappers/               # Contract wrappers
├── context/                # TonConnect + app state
└── appConfig.ts            # Collection address, network config
```

---

## Key Feature: The Map

The map is built on Leaflet with a CartoDB light tile layer bounded to Warsaw coordinates. Each NFT renders as an emoji marker that scales with zoom level. Tapping a marker flies the map to that location and opens a popup with the artwork image.

Tapping the image opens a full modal with:
- NFT attributes table
- **GetGems** button to view or buy
- **Expandable menu** — directions, share, view on TonScan

A canvas-based animated cloud layer drifts across the map using a seeded PRNG for deterministic cloud positions across sessions.

---

## Getting Started

```bash
# Install
yarn

# Dev (standard)
yarn dev

# Dev with HTTPS (required for Telegram Mini App testing)
yarn dev:https

# Build
yarn build

# Deploy to GitHub Pages
yarn deploy
```

### Local HTTPS

The app detects `tma.internal.pem` and `tma.internal-key.pem` in the root. If present, it uses them for the local HTTPS server. If not, it falls back to `@vitejs/plugin-basic-ssl`.

To generate local certs (requires mkcert installed):
```bash
mkcert tma.internal
```

Add `tma.internal` to your `/etc/hosts`:
```
127.0.0.1 tma.internal
```

Then run `yarn dev:https` and open `https://tma.internal:5173` in Telegram Desktop.

---

## Environment

No `.env` required for local dev. Collection address and network config live in `src/appConfig.ts`.

```typescript
// src/appConfig.ts
export const COLLECTION_ADDRESS = 'EQCRgkSHG74IJlQthGSc1L6-5-vCBh9gqzF6--eE5trapWsm'
export const TREASURY_ADDRESS   = 'EQAVTTNZ0OmGZVSY4mv0kRffne-ViaeX8RJ-i-RD1Ppt8PkU'
export const NETWORK = 'mainnet'
```

---

## TON Integration

Wallet connection is handled by TonConnect. Contract interactions use `@ton/ton` with custom wrappers in `src/wrappers/` for the royalty splitter contract.

The treasury page reads epoch data and claimed amounts directly from the contract — no backend, fully on-chain.

---

## Deployment

The app is deployed as a static site on **Vercel**.

---

## Collection

23 NFTs on TON Mainnet. Each item is a Warsaw coordinate fused with a public-domain painting via style transfer — image, GIF, and full on-chain metadata.

`EQCRgkSHG74IJlQthGSc1L6-5-vCBh9gqzF6--eE5trapWsm`