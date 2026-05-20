import type { Creature, Tier, Hybrid } from '../types';
import { isHybridValid } from '../physics';

const clamp = (n: number) => Math.max(0, Math.min(100, n));
const tier = (t: number): Tier => Math.max(0, Math.min(2, t)) as Tier;

function pick<T>(a: T, b: T): T {
  return Math.random() < 0.5 ? a : b;
}

export function breed(p1: Creature, p2: Creature): Creature {
  const sizeBlend = (p1.sizeUnit + p2.sizeUnit) / 2 + (Math.random() - 0.5) * 8;
  const childHybrids: Hybrid[] = [];
  const candidates: Hybrid[] = [...new Set([...p1.hybrids, ...p2.hybrids])];
  for (const h of candidates) {
    if (Math.random() < 0.5 && childHybrids.length < 2) childHybrids.push(h);
  }

  const child: Creature = {
    name: childName(p1, p2),
    sizeUnit: clamp(Math.round(sizeBlend)),
    bodyPlan: pick(p1.bodyPlan, p2.bodyPlan),
    warmBlooded: pick(p1.warmBlooded, p2.warmBlooded),
    legTier: tier(pick(p1.legTier, p2.legTier) + (Math.random() < 0.2 ? (Math.random() < 0.5 ? -1 : 1) : 0)),
    brainTier: tier(pick(p1.brainTier, p2.brainTier) + (Math.random() < 0.2 ? (Math.random() < 0.5 ? -1 : 1) : 0)),
    defenseTier: tier(pick(p1.defenseTier, p2.defenseTier) + (Math.random() < 0.2 ? (Math.random() < 0.5 ? -1 : 1) : 0)),
    sensorTier: tier(pick(p1.sensorTier, p2.sensorTier) + (Math.random() < 0.2 ? (Math.random() < 0.5 ? -1 : 1) : 0)),
    hybrids: childHybrids,
  };

  child.hybrids = child.hybrids.filter((h) => isHybridValid(h, child).valid);
  return child;
}

const NAME_LINKS = ['of', 'son of', 'kin of', 'spawn of'];

function childName(p1: Creature, p2: Creature): string {
  const first = p1.name.split(/[\s,]+/)[0] ?? 'Critter';
  const second = p2.name.split(/[\s,]+/)[0] ?? 'Critter';
  if (Math.random() < 0.5) {
    return blend(first, second);
  }
  const link = NAME_LINKS[Math.floor(Math.random() * NAME_LINKS.length)];
  return `${first} ${link} ${second}`;
}

function blend(a: string, b: string): string {
  if (a.length < 3 || b.length < 3) return `${a} × ${b}`;
  const mid = Math.max(2, Math.min(a.length - 1, Math.floor(a.length / 2)));
  const tail = Math.max(2, Math.floor(b.length / 2));
  return a.slice(0, mid) + b.slice(b.length - tail);
}
