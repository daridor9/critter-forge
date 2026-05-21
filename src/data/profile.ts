import type { ArenaResult } from './insights';

// Per-encounter detail tracking — Hunt is the only arena with multiple
// biome×strategy combinations, so it gets its own record. Others get
// "best of" record-fields (deepest dive, longest drought, fastest maze).
export interface HuntStratStats {
  wins: number;
  losses: number;
}
export interface HuntBiomeStats {
  wins: number;
  losses: number;
  byStrategy: {
    hide: HuntStratStats;
    run: HuntStratStats;
    fight: HuntStratStats;
  };
}
export interface BattleVenueStats {
  wins: number;
  losses: number;
  draws: number;
}

export interface PlayerProfile {
  testsRun: number;
  totalWins: number;
  totalLosses: number;
  winsByArena: Record<string, number>;
  lossesByArena: Record<string, number>;
  generationsTotal: number;
  tournamentsCompleted: number;
  bestTournamentPoints: number;
  creaturesSaved: number;
  creaturesEvolved: number;
  creaturesBred: number;
  totalChaseKcal: number;
  preysCaught: Record<string, number>;
  sharedImported: number;

  // Records — best result per arena.
  bestDeepDepth: number;        // deepest dive that won (m)
  bestDroughtDays: number;      // longest drought survived (days)
  fastestMazeSteps: number;     // fewest steps on a maze win (Infinity if none)
  bestChaseKcal: number;        // biggest single Chase reward
  currentHuntStreak: number;
  longestHuntStreak: number;

  // Per-Hunt-biome × per-strategy detail.
  huntByBiome: Record<string, HuntBiomeStats>;

  // Battle modal results, keyed by venue.
  battleByVenue: Record<string, BattleVenueStats>;
  totalBattles: number;

  firstPlayedAt: number;        // ms epoch of first arena run
  lastPlayedAt: number;
}

const KEY = 'critter-forge:profile';

export const EMPTY: PlayerProfile = {
  testsRun: 0,
  totalWins: 0,
  totalLosses: 0,
  winsByArena: {},
  lossesByArena: {},
  generationsTotal: 0,
  tournamentsCompleted: 0,
  bestTournamentPoints: 0,
  creaturesSaved: 0,
  creaturesEvolved: 0,
  creaturesBred: 0,
  totalChaseKcal: 0,
  preysCaught: {},
  sharedImported: 0,
  bestDeepDepth: 0,
  bestDroughtDays: 0,
  fastestMazeSteps: 0,
  bestChaseKcal: 0,
  currentHuntStreak: 0,
  longestHuntStreak: 0,
  huntByBiome: {},
  battleByVenue: {},
  totalBattles: 0,
  firstPlayedAt: 0,
  lastPlayedAt: 0,
};

const EMPTY_HUNT_BIOME: HuntBiomeStats = {
  wins: 0, losses: 0,
  byStrategy: {
    hide: { wins: 0, losses: 0 },
    run: { wins: 0, losses: 0 },
    fight: { wins: 0, losses: 0 },
  },
};

export function loadProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    return { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    return { ...EMPTY };
  }
}

function save(p: PlayerProfile): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

function update(fn: (p: PlayerProfile) => PlayerProfile): PlayerProfile {
  const next = fn(loadProfile());
  save(next);
  return next;
}

export function recordArena(r: ArenaResult): PlayerProfile {
  return update((p) => {
    const key = r.arena;
    const now = Date.now();
    const next: PlayerProfile = {
      ...p,
      testsRun: p.testsRun + 1,
      totalWins: p.totalWins + (r.won ? 1 : 0),
      totalLosses: p.totalLosses + (r.won ? 0 : 1),
      winsByArena: { ...p.winsByArena, [key]: (p.winsByArena[key] ?? 0) + (r.won ? 1 : 0) },
      lossesByArena: { ...p.lossesByArena, [key]: (p.lossesByArena[key] ?? 0) + (r.won ? 0 : 1) },
      firstPlayedAt: p.firstPlayedAt || now,
      lastPlayedAt: now,
    };

    // Per-arena records — track personal-bests.
    if (r.arena === 'deep' && r.won) {
      next.bestDeepDepth = Math.max(p.bestDeepDepth, r.maxDepth);
    }
    if (r.arena === 'drought' && r.won) {
      next.bestDroughtDays = Math.max(p.bestDroughtDays, r.daysSurvived);
    }
    if (r.arena === 'maze' && r.won) {
      const current = p.fastestMazeSteps || Infinity;
      next.fastestMazeSteps = Math.min(current, r.stepsTaken);
    }
    if (r.arena === 'chase' && r.won && typeof r.reward === 'number') {
      next.bestChaseKcal = Math.max(p.bestChaseKcal, r.reward);
    }

    // Hunt — track streak + per-biome / per-strategy detail.
    if (r.arena === 'hunt') {
      if (r.won) {
        next.currentHuntStreak = p.currentHuntStreak + 1;
        next.longestHuntStreak = Math.max(p.longestHuntStreak, next.currentHuntStreak);
      } else {
        next.currentHuntStreak = 0;
      }
      if (r.env && r.strategy) {
        const existing: HuntBiomeStats = p.huntByBiome[r.env]
          ? {
              ...p.huntByBiome[r.env],
              byStrategy: {
                hide: { ...p.huntByBiome[r.env].byStrategy.hide },
                run: { ...p.huntByBiome[r.env].byStrategy.run },
                fight: { ...p.huntByBiome[r.env].byStrategy.fight },
              },
            }
          : {
              wins: 0, losses: 0,
              byStrategy: {
                hide: { wins: 0, losses: 0 },
                run: { wins: 0, losses: 0 },
                fight: { wins: 0, losses: 0 },
              },
            };
        if (r.won) {
          existing.wins++;
          existing.byStrategy[r.strategy].wins++;
        } else {
          existing.losses++;
          existing.byStrategy[r.strategy].losses++;
        }
        next.huntByBiome = { ...p.huntByBiome, [r.env]: existing };
      }
    }

    return next;
  });
}

export function recordBattle(venue: string, winner: 'A' | 'B' | 'draw'): PlayerProfile {
  return update((p) => {
    const cur = p.battleByVenue[venue] ?? { wins: 0, losses: 0, draws: 0 };
    const next = {
      wins: cur.wins + (winner === 'A' ? 1 : 0),
      losses: cur.losses + (winner === 'B' ? 1 : 0),
      draws: cur.draws + (winner === 'draw' ? 1 : 0),
    };
    return {
      ...p,
      totalBattles: p.totalBattles + 1,
      battleByVenue: { ...p.battleByVenue, [venue]: next },
      lastPlayedAt: Date.now(),
    };
  });
}

// Silence unused-binding warning for the empty-biome scaffold (used as
// a reference shape — declared but not directly imported elsewhere).
void EMPTY_HUNT_BIOME;

export function recordChaseCatch(preyId: string, reward: number): PlayerProfile {
  return update((p) => ({
    ...p,
    totalChaseKcal: p.totalChaseKcal + reward,
    preysCaught: { ...p.preysCaught, [preyId]: (p.preysCaught[preyId] ?? 0) + 1 },
  }));
}

export function recordGeneration(): PlayerProfile {
  return update((p) => ({ ...p, generationsTotal: p.generationsTotal + 1 }));
}

export function recordEvolved(): PlayerProfile {
  return update((p) => ({ ...p, creaturesEvolved: p.creaturesEvolved + 1 }));
}

export function recordBred(): PlayerProfile {
  return update((p) => ({ ...p, creaturesBred: p.creaturesBred + 1 }));
}

export function recordTournament(points: number): PlayerProfile {
  return update((p) => ({
    ...p,
    tournamentsCompleted: p.tournamentsCompleted + 1,
    bestTournamentPoints: Math.max(p.bestTournamentPoints, points),
  }));
}

export function recordSaved(count: number): PlayerProfile {
  return update((p) => ({ ...p, creaturesSaved: count }));
}

export function recordSharedImport(): PlayerProfile {
  return update((p) => ({ ...p, sharedImported: p.sharedImported + 1 }));
}
