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
  | 'symbiosis'
  // Unlockable hybrids — gated behind point totals. See data/points.ts
  // HYBRID_UNLOCKS for costs and data/hybrids.ts catalog for facts.
  | 'firebreath'
  | 'stoneskin'
  | 'hypersonic'
  | 'dragon';

// When a creature is loaded straight from the dex, it carries the bespoke
// shape name, palette, and factual adaptations so the main stage can render
// the canonical critter and the arenas can respect real biology without
// pretending every adaptation is a player hybrid power.
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
  adaptations?: string[];
}

/**
 * Which anatomical layer to display when looking at a creature.
 *  - skin:    normal habitat view (what users see when designing)
 *  - muscles: removed-skin view showing major muscle groups
 *  - anatomy: skeleton + labeled organs, biology-textbook style
 */
export type AnatomyLayer = 'skin' | 'muscles' | 'anatomy';

export const defaultCreature: Creature = {
  sizeUnit: 40,
  bodyPlan: 'mammal',
  warmBlooded: true,
  legTier: 2,
  brainTier: 1,
  defenseTier: 1,
  sensorTier: 1,
  hybrids: [],
  name: 'Pip',
};
