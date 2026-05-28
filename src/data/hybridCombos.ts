import type { Creature, Hybrid } from '../types';

// ─── Hybrid combo synergies ─────────────────────────────────────────────
// Specific pairs of hybrids unlock bonus effects across arenas + battles.
// Adam learns this by running the dex (e.g. the Bat has wings + echo
// for a reason — it's the original sonar-flight combo).

export interface HybridCombo {
  id: string;
  hybrids: [Hybrid, Hybrid];
  name: string;
  emoji: string;
  description: string;
  effects: {
    mazeStaminaBonus?: number;    // +N stamina-budget points in Maze
    brawlPowerBonus?: number;     // +N attack power in Battle Brawl
    huntHideBonus?: number;       // +N stealth score in Hunt Hide
    huntFightBonus?: number;      // +N fight score in Hunt Fight
    chaseSpeedMult?: number;      // multiplier on Chase top speed
    deepBreathBonus?: number;     // multiplier on Deep breath capacity
    droughtFoodMult?: number;     // multiplier reducing Drought food need
    climbBonus?: number;          // +N energy in Climb
    pointsMultiplier?: number;    // multiplier applied to ALL arena/battle wins
  };
}

export const HYBRID_COMBOS: HybridCombo[] = [
  {
    id: 'bat-sonar',
    hybrids: ['wings', 'echolocation'],
    name: 'Bat sonar flight',
    emoji: '🦇',
    description: 'Wings + echolocation = blind navigation. +25 maze stamina, +15 hide score.',
    effects: { mazeStaminaBonus: 25, huntHideBonus: 15 },
  },
  {
    id: 'electric-eel',
    hybrids: ['electric', 'gills'],
    name: 'Electric eel',
    emoji: '⚡',
    description: 'Electric + gills = water-amplified shock. +30 brawl power, +10 hunt fight.',
    effects: { brawlPowerBonus: 30, huntFightBonus: 10 },
  },
  {
    id: 'ambush-hunter',
    hybrids: ['camouflage', 'venom'],
    name: 'Ambush hunter',
    emoji: '🐍',
    description: 'Camo + venom = strike from cover. +25 hide score, +15 fight.',
    effects: { huntHideBonus: 25, huntFightBonus: 15 },
  },
  {
    id: 'arctic-survivor',
    hybrids: ['antifreeze', 'thick-fur'],
    name: 'Arctic-adapted',
    emoji: '🥶',
    description: 'Antifreeze + thick fur = full polar kit. +25% drought food efficiency, +40 climb energy.',
    effects: { droughtFoodMult: 0.8, climbBonus: 40 },
  },
  {
    id: 'symbiote-network',
    hybrids: ['symbiosis', 'echolocation'],
    name: 'Symbiote network',
    emoji: '🤝',
    description: 'Partner + echolocation = warned about danger. +30 maze stamina, +15 hide.',
    effects: { mazeStaminaBonus: 30, huntHideBonus: 15 },
  },
  // Mythic-tier combos (require unlockables)
  {
    id: 'hypersonic-flyer',
    hybrids: ['wings', 'hypersonic'],
    name: 'Hypersonic flyer',
    emoji: '🚀',
    description: 'Wings + hypersonic = peregrine x10. +40% chase speed, +15 brawl power.',
    effects: { chaseSpeedMult: 1.4, brawlPowerBonus: 15 },
  },
  {
    id: 'stone-tank',
    hybrids: ['stoneskin', 'thick-fur'],
    name: 'Stone tank',
    emoji: '🏰',
    description: 'Stone skin + thick fur = walking fortress. +25 brawl power, +30 climb energy.',
    effects: { brawlPowerBonus: 25, climbBonus: 30 },
  },
  {
    id: 'volcanic-breath',
    hybrids: ['firebreath', 'stoneskin'],
    name: 'Volcanic breath',
    emoji: '🌋',
    description: 'Fire + stone skin = lava-tier offense. +40 brawl power, +20 fight.',
    effects: { brawlPowerBonus: 40, huntFightBonus: 20 },
  },
  {
    id: 'apex-dragon',
    hybrids: ['dragon', 'firebreath'],
    name: 'Apex dragon',
    emoji: '🐉',
    description: 'Dragon + fire breath = mythic apex. +50 brawl, +25% chase speed, +1.3× point multiplier.',
    effects: { brawlPowerBonus: 50, chaseSpeedMult: 1.25, pointsMultiplier: 1.3 },
  },
  {
    id: 'sonar-genius',
    hybrids: ['echolocation', 'hypersonic'],
    name: 'Sonar genius',
    emoji: '🎯',
    description: 'Echolocation + hypersonic = sees everything, catches anything. +40 maze stamina, +30% chase speed.',
    effects: { mazeStaminaBonus: 40, chaseSpeedMult: 1.3 },
  },
  // ─── New biology combos using the niche-trait batch ──────────────────
  {
    id: 'green-survivor',
    hybrids: ['photosynthesis', 'hibernation'],
    name: 'Eternal survivor',
    emoji: '🌿',
    description: 'Eat sun + sleep through bad times = ultimate drought-proof. 2× drought food, +30 climb energy.',
    effects: { droughtFoodMult: 2.0, climbBonus: 30 },
  },
  {
    id: 'mimic-octopus',
    hybrids: ['mimicry', 'camouflage'],
    name: 'Phantom shapeshifter',
    emoji: '🎭',
    description: 'Mimicry + camo = vanish from any predator. +60 hunt-hide, half maze stamina cost.',
    effects: { huntHideBonus: 60, mazeStaminaBonus: 30 },
  },
  {
    id: 'abyss-lantern',
    hybrids: ['bioluminescence', 'gills'],
    name: 'Abyss lantern',
    emoji: '✨',
    description: 'Glow + gills = thrive in the lightless deep. 2.5× deep breath, +25 maze stamina.',
    effects: { deepBreathBonus: 2.5, mazeStaminaBonus: 25 },
  },
  {
    id: 'undying-tank',
    hybrids: ['regeneration', 'stoneskin'],
    name: 'Undying tank',
    emoji: '🦎',
    description: 'Regrow + armor = nothing kills you. +40 brawl power, +25 climb energy, +20 hunt-fight.',
    effects: { brawlPowerBonus: 40, climbBonus: 25, huntFightBonus: 20 },
  },
];

// Returns the first matching combo for a creature's hybrids, or null
// if no combo applies. Each creature has at most one active combo
// (since hybrids cap at 2, only one pair can exist at a time).
export function getActiveCombo(c: Creature): HybridCombo | null {
  if (c.hybrids.length < 2) return null;
  for (const combo of HYBRID_COMBOS) {
    if (combo.hybrids.every((h) => c.hybrids.includes(h))) return combo;
  }
  return null;
}

// Aggregated effects from any active combo on the creature.
export function comboEffects(c: Creature): NonNullable<HybridCombo['effects']> {
  const combo = getActiveCombo(c);
  return combo?.effects ?? {};
}
