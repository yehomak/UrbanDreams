/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional XYZ tile template, e.g. https://tile.example.com/{z}/{x}/{y}.png */
  readonly VITE_TILE_URL?: string;
  /** HTML attribution for VITE_TILE_URL. Required by most providers' terms. */
  readonly VITE_TILE_ATTRIBUTION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
