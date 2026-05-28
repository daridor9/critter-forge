// ─── Daily Wild Encounter ──────────────────────────────────────────────
// Generates a deterministic rival creature for each calendar day, using the
// date as a seed. Same date → same rival across all sessions/devices.
// Tracks streak in localStorage.

import type { Creature, BodyPlan, Tier, BrainTier, Hybrid } from '../types';
import { hybridCatalog } from './hybrids';
import { isHybridValid } from '../physics';

// ─── Seeded PRNG (mulberry32) ────────────────────────────────────────────
// Tiny, deterministic, good enough for daily creature generation.
function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Convert a YYYY-MM-DD string into a 32-bit seed.
function dateSeed(date: string): number {
  let h = 2166136261;
  for (let i = 0; i < date.length; i++) {
    h ^= date.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ─── Daily-themed name ────────────────────────────────────────────────────
const DAILY_PREFIXES = [
  'Sky-', 'Storm-', 'Moss-', 'Ember-', 'Frost-', 'Dusk-', 'Tide-', 'Cinder-',
  'Shadow-', 'Mist-', 'Stone-', 'Thorn-', 'Pyre-', 'Glade-', 'Quill-', 'Rune-',
];
const DAILY_SUFFIXES = [
  'wraith', 'fang', 'maw', 'claw', 'crest', 'tooth', 'horn', 'shade',
  'spike', 'jaws', 'mantle', 'talon', 'tusk', 'eye', 'hide', 'paw',
];

function dailyName(rng: () => number, bodyPlan: BodyPlan): string {
  // Body-plan-themed final tweak.
  const prefix = DAILY_PREFIXES[Math.floor(rng() * DAILY_PREFIXES.length)];
  const suffix = DAILY_SUFFIXES[Math.floor(rng() * DAILY_SUFFIXES.length)];
  // 'The Sky-Wraith of the Mountain' style — drop the The for compactness.
  const flavour: Record<BodyPlan, string[]> = {
    mammal:  ['Beast', 'Lord', 'Hunter'],
    reptile: ['Serpent', 'Drake', 'Crawler'],
    bird:    ['Hawk', 'Raptor', 'Wing'],
    fish:    ['Shark', 'Leviathan', 'Tide'],
  };
  const flav = flavour[bodyPlan][Math.floor(rng() * flavour[bodyPlan].length)];
  return `${prefix}${suffix} the ${flav}`;
}

// ─── Build the daily rival deterministically ─────────────────────────────
export function dailyRival(date: string = todayKey()): { creature: Creature; difficulty: 'easy' | 'medium' | 'hard'; date: string } {
  const seed = dateSeed(date);
  const rng = mulberry32(seed);

  // Difficulty rotates so the daily isn't always brutal.
  // Pattern: 4 easy, 3 medium, 1 hard per 8-day cycle.
  const cycleDay = (seed % 8);
  const difficulty: 'easy' | 'medium' | 'hard' =
    cycleDay < 4 ? 'easy' : cycleDay < 7 ? 'medium' : 'hard';

  // Pick traits weighted by difficulty.
  const bodyPlans: BodyPlan[] = ['mammal', 'reptile', 'bird', 'fish'];
  const bodyPlan = bodyPlans[Math.floor(rng() * bodyPlans.length)];

  // Difficulty influences how min-maxed the build is.
  const tierBias = difficulty === 'hard' ? 1.5 : difficulty === 'medium' ? 1.0 : 0.4;
  const pickTier = (): Tier => {
    const r = rng() * (3 + tierBias);
    return Math.min(2, Math.floor(r)) as Tier;
  };

  // Size — medium range with some extremes
  const sizeBase = difficulty === 'hard' ? 30 + rng() * 60 : 20 + rng() * 50;
  const sizeUnit = Math.round(Math.max(2, Math.min(98, sizeBase)));

  const base: Creature = {
    name: 'Daily Rival',
    sizeUnit,
    bodyPlan,
    warmBlooded: rng() < 0.65,
    legTier: pickTier(),
    brainTier: (rng() < (difficulty === 'hard' ? 0.25 : 0.08) ? 3 : pickTier()) as BrainTier,
    defenseTier: pickTier(),
    sensorTier: pickTier(),
    hybrids: [],
  };

  // Hybrids — harder difficulties get more
  const hybridChance = difficulty === 'hard' ? 0.95 : difficulty === 'medium' ? 0.7 : 0.4;
  if (rng() < hybridChance) {
    const valid = hybridCatalog.filter((h) => isHybridValid(h.id, base).valid);
    if (valid.length > 0) {
      const picked: Hybrid[] = [valid[Math.floor(rng() * valid.length)].id];
      // Hard rivals often have 2 hybrids (combos)
      if (difficulty !== 'easy' && rng() < 0.6 && valid.length > 1) {
        const remaining = valid.filter((h) => !picked.includes(h.id));
        if (remaining.length > 0) picked.push(remaining[Math.floor(rng() * remaining.length)].id);
      }
      base.hybrids = picked;
    }
  }

  base.name = dailyName(rng, bodyPlan);
  return { creature: base, difficulty, date };
}

// ─── Streak + status tracking ────────────────────────────────────────────
type DailyStatus = 'pending' | 'won' | 'lost';

function statusKey(date: string): string {
  return `critter-forge:daily-status:${date}`;
}
const STREAK_KEY = 'critter-forge:daily-streak';
const LAST_WIN_KEY = 'critter-forge:daily-last-win';
const BEST_STREAK_KEY = 'critter-forge:daily-best-streak';

export function getDailyStatus(date: string = todayKey()): DailyStatus {
  try {
    const v = localStorage.getItem(statusKey(date));
    if (v === 'won' || v === 'lost') return v;
    return 'pending';
  } catch { return 'pending'; }
}

export function setDailyStatus(date: string, status: DailyStatus): void {
  try { localStorage.setItem(statusKey(date), status); } catch { /* ignore */ }
}

export function getStreak(): number {
  try { return Number(localStorage.getItem(STREAK_KEY) || '0'); } catch { return 0; }
}

export function getBestStreak(): number {
  try { return Number(localStorage.getItem(BEST_STREAK_KEY) || '0'); } catch { return 0; }
}

function setStreak(n: number): void {
  try {
    localStorage.setItem(STREAK_KEY, String(n));
    const best = getBestStreak();
    if (n > best) localStorage.setItem(BEST_STREAK_KEY, String(n));
  } catch { /* ignore */ }
}

function getLastWin(): string | null {
  try { return localStorage.getItem(LAST_WIN_KEY); } catch { return null; }
}
function setLastWin(date: string): void {
  try { localStorage.setItem(LAST_WIN_KEY, date); } catch { /* ignore */ }
}

// Returns the new streak after recording the win.
export function recordDailyWin(date: string = todayKey()): number {
  setDailyStatus(date, 'won');
  const last = getLastWin();
  let next: number;
  if (!last) {
    next = 1;
  } else {
    // Streak continues if last win was yesterday; otherwise resets to 1.
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    if (last === yKey || last === date) {
      next = getStreak() + (last === date ? 0 : 1);
    } else {
      next = 1;
    }
  }
  setStreak(next);
  setLastWin(date);
  return next;
}

export function recordDailyLoss(date: string = todayKey()): void {
  setDailyStatus(date, 'lost');
  // A loss resets the streak to 0.
  setStreak(0);
}
