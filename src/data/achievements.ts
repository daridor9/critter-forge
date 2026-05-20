import type { Creature } from '../types';
import type { ArenaResult } from './insights';

export interface Achievement {
  id: string;
  emoji: string;
  name: string;
  description: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-creature',    emoji: '🥚', name: 'Spark of life',       description: 'Open the game for the first time.' },
  { id: 'save-one',          emoji: '💾', name: 'First album entry',   description: 'Save a creature to your Family album.' },
  { id: 'save-five',         emoji: '📚', name: 'Collector',            description: 'Save 5 creatures.' },
  { id: 'save-ten',          emoji: '🗄️', name: 'Roster',              description: 'Save 10 creatures.' },
  { id: 'win-chase',         emoji: '🦌', name: 'The Chase',            description: 'Catch your prey in the Chase.' },
  { id: 'win-hunt',          emoji: '🌳', name: 'The Hunt',             description: 'Survive a predator encounter.' },
  { id: 'win-climb',         emoji: '🏔', name: 'Summit climber',       description: 'Reach the mountain summit.' },
  { id: 'win-drought',       emoji: '☀️', name: 'Drought survivor',     description: 'Survive the Drought.' },
  { id: 'win-deep',          emoji: '🌊', name: 'Abyss diver',          description: 'Complete a deep dive.' },
  { id: 'win-maze',          emoji: '🧩', name: 'Maze solver',          description: 'Escape the Maze.' },
  { id: 'win-all-arenas',    emoji: '🏆', name: 'Renaissance critter', description: 'Win every arena at least once.' },
  { id: 'tournament-run',    emoji: '🎫', name: 'Entered the arena',    description: 'Start a tournament.' },
  { id: 'tournament-champ',  emoji: '🥇', name: 'Champion',             description: 'Win 5 or more arenas in one tournament.' },
  { id: 'tournament-apex',   emoji: '👑', name: 'Apex Designer',        description: 'Win all 6 arenas in one tournament.' },
  { id: 'gen-five',          emoji: '🧬', name: 'Five generations',     description: 'Evolve through 5 generations.' },
  { id: 'gen-ten',           emoji: '🌳', name: 'Family tree',          description: 'Evolve through 10 generations.' },
  { id: 'mass-mighty',       emoji: '🐘', name: 'Mighty',                description: 'Design a creature over 4,000 kg.' },
  { id: 'mass-tiny',         emoji: '🐭', name: 'Tiny',                  description: 'Design a creature under 100 g.' },
  { id: 'every-hybrid',      emoji: '🧪', name: 'Every power',           description: 'Use every hybrid trait at least once.' },
  { id: 'beat-kangaroo',     emoji: '🦘', name: 'Out-hopped a kangaroo', description: 'Catch the kangaroo (70 km/h).' },
  { id: 'beat-shark',        emoji: '🦈', name: 'Bigger than a shark',  description: 'Survive the Shark.' },
  { id: 'fought-back',       emoji: '⚔️', name: 'Fought back',          description: 'Win a Hunt by fighting.' },
];

const KEY = 'critter-forge:achievements';
const HYBRIDS_USED_KEY = 'critter-forge:hybrids-used';

export function loadUnlocked(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) || '[]'));
  } catch {
    return new Set();
  }
}

function saveUnlocked(s: Set<string>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify([...s]));
  } catch {
    /* ignore */
  }
}

export function tryUnlock(id: string): Achievement | null {
  const set = loadUnlocked();
  if (set.has(id)) return null;
  set.add(id);
  saveUnlocked(set);
  return ACHIEVEMENTS.find((a) => a.id === id) ?? null;
}

function loadHybridsUsed(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(HYBRIDS_USED_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

function saveHybridsUsed(s: Set<string>): void {
  try {
    localStorage.setItem(HYBRIDS_USED_KEY, JSON.stringify([...s]));
  } catch {
    /* ignore */
  }
}

export function recordHybridUsage(c: Creature): Achievement | null {
  if (c.hybrids.length === 0) return null;
  const used = loadHybridsUsed();
  let added = false;
  for (const h of c.hybrids) {
    if (!used.has(h)) {
      used.add(h);
      added = true;
    }
  }
  if (added) saveHybridsUsed(used);
  if (used.size >= 9) return tryUnlock('every-hybrid');
  return null;
}

export function checkArenaWin(r: ArenaResult): Achievement[] {
  const out: Achievement[] = [];
  if (!r.won) return out;
  const arenaKey: Record<ArenaResult['arena'], string> = {
    chase: 'win-chase',
    hunt: 'win-hunt',
    climb: 'win-climb',
    drought: 'win-drought',
    deep: 'win-deep',
    maze: 'win-maze',
  };
  const a = tryUnlock(arenaKey[r.arena]);
  if (a) out.push(a);
  const unlocked = loadUnlocked();
  if (['win-chase','win-hunt','win-climb','win-drought','win-deep','win-maze'].every((k) => unlocked.has(k))) {
    const all = tryUnlock('win-all-arenas');
    if (all) out.push(all);
  }
  if (r.arena === 'hunt' && r.reason === 'fought') {
    const f = tryUnlock('fought-back');
    if (f) out.push(f);
  }
  return out;
}

export function checkCreatureAchievements(c: Creature, massKg: number): Achievement[] {
  const out: Achievement[] = [];
  if (massKg > 4000) {
    const a = tryUnlock('mass-mighty');
    if (a) out.push(a);
  }
  if (massKg < 0.1 && massKg > 0) {
    const a = tryUnlock('mass-tiny');
    if (a) out.push(a);
  }
  const h = recordHybridUsage(c);
  if (h) out.push(h);
  return out;
}

export function checkSaveAchievements(albumCount: number): Achievement[] {
  const out: Achievement[] = [];
  if (albumCount >= 1) {
    const a = tryUnlock('save-one');
    if (a) out.push(a);
  }
  if (albumCount >= 5) {
    const a = tryUnlock('save-five');
    if (a) out.push(a);
  }
  if (albumCount >= 10) {
    const a = tryUnlock('save-ten');
    if (a) out.push(a);
  }
  return out;
}

export function checkGenAchievements(gen: number): Achievement[] {
  const out: Achievement[] = [];
  if (gen >= 5) {
    const a = tryUnlock('gen-five');
    if (a) out.push(a);
  }
  if (gen >= 10) {
    const a = tryUnlock('gen-ten');
    if (a) out.push(a);
  }
  return out;
}
