export type BodyPlan = 'mammal' | 'reptile' | 'bird' | 'fish';

export type Tier = 0 | 1 | 2;

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
  brainTier: Tier;
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
