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
];

export const MAX_HYBRIDS = 2;
