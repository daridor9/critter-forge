import { useState } from 'react';
import type { Creature, Tier, Hybrid } from '../types';
import { isHybridValid } from '../physics';
import { hybridCatalog } from '../data/hybrids';
import { CreatureSVG } from './CreatureSVG';

interface Props {
  parent: Creature;
  onPick: (c: Creature) => void;
  onClose: () => void;
}

function clampTier(t: number): Tier {
  return Math.max(0, Math.min(2, Math.round(t))) as Tier;
}

const NAME_PREFIXES = ['Swift', 'Stout', 'Sleek', 'Bright', 'Bold', 'Tiny', 'Mighty', 'Sly'];

function mutateName(parent: string): string {
  const prefix = NAME_PREFIXES[Math.floor(Math.random() * NAME_PREFIXES.length)];
  return `${prefix} ${parent}`;
}

function tweakHybrids(c: Creature): Hybrid[] {
  const all = hybridCatalog.map((h) => h.id);
  const has = new Set(c.hybrids);
  const candidates = all.filter((h) => !has.has(h) && isHybridValid(h, c).valid);
  if (c.hybrids.length === 2 && Math.random() < 0.5) {
    return c.hybrids.filter((_, i) => i !== Math.floor(Math.random() * c.hybrids.length));
  }
  if (candidates.length > 0 && c.hybrids.length < 2) {
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    return [...c.hybrids, pick];
  }
  return c.hybrids;
}

function mutate(parent: Creature): Creature {
  const mutators: ((c: Creature) => Creature)[] = [
    (c) => ({ ...c, sizeUnit: Math.max(0, Math.min(100, c.sizeUnit + (Math.random() < 0.5 ? -8 : 8))) }),
    (c) => ({ ...c, legTier: clampTier(c.legTier + (Math.random() < 0.5 ? -1 : 1)) }),
    (c) => ({ ...c, brainTier: clampTier(c.brainTier + (Math.random() < 0.5 ? -1 : 1)) }),
    (c) => ({ ...c, defenseTier: clampTier(c.defenseTier + (Math.random() < 0.5 ? -1 : 1)) }),
    (c) => ({ ...c, sensorTier: clampTier(c.sensorTier + (Math.random() < 0.5 ? -1 : 1)) }),
    (c) => ({ ...c, hybrids: tweakHybrids(c) }),
    (c) => ({ ...c, warmBlooded: !c.warmBlooded }),
  ];
  let child = { ...parent };
  const numMutations = Math.random() < 0.7 ? 1 : 2;
  for (let i = 0; i < numMutations; i++) {
    const m = mutators[Math.floor(Math.random() * mutators.length)];
    child = m(child);
  }
  child = { ...child, hybrids: child.hybrids.filter((h) => isHybridValid(h, child).valid) };
  child.name = mutateName(parent.name);
  return child;
}

export function EvolveModal({ parent, onPick, onClose }: Props) {
  const [variants] = useState(() => [mutate(parent), mutate(parent), mutate(parent)]);

  return (
    <div className="insight-overlay" onClick={onClose}>
      <div className="evolve-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Next generation 🥚</h3>
        <p>Your winning creature spawned three offspring with small mutations. Pick one to evolve into — or keep your current design.</p>
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
          Keep current
        </button>
      </div>
    </div>
  );
}
