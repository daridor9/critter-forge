export type BodyPlan = 'mammal' | 'reptile' | 'bird' | 'fish';

export type Tier = 0 | 1 | 2;
// Brain has a 4th tier (Genius) beyond the standard 3-tier system.
// Tier 3 represents the encephalization-quotient outliers — humans, dolphins,
// some octopi, ravens, elephants. Costs 50% more food than baseline.
export type BrainTier = 0 | 1 | 2 | 3;

export type Hybrid =
  | 'echolocation'
  | 'wings'
  | 'venom'
  | 'electric'
  | 'camouflage'
  | 'antifreeze'
  | 'thick-fur'
  | 'gills'
  | 'symbiosis';

// When a creature is loaded straight from the dex, it carries the bespoke
// shape name and palette so the main stage can render the canonical critter
// (e.g. an octopus actually looks like an octopus, not a generic fish blob).
// Cleared the moment the user mutates any trait in the builder.
export interface ShapeColors {
  main: string;
  shade: string;
  light: string;
  cheek: string;
  pattern?: string;
}

export interface Creature {
  sizeUnit: number;
  bodyPlan: BodyPlan;
  warmBlooded: boolean;
  legTier: Tier;
  brainTier: BrainTier;
  defenseTier: Tier;
  sensorTier: Tier;
  hybrids: Hybrid[];
  name: string;
  shape?: string;
  colors?: ShapeColors;
}

export const defaultCreature: Creature = {
  sizeUnit: 40,
  bodyPlan: 'mammal',
  warmBlooded: true,
  legTier: 1,
  brainTier: 1,
  defenseTier: 1,
  sensorTier: 1,
  hybrids: [],
  name: 'My Critter',
};
