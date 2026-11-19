/**
 * Shared-element transitions: the same artwork carries one name across views, so the browser
 * morphs it from gallery card / map preview into the work page. CSS-only, progressive.
 */
export function artworkTransitionName(slug: string): string {
  return `work-${slug}`;
}
