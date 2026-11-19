import type { CSSProperties } from 'react';

const WORDS = ['Urban', 'Dreams'];

/**
 * "Urban Dreams" in big cloud letters. Each letter floats on its own phase, like the original title.
 * On narrow phones the two words stack. Decorative: the parent link carries the accessible name.
 */
export function Wordmark() {
  let i = 0;
  return (
    <span className="wordmark" aria-hidden="true">
      {WORDS.map((word) => (
        <span key={word} className="wordmark__word">
          {Array.from(word).map((char) => (
            <span key={i} className="wordmark__letter" style={{ '--i': i++ } as CSSProperties}>
              {char}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}
