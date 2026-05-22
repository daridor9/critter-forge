import { useState } from 'react';
import type { Creature } from '../types';
import { breed } from '../data/breeding';
import type { BreedResult } from '../data/breeding';
import { CreatureSVG } from './CreatureSVG';
import { arenaFitFor, fitEmoji } from '../data/arenaFit';
import type { ArenaId } from '../data/arenaFit';

interface Props {
  parent1: Creature;
  parent2: Creature;
  onPick: (result: BreedResult) => void;
  onClose: () => void;
}

const ARENAS: { id: ArenaId; label: string }[] = [
  { id: 'chase', label: 'Chase' },
  { id: 'hunt', label: 'Hunt' },
  { id: 'climb', label: 'Climb' },
  { id: 'drought', label: 'Drought' },
  { id: 'deep', label: 'Deep' },
  { id: 'maze', label: 'Maze' },
];

const SOURCE_LABELS = {
  blend: 'blend',
  parent1: 'parent A',
  parent2: 'parent B',
  mutation: 'surprise',
};

function bestArenaLine(creature: Creature): string {
  const fits = ARENAS
    .map((arena) => ({ ...arena, fit: arenaFitFor(arena.id, creature) }))
    .filter((arena) => arena.fit.fit !== 'tough')
    .slice(0, 3);
  if (fits.length === 0) return 'Needs testing: no obvious safe arena.';
  return fits.map((arena) => `${fitEmoji(arena.fit.fit)} ${arena.label}`).join(' · ');
}

export function BreedModal({ parent1, parent2, onPick, onClose }: Props) {
  const [variants] = useState<BreedResult[]>(() => [breed(parent1, parent2), breed(parent1, parent2), breed(parent1, parent2)]);

  return (
    <div className="insight-overlay" onClick={onClose}>
      <div className="evolve-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Offspring 👨‍👩‍👧</h3>
        <p>
          <strong>{parent1.name}</strong> + <strong>{parent2.name}</strong> produced three children with a mix of traits.
          Compare their genes, mutation surprises, and best arenas before choosing the next family branch.
        </p>
        <div className="breed-parent-key" aria-label="Parent key">
          <span className="breed-source parent1">A</span> {parent1.name}
          <span className="breed-source parent2">B</span> {parent2.name}
          <span className="breed-source mutation">!</span> mutation
        </div>
        <div className="evolve-variants">
          {variants.map((v, i) => (
            <button key={i} className="evolve-card breed-card" type="button" onClick={() => onPick(v)}>
              <div className="evolve-thumb">
                <CreatureSVG creature={v.creature} />
              </div>
              <div className="evolve-name">{v.creature.name}</div>
              <div className="breed-role">
                {v.mutationCount > 0 ? `${v.mutationCount} surprise mutation${v.mutationCount === 1 ? '' : 's'}` : 'steady inheritance'}
              </div>
              <div className="breed-arena-line">{bestArenaLine(v.creature)}</div>
              <div className="breed-genes">
                {v.genes.slice(0, 8).map((gene) => (
                  <span
                    key={`${gene.label}-${gene.value}-${gene.source}`}
                    className={`breed-gene gene-${gene.source}`}
                    title={gene.sourceName ? `${gene.label} came from ${gene.sourceName}` : SOURCE_LABELS[gene.source]}
                  >
                    <span className={`breed-source ${gene.source}`}>{gene.source === 'parent1' ? 'A' : gene.source === 'parent2' ? 'B' : gene.source === 'mutation' ? '!' : '×'}</span>
                    {gene.label}: {gene.value}
                  </span>
                ))}
              </div>
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
