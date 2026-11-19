/** A whisper of film grain over everything. One inline SVG, no image request. */
export function Grain() {
  return (
    <svg className="grain" aria-hidden="true">
      <filter id="grain-noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain-noise)" />
    </svg>
  );
}
