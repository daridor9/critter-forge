import type { Creature, BodyPlan, Tier, BrainTier, Hybrid } from '../types';
import { hybridCatalog } from './hybrids';
import { isHybridValid } from '../physics';

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const ADJECTIVES_LARGE = ['Mighty', 'Colossal', 'Boulder', 'Titan'];
const ADJECTIVES_SMALL = ['Tiny', 'Wee', 'Pip', 'Speck'];
const ADJECTIVES_FAST = ['Swift', 'Dart', 'Streak', 'Blitz'];
const ADJECTIVES_TOUGH = ['Iron', 'Stone', 'Granite', 'Bastion'];
const ADJECTIVES_SMART = ['Clever', 'Sage', 'Wise', 'Sly'];
const ADJECTIVES_DEFAULT = ['Wild', 'Patch', 'Mossy', 'Bramble', 'Sunny'];

const NOUNS: Record<BodyPlan, string[]> = {
  mammal: ['Critter', 'Fluffer', 'Pawpaw', 'Tuft', 'Snout'],
  reptile: ['Scale', 'Coil', 'Basker', 'Ridge'],
  bird: ['Wing', 'Plume', 'Feather', 'Beaky'],
  fish: ['Fin', 'Splash', 'Bubble', 'Glider'],
};

export function suggestName(c: Creature): string {
  const adjPools: string[][] = [];
  if (c.sizeUnit > 70) adjPools.push(ADJECTIVES_LARGE);
  if (c.sizeUnit < 20) adjPools.push(ADJECTIVES_SMALL);
  if (c.legTier === 2) adjPools.push(ADJECTIVES_FAST);
  if (c.defenseTier === 2) adjPools.push(ADJECTIVES_TOUGH);
  if (c.brainTier >= 2) adjPools.push(ADJECTIVES_SMART);
  if (adjPools.length === 0) adjPools.push(ADJECTIVES_DEFAULT);

  const adj = pick(pick(adjPools));
  const noun = pick(NOUNS[c.bodyPlan]);
  return `${adj} ${noun}`;
}

export function randomCreature(): Creature {
  const bodyPlan = pick<BodyPlan>(['mammal', 'reptile', 'bird', 'fish']);
  const tiers: Tier[] = [0, 1, 2];
  // Brain has a rare 4th tier — Genius — show up ~8% of the time on random.
  const brainTiers: BrainTier[] = Math.random() < 0.08 ? [3] : [0, 1, 2];
  const base: Creature = {
    name: 'Random',
    sizeUnit: Math.floor(Math.random() * 95) + 3,
    bodyPlan,
    warmBlooded: Math.random() < 0.65,
    legTier: pick(tiers),
    brainTier: pick(brainTiers),
    defenseTier: pick(tiers),
    sensorTier: pick(tiers),
    hybrids: [],
  };

  if (Math.random() < 0.5) {
    const valid = hybridCatalog.filter((h) => isHybridValid(h.id, base).valid);
    if (valid.length > 0) {
      const picked: Hybrid[] = [pick(valid).id];
      if (Math.random() < 0.4 && valid.length > 1) {
        const second = pick(valid.filter((h) => !picked.includes(h.id)));
        if (second) picked.push(second.id);
      }
      base.hybrids = picked;
    }
  }

  base.name = suggestName(base);
  return base;
}
