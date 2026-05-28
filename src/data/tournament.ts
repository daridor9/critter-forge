import type { ArenaResult } from './insights';
import type { Creature } from '../types';
import { computeStats } from '../physics';

export type ArenaId = 'chase' | 'hunt' | 'climb' | 'drought' | 'deep' | 'maze' | 'storm' | 'nest' | 'migrate' | 'plague';

// Storm is excluded from the tournament 6-arena rotation by design — it's
// a standalone challenge. The tournament keeps its original 6 to preserve
// existing save data + the 6/6 apex achievement.
export const TOURNAMENT_ORDER: ArenaId[] = ['chase', 'hunt', 'climb', 'drought', 'deep', 'maze'];

export const ARENA_LABELS: Record<ArenaId, { label: string; emoji: string }> = {
  storm:   { label: 'The Storm',   emoji: '🌪️' },
  nest:    { label: 'The Nest',    emoji: '🥚' },
  migrate: { label: 'The Migration', emoji: '🏛' },
  plague:  { label: 'The Plague',  emoji: '🦟' },
  chase:   { label: 'The Chase',   emoji: '🦌' },
  hunt:    { label: 'The Hunt',    emoji: '🌳' },
  climb:   { label: 'The Climb',   emoji: '🏔' },
  drought: { label: 'The Drought', emoji: '☀️' },
  deep:    { label: 'The Deep',    emoji: '🌊' },
  maze:    { label: 'The Maze',    emoji: '🧩' },
};

const BASE_POINTS: Record<ArenaId, number> = {
  chase:   3,
  hunt:    3,
  climb:   3,
  drought: 3,
  deep:    4,
  maze:    3,
  storm:   4,    // tornado is brutal; reflects it
  nest:    3,
  migrate: 4,    // 800km is a long haul
  plague:  3,
};

export function difficultyFor(arena: ArenaId, generation: number): number {
  const genMult = 1 + (generation - 1) * 0.1;
  return Math.round(BASE_POINTS[arena] * genMult * 10) / 10;
}

export function scoreArena(r: ArenaResult, generation: number): number {
  if (!r.won) return 0;
  return difficultyFor(r.arena as ArenaId, generation);
}

export interface RoundResult {
  arena: ArenaId;
  won: boolean;
  points: number;
  difficulty: number;
}

export interface TournamentState {
  round: number;
  results: RoundResult[];
  phase: 'playing' | 'between-rounds' | 'finished';
  generation: number;
}

export const MEDAL_NAMES: Record<ArenaId, string> = {
  chase:   'Gazelle-Catcher',
  hunt:    'Shadow-Stalker',
  climb:   'Summit-Climber',
  drought: 'Drought-Survivor',
  deep:    'Abyss-Diver',
  maze:    'Maze-Solver',
  storm:   'Wind-Defier',
  nest:    'Egg-Guardian',
  migrate: 'Trail-Blazer',
  plague:  'Plague-Survivor',
};

export interface FinalRank {
  title: string;
  emoji: string;
  flavor: string;
}

export function finalRank(totalPoints: number, winsCount: number): FinalRank {
  if (winsCount === 6 && totalPoints >= 25) {
    return { title: 'Apex Designer of the Bio-Cosmos', emoji: '👑', flavor: 'You won every arena across multiple generations. Geoffrey West would shake your hand.' };
  }
  if (winsCount === 6) {
    return { title: 'Grand Champion', emoji: '🏆', flavor: 'A perfect run — every arena conquered.' };
  }
  if (winsCount >= 5) {
    return { title: 'Champion', emoji: '🥇', flavor: 'Five arenas mastered. A creature for almost any world.' };
  }
  if (winsCount >= 4) {
    return { title: 'Skilled Adapter', emoji: '🥈', flavor: 'Four wins — your design handles most pressures.' };
  }
  if (winsCount >= 2) {
    return { title: 'Survivor', emoji: '🥉', flavor: 'Your creature found its niches. Specialists thrive in the right place.' };
  }
  if (winsCount >= 1) {
    return { title: 'Honorable Mention', emoji: '🎖', flavor: 'One arena won — every creature has its world.' };
  }
  return { title: 'Brave Beginner', emoji: '🌱', flavor: 'The arenas tested your design. Mutate, return, and try again — that is evolution.' };
}

export function creatureEpithet(c: Creature): string {
  const s = computeStats(c);
  if (c.defenseTier === 2) return 'the Iron';
  if (c.legTier === 2 && s.topSpeedKmh > 100) return 'the Swift';
  if (c.brainTier === 3) return 'the Genius';
  if (c.brainTier === 2) return 'the Cunning';
  if (s.lifespanYears >= 40) return 'the Ancient';
  if (s.massKg < 1) return 'the Tiny';
  if (s.massKg > 1000) return 'the Mighty';
  if (c.hybrids.includes('camouflage')) return 'the Unseen';
  if (c.hybrids.includes('wings')) return 'the Soaring';
  if (c.hybrids.includes('venom')) return 'the Venomous';
  return 'the Brave';
}
