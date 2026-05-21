import type { Creature, Tier, Hybrid } from '../types';
import { isHybridValid } from '../physics';

const clamp = (n: number) => Math.max(0, Math.min(100, n));
const tier = (t: number): Tier => Math.max(0, Math.min(2, t)) as Tier;

function pick<T>(a: T, b: T): { value: T; fromFirst: boolean } {
  const fromFirst = Math.random() < 0.5;
  return { value: fromFirst ? a : b, fromFirst };
}

export interface BreedResult {
  creature: Creature;
  notes: string[];
}

const TIER_LEG = ['stubby', 'standard', 'runner'];
const TIER_BRAIN = ['tiny', 'standard', 'big'];
const TIER_DEFENSE = ['none', 'fur/scales', 'armor'];
const TIER_SENSORS = ['simple', 'sharp', 'sonar'];

export function breed(p1: Creature, p2: Creature): BreedResult {
  const notes: string[] = [];
  const sizeBlend = (p1.sizeUnit + p2.sizeUnit) / 2 + (Math.random() - 0.5) * 8;

  const bp = pick(p1.bodyPlan, p2.bodyPlan);
  if (p1.bodyPlan !== p2.bodyPlan) notes.push(`Body: ${bp.fromFirst ? p1.name : p2.name}'s ${bp.value}`);

  const blood = pick(p1.warmBlooded, p2.warmBlooded);
  if (p1.warmBlooded !== p2.warmBlooded) notes.push(`Blood: ${blood.value ? 'warm' : 'cold'} (${blood.fromFirst ? p1.name : p2.name})`);

  let legBase = pick(p1.legTier, p2.legTier).value;
  const legMutated = Math.random() < 0.2;
  const legDir = Math.random() < 0.5 ? -1 : 1;
  if (legMutated) legBase = tier(legBase + legDir);
  if (p1.legTier !== p2.legTier || legMutated) {
    notes.push(`Legs: ${TIER_LEG[legBase]}${legMutated ? ' ⚡ mutated' : ''}`);
  }

  let brainBase = pick(p1.brainTier, p2.brainTier).value;
  const brainMutated = Math.random() < 0.2;
  if (brainMutated) brainBase = tier(brainBase + (Math.random() < 0.5 ? -1 : 1));
  if (p1.brainTier !== p2.brainTier || brainMutated) {
    notes.push(`Brain: ${TIER_BRAIN[brainBase]}${brainMutated ? ' ⚡ mutated' : ''}`);
  }

  let defBase = pick(p1.defenseTier, p2.defenseTier).value;
  const defMutated = Math.random() < 0.2;
  if (defMutated) defBase = tier(defBase + (Math.random() < 0.5 ? -1 : 1));
  if (p1.defenseTier !== p2.defenseTier || defMutated) {
    notes.push(`Defense: ${TIER_DEFENSE[defBase]}${defMutated ? ' ⚡ mutated' : ''}`);
  }

  let senBase = pick(p1.sensorTier, p2.sensorTier).value;
  const senMutated = Math.random() < 0.2;
  if (senMutated) senBase = tier(senBase + (Math.random() < 0.5 ? -1 : 1));
  if (p1.sensorTier !== p2.sensorTier || senMutated) {
    notes.push(`Sensors: ${TIER_SENSORS[senBase]}${senMutated ? ' ⚡ mutated' : ''}`);
  }

  const childHybrids: Hybrid[] = [];
  const candidates: Hybrid[] = [...new Set([...p1.hybrids, ...p2.hybrids])];
  for (const h of candidates) {
    if (Math.random() < 0.5 && childHybrids.length < 2) childHybrids.push(h);
  }

  const child: Creature = {
    name: childName(p1, p2),
    sizeUnit: clamp(Math.round(sizeBlend)),
    bodyPlan: bp.value,
    warmBlooded: blood.value,
    legTier: legBase,
    brainTier: brainBase,
    defenseTier: defBase,
    sensorTier: senBase,
    hybrids: childHybrids,
  };

  child.hybrids = child.hybrids.filter((h) => isHybridValid(h, child).valid);
  if (childHybrids.length > 0) {
    notes.push(`Inherited hybrids: ${child.hybrids.join(', ') || 'none (incompatible)'}`);
  }

  return { creature: child, notes };
}

const NAME_LINKS = ['of', 'son of', 'kin of', 'spawn of'];

function childName(p1: Creature, p2: Creature): string {
  const first = p1.name.split(/[\s,]+/)[0] ?? 'Critter';
  const second = p2.name.split(/[\s,]+/)[0] ?? 'Critter';
  if (Math.random() < 0.5) return blend(first, second);
  const link = NAME_LINKS[Math.floor(Math.random() * NAME_LINKS.length)];
  return `${first} ${link} ${second}`;
}

function blend(a: string, b: string): string {
  if (a.length < 3 || b.length < 3) return `${a} × ${b}`;
  const mid = Math.max(2, Math.min(a.length - 1, Math.floor(a.length / 2)));
  const tail = Math.max(2, Math.floor(b.length / 2));
  return a.slice(0, mid) + b.slice(b.length - tail);
}
