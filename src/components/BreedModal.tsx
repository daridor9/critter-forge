import { useState } from 'react';
import type { Creature } from '../types';
import { breed } from '../data/breeding';
import { CreatureSVG } from './CreatureSVG';

interface Props {
  parent1: Creature;
  parent2: Creature;
  onPick: (c: Creature) => void;
  onClose: () => void;
}

export function BreedModal({ parent1, parent2, onPick, onClose }: Props) {
  const [variants] = useState(() => [breed(parent1, parent2), breed(parent1, parent2), breed(parent1, parent2)]);

  return (
    <div className="insight-overlay" onClick={onClose}>
      <div className="evolve-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Offspring 👨‍👩‍👧</h3>
        <p>
          <strong>{parent1.name}</strong> + <strong>{parent2.name}</strong> produced three children with a mix of traits.
          Pick one to adopt, or close to skip.
        </p>
        <div className="evolve-variants">
          {variants.map((v, i) => (
            <button key={i} className="evolve-card" type="button" onClick={() => onPick(v)}>
              <div className="evolve-thumb">
                <CreatureSVG creature={v} />
              </div>
              <div className="evolve-name">{v.name}</div>
            </button>
          ))}
        </div>
        <button className="btn btn-secondary" onClick={onClose} type="button">
          Close
        </button>
      </div>
    </div>
  );
}
