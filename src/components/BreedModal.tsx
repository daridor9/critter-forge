import { useState } from 'react';
import type { Creature } from '../types';
import { breed } from '../data/breeding';
import type { BreedResult } from '../data/breeding';
import { CreatureSVG } from './CreatureSVG';

interface Props {
  parent1: Creature;
  parent2: Creature;
  onPick: (c: Creature) => void;
  onClose: () => void;
}

export function BreedModal({ parent1, parent2, onPick, onClose }: Props) {
  const [variants] = useState<BreedResult[]>(() => [breed(parent1, parent2), breed(parent1, parent2), breed(parent1, parent2)]);

  return (
    <div className="insight-overlay" onClick={onClose}>
      <div className="evolve-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Offspring 👨‍👩‍👧</h3>
        <p>
          <strong>{parent1.name}</strong> + <strong>{parent2.name}</strong> produced three children with a mix of traits.
          Each card shows what was inherited or mutated.
        </p>
        <div className="evolve-variants">
          {variants.map((v, i) => (
            <button key={i} className="evolve-card" type="button" onClick={() => onPick(v.creature)}>
              <div className="evolve-thumb">
                <CreatureSVG creature={v.creature} />
              </div>
              <div className="evolve-name">{v.creature.name}</div>
              <ul className="evolve-changes">
                {v.notes.length > 0
                  ? v.notes.map((n, j) => <li key={j}>{n}</li>)
                  : <li className="evolve-change-none">(traits identical to both parents)</li>}
              </ul>
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
