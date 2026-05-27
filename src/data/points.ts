import type { Creature } from '../types';
import type { ArenaResult } from './insights';
import type { Venue } from './battle';
import { comboEffects } from './hybridCombos';

// ─── Per-creature points system ─────────────────────────────────────────
//
// Rules (from Dan, May 2026):
//   • Each creature earns points for every competition it WINS.
//   • Difficulty determines how many points — Deep dive worth more than a
//     Chase, harder generations worth more, harder strategies worth more.
//   • The EXACT SAME configuration cannot earn points on the EXACT SAME
//     competition under the EXACT SAME conditions twice. Renaming doesn't
//     help — identity is the trait fingerprint, not the name.
//   • Different conditions count as different competitions: catching a
//     kangaroo is different from catching a rabbit; the Savanna lion is
//     different from the Ocean shark; battling a tiger is different from
//     battling a sheep.
//
// Storage shape:
//   critter-forge:points → {
//     totalPoints: number,
//     byCreature: { [hash]: { hash, name, totalPoints, awards[] } }
//   }

const KEY = 'critter-forge:points';

export interface PointAward {
  challengeKey: string;
  points: number;
  difficulty: number;
  date: number;
  description: string;
}

export interface CreaturePoints {
  hash: string;
  name: string;       // most recent name we saw for this fingerprint
  totalPoints: number;
  awards: PointAward[];
}

interface PointsState {
  byCreature: Record<string, CreaturePoints>;
  totalPoints: number;
}

// Deterministic fingerprint — every trait that affects gameplay, sorted
// hybrids for stability. Name is NOT included by design (a player who
// renames the same critter shouldn't be able to farm it twice).
export function creatureHash(c: Creature): string {
  return [
    `sz${c.sizeUnit}`,
    c.bodyPlan,
    c.warmBlooded ? 'w' : 'c',
    `L${c.legTier}`,
    `B${c.brainTier}`,
    `D${c.defenseTier}`,
    `S${c.sensorTier}`,
    [...c.hybrids].sort().join(','),
  ].join('|');
}

function load(): PointsState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { byCreature: {}, totalPoints: 0 };
    const parsed = JSON.parse(raw);
    return { byCreature: parsed.byCreature ?? {}, totalPoints: parsed.totalPoints ?? 0 };
  } catch {
    return { byCreature: {}, totalPoints: 0 };
  }
}

function save(s: PointsState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore quota */
  }
}

export interface AwardResult {
  awarded: boolean;
  pointsThisAward: number;
  totalForCreature: number;
  reason: 'new' | 'duplicate';
  description: string;
}

// Award only if (hash, challengeKey) hasn't been seen before for this creature.
export function awardPoints(
  creature: Creature,
  challengeKey: string,
  points: number,
  difficulty: number,
  description: string,
): AwardResult {
  // Apex combos (currently apex-dragon) multiply every points award.
  const pointsMult = comboEffects(creature).pointsMultiplier ?? 1;
  if (pointsMult !== 1) points = Math.round(points * pointsMult);

  const hash = creatureHash(creature);
  const state = load();
  const existing: CreaturePoints = state.byCreature[hash] ?? {
    hash,
    name: creature.name,
    totalPoints: 0,
    awards: [],
  };
  if (existing.awards.some((a) => a.challengeKey === challengeKey)) {
    return {
      awarded: false,
      pointsThisAward: 0,
      totalForCreature: existing.totalPoints,
      reason: 'duplicate',
      description,
    };
  }
  const newAward: PointAward = {
    challengeKey,
    points,
    difficulty,
    date: Date.now(),
    description,
  };
  const updated: CreaturePoints = {
    hash,
    name: creature.name || existing.name,
    totalPoints: existing.totalPoints + points,
    awards: [...existing.awards, newAward],
  };
  const next: PointsState = {
    byCreature: { ...state.byCreature, [hash]: updated },
    totalPoints: state.totalPoints + points,
  };
  save(next);
  return {
    awarded: true,
    pointsThisAward: points,
    totalForCreature: updated.totalPoints,
    reason: 'new',
    description,
  };
}

// Arena base values — Deep is the hardest single-creature challenge,
// drought / hunt / chase / climb / maze are roughly equal.
const ARENA_BASE: Record<string, number> = {
  chase: 3,
  hunt: 3,
  climb: 3,
  drought: 3,
  deep: 4,
  maze: 3,
};

interface PointsSpec {
  challengeKey: string;
  points: number;
  difficulty: number;
  description: string;
}

// Turn an arena win into a points award spec. Returns null on a loss
// (no points for losing — points are only for victories).
export function pointsForArenaResult(r: ArenaResult, generation: number): PointsSpec | null {
  if (!r.won) return null;
  const base = ARENA_BASE[r.arena] ?? 1;
  const genMult = 1 + (generation - 1) * 0.1;
  let specificMult = 1;
  let key = `arena-${r.arena}-gen${generation}`;
  let description = `Won ${capitalize(r.arena)} (Gen ${generation})`;

  switch (r.arena) {
    case 'chase':
      if (r.preyId) {
        // Biome is part of the key — same prey in a different biome is a
        // fresh challenge with its own award. Difficulty scales by both.
        const biome = r.biome ?? 'savanna';
        const biomeMult = biome === 'night' ? 1.9
          : biome === 'desert' ? 1.6
          : biome === 'tundra' ? 1.5
          : biome === 'forest' ? 1.3
          : 1.0;
        const preyMult = r.preyId === 'kangaroo' ? 1.6 : r.preyId === 'gazelle' ? 1.2 : 1.0;
        key = `arena-chase-${biome}-gen${generation}-${r.preyId}`;
        specificMult = preyMult * biomeMult;
        description = `Caught ${r.preyId} in ${biome} (Gen ${generation})`;
      }
      break;
    case 'hunt':
      if (r.env && r.strategy) {
        // Each biome × strategy × difficulty combo is its own challenge.
        const diff = r.difficulty ?? 'normal';
        const diffMult = diff === 'apex' ? 2.2 : diff === 'tough' ? 1.5 : 1.0;
        key = `arena-hunt-${r.env}-${r.strategy}-${diff}`;
        const stratMult = r.strategy === 'fight' ? 1.5 : r.strategy === 'run' ? 1.2 : 1.0;
        specificMult = stratMult * diffMult;
        description = `Beat ${r.env} ${diff !== 'normal' ? `(${diff}) ` : ''}${r.strategy === 'hide' ? '(hidden)' : r.strategy === 'run' ? '(outran)' : '(fought)'}`;
      }
      break;
    case 'drought':
      {
        const sev = r.severity ?? 'dry';
        const sevMult = sev === 'apocalypse' ? 2.3 : sev === 'megadrought' ? 1.8 : sev === 'drought' ? 1.4 : 1.0;
        key = `arena-drought-${sev}-gen${generation}`;
        specificMult = (1 + Math.min(2, r.daysSurvived / 14)) * sevMult;
        description = `Survived ${r.daysSurvived}-day ${sev} (Gen ${generation})`;
      }
      break;
    case 'deep':
      // Single Deep arena, but deeper dives are harder challenges.
      // Bucket the depth in 200m steps so deeper records count as new.
      {
        const bucket = Math.floor(r.maxDepth / 200) * 200;
        key = `arena-deep-${bucket}`;
        specificMult = 1 + Math.min(3, r.maxDepth / 500);
        description = `Foraged at ${r.maxDepth}m`;
      }
      break;
    case 'maze':
      // Bucket maze efficiency — finishing in <20 steps is a different
      // achievement than just finishing.
      {
        const bucket = r.stepsTaken < 20 ? 'fast' : r.stepsTaken < 30 ? 'med' : 'slow';
        key = `arena-maze-${bucket}`;
        specificMult = 1 + Math.max(0, (r.stepsNeeded - r.stepsTaken) / 30);
        description = `Escaped maze in ${r.stepsTaken} steps`;
      }
      break;
    case 'climb':
      {
        const terr = r.terrain ?? 'alpine';
        const terrMult = terr === 'aurora' ? 2.2 : terr === 'glacial' ? 1.8 : terr === 'volcanic' ? 1.5 : 1.0;
        key = `arena-climb-${terr}-gen${generation}`;
        specificMult = terrMult;
        description = `Summited ${terr} (Gen ${generation})`;
      }
      break;
  }

  const difficulty = base * genMult * specificMult;
  const points = Math.max(1, Math.round(difficulty));
  return { challengeKey: key, points, difficulty, description };
}

const VENUE_BASE: Record<string, number> = {
  brawl: 4,
  race: 3,
  maze: 3,
  dive: 4,
};

// Battle win — opponent identity + venue determine the conditions. Beating
// a heavier opponent is worth more (mass ratio scales the difficulty).
export function pointsForBattleWin(winner: Creature, opponent: Creature, venue: Venue): PointsSpec {
  const base = VENUE_BASE[venue] ?? 3;
  const winnerMass = sizeUnitToMass(winner.sizeUnit);
  const oppMass = sizeUnitToMass(opponent.sizeUnit);
  const ratio = Math.max(0.4, Math.min(5, oppMass / winnerMass));
  const massMult = 0.6 + 0.4 * ratio;
  const difficulty = base * massMult;
  const points = Math.max(1, Math.round(difficulty));
  return {
    challengeKey: `battle-${venue}-vs-${creatureHash(opponent)}`,
    points,
    difficulty,
    description: `Beat ${opponent.name || 'rival'} in ${venue}`,
  };
}

// Helpers
function sizeUnitToMass(sizeUnit: number): number {
  // Mirror src/physics.ts sizeToMass; duplicated here to keep the points
  // module free of cross-module physics imports (faster load).
  const minLog = Math.log10(0.01);
  const maxLog = Math.log10(100000);
  const log = minLog + (sizeUnit / 100) * (maxLog - minLog);
  return Math.pow(10, log);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Read APIs (for UI) ─────────────────────────────────────────────────

export function loadPointsState(): PointsState {
  return load();
}

export function getCreaturePoints(c: Creature): CreaturePoints | null {
  const hash = creatureHash(c);
  return load().byCreature[hash] ?? null;
}

export function getLeaderboard(limit = 10): CreaturePoints[] {
  const state = load();
  return Object.values(state.byCreature)
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, limit);
}

export function hasEarned(creature: Creature, challengeKey: string): boolean {
  const hash = creatureHash(creature);
  const entry = load().byCreature[hash];
  if (!entry) return false;
  return entry.awards.some((a) => a.challengeKey === challengeKey);
}

// ─── Hybrid unlocks ─────────────────────────────────────────────────────
// Mythic hybrids unlock at global point thresholds. Once total points
// across all creatures crosses a threshold, the hybrid becomes available
// in the Builder for every future creature.

export interface HybridUnlock {
  id: 'firebreath' | 'stoneskin' | 'hypersonic' | 'dragon';
  emoji: string;
  name: string;
  cost: number;
  blurb: string;
}

export const HYBRID_UNLOCKS: HybridUnlock[] = [
  { id: 'firebreath', emoji: '🔥', name: 'Fire breath', cost: 10,   blurb: '+brawl damage, scares prey in Chase' },
  { id: 'stoneskin',  emoji: '🪨', name: 'Stone skin',  cost: 30,   blurb: 'Big defense without the speed penalty' },
  { id: 'hypersonic', emoji: '⚡', name: 'Hypersonic',  cost: 150,  blurb: '+25% top speed, beats most prey' },
  { id: 'dragon',     emoji: '🐉', name: 'Dragon mode', cost: 500,  blurb: 'Wings + fire + scales + brain — all in one' },
];

const UNLOCKABLE_IDS = new Set(HYBRID_UNLOCKS.map((u) => u.id));

export function isUnlockableHybrid(id: string): boolean {
  return UNLOCKABLE_IDS.has(id as HybridUnlock['id']);
}

export function unlockedHybridIds(): Set<string> {
  const total = loadPointsState().totalPoints;
  return new Set(
    HYBRID_UNLOCKS.filter((h) => total >= h.cost).map((h) => h.id),
  );
}

export function isHybridUnlocked(id: string): boolean {
  if (!UNLOCKABLE_IDS.has(id as HybridUnlock['id'])) return true; // base 9 are always free
  return unlockedHybridIds().has(id);
}

export function nextHybridUnlock(): HybridUnlock | null {
  const total = loadPointsState().totalPoints;
  return HYBRID_UNLOCKS.find((h) => total < h.cost) ?? null;
}

// ─── Bracket entry fees + champion bonus ────────────────────────────────
// Bracket tournaments require every entrant to clear a minimum personal
// score; the champion earns a fat reward.

export interface BracketRules {
  minPointsPerEntrant: number;
  championBonus: number;
}

export function bracketRules(size: 4 | 8): BracketRules {
  return size === 8
    ? { minPointsPerEntrant: 25, championBonus: 200 }
    : { minPointsPerEntrant: 10, championBonus: 50 };
}

export function getCreatureTotal(c: Creature): number {
  return getCreaturePoints(c)?.totalPoints ?? 0;
}
