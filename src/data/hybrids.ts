import type { Hybrid } from '../types';

export interface HybridInfo {
  id: Hybrid;
  name: string;
  emoji: string;
  fact: string;
}

export const hybridCatalog: HybridInfo[] = [
  {
    id: 'echolocation',
    name: 'Echolocation',
    emoji: '🦇',
    fact: 'Bats and dolphins ping the world with sound — works in darkness and under water.',
  },
  {
    id: 'wings',
    name: 'Wings',
    emoji: '🦅',
    fact: 'Flight is metabolically expensive. A hummingbird burns ~10× more kcal/kg than a runner — that\'s why no flying elephant exists.',
  },
  {
    id: 'venom',
    name: 'Venom',
    emoji: '🐍',
    fact: 'Lets a small predator drop huge prey — a 50 g snake can take down a 100 kg deer.',
  },
  {
    id: 'electric',
    name: 'Electric organs',
    emoji: '⚡',
    fact: 'Electric eels generate ~600 volts. Producing the discharge costs about a third of the eel\'s daily energy.',
  },
  {
    id: 'camouflage',
    name: 'Camouflage',
    emoji: '🦎',
    fact: 'Octopi change skin colour in ~0.3 seconds using millions of pigment cells.',
  },
  {
    id: 'antifreeze',
    name: 'Antifreeze blood',
    emoji: '🧊',
    fact: 'Arctic fish make sugar proteins that block ice crystals — they live in -2°C salt water.',
  },
  {
    id: 'thick-fur',
    name: 'Thick fur',
    emoji: '🦣',
    fact: 'Musk-ox underfur is ~8× warmer per gram than sheep wool — but heavy and drag-prone.',
  },
  {
    id: 'gills',
    name: 'Gills',
    emoji: '🐟',
    fact: 'Gills pull O₂ from water — but water carries ~30× less O₂ than air, so water flow must be much faster.',
  },
  {
    id: 'symbiosis',
    name: 'Symbiotic partner',
    emoji: '🤝',
    fact: 'Clownfish in anemones, oxpeckers on buffalo, gut bacteria — cooperation rivals competition as a survival strategy.',
  },
  // ─── Unlockable (mythic) hybrids ────────────────────────────────────
  // Real animals don't do these — they're earned by playing, gated behind
  // global point totals in data/points.ts HYBRID_UNLOCKS.
  {
    id: 'firebreath',
    name: 'Fire breath',
    emoji: '🔥',
    fact: 'No real animal breathes fire, but the Bombardier Beetle sprays a 100°C jet of quinones at 500 pulses/sec. Close enough.',
  },
  {
    id: 'stoneskin',
    name: 'Stone skin',
    emoji: '🪨',
    fact: 'Pangolins wear overlapping keratin scales; tortoise shells fuse ribs into armor. Stone skin extends the pattern — full defense without slowing you down.',
  },
  {
    id: 'hypersonic',
    name: 'Hypersonic',
    emoji: '⚡',
    fact: 'Real top: peregrine falcon 390 km/h in a dive. Hypersonic blows past that — speed cheats the square-cube limit.',
  },
  {
    id: 'dragon',
    name: 'Dragon mode',
    emoji: '🐉',
    fact: 'The legendary apex. Wings, fire, scales, big brain — every mythic upgrade rolled into one. Costs almost as much food as it grants in glory.',
  },
  {
    id: 'photosynthesis',
    name: 'Photosynthesis',
    emoji: '🌿',
    fact: 'Sea slugs steal chloroplasts from algae and live off sunlight for months. Sloths grow algae in their fur. This trait lets your creature gain food from sun — drought becomes way easier.',
  },
  {
    id: 'regeneration',
    name: 'Regeneration',
    emoji: '🦎',
    fact: 'Axolotls regrow entire limbs in weeks. Starfish regrow from a single arm. Planarian flatworms cut in half become two complete worms. Heal mid-fight in Hunt.',
  },
  {
    id: 'bioluminescence',
    name: 'Bioluminescence',
    emoji: '✨',
    fact: 'Anglerfish dangle a glowing lure in the abyss; fireflies signal mates; deep-sea squid blast brilliant flashes to confuse predators. Light up the Deep — and dazzle attackers.',
  },
  {
    id: 'mimicry',
    name: 'Mimicry',
    emoji: '🎭',
    fact: 'The mimic octopus can shape-shift to look like 15 different species including poison fish and sea snakes. Viceroy butterflies copy toxic Monarchs. Confuse predators in Hunt.',
  },
  {
    id: 'hibernation',
    name: 'Hibernation',
    emoji: '😴',
    fact: 'Ground squirrels drop their heart rate to 5 bpm and body temperature below freezing for months. Bears sleep through winter. Your creature can wait out the worst of the Drought.',
  },
];

export const MAX_HYBRIDS = 2;
