import type { Creature, BodyPlan, Tier, BrainTier, Hybrid } from '../types';
import type { ColorOverride } from '../components/CreatureSVG';

export type DexShape =
  | 'default' | 'snake' | 'octopus' | 'whale' | 'dolphin' | 'penguin'
  | 'lion' | 'cheetah' | 'snowleopard' | 'wolf' | 'foxkit' | 'polarbear'
  | 'mouse' | 'hummingbird' | 'bat' | 'sloth' | 'kangaroo'
  | 'elephant' | 'gorilla' | 'camel' | 'ostrich' | 'eagle' | 'owl'
  | 'tortoise' | 'crocodile' | 'shark' | 'chameleon'
  | 'raptor' | 'triceratops' | 'stegosaurus' | 'pterodactyl'
  | 'tiger' | 'trex' | 'jellyfish' | 'sheep' | 'cow' | 'horse' | 'pig' | 'giraffe'
  | 'rooster' | 'donkey' | 'rhino' | 'cat' | 'dog' | 'goat';

export interface DexAnimal {
  name: string;
  emoji: string;
  fact: string;
  adaptations?: string[];
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
  'Foxkit':          { main: '#f58f76', shade: '#bc5844', light: '#ffd4b6', cheek: '#ffad9a', pattern: '#7b3528' },
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
  'Tiger':           { main: '#e08838', shade: '#a85820', light: '#f0a868', cheek: '#f0b890', pattern: '#1a1a1a' },
  'T-Rex':           { main: '#6a6850', shade: '#3a3828', light: '#8e8a70', cheek: '#9e9080' },
  'Jellyfish':       { main: '#9ec4e0', shade: '#5a8ab0', light: '#cee0ef', cheek: '#e8b8d0' },
  'Sheep':           { main: '#f4eedc', shade: '#c4b896', light: '#fff8e8', cheek: '#e8c8c8' },
  'Cow':             { main: '#f4f0e8', shade: '#c8b8a8', light: '#ffffff', cheek: '#f4b8b8', pattern: '#1a1a1a' },
  'Horse':           { main: '#a06438', shade: '#6a3818', light: '#c48868', cheek: '#d8aa90', pattern: '#3a1a08' },
  'Pig':             { main: '#f5b8a8', shade: '#c48070', light: '#ffd0c0', cheek: '#f08090' },
  'Giraffe':         { main: '#d8a868', shade: '#a87838', light: '#f0d8b0', cheek: '#e8c8a8', pattern: '#6a4828' },
  'Rooster':         { main: '#c84030', shade: '#8a2818', light: '#f0a060', cheek: '#f8d050', pattern: '#1a1a1a' },
  'Donkey':          { main: '#9a948a', shade: '#5a544a', light: '#cec8be', cheek: '#e8e0d4', pattern: '#3a342a' },
  'Rhino':           { main: '#9a8e80', shade: '#6a5e50', light: '#bcb0a2', cheek: '#c4a890', pattern: '#3a342a' },
  'Cat':             { main: '#d4a060', shade: '#a87838', light: '#f0c890', cheek: '#f4b0a0', pattern: '#1a1a1a' },
  'Dog':             { main: '#c89058', shade: '#8a5828', light: '#e8b888', cheek: '#f4a098', pattern: '#3a1a08' },
  'Goat':            { main: '#e8e4d8', shade: '#a09888', light: '#fff8e8', cheek: '#e8c8c8', pattern: '#3a342a' },
};

const make = (
  name: string,
  emoji: string,
  massKg: number,
  bodyPlan: BodyPlan,
  warmBlooded: boolean,
  legTier: Tier,
  brainTier: BrainTier,
  defenseTier: Tier,
  sensorTier: Tier,
  hybrids: Hybrid[],
  fact: string,
  shape?: DexShape,
  adaptations: string[] = [],
): DexAnimal => {
  const sizeUnit = Math.max(0, Math.min(100, Math.round((Math.log10(Math.max(0.001, massKg)) + 2) / 7 * 100)));
  const colors = ANIMAL_COLORS[name];
  return {
    name,
    emoji,
    fact,
    adaptations,
    creature: {
      name, sizeUnit, bodyPlan, warmBlooded, legTier, brainTier, defenseTier, sensorTier, hybrids,
      shape,
      colors,
      adaptations,
    },
    colors,
    shape,
  };
};

export const ANIMAL_DEX: DexAnimal[] = [
  make('Mouse', '🐭', 0.025, 'mammal', true, 1, 0, 1, 2, [],
    'Heart beats ~600 bpm. Burns the same lifetime heartbeats as a whale, in 2 years instead of 100.', 'mouse'),
  make('Hummingbird', '🐦', 0.004, 'bird', true, 0, 1, 0, 2, ['wings'],
    'Eats its body weight in nectar every day. Heart at 1200 bpm in flight — physics-limit metabolism.', 'hummingbird',
    ['powered flight', 'hovering', 'high metabolism']),
  make('Bat', '🦇', 0.05, 'mammal', true, 0, 2, 0, 2, ['echolocation', 'wings'],
    'Pings the dark with ultrasound. Catches mosquitoes mid-air using sound alone.', 'bat',
    ['echolocation', 'powered flight', 'nocturnal hunter']),
  make('Cheetah', '🐆', 50, 'mammal', true, 2, 1, 0, 2, [],
    'Fastest land animal: 110 km/h. Holds top speed ~30 seconds before overheating. Black tear stripes shade the eyes from glare.', 'cheetah'),
  make('Wolf', '🐺', 40, 'mammal', true, 1, 2, 1, 1, [],
    'Wins by stamina, not speed. Long snout, pointed ears, bushy tail. Trots all day until prey collapses.', 'wolf'),
  make('Foxkit', '🦊', 5.5, 'mammal', true, 2, 2, 1, 2, [],
    'Recreated from your portrait: oversized ears, bright binocular eyes, springy runner legs, cream chest fur, and a curled balancing tail.', 'foxkit',
    ['oversized ears', 'bushy balancing tail', 'springy runner legs', 'cream chest fur']),
  make('Lion', '🦁', 190, 'mammal', true, 1, 2, 1, 2, [],
    'Pride hunter. Males grow huge dark manes that signal genes + protect the neck. Females do most of the killing.', 'lion'),
  make('Polar bear', '🐻‍❄️', 450, 'mammal', true, 1, 1, 2, 2, ['thick-fur'],
    'Hollow fur traps body heat. Black skin under white fur. Swims for hours in -2°C water.', 'polarbear',
    ['hollow fur', 'black heat-absorbing skin', 'long-distance swimmer']),
  make('Snow leopard', '🐆', 50, 'mammal', true, 2, 2, 1, 2, ['thick-fur', 'camouflage'],
    'Lives above 3000 m. Tail almost as long as its body for balance on cliffs. Dark open-ring rosettes on pale fur.', 'snowleopard',
    ['insulating fur', 'rock camouflage', 'balancing tail']),
  make('Elephant', '🐘', 4000, 'mammal', true, 0, 2, 2, 1, [],
    'Lives 65 years. Mourns dead. Largest land brain on Earth. Trunk has 40,000+ muscles; tusks are continuously-growing incisors.', 'elephant'),
  make('Blue whale', '🐳', 100000, 'mammal', true, 0, 2, 2, 1, [],
    'The biggest animal that has ever lived. Heart beats once every 10 seconds when diving.', 'whale',
    ['deep-diving lungs', 'blubber', 'low-frequency sound']),
  make('Dolphin', '🐬', 200, 'mammal', true, 0, 3, 1, 2, ['echolocation'],
    'Recognizes itself in a mirror. Uses ultrasound to navigate murky water. EQ ~5 — second only to humans.', 'dolphin',
    ['echolocation', 'air-breathing diver', 'streamlined flippers']),
  make('Sloth', '🦥', 6, 'mammal', true, 0, 0, 1, 1, [],
    'Algae grows in its fur for camouflage. Moves 30 cm/min. Sleeps 18h a day.', 'sloth',
    ['algae fur symbiosis', 'hook claws', 'ultra-slow metabolism']),
  make('Kangaroo', '🦘', 60, 'mammal', true, 2, 1, 0, 1, [],
    'Hops at 70 km/h using elastic tendons. Tail acts as a fifth leg.', 'kangaroo'),
  make('Camel', '🐪', 600, 'mammal', true, 1, 1, 1, 1, [],
    'Survives 10% water loss (we die at 5%). Hump is fat, not water — burns it for energy + metabolic water.', 'camel'),
  make('Gorilla', '🦍', 180, 'mammal', true, 1, 2, 1, 2, [],
    'Mostly herbivorous despite huge canines. Brain ~500 g. Knuckle-walker: long arms, short legs.', 'gorilla'),
  make('Ostrich', '🪶', 110, 'bird', true, 2, 1, 0, 2, [],
    'Cannot fly — too heavy. Runs 70 km/h on two powerful clawed legs. Kicks can kill a lion.', 'ostrich'),
  make('Eagle', '🦅', 6, 'bird', true, 1, 2, 2, 2, [],
    'Sees small prey from 3 km away. Hooked beak, sharp talons. Strikes at 240 km/h in a dive.', 'eagle',
    ['powered flight', 'telescopic vision', 'talons']),
  make('Penguin', '🐧', 30, 'bird', true, 0, 1, 1, 2, ['thick-fur'],
    'Wings became flippers. Survives -40°C with feather + fat insulation.', 'penguin',
    ['flipper wings', 'dense waterproof feathers', 'air-breathing diver']),
  make('Owl', '🦉', 1.5, 'bird', true, 1, 2, 0, 2, ['camouflage'],
    'Silent flight. Huge forward-facing eyes (rare in birds). Hears a mouse moving under snow 30 m away.', 'owl',
    ['silent flight', 'binocular vision', 'asymmetric ears']),
  make('Tortoise', '🐢', 200, 'reptile', false, 0, 1, 2, 1, [],
    'Lives 150+ years. Heart beats ~10 bpm. Slow metabolism = long life. Shell is fused vertebrae + ribs.', 'tortoise'),
  make('Crocodile', '🐊', 700, 'reptile', false, 0, 1, 2, 2, [],
    'Bite force 16,000 N (lion: 4,000). Long jaw with interlocking teeth. Hasn\'t changed much in 200 million years.', 'crocodile',
    ['crushing bite', 'armored osteoderms', 'ambush hunter']),
  make('Chameleon', '🦎', 0.2, 'reptile', false, 1, 1, 0, 2, ['camouflage'],
    'Two eyes that move independently like turret cameras. Curled prehensile tail grips branches. Long sticky tongue snaps out 2× body length. Colour-change skin in 0.3 s.', 'chameleon',
    ['color-change skin', 'turret eyes', 'projectile tongue']),
  make('Anaconda', '🐍', 250, 'reptile', false, 0, 1, 1, 1, [],
    'Crushes prey 1.5× its own mass. Cold-blooded — needs sun to digest.', 'snake',
    ['constriction', 'heat-sensing pits', 'stretchy jaws']),
  make('Great white shark', '🦈', 1100, 'fish', false, 0, 1, 1, 2, [],
    'Detects electric fields from heartbeats. 300 serrated teeth in rows, replaced lifelong. Triangular dorsal fin + crescent tail.', 'shark',
    ['gills', 'electroreception', 'cartilage skeleton']),
  make('Octopus', '🐙', 5, 'fish', false, 0, 3, 0, 2, ['camouflage', 'venom'],
    '9 brains (one main + one per arm). Opens jars. Edits its own RNA. EQ ~2 — smartest invertebrate.', 'octopus',
    ['color-change skin', 'venomous bite', 'arm brains']),
  make('Velociraptor', '🦖', 20, 'reptile', false, 2, 2, 0, 2, [],
    'Pack hunter the size of a turkey. Feathered (Jurassic Park lied). Sickle claw could disembowel prey.', 'raptor',
    ['sickle claw', 'feathers', 'pack hunting']),
  make('Triceratops', '🦕', 6000, 'reptile', false, 0, 1, 2, 1, [],
    'Three-horned herbivore with a bony neck frill ~2 m wide. ~6 t. Lived alongside T-rex.', 'triceratops'),
  make('Stegosaurus', '🦕', 3500, 'reptile', false, 0, 0, 2, 1, [],
    'Plate-backed herbivore. Spiked tail (the thagomizer) for defence. Brain the size of a walnut.', 'stegosaurus'),
  make('Pterodactyl', '🦅', 5, 'bird', false, 0, 1, 0, 2, [],
    'Flying reptile, not a dinosaur. Wingspan ~1 m. Long toothless beak, head crest. Glided more than flapped.', 'pterodactyl',
    ['membrane wings', 'light bones', 'gliding flight']),
  make('Tiger', '🐯', 220, 'mammal', true, 2, 2, 1, 2, ['camouflage'],
    'Largest cat alive. Bold stripes break the silhouette in dappled jungle light. Solitary ambush hunter — drags prey twice its mass.', 'tiger',
    ['stripe camouflage', 'ambush sprint', 'retractile claws']),
  make('T-Rex', '🦖', 8000, 'reptile', false, 2, 2, 1, 2, [],
    'King of the cretaceous. Skull 1.5 m long with 30-cm teeth. Bite force ~57,000 N — strongest of any land animal ever. Arms shockingly tiny.', 'trex'),
  make('Jellyfish', '🪼', 1, 'fish', false, 0, 0, 0, 0, ['venom'],
    'Older than dinosaurs by 400 million years. 95% water, no brain, no heart, no bones. Stinging cells fire in milliseconds.', 'jellyfish',
    ['stinging cells', 'nerve net', 'gelatinous body']),
  make('Sheep', '🐏', 80, 'mammal', true, 1, 1, 1, 1, ['thick-fur'],
    'Domesticated ~10,000 years ago. Ram horns curl backward in a spiral — keratin that keeps growing, can reach 50 cm. Wool fleece insulates against -20°C. Horizontal-slit pupils give nearly 360° vision.', 'sheep',
    ['curled keratin horns', 'wool fleece', 'horizontal-slit pupils']),
  make('Cow', '🐄', 650, 'mammal', true, 1, 1, 2, 1, [],
    'Big horns + 650 kg of muscle = real defense. Four-chamber stomach ferments grass with bacteria. Sees almost 360° and can smell predators 10 km away. Domesticated cattle still carry the bull\'s defensive horns in many breeds.', 'cow',
    ['forward-curving horns', '4-chamber stomach', '360° panoramic vision']),
  make('Horse', '🐎', 500, 'mammal', true, 2, 1, 1, 2, [],
    'Built to run — top speed 70 km/h and 40+ km of endurance. Eyes on the sides give nearly 350° vision. Tall pointed ears swivel independently to track sound. Domesticated ~6,000 years ago; reshaped human civilization.', 'horse',
    ['runner legs', 'panoramic vision', 'swiveling ears']),
  make('Pig', '🐖', 150, 'mammal', true, 1, 2, 1, 1, [],
    'Smarter than dogs — pigs solve mirror puzzles and remember faces for years. Disk snout is a sense organ packed with 20,000 nerve endings; they root, smell truffles a metre underground, and feel temperature with it. Cloven hooves descend from same toe pattern as cows and deer.', 'pig',
    ['disk snout (20k nerves)', 'cloven hooves', 'big-brain mammal']),
  make('Giraffe', '🦒', 1200, 'mammal', true, 2, 1, 1, 2, [],
    'Tallest land animal — 5-6 m. Still only 7 neck vertebrae like every mammal, but each one is huge. Heart weighs 11 kg and pumps at 280 mm Hg — needed to push blood up 2 m to the brain. Tongue is dark blue-purple, 50 cm long, prehensile.', 'giraffe',
    ['7 giant neck vertebrae', '11 kg heart', '50 cm prehensile tongue']),
  make('Rooster', '🐓', 3, 'bird', true, 1, 0, 1, 2, [],
    'Domesticated jungle fowl. Sharp leg SPURS for fighting — males duel for hens. Tall red comb + dangling wattles regulate body temperature (the bigger and redder, the healthier). Crows at dawn at ~90 dB.', 'rooster',
    ['leg spurs', 'crowing call', 'temperature-regulating comb']),
  make('Donkey', '🐴', 250, 'mammal', true, 1, 2, 1, 2, [],
    'Smarter than horses and famously stubborn — a "stubborn" donkey is one that has assessed the situation and decided NO. Long ears regulate heat and pick up sound 60 km away. The dark "donkey cross" on the back is real anatomy. Carries up to 30% of body weight all day.', 'donkey',
    ['enormous heat-radiating ears', 'donkey-cross stripe', 'big-brain stubbornness']),
  make('Rhino', '🦏', 2300, 'mammal', true, 1, 1, 2, 1, [],
    '2nd-biggest land animal after the elephant. The front horn is keratin (same as fingernails), no bone — and grows up to 1.5 m. Skin armor folds 2 cm thick. Charges at 50 km/h despite the bulk. Sees poorly but smells in 360°.', 'rhino',
    ['keratin horn', '2 cm armor skin', 'square mouth for grazing']),
  make('Cat', '🐱', 4, 'mammal', true, 2, 1, 0, 2, [],
    'Smallest cat alive — a domesticated tabby. Sees 6× better than humans in low light. Retractable claws stay sharp. Whiskers map space precisely. Purrs at 25-50 Hz, a frequency that helps bones heal.', 'cat',
    ['retractable claws', 'slit pupils for night vision', 'purr at 25-50 Hz']),
  make('Dog', '🐶', 25, 'mammal', true, 1, 1, 1, 2, [],
    'Domesticated wolf — diverged ~20,000 years ago. 300 million scent receptors (vs human 6 million). Reads human emotion from face + voice. Can learn 165+ words; collies push 1,000.', 'dog',
    ['300M scent receptors', 'wags emotion', 'social-bonding eye contact']),
  make('Goat', '🐐', 70, 'mammal', true, 2, 1, 2, 1, [],
    'Lives almost anywhere — Himalayas, deserts, sea cliffs. Cloven hooves grip rough rock; can climb near-vertical cliffs. Horizontal pupils give a 320° view. Headbutts with backward-curving horns. Beard grows from a special gland.', 'goat',
    ['cliff-climbing hooves', 'horizontal pupils (320°)', 'backward-curving horns']),
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
