import type { Creature, ShapeColors, Tier, BrainTier, Hybrid } from '../types';
import { isHybridValid } from '../physics';

// Average two RGB-hex colors. Returns a hex string. Falls back to the
// first argument if either input isn't a valid 6-digit hex.
function blendHex(a: string, b: string): string {
  const ma = a.match(/^#([0-9a-f]{6})$/i);
  const mb = b.match(/^#([0-9a-f]{6})$/i);
  if (!ma || !mb) return a;
  const va = parseInt(ma[1], 16);
  const vb = parseInt(mb[1], 16);
  const r = Math.round(((va >> 16) & 0xff) / 2 + ((vb >> 16) & 0xff) / 2);
  const g = Math.round(((va >> 8) & 0xff) / 2 + ((vb >> 8) & 0xff) / 2);
  const b2 = Math.round((va & 0xff) / 2 + (vb & 0xff) / 2);
  return '#' + [r, g, b2].map((n) => n.toString(16).padStart(2, '0')).join('');
}

function blendColors(a?: ShapeColors, b?: ShapeColors): ShapeColors | undefined {
  if (!a && !b) return undefined;
  if (!a) return b;
  if (!b) return a;
  return {
    main: blendHex(a.main, b.main),
    shade: blendHex(a.shade, b.shade),
    light: blendHex(a.light, b.light),
    cheek: blendHex(a.cheek, b.cheek),
    pattern: a.pattern && b.pattern ? blendHex(a.pattern, b.pattern) : a.pattern ?? b.pattern,
  };
}

const clamp = (n: number) => Math.max(0, Math.min(100, n));
const tier = (t: number): Tier => Math.max(0, Math.min(2, t)) as Tier;
const brainTier = (t: number): BrainTier => Math.max(0, Math.min(3, t)) as BrainTier;

function pick<T>(a: T, b: T): { value: T; fromFirst: boolean } {
  const fromFirst = Math.random() < 0.5;
  return { value: fromFirst ? a : b, fromFirst };
}

export interface BreedResult {
  creature: Creature;
  notes: string[];
  genes: BreedGene[];
  mutationCount: number;
}

export interface BreedGene {
  label: string;
  value: string;
  source: 'blend' | 'parent1' | 'parent2' | 'mutation';
  sourceName?: string;
}

const TIER_LEG = ['stubby', 'standard', 'runner'];
const TIER_BRAIN = ['tiny', 'standard', 'big', 'genius'];
const TIER_DEFENSE = ['none', 'fur/scales', 'armor'];
const TIER_SENSORS = ['simple', 'sharp', 'sonar'];

export function breed(p1: Creature, p2: Creature): BreedResult {
  const notes: string[] = [];
  const genes: BreedGene[] = [];
  let mutationCount = 0;
  const sizeBlend = (p1.sizeUnit + p2.sizeUnit) / 2 + (Math.random() - 0.5) * 8;
  genes.push({ label: 'Size', value: 'parent blend', source: 'blend' });

  const bp = pick(p1.bodyPlan, p2.bodyPlan);
  genes.push({ label: 'Body', value: bp.value, source: bp.fromFirst ? 'parent1' : 'parent2', sourceName: bp.fromFirst ? p1.name : p2.name });
  if (p1.bodyPlan !== p2.bodyPlan) notes.push(`Body: ${bp.fromFirst ? p1.name : p2.name}'s ${bp.value}`);

  const blood = pick(p1.warmBlooded, p2.warmBlooded);
  genes.push({ label: 'Blood', value: blood.value ? 'warm' : 'cold', source: blood.fromFirst ? 'parent1' : 'parent2', sourceName: blood.fromFirst ? p1.name : p2.name });
  if (p1.warmBlooded !== p2.warmBlooded) notes.push(`Blood: ${blood.value ? 'warm' : 'cold'} (${blood.fromFirst ? p1.name : p2.name})`);

  const legPick = pick(p1.legTier, p2.legTier);
  let legBase = legPick.value;
  const legMutated = Math.random() < 0.2;
  const legDir = Math.random() < 0.5 ? -1 : 1;
  if (legMutated) {
    legBase = tier(legBase + legDir);
    mutationCount += 1;
  }
  genes.push({
    label: 'Legs',
    value: TIER_LEG[legBase],
    source: legMutated ? 'mutation' : legPick.fromFirst ? 'parent1' : 'parent2',
    sourceName: legMutated ? undefined : legPick.fromFirst ? p1.name : p2.name,
  });
  if (p1.legTier !== p2.legTier || legMutated) {
    notes.push(`Legs: ${TIER_LEG[legBase]}${legMutated ? ' ⚡ mutated' : ''}`);
  }

  const brainPick = pick(p1.brainTier, p2.brainTier);
  let brainBase = brainPick.value;
  const brainMutated = Math.random() < 0.2;
  if (brainMutated) {
    brainBase = brainTier(brainBase + (Math.random() < 0.5 ? -1 : 1));
    mutationCount += 1;
  }
  genes.push({
    label: 'Brain',
    value: TIER_BRAIN[brainBase],
    source: brainMutated ? 'mutation' : brainPick.fromFirst ? 'parent1' : 'parent2',
    sourceName: brainMutated ? undefined : brainPick.fromFirst ? p1.name : p2.name,
  });
  if (p1.brainTier !== p2.brainTier || brainMutated) {
    notes.push(`Brain: ${TIER_BRAIN[brainBase]}${brainMutated ? ' ⚡ mutated' : ''}`);
  }

  const defPick = pick(p1.defenseTier, p2.defenseTier);
  let defBase = defPick.value;
  const defMutated = Math.random() < 0.2;
  if (defMutated) {
    defBase = tier(defBase + (Math.random() < 0.5 ? -1 : 1));
    mutationCount += 1;
  }
  genes.push({
    label: 'Defense',
    value: TIER_DEFENSE[defBase],
    source: defMutated ? 'mutation' : defPick.fromFirst ? 'parent1' : 'parent2',
    sourceName: defMutated ? undefined : defPick.fromFirst ? p1.name : p2.name,
  });
  if (p1.defenseTier !== p2.defenseTier || defMutated) {
    notes.push(`Defense: ${TIER_DEFENSE[defBase]}${defMutated ? ' ⚡ mutated' : ''}`);
  }

  const senPick = pick(p1.sensorTier, p2.sensorTier);
  let senBase = senPick.value;
  const senMutated = Math.random() < 0.2;
  if (senMutated) {
    senBase = tier(senBase + (Math.random() < 0.5 ? -1 : 1));
    mutationCount += 1;
  }
  genes.push({
    label: 'Sensors',
    value: TIER_SENSORS[senBase],
    source: senMutated ? 'mutation' : senPick.fromFirst ? 'parent1' : 'parent2',
    sourceName: senMutated ? undefined : senPick.fromFirst ? p1.name : p2.name,
  });
  if (p1.sensorTier !== p2.sensorTier || senMutated) {
    notes.push(`Sensors: ${TIER_SENSORS[senBase]}${senMutated ? ' ⚡ mutated' : ''}`);
  }

  const childHybrids: Hybrid[] = [];
  const candidates: Hybrid[] = [...new Set([...p1.hybrids, ...p2.hybrids])];
  for (const h of candidates) {
    if (Math.random() < 0.5 && childHybrids.length < 2) childHybrids.push(h);
  }

  // ─── Shape + colors: chimeric inheritance ──────────────────────────
  // If at least one parent has a bespoke dex shape, the child inherits
  // it (50/50 when both have one). Colors are always a 50/50 blend of
  // both parents' palettes (or the lone parent's if only one has one).
  // This is what makes offspring actually LOOK like a mix of the
  // parents instead of reverting to the generic body morph.
  let childShape: string | undefined;
  let shapeSourceName: string | undefined;
  if (p1.shape && p2.shape) {
    const fromFirst = Math.random() < 0.5;
    childShape = fromFirst ? p1.shape : p2.shape;
    shapeSourceName = fromFirst ? p1.name : p2.name;
  } else if (p1.shape) {
    childShape = p1.shape;
    shapeSourceName = p1.name;
  } else if (p2.shape) {
    childShape = p2.shape;
    shapeSourceName = p2.name;
  }
  const childColors = blendColors(p1.colors, p2.colors);
  if (childShape && shapeSourceName) {
    genes.push({ label: 'Shape', value: childShape, source: shapeSourceName === p1.name ? 'parent1' : 'parent2', sourceName: shapeSourceName });
    notes.push(`Shape: ${childShape} (from ${shapeSourceName})`);
  }
  if (childColors && p1.colors && p2.colors) {
    genes.push({ label: 'Colors', value: 'blended', source: 'blend' });
    notes.push(`Colors: blended ${p1.name} × ${p2.name}`);
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
    shape: childShape,
    colors: childColors,
  };

  child.hybrids = child.hybrids.filter((h) => isHybridValid(h, child).valid);
  for (const h of child.hybrids) {
    const fromP1 = p1.hybrids.includes(h);
    const fromP2 = p2.hybrids.includes(h);
    genes.push({
      label: 'Hybrid',
      value: h,
      source: fromP1 && fromP2 ? 'blend' : fromP1 ? 'parent1' : 'parent2',
      sourceName: fromP1 && fromP2 ? undefined : fromP1 ? p1.name : p2.name,
    });
  }
  if (childHybrids.length > 0) {
    notes.push(`Inherited hybrids: ${child.hybrids.join(', ') || 'none (incompatible)'}`);
  }

  return { creature: child, notes, genes, mutationCount };
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
