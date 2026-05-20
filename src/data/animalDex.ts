import type { Creature, BodyPlan, Tier, Hybrid } from '../types';

export interface DexAnimal {
  name: string;
  emoji: string;
  fact: string;
  creature: Creature;
}

const make = (
  name: string,
  emoji: string,
  massKg: number,
  bodyPlan: BodyPlan,
  warmBlooded: boolean,
  legTier: Tier,
  brainTier: Tier,
  defenseTier: Tier,
  sensorTier: Tier,
  hybrids: Hybrid[],
  fact: string,
): DexAnimal => {
  const sizeUnit = Math.max(0, Math.min(100, Math.round((Math.log10(Math.max(0.001, massKg)) + 2) / 7 * 100)));
  return {
    name,
    emoji,
    fact,
    creature: { name, sizeUnit, bodyPlan, warmBlooded, legTier, brainTier, defenseTier, sensorTier, hybrids },
  };
};

export const ANIMAL_DEX: DexAnimal[] = [
  make('Mouse', '🐭', 0.025, 'mammal', true, 1, 0, 1, 2, [],
    'Heart beats ~600 bpm. Burns the same lifetime heartbeats as a whale, in 2 years instead of 100.'),
  make('Hummingbird', '🐦', 0.004, 'bird', true, 0, 1, 0, 2, ['wings'],
    'Eats its body weight in nectar every day. Heart at 1200 bpm in flight — physics-limit metabolism.'),
  make('Bat', '🦇', 0.05, 'mammal', true, 0, 2, 0, 2, ['echolocation', 'wings'],
    'Pings the dark with ultrasound. Catches mosquitoes mid-air using sound alone.'),
  make('Cheetah', '🐆', 50, 'mammal', true, 2, 1, 0, 2, [],
    'Fastest land animal: 110 km/h. Holds top speed ~30 seconds before overheating.'),
  make('Wolf', '🐺', 40, 'mammal', true, 1, 2, 1, 1, [],
    'Wins by stamina, not speed. Trots all day until prey collapses.'),
  make('Lion', '🦁', 190, 'mammal', true, 1, 2, 1, 2, [],
    'Pride hunter. Females do most kills; males defend territory.'),
  make('Polar bear', '🐻‍❄️', 450, 'mammal', true, 1, 1, 2, 2, ['thick-fur'],
    'Hollow fur traps body heat. Swims for hours in -2°C water.'),
  make('Snow leopard', '🐆', 50, 'mammal', true, 2, 2, 1, 2, ['thick-fur', 'camouflage'],
    'Lives above 3000 m. Tail almost as long as its body for balance on cliffs.'),
  make('Elephant', '🐘', 4000, 'mammal', true, 0, 2, 2, 1, [],
    'Lives 65 years. Mourns dead. Largest land brain on Earth.'),
  make('Blue whale', '🐳', 100000, 'mammal', true, 0, 2, 2, 1, ['echolocation'],
    'The biggest animal that has ever lived. Heart beats once every 10 seconds when diving.'),
  make('Dolphin', '🐬', 200, 'mammal', true, 0, 2, 1, 2, ['echolocation', 'gills'],
    'Recognizes itself in a mirror. Uses ultrasound to navigate murky water.'),
  make('Sloth', '🦥', 6, 'mammal', true, 0, 0, 1, 1, ['symbiosis'],
    'Algae grows in its fur for camouflage. Moves 30 cm/min. Sleeps 18h a day.'),
  make('Kangaroo', '🦘', 60, 'mammal', true, 2, 1, 0, 1, [],
    'Hops at 70 km/h using elastic tendons. Tail acts as a fifth leg.'),
  make('Camel', '🐪', 600, 'mammal', true, 1, 1, 1, 1, [],
    'Survives 10% water loss (we die at 5%). Hump is fat, not water.'),
  make('Gorilla', '🦍', 180, 'mammal', true, 1, 2, 1, 2, [],
    'Mostly herbivorous despite huge canines. Brain ~500 g.'),
  make('Ostrich', '🪶', 110, 'bird', true, 2, 1, 0, 2, [],
    'Cannot fly — too heavy. Runs 70 km/h. Kicks can kill a lion.'),
  make('Eagle', '🦅', 6, 'bird', true, 1, 2, 2, 2, ['wings'],
    'Sees small prey from 3 km away. Strikes at 240 km/h in a dive.'),
  make('Penguin', '🐧', 30, 'bird', true, 0, 1, 1, 2, ['thick-fur', 'gills'],
    'Wings became flippers. Survives -40°C with feather + fat insulation.'),
  make('Owl', '🦉', 1.5, 'bird', true, 1, 2, 0, 2, ['camouflage'],
    'Silent flight. Hears a mouse moving under snow 30 m away.'),
  make('Tortoise', '🐢', 200, 'reptile', false, 0, 1, 2, 1, [],
    'Lives 150+ years. Heart beats ~10 bpm. Slow metabolism = long life.'),
  make('Crocodile', '🐊', 700, 'reptile', false, 0, 1, 2, 2, ['venom'],
    'Bite force 16,000 N (lion: 4,000). Hasn\'t changed much in 200 million years.'),
  make('Chameleon', '🦎', 0.2, 'reptile', false, 1, 1, 0, 2, ['camouflage'],
    'Eyes move independently. Skin colour change in 0.3s via pigment cells.'),
  make('Anaconda', '🐍', 250, 'reptile', false, 0, 1, 1, 1, ['venom'],
    'Crushes prey 1.5× its own mass. Cold-blooded — needs sun to digest.'),
  make('Great white shark', '🦈', 1100, 'fish', false, 0, 1, 1, 2, ['electric', 'gills'],
    'Detects electric fields from heartbeats. 300 serrated teeth, replaced lifelong.'),
  make('Octopus', '🐙', 5, 'fish', false, 0, 2, 0, 2, ['camouflage', 'venom'],
    '9 brains (one main + one per arm). Opens jars. Edits its own RNA.'),
];

export function massDistance(a: Creature, b: Creature): number {
  return Math.abs(a.sizeUnit - b.sizeUnit);
}

export function closestAnimal(c: Creature): DexAnimal {
  let best = ANIMAL_DEX[0];
  let bestScore = Infinity;
  for (const a of ANIMAL_DEX) {
    let score = massDistance(c, a.creature) * 2;
    if (a.creature.bodyPlan !== c.bodyPlan) score += 30;
    if (a.creature.warmBlooded !== c.warmBlooded) score += 12;
    score += Math.abs(a.creature.legTier - c.legTier) * 4;
    score += Math.abs(a.creature.brainTier - c.brainTier) * 3;
    score += Math.abs(a.creature.defenseTier - c.defenseTier) * 3;
    score += Math.abs(a.creature.sensorTier - c.sensorTier) * 2;
    const sharedHybrids = a.creature.hybrids.filter((h) => c.hybrids.includes(h)).length;
    score -= sharedHybrids * 6;
    if (score < bestScore) {
      bestScore = score;
      best = a;
    }
  }
  return best;
}
