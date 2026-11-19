import { Link } from 'react-router';
import { useDocumentTitle } from '@/lib/useDocumentTitle.ts';
import './StatusPage.css';

export function NotFoundPage() {
  useDocumentTitle('Not found');
  return (
    <div className="page status-page" data-testid="not-found">
      <p className="status-page__emoji" aria-hidden="true">
        ☁️
      </p>
      <h1 className="display status-page__title">Lost in the clouds</h1>
      <p className="lede">This street hasn’t dreamed anything yet.</p>
      <div className="status-page__actions">
        <Link className="button button--primary" to="/">
          Back to the map
        </Link>
        <Link className="button" to="/works">
          Browse works
        </Link>
      </div>
    </div>
  );
}
