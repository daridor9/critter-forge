import type { ArenaResult } from './insights';

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
    return {
      ...p,
      testsRun: p.testsRun + 1,
      totalWins: p.totalWins + (r.won ? 1 : 0),
      totalLosses: p.totalLosses + (r.won ? 0 : 1),
      winsByArena: { ...p.winsByArena, [key]: (p.winsByArena[key] ?? 0) + (r.won ? 1 : 0) },
      lossesByArena: { ...p.lossesByArena, [key]: (p.lossesByArena[key] ?? 0) + (r.won ? 0 : 1) },
    };
  });
}

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
