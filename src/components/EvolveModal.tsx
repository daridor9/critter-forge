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

const TIER_NAMES_LEG = ['stubby', 'standard', 'runner'];
const TIER_NAMES_BRAIN = ['tiny', 'standard', 'big'];
const TIER_NAMES_DEFENSE = ['none', 'fur/scales', 'armor'];
const TIER_NAMES_SENSORS = ['simple', 'sharp', 'sonar'];

function describeTierChange(label: string, names: readonly string[], from: Tier, to: Tier): string | null {
  if (from === to) return null;
  const arrow = to > from ? '↑' : '↓';
  return `${label} ${names[from]} → ${names[to]} ${arrow}`;
}

interface Mutation {
  creature: Creature;
  changes: string[];
}

function mutate(parent: Creature): Mutation {
  const changes: string[] = [];
  let child = { ...parent };
  const numMutations = Math.random() < 0.7 ? 1 : 2;

  const mutators: ((c: Creature) => { creature: Creature; change: string | null })[] = [
    (c) => {
      const dir = Math.random() < 0.5 ? -1 : 1;
      const next = Math.max(0, Math.min(100, c.sizeUnit + dir * 8));
      if (next === c.sizeUnit) return { creature: c, change: null };
      return { creature: { ...c, sizeUnit: next }, change: `Size ${dir > 0 ? 'grew' : 'shrank'} (+${Math.abs(next - c.sizeUnit)})` };
    },
    (c) => {
      const dir = Math.random() < 0.5 ? -1 : 1;
      const next = clampTier(c.legTier + dir);
      if (next === c.legTier) return { creature: c, change: null };
      return { creature: { ...c, legTier: next }, change: describeTierChange('Legs', TIER_NAMES_LEG, c.legTier, next) };
    },
    (c) => {
      const dir = Math.random() < 0.5 ? -1 : 1;
      const next = clampTier(c.brainTier + dir);
      if (next === c.brainTier) return { creature: c, change: null };
      return { creature: { ...c, brainTier: next }, change: describeTierChange('Brain', TIER_NAMES_BRAIN, c.brainTier, next) };
    },
    (c) => {
      const dir = Math.random() < 0.5 ? -1 : 1;
      const next = clampTier(c.defenseTier + dir);
      if (next === c.defenseTier) return { creature: c, change: null };
      return { creature: { ...c, defenseTier: next }, change: describeTierChange('Defense', TIER_NAMES_DEFENSE, c.defenseTier, next) };
    },
    (c) => {
      const dir = Math.random() < 0.5 ? -1 : 1;
      const next = clampTier(c.sensorTier + dir);
      if (next === c.sensorTier) return { creature: c, change: null };
      return { creature: { ...c, sensorTier: next }, change: describeTierChange('Sensors', TIER_NAMES_SENSORS, c.sensorTier, next) };
    },
    (c) => {
      const next = tweakHybrids(c);
      const added = next.filter((h) => !c.hybrids.includes(h));
      const removed = c.hybrids.filter((h) => !next.includes(h));
      if (added.length === 0 && removed.length === 0) return { creature: c, change: null };
      const parts: string[] = [];
      if (added.length > 0) parts.push(`gained ${added.map((h) => hybridCatalog.find((x) => x.id === h)?.name ?? h).join(', ')}`);
      if (removed.length > 0) parts.push(`lost ${removed.map((h) => hybridCatalog.find((x) => x.id === h)?.name ?? h).join(', ')}`);
      return { creature: { ...c, hybrids: next }, change: 'Hybrid: ' + parts.join(' · ') };
    },
    (c) => ({
      creature: { ...c, warmBlooded: !c.warmBlooded },
      change: c.warmBlooded ? 'Flipped to cold-blooded ❄️' : 'Flipped to warm-blooded 🔥',
    }),
  ];

  for (let i = 0; i < numMutations; i++) {
    const m = mutators[Math.floor(Math.random() * mutators.length)];
    const r = m(child);
    if (r.change) {
      child = r.creature;
      changes.push(r.change);
    }
  }

  child = { ...child, hybrids: child.hybrids.filter((h) => isHybridValid(h, child).valid) };
  child.name = mutateName(parent.name);
  return { creature: child, changes };
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

export function EvolveModal({ parent, onPick, onClose }: Props) {
  const [variants] = useState<Mutation[]>(() => [mutate(parent), mutate(parent), mutate(parent)]);

  return (
    <div className="insight-overlay" onClick={onClose}>
      <div className="evolve-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Next generation 🥚</h3>
        <p>Your winning creature spawned three offspring with small mutations. Pick one to evolve into — or keep your current design.</p>
        <div className="evolve-variants">
          {variants.map((v, i) => (
            <button key={i} className="evolve-card" type="button" onClick={() => onPick(v.creature)}>
              <div className="evolve-thumb">
                <CreatureSVG creature={v.creature} />
              </div>
              <div className="evolve-name">{v.creature.name}</div>
              <ul className="evolve-changes">
                {v.changes.length > 0
                  ? v.changes.map((c, j) => <li key={j}>{c}</li>)
                  : <li className="evolve-change-none">(no visible change — same form)</li>}
              </ul>
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
