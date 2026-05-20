import type { Creature, Tier } from '../types';

const clamp = (n: number) => Math.max(0, Math.min(100, n));
const tier = (t: number): Tier => Math.max(0, Math.min(2, t)) as Tier;

export type StatKey = 'mass' | 'food' | 'vigil' | 'speed' | 'endurance' | 'cold' | 'lifespan' | 'bone' | 'heart';

export interface AdjustResult {
  creature: Creature;
  changed: boolean;
}

export function adjustCreatureForStat(c: Creature, stat: StatKey, dir: 1 | -1): AdjustResult {
  const noChange: AdjustResult = { creature: c, changed: false };

  switch (stat) {
    case 'mass': {
      const next = clamp(c.sizeUnit + dir * 6);
      if (next === c.sizeUnit) return noChange;
      return { creature: { ...c, sizeUnit: next }, changed: true };
    }
    case 'food': {
      if (dir > 0) {
        if (!c.warmBlooded) return { creature: { ...c, warmBlooded: true }, changed: true };
        if (c.brainTier < 2) return { creature: { ...c, brainTier: tier(c.brainTier + 1) }, changed: true };
        const next = clamp(c.sizeUnit + 5);
        if (next === c.sizeUnit) return noChange;
        return { creature: { ...c, sizeUnit: next }, changed: true };
      }
      if (c.brainTier > 0) return { creature: { ...c, brainTier: tier(c.brainTier - 1) }, changed: true };
      if (c.warmBlooded) return { creature: { ...c, warmBlooded: false }, changed: true };
      const next = clamp(c.sizeUnit - 5);
      if (next === c.sizeUnit) return noChange;
      return { creature: { ...c, sizeUnit: next }, changed: true };
    }
    case 'vigil': {
      const next = tier(c.sensorTier + dir);
      if (next === c.sensorTier) {
        const bnext = tier(c.brainTier + dir);
        if (bnext === c.brainTier) return noChange;
        return { creature: { ...c, brainTier: bnext }, changed: true };
      }
      return { creature: { ...c, sensorTier: next }, changed: true };
    }
    case 'speed':
    case 'endurance': {
      const next = tier(c.legTier + dir);
      if (next === c.legTier) {
        if (stat === 'endurance' && c.warmBlooded !== (dir > 0)) {
          return { creature: { ...c, warmBlooded: dir > 0 }, changed: true };
        }
        return noChange;
      }
      return { creature: { ...c, legTier: next }, changed: true };
    }
    case 'cold': {
      const next = tier(c.defenseTier + dir);
      if (next === c.defenseTier) return noChange;
      return { creature: { ...c, defenseTier: next }, changed: true };
    }
    case 'lifespan': {
      const next = clamp(c.sizeUnit + dir * 6);
      if (next === c.sizeUnit) return noChange;
      return { creature: { ...c, sizeUnit: next }, changed: true };
    }
    case 'bone': {
      const next = clamp(c.sizeUnit + dir * 6);
      if (next === c.sizeUnit) return noChange;
      return { creature: { ...c, sizeUnit: next }, changed: true };
    }
    case 'heart': {
      const next = clamp(c.sizeUnit - dir * 6);
      if (next === c.sizeUnit) return noChange;
      return { creature: { ...c, sizeUnit: next }, changed: true };
    }
  }
}
