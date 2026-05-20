import type { Creature } from '../types';

export interface AnimalPreset {
  name: string;
  emoji: string;
  creature: Creature;
}

export const animalPresets: AnimalPreset[] = [
  {
    name: 'Cheetah',
    emoji: '🐆',
    creature: {
      name: 'Cheetah',
      sizeUnit: 53,
      bodyPlan: 'mammal',
      warmBlooded: true,
      legTier: 2,
      brainTier: 1,
      defenseTier: 0,
      sensorTier: 2,
      hybrids: [],
    },
  },
  {
    name: 'Wolf',
    emoji: '🐺',
    creature: {
      name: 'Wolf',
      sizeUnit: 51,
      bodyPlan: 'mammal',
      warmBlooded: true,
      legTier: 1,
      brainTier: 2,
      defenseTier: 1,
      sensorTier: 1,
      hybrids: [],
    },
  },
  {
    name: 'Elephant',
    emoji: '🐘',
    creature: {
      name: 'Elephant',
      sizeUnit: 80,
      bodyPlan: 'mammal',
      warmBlooded: true,
      legTier: 0,
      brainTier: 2,
      defenseTier: 2,
      sensorTier: 1,
      hybrids: [],
    },
  },
  {
    name: 'Mouse',
    emoji: '🐭',
    creature: {
      name: 'Mouse',
      sizeUnit: 6,
      bodyPlan: 'mammal',
      warmBlooded: true,
      legTier: 1,
      brainTier: 0,
      defenseTier: 1,
      sensorTier: 2,
      hybrids: [],
    },
  },
  {
    name: 'Hummingbird',
    emoji: '🐦',
    creature: {
      name: 'Hummingbird',
      sizeUnit: 0,
      bodyPlan: 'bird',
      warmBlooded: true,
      legTier: 0,
      brainTier: 1,
      defenseTier: 0,
      sensorTier: 2,
      hybrids: [],
    },
  },
];

export function presetFor(name: string): AnimalPreset | undefined {
  return animalPresets.find((p) => p.name === name);
}
