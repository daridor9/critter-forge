import { ANIMAL_DEX, closestAnimal } from '../data/animalDex';
import type { Creature } from '../types';
import { CreatureSVG } from './CreatureSVG';

interface Props {
  current: Creature;
  onLoad: (c: Creature) => void;
  onClose: () => void;
}

export function DexModal({ current, onLoad, onClose }: Props) {
  const match = closestAnimal(current);
  return (
    <div className="insight-overlay" onClick={onClose}>
      <div className="dex-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dex-head">
          <h2>📖 Animal Dex</h2>
          <button className="about-close" type="button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="dex-match">
          <span className="dex-match-label">Your creature is most like</span>
          <strong>{match.emoji} {match.name}</strong>
        </div>
        <div className="dex-grid">
          {ANIMAL_DEX.map((a) => (
            <div key={a.name} className="dex-card">
              <div className="dex-thumb">
                <CreatureSVG creature={a.creature} />
              </div>
              <div className="dex-card-name">{a.emoji} {a.name}</div>
              <div className="dex-card-fact">{a.fact}</div>
              <button className="btn dex-load" type="button" onClick={() => onLoad(a.creature)}>
                Load this animal
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
