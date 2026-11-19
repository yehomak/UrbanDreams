/**
 * "UD" in a round seal. On hover/focus (pointer devices) it unfolds into the full name.
 * The full name is always the accessible label (set on the parent link).
 */
export function Monogram() {
  return (
    <span className="monogram" aria-hidden="true">
      <span className="monogram__seal">
        <span className="monogram__initials">UD</span>
      </span>
      <span className="monogram__name">
        <span>Urban Dreams</span>
      </span>
    </span>
  );
}
