import { MAP_PALETTES, type MapStyleId } from './mapStyles.ts';
import './MapStyleLab.css';

const STORAGE_KEY = 'ud:map-style';

export function readStoredStyle(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function storeStyle(id: MapStyleId) {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* private mode: the choice just won't persist */
  }
}

/**
 * TEMPORARY style switcher used to pick the final map look by eye.
 * Remove together with the unused palettes in mapStyles.ts once a style is chosen.
 */
export function MapStyleLab({ value, onChange }: { value: string; onChange: (id: MapStyleId) => void }) {
  return (
    <div className="style-lab" role="radiogroup" aria-label="Map style (temporary)" data-testid="style-lab">
      <span className="meta style-lab__label">Map style</span>
      {MAP_PALETTES.map((p) => (
        <button
          key={p.id}
          type="button"
          role="radio"
          aria-checked={p.id === value}
          className="style-lab__option"
          title={p.name}
          onClick={(e) => {
            e.stopPropagation();
            onChange(p.id);
          }}
        >
          <span
            className="style-lab__swatch"
            style={{ background: `linear-gradient(135deg, ${p.land} 0 48%, ${p.water} 48% 62%, ${p.major} 62%)` }}
            aria-hidden="true"
          />
          <span className="style-lab__name">{p.name}</span>
        </button>
      ))}
    </div>
  );
}
