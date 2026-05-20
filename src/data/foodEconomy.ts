import type { Creature } from '../types';
import type { CreatureStats } from '../physics';

export interface FoodEnv {
  id: string;
  emoji: string;
  name: string;
  baseAvailable: number;
  bonus: (c: Creature, s: CreatureStats) => number;
  note: string;
}

export const FOOD_ENVS: FoodEnv[] = [
  {
    id: 'savanna',
    emoji: '🌾',
    name: 'Savanna',
    baseAvailable: 700,
    bonus: (c, s) => {
      let b = 0.7;
      b += 0.18 * c.legTier;
      b += 0.10 * c.sensorTier;
      if (s.topSpeedKmh > 70) b += 0.25;
      if (s.massKg > 500 && c.bodyPlan === 'mammal') b += 0.2;
      return b;
    },
    note: 'Grass & medium prey. Runners and big herbivores eat well.',
  },
  {
    id: 'forest',
    emoji: '🌳',
    name: 'Forest',
    baseAvailable: 550,
    bonus: (c, s) => {
      let b = 0.85;
      b += 0.18 * c.brainTier;
      if (c.hybrids.includes('camouflage')) b += 0.3;
      if (c.hybrids.includes('echolocation')) b += 0.2;
      if (c.sensorTier === 2) b += 0.1;
      if (s.massKg < 50 && s.massKg > 0.5) b += 0.15;
      return b;
    },
    note: 'Leaves, fruit, insects. Brains + camouflage find hidden food.',
  },
  {
    id: 'mountain',
    emoji: '🏔',
    name: 'Mountain',
    baseAvailable: 220,
    bonus: (c, s) => {
      let b = 0.4;
      b += 0.6 * (s.coldTolerance / 100);
      b += 0.12 * c.brainTier;
      if (s.massKg > 80 && s.massKg < 800) b += 0.2;
      if (c.hybrids.includes('thick-fur')) b += 0.2;
      return b;
    },
    note: 'Sparse moss and small prey. Cold-tolerant musk-ox-types do best; brains remember snow caches.',
  },
  {
    id: 'desert',
    emoji: '🏜',
    name: 'Desert',
    baseAvailable: 120,
    bonus: (c, s) => {
      let b = 0.3;
      if (!c.warmBlooded) b += 0.6;
      b += 0.1 * c.brainTier;
      if (s.massKg > 200 && c.bodyPlan === 'mammal') b += 0.3;
      if (c.bodyPlan === 'reptile') b += 0.4;
      if (c.hybrids.includes('venom')) b += 0.2;
      return b;
    },
    note: 'Almost no food. Cold-blooded reptiles and camels manage; brains remember water holes.',
  },
  {
    id: 'ocean',
    emoji: '🌊',
    name: 'Ocean',
    baseAvailable: 1100,
    bonus: (c, s) => {
      const aquatic = c.bodyPlan === 'fish' || c.hybrids.includes('gills');
      if (!aquatic) return 0.04;
      let b = 1.0;
      if (s.massKg > 100) b += 0.4;
      if (c.hybrids.includes('echolocation')) b += 0.2;
      if (c.hybrids.includes('electric')) b += 0.15;
      return b;
    },
    note: 'Plankton, fish, krill. Aquatic only — gills or fish body.',
  },
];

export interface FoodBalance {
  env: FoodEnv;
  intake: number;
  need: number;
  net: number;
  status: 'thriving' | 'tight' | 'starving';
}

export function foodBalance(env: FoodEnv, c: Creature, s: CreatureStats): FoodBalance {
  const intake = Math.max(0, env.baseAvailable * env.bonus(c, s));
  const need = s.foodKcalPerDay;
  const net = intake - need;
  const status: FoodBalance['status'] =
    net >= need * 0.3 ? 'thriving' : net >= -need * 0.2 ? 'tight' : 'starving';
  return { env, intake, need, net, status };
}

export function allBalances(c: Creature, s: CreatureStats): FoodBalance[] {
  return FOOD_ENVS.map((env) => foodBalance(env, c, s));
}
