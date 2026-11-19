import { useEffect } from 'react';

const SITE = 'Urban Dreams';

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE}` : `${SITE} — Warsaw, as it dreams of itself`;
  }, [title]);
}
