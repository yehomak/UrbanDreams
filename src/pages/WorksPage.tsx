import { useMemo, useState, type CSSProperties } from 'react';
import { Link, useSearchParams } from 'react-router';
import { districtName, workNumber, works, type Work } from '@/content/works.ts';
import { WorkImage } from '@/components/WorkImage.tsx';
import { useDocumentTitle } from '@/lib/useDocumentTitle.ts';
import './WorksPage.css';

function WorkCard({ work, index }: { work: Work; index: number }) {
  // Posters keep the grid light; the animated original plays on hover / focus.
  const [live, setLive] = useState(false);
  return (
    <li className="work-card rise" style={{ '--d': Math.min(index, 12) } as CSSProperties}>
      <Link
        to={`/works/${work.slug}`}
        className="work-card__link"
        data-testid="work-card"
        viewTransition
        onPointerEnter={(e) => e.pointerType === 'mouse' && setLive(true)}
        onPointerLeave={() => setLive(false)}
        onFocus={() => setLive(true)}
        onBlur={() => setLive(false)}
      >
        <div className="work-card__media">
          <WorkImage work={work} variant="poster" />
          {live && work.media.animated && <WorkImage work={work} variant="full" className="work-card__live" />}
        </div>
        <div className="work-card__caption">
          <h2 className="work-card__title display">{work.title}</h2>
          <p className="work-card__meta">
            <span>{workNumber(work)}</span>
            <span>{work.style}</span>
            <span>{districtName(work.location.district)}</span>
          </p>
        </div>
      </Link>
    </li>
  );
}

export function WorksPage() {
  useDocumentTitle('Works');
  const [params, setParams] = useSearchParams();
  const rawStyle = params.get('style');

  const styles = useMemo(() => {
    const counts = new Map<string, number>();
    for (const w of works) counts.set(w.style, (counts.get(w.style) ?? 0) + 1);
    return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, []);

  // Unknown ?style= falls back to "All" instead of an empty page
  const style = styles.some(([name]) => name === rawStyle) ? rawStyle : null;
  const visible = style ? works.filter((w) => w.style === style) : works;

  return (
    <div className="page works-page">
      <header className="works-page__head">
        <p className="eyebrow">The collection</p>
        <h1 className="display works-page__title">Works</h1>
        <p className="lede">
          {works.length} streets of Warsaw, each re-painted by a neural network in the manner of an art movement.
        </p>
      </header>

      <div className="filters" role="group" aria-label="Filter by painting style">
        <button className="chip filter" aria-pressed={!style} onClick={() => setParams({}, { replace: true })}>
          All <span className="filter__count">{works.length}</span>
        </button>
        {styles.map(([name, count]) => (
          <button
            key={name}
            className="chip filter"
            aria-pressed={style === name}
            onClick={() => setParams(style === name ? {} : { style: name }, { replace: true })}
          >
            {name} <span className="filter__count">{count}</span>
          </button>
        ))}
      </div>

      <ul className="works-grid" key={style ?? 'all'}>
        {visible.map((work, i) => (
          <WorkCard key={work.slug} work={work} index={i} />
        ))}
      </ul>
    </div>
  );
}
