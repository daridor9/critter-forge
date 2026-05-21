import type { Creature, BodyPlan, Tier, Hybrid } from '../types';
import type { ColorOverride } from '../components/CreatureSVG';

export type DexShape =
  | 'default' | 'snake' | 'octopus' | 'whale' | 'dolphin' | 'penguin'
  | 'lion' | 'cheetah' | 'snowleopard' | 'wolf' | 'polarbear'
  | 'mouse' | 'hummingbird' | 'bat'
  | 'elephant' | 'gorilla' | 'camel' | 'ostrich' | 'eagle' | 'owl'
  | 'tortoise' | 'crocodile' | 'shark' | 'chameleon'
  | 'raptor' | 'triceratops' | 'stegosaurus' | 'pterodactyl';

export interface DexAnimal {
  name: string;
  emoji: string;
  fact: string;
  creature: Creature;
  colors?: ColorOverride;
  shape?: DexShape;
}

export const ANIMAL_COLORS: Record<string, ColorOverride> = {
  'Mouse':           { main: '#b8a698', shade: '#7a6a5c', light: '#d4c4b6', cheek: '#f0bcbc' },
  'Hummingbird':     { main: '#3da080', shade: '#1f6e52', light: '#67bfa0', cheek: '#ff8a8a' },
  'Bat':             { main: '#5a4a3e', shade: '#2e2418', light: '#7a685a', cheek: '#a06a76' },
  'Cheetah':         { main: '#d4a060', shade: '#a8783c', light: '#e8c690', cheek: '#f0b890', pattern: '#1a1a1a' },
  'Wolf':            { main: '#8a8580', shade: '#5a5550', light: '#b0aba4', cheek: '#bcb5ae' },
  'Lion':            { main: '#d4a040', shade: '#a87820', light: '#e6c065', cheek: '#f0b890' },
  'Polar bear':      { main: '#f4f4f0', shade: '#b8b8b0', light: '#ffffff', cheek: '#ffd8d8' },
  'Snow leopard':    { main: '#d8d2c4', shade: '#9a948a', light: '#ede8de', cheek: '#f4d8c8', pattern: '#3a3530' },
  'Elephant':        { main: '#9a958c', shade: '#5a554c', light: '#b8b3aa', cheek: '#caa8a8' },
  'Blue whale':      { main: '#5a7a98', shade: '#2e4a68', light: '#7e9bb8', cheek: '#9eb4cc' },
  'Dolphin':         { main: '#7090b0', shade: '#3e5e80', light: '#a2b8d0', cheek: '#b4c4d6' },
  'Sloth':           { main: '#9a8458', shade: '#5e4e2c', light: '#b6a274', cheek: '#c0a878' },
  'Kangaroo':        { main: '#b07248', shade: '#7a4a24', light: '#c89060', cheek: '#daa080' },
  'Camel':           { main: '#d8b88a', shade: '#a8885a', light: '#ead4ae', cheek: '#f0c8aa' },
  'Gorilla':         { main: '#2a2a2a', shade: '#0c0c0c', light: '#4a4a4a', cheek: '#5a4040' },
  'Ostrich':         { main: '#3a3530', shade: '#1a1614', light: '#6a625a', cheek: '#d68b5a' },
  'Eagle':           { main: '#8a6a48', shade: '#5a4220', light: '#b09070', cheek: '#e0a060' },
  'Penguin':         { main: '#1a1a1a', shade: '#000000', light: '#ffffff', cheek: '#ffa040' },
  'Owl':             { main: '#9a7a54', shade: '#5a402c', light: '#bca080', cheek: '#caaa90', pattern: '#3a2818' },
  'Tortoise':        { main: '#7a924a', shade: '#42622a', light: '#9ab068', cheek: '#a8b88a' },
  'Crocodile':       { main: '#5a7a3a', shade: '#2a4818', light: '#82a058', cheek: '#90a880' },
  'Chameleon':       { main: '#5aa840', shade: '#2a7818', light: '#82c068', cheek: '#a0d090' },
  'Anaconda':        { main: '#6a7e3a', shade: '#3a4a1c', light: '#92a258', cheek: '#94a274' },
  'Great white shark': { main: '#7090a4', shade: '#3a5060', light: '#ffffff', cheek: '#a4b8c8' },
  'Octopus':         { main: '#c45a78', shade: '#7a2c4c', light: '#e69cb0', cheek: '#fab8c8' },
  'Velociraptor':    { main: '#9a6840', shade: '#5a3818', light: '#bc8a5e', cheek: '#d0a080' },
  'Triceratops':     { main: '#7a9258', shade: '#42622a', light: '#9ab078', cheek: '#a8b88a' },
  'Stegosaurus':     { main: '#6a8a6a', shade: '#385a3c', light: '#92ac90', cheek: '#a4b8a4' },
  'Pterodactyl':     { main: '#9a8458', shade: '#5a4828', light: '#bca080', cheek: '#caaa90' },
};

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
  shape?: DexShape,
): DexAnimal => {
  const sizeUnit = Math.max(0, Math.min(100, Math.round((Math.log10(Math.max(0.001, massKg)) + 2) / 7 * 100)));
  return {
    name,
    emoji,
    fact,
    creature: { name, sizeUnit, bodyPlan, warmBlooded, legTier, brainTier, defenseTier, sensorTier, hybrids },
    colors: ANIMAL_COLORS[name],
    shape,
  };
};

export const ANIMAL_DEX: DexAnimal[] = [
  make('Mouse', '🐭', 0.025, 'mammal', true, 1, 0, 1, 2, [],
    'Heart beats ~600 bpm. Burns the same lifetime heartbeats as a whale, in 2 years instead of 100.', 'mouse'),
  make('Hummingbird', '🐦', 0.004, 'bird', true, 0, 1, 0, 2, ['wings'],
    'Eats its body weight in nectar every day. Heart at 1200 bpm in flight — physics-limit metabolism.', 'hummingbird'),
  make('Bat', '🦇', 0.05, 'mammal', true, 0, 2, 0, 2, ['echolocation', 'wings'],
    'Pings the dark with ultrasound. Catches mosquitoes mid-air using sound alone.', 'bat'),
  make('Cheetah', '🐆', 50, 'mammal', true, 2, 1, 0, 2, [],
    'Fastest land animal: 110 km/h. Holds top speed ~30 seconds before overheating. Black tear stripes shade the eyes from glare.', 'cheetah'),
  make('Wolf', '🐺', 40, 'mammal', true, 1, 2, 1, 1, [],
    'Wins by stamina, not speed. Long snout, pointed ears, bushy tail. Trots all day until prey collapses.', 'wolf'),
  make('Lion', '🦁', 190, 'mammal', true, 1, 2, 1, 2, [],
    'Pride hunter. Males grow huge dark manes that signal genes + protect the neck. Females do most of the killing.', 'lion'),
  make('Polar bear', '🐻‍❄️', 450, 'mammal', true, 1, 1, 2, 2, ['thick-fur'],
    'Hollow fur traps body heat. Black skin under white fur. Swims for hours in -2°C water.', 'polarbear'),
  make('Snow leopard', '🐆', 50, 'mammal', true, 2, 2, 1, 2, ['thick-fur', 'camouflage'],
    'Lives above 3000 m. Tail almost as long as its body for balance on cliffs. Dark open-ring rosettes on pale fur.', 'snowleopard'),
  make('Elephant', '🐘', 4000, 'mammal', true, 0, 2, 2, 1, [],
    'Lives 65 years. Mourns dead. Largest land brain on Earth. Trunk has 40,000+ muscles; tusks are continuously-growing incisors.', 'elephant'),
  make('Blue whale', '🐳', 100000, 'mammal', true, 0, 2, 2, 1, ['echolocation'],
    'The biggest animal that has ever lived. Heart beats once every 10 seconds when diving.', 'whale'),
  make('Dolphin', '🐬', 200, 'mammal', true, 0, 2, 1, 2, ['echolocation', 'gills'],
    'Recognizes itself in a mirror. Uses ultrasound to navigate murky water. Streamlined body + curved dorsal fin + iconic smile.', 'dolphin'),
  make('Sloth', '🦥', 6, 'mammal', true, 0, 0, 1, 1, ['symbiosis'],
    'Algae grows in its fur for camouflage. Moves 30 cm/min. Sleeps 18h a day.'),
  make('Kangaroo', '🦘', 60, 'mammal', true, 2, 1, 0, 1, [],
    'Hops at 70 km/h using elastic tendons. Tail acts as a fifth leg.'),
  make('Camel', '🐪', 600, 'mammal', true, 1, 1, 1, 1, [],
    'Survives 10% water loss (we die at 5%). Hump is fat, not water — burns it for energy + metabolic water.', 'camel'),
  make('Gorilla', '🦍', 180, 'mammal', true, 1, 2, 1, 2, [],
    'Mostly herbivorous despite huge canines. Brain ~500 g. Knuckle-walker: long arms, short legs.', 'gorilla'),
  make('Ostrich', '🪶', 110, 'bird', true, 2, 1, 0, 2, [],
    'Cannot fly — too heavy. Runs 70 km/h on two powerful clawed legs. Kicks can kill a lion.', 'ostrich'),
  make('Eagle', '🦅', 6, 'bird', true, 1, 2, 2, 2, ['wings'],
    'Sees small prey from 3 km away. Hooked beak, sharp talons. Strikes at 240 km/h in a dive.', 'eagle'),
  make('Penguin', '🐧', 30, 'bird', true, 0, 1, 1, 2, ['thick-fur', 'gills'],
    'Wings became flippers. Survives -40°C with feather + fat insulation.', 'penguin'),
  make('Owl', '🦉', 1.5, 'bird', true, 1, 2, 0, 2, ['camouflage'],
    'Silent flight. Huge forward-facing eyes (rare in birds). Hears a mouse moving under snow 30 m away.', 'owl'),
  make('Tortoise', '🐢', 200, 'reptile', false, 0, 1, 2, 1, [],
    'Lives 150+ years. Heart beats ~10 bpm. Slow metabolism = long life. Shell is fused vertebrae + ribs.', 'tortoise'),
  make('Crocodile', '🐊', 700, 'reptile', false, 0, 1, 2, 2, ['venom'],
    'Bite force 16,000 N (lion: 4,000). Long jaw with interlocking teeth. Hasn\'t changed much in 200 million years.', 'crocodile'),
  make('Chameleon', '🦎', 0.2, 'reptile', false, 1, 1, 0, 2, ['camouflage'],
    'Two eyes that move independently like turret cameras. Curled prehensile tail grips branches. Long sticky tongue snaps out 2× body length. Colour-change skin in 0.3 s.', 'chameleon'),
  make('Anaconda', '🐍', 250, 'reptile', false, 0, 1, 1, 1, ['venom'],
    'Crushes prey 1.5× its own mass. Cold-blooded — needs sun to digest.', 'snake'),
  make('Great white shark', '🦈', 1100, 'fish', false, 0, 1, 1, 2, ['electric', 'gills'],
    'Detects electric fields from heartbeats. 300 serrated teeth in rows, replaced lifelong. Triangular dorsal fin + crescent tail.', 'shark'),
  make('Octopus', '🐙', 5, 'fish', false, 0, 2, 0, 2, ['camouflage', 'venom'],
    '9 brains (one main + one per arm). Opens jars. Edits its own RNA.', 'octopus'),
  make('Velociraptor', '🦖', 20, 'reptile', false, 2, 2, 0, 2, ['venom'],
    'Pack hunter the size of a turkey. Feathered (Jurassic Park lied). Sickle claw could disembowel prey.', 'raptor'),
  make('Triceratops', '🦕', 6000, 'reptile', false, 0, 1, 2, 1, [],
    'Three-horned herbivore with a bony neck frill ~2 m wide. ~6 t. Lived alongside T-rex.', 'triceratops'),
  make('Stegosaurus', '🦕', 3500, 'reptile', false, 0, 0, 2, 1, [],
    'Plate-backed herbivore. Spiked tail (the thagomizer) for defence. Brain the size of a walnut.', 'stegosaurus'),
  make('Pterodactyl', '🦅', 5, 'bird', false, 0, 1, 0, 2, ['wings'],
    'Flying reptile, not a dinosaur. Wingspan ~1 m. Long toothless beak, head crest. Glided more than flapped.', 'pterodactyl'),
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
