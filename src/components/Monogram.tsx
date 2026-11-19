import type { CSSProperties } from 'react';

/** The letters in the header. One constant, so it's a one-line change. */
export const MONOGRAM = 'UB';

/**
 * Big cloud letters in the display face. Each letter floats on its own phase,
 * like the original Urban Dreams title. Purely decorative: the link carries the name.
 */
export function Monogram() {
  return (
    <span className="monogram" aria-hidden="true">
      {Array.from(MONOGRAM).map((char, i) => (
        <span key={i} className="monogram__letter" style={{ '--i': i } as CSSProperties}>
          {char}
        </span>
      ))}
    </span>
  );
}
