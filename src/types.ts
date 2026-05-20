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
