import type { CSSProperties } from 'react';

/**
 * The hand-drawn "Urban Dreams" title. Each letter floats on its own phase —
 * pure CSS, paused for people who prefer reduced motion.
 */
export function Wordmark({ text, as: Tag = 'span' }: { text: string; as?: 'span' | 'h1' }) {
  return (
    <Tag className="wordmark" aria-label={text}>
      {Array.from(text).map((char, i) => (
        <span key={i} aria-hidden="true" className="wordmark__letter" style={{ '--i': i } as CSSProperties}>
          {char === ' ' ? ' ' : char}
        </span>
      ))}
    </Tag>
  );
}
