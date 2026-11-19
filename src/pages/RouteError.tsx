import { isRouteErrorResponse, useRouteError } from 'react-router';
import './StatusPage.css';

/** Last line of defence: a calm page instead of a blank screen. */
export function RouteError() {
  const error = useRouteError();
  if (import.meta.env.DEV) console.error(error);

  // A failed lazy import almost always means a new deploy replaced the old chunks.
  const staleChunk = error instanceof TypeError && /dynamically imported module|Importing a module script/i.test(error.message);
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : staleChunk
      ? 'A newer version of the site is available.'
      : 'Something went wrong while drawing this page.';

  return (
    <div className="page status-page" role="alert">
      <p className="status-page__emoji" aria-hidden="true">
        🌀
      </p>
      <h1 className="display status-page__title">The dream broke</h1>
      <p className="lede">{message}</p>
      <div className="status-page__actions">
        <button className="button button--primary" onClick={() => window.location.reload()}>
          Reload
        </button>
        <a className="button" href="/">
          Back to the map
        </a>
      </div>
    </div>
  );
}
