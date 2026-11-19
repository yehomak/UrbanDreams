/**
 * True for a bare key press meant for the page: no modifiers (Alt+← is "Back" in most browsers),
 * not auto-repeat, not already handled, and not typed into a form field.
 */
export function isPlainKey(e: KeyboardEvent): boolean {
  if (e.altKey || e.metaKey || e.ctrlKey || e.shiftKey || e.repeat || e.defaultPrevented) return false;
  const t = e.target;
  return !(t instanceof HTMLElement && (t.isContentEditable || t.closest('input, textarea, select')));
}
