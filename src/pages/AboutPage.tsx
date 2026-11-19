import type { CSSProperties } from 'react';
import { Link } from 'react-router';
import { collection, workNumber, works } from '@/content/works.ts';
import { WorkImage } from '@/components/WorkImage.tsx';
import { useDocumentTitle } from '@/lib/useDocumentTitle.ts';
import './AboutPage.css';

const STEPS = [
  {
    title: 'Walk & photograph',
    text: 'It starts on foot: a courtyard in Wola, a crossing in Śródmieście, a tree in front of an abandoned building in Służew. Ordinary places, shot on a phone.',
  },
  {
    title: 'Pair with a painting',
    text: 'Each photo is matched with a painting tradition whose mood it already carries: Ukiyo-e, Cubism, Symbolism, Futurism, Vaporwave and more.',
  },
  {
    title: 'Neural style transfer',
    text: 'A style-transfer model re-renders the photograph in that painting’s brushwork and palette, keeping the geometry of the street intact. The frames are animated into a looping dream.',
  },
  {
    title: 'Pin it back to the street',
    text: 'Every work goes back on the map at the exact coordinates where it was taken, so you can stand in the same spot and compare.',
  },
];

export function AboutPage() {
  useDocumentTitle('About');
  const styles = [...new Set(works.map((w) => w.style))];
  const featured = works.find((w) => w.slug === 'grinning-relic') ?? works[0]!;

  return (
    <div className="page about">
      <section className="about__hero">
        <div>
          <p className="eyebrow">About the project</p>
          <h1 className="display display--xl about__title">{collection.tagline}</h1>
          <p className="lede">{collection.description}</p>
          <div className="about__cta">
            <Link className="button button--primary" to="/" viewTransition>
              Open the map
            </Link>
            <Link className="button" to="/works" viewTransition>
              Open the gallery
            </Link>
          </div>
        </div>
        <Link to={`/works/${featured.slug}`} className="about__featured" aria-label={`Open ${featured.title}`} viewTransition>
          <WorkImage work={featured} variant="full" posterUnderlay />
          <span className="meta about__featured-caption">
            <span className="meta__accent">{workNumber(featured)}</span>
            <span>{featured.title}</span>
          </span>
        </Link>
      </section>

      <section className="about__section" aria-labelledby="process">
        <h2 id="process" className="display display--l about__h2">
          How a dream is made
        </h2>
        <ol className="steps">
          {STEPS.map((step, i) => (
            <li key={step.title} className="step surface rise" style={{ '--d': i } as CSSProperties}>
              <span className="meta step__n">Step {String(i + 1).padStart(2, '0')}</span>
              <h3 className="display display--s step__title">{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
        <p className="about__note">
          The model runs offline on the artist’s machine. This site shows the finished works: no images are generated in
          your browser and nothing is uploaded.
        </p>
      </section>

      <section className="about__section" aria-labelledby="styles">
        <h2 id="styles" className="display display--l about__h2">
          {styles.length} ways of seeing
        </h2>
        <ul className="style-cloud">
          {styles.map((s) => (
            <li key={s}>
              <Link className="chip" to={`/works?style=${encodeURIComponent(s)}`}>
                {s}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="about__section" aria-labelledby="links">
        <h2 id="links" className="display display--l about__h2">
          Elsewhere
        </h2>
        <ul className="about__links">
          {collection.links.map((l) => (
            <li key={l.href}>
              <a className="link" href={l.href} target="_blank" rel="noreferrer">
                {l.label} ↗
              </a>
            </li>
          ))}
          <li>
            <a className="link" href="/catalog.json">
              Open data: catalog.json
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
