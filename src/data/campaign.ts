// ─── Campaign / Story Mode — "The Adapting" ────────────────────────────
// 10 chapters walking through real evolutionary pressures. Each chapter
// has a thematic premise, a required arena, success conditions, and a
// recommended build hint. Progress is persisted in localStorage.

import type { ArenaResult } from './insights';

export type ChapterId =
  | 'tidepool'
  | 'savanna-dry'
  | 'gathering-storm'
  | 'long-night'
  | 'ice-age'
  | 'dust-bowl'
  | 'predator-boom'
  | 'volcanic-vents'
  | 'cyclone-wing'
  | 'apex-final';

export interface Chapter {
  id: ChapterId;
  num: number;
  emoji: string;
  title: string;
  era: string;
  /** 1-3 line story setup shown when chapter opens. */
  premise: string;
  /** Recommended build approach (no rules, just guidance). */
  buildHint: string;
  /** Real-world biology fact tied to the era. */
  bioFact: string;
  /** Background color for the chapter's intro card. */
  color: string;
  /** Arena + sub-conditions the player must clear. */
  challenge: ChapterChallenge;
}

export interface ChapterChallenge {
  arena: 'chase' | 'hunt' | 'climb' | 'drought' | 'deep' | 'maze';
  /** Optional sub-route id (e.g. drought severity, deep zone, swim route). */
  routeId?: string;
  /** Description of the specific challenge. */
  task: string;
  /** Predicate run on the arena result to check success. */
  check: (r: ArenaResult) => boolean;
}

export const CHAPTERS: Chapter[] = [
  {
    id: 'tidepool',
    num: 1,
    emoji: '🌊',
    title: 'The Tide Pools',
    era: '~500 million years ago — Cambrian seas',
    premise:
      'You begin in a shallow tropical reef. Strange creatures fill the water. To survive, you must navigate the maze of coral and reach the open sea.',
    buildHint:
      'Pick a fish body or add the gills hybrid so you can breathe water. A bright brain helps you find the way.',
    bioFact:
      'The Cambrian explosion (~540 Mya) was the most rapid burst of body-plan evolution in Earth history — almost every animal group alive today first appeared here.',
    color: '#3a85b8',
    challenge: {
      arena: 'maze',
      task: 'Escape the Cave maze to reach open water.',
      check: (r) => r.arena === 'maze' && r.won,
    },
  },
  {
    id: 'savanna-dry',
    num: 2,
    emoji: '🌾',
    title: 'The Drying Savanna',
    era: '~10 million years ago — Miocene grasslands spread',
    premise:
      'The forests are shrinking; vast grasslands replace them. Prey gets faster, predators must too. Run something down before sunset.',
    buildHint:
      'Long legs, warm blood, and lean muscle. Light bodies (5–80 kg) hit peak speed.',
    bioFact:
      'When grasslands spread, prey evolved bigger feet and longer legs — and predators (cheetahs, big cats) evolved to match. The cheetah\'s 110 km/h is the fastest land speed ever evolved.',
    color: '#d8b870',
    challenge: {
      arena: 'chase',
      task: 'Catch any prey in the Chase arena.',
      check: (r) => r.arena === 'chase' && r.won,
    },
  },
  {
    id: 'gathering-storm',
    num: 3,
    emoji: '🌧️',
    title: 'The Gathering Storm',
    era: 'Late Mesozoic — predators rule the land',
    premise:
      'A massive predator hunts you. Hide, run, or fight — your body decides which.',
    buildHint:
      'Camouflage + small body → hide. Top speed → run. Venom or armor → fight.',
    bioFact:
      'Real prey species evolved THREE distinct survival strategies: cryptic camouflage (rabbits, octopi), aerobic flight (pronghorns, gazelles), or chemical/armor defense (venomous snakes, pangolins).',
    color: '#5a7838',
    challenge: {
      arena: 'hunt',
      task: 'Survive any predator encounter.',
      check: (r) => r.arena === 'hunt' && r.won,
    },
  },
  {
    id: 'long-night',
    num: 4,
    emoji: '🌙',
    title: 'The Long Night',
    era: 'Caves and twilight — sensory arms race',
    premise:
      'Light fades. You must navigate by something other than eyes. Sound? Smell? Whisker tips?',
    buildHint:
      'Add ECHOLOCATION (the bat / dolphin trick) — it cuts maze stamina cost in half and unlocks pings.',
    bioFact:
      'Bats and dolphins independently evolved echolocation — sending out sound and listening to the echo. Bats can resolve targets the width of a human hair from across a room.',
    color: '#2a3a5a',
    challenge: {
      arena: 'maze',
      routeId: 'sonar',
      task: 'Escape the Sonar maze (cave / darkness).',
      check: (r) => r.arena === 'maze' && r.won,
    },
  },
  {
    id: 'ice-age',
    num: 5,
    emoji: '❄️',
    title: 'The Ice Age',
    era: '2.6 Mya–11 kya — Pleistocene glaciers',
    premise:
      'Cold descends. Snow covers the world. Only the insulated and the big-bodied survive. Climb the frozen mountain to a warmer valley.',
    buildHint:
      'Big body + warm blood + thick-fur hybrid. Or cold-blooded with antifreeze. Avoid being small.',
    bioFact:
      'Bigger animals lose less heat (smaller surface-to-volume ratio). Mammoths and woolly rhinos got huge during the Ice Age — and shrank when it ended.',
    color: '#9ad0d8',
    challenge: {
      arena: 'climb',
      task: 'Reach a mountain summit.',
      check: (r) => r.arena === 'climb' && r.won,
    },
  },
  {
    id: 'dust-bowl',
    num: 6,
    emoji: '🏜️',
    title: 'The Dust Bowl',
    era: 'A 90-day drought tests endurance',
    premise:
      'No rain has fallen in months. Watering holes shrink. Conserve everything.',
    buildHint:
      'Cold-blooded + big body wins droughts. Camels and crocodiles can fast for months.',
    bioFact:
      'Camels store fat (not water) in their humps and can lose 25% of their body weight in water before they\'re in danger. Crocodiles can go a YEAR without eating.',
    color: '#c08030',
    challenge: {
      arena: 'drought',
      task: 'Survive the dry season.',
      check: (r) => r.arena === 'drought' && r.won,
    },
  },
  {
    id: 'predator-boom',
    num: 7,
    emoji: '🐺',
    title: 'The Predator Boom',
    era: 'Apex predators dominate',
    premise:
      "An apex hunter stalks the land. Tough times — only the boldest defenses survive.",
    buildHint:
      'Aggressive tactic. Venom, electric, fire-breath, or stoneskin armor. Or run very fast.',
    bioFact:
      'Apex predators ("trophic level 5") are rare — there\'s only enough energy in a food chain to support a few of them. Killing one disrupts ecosystems for decades.',
    color: '#8a3030',
    challenge: {
      arena: 'hunt',
      task: 'Survive an APEX-difficulty predator.',
      check: (r) => r.arena === 'hunt' && r.won && (r as { difficulty?: string }).difficulty === 'apex',
    },
  },
  {
    id: 'volcanic-vents',
    num: 8,
    emoji: '🌋',
    title: 'Volcanic Vents',
    era: 'Abyssal — life finds chemistry',
    premise:
      'Dive deep to a hydrothermal vent. The pressure crushes. The dark is total. But strange life thrives here.',
    buildHint:
      'Fish body or gills hybrid for pressure resistance. Sensory tier or echolocation for the dark.',
    bioFact:
      'Hydrothermal vents host life that doesn\'t need the sun — they eat sulfur from the rocks. This is the only ecosystem on Earth that runs without photosynthesis.',
    color: '#1a1f3a',
    challenge: {
      arena: 'deep',
      task: 'Reach the Abyssal zone (1000m+).',
      check: (r) => r.arena === 'deep' && r.won && (r as { maxDepth?: number }).maxDepth !== undefined && (r as { maxDepth: number }).maxDepth >= 1000,
    },
  },
  {
    id: 'cyclone-wing',
    num: 9,
    emoji: '🌀',
    title: 'Cyclone Wing',
    era: 'The skies become a battlefield',
    premise:
      'A storm fills the sky. To survive, you must learn to soar — gliding over the chaos using winds and updrafts.',
    buildHint:
      'Bird body or wings hybrid. Light body is a huge advantage. Pick the Cyclone glide route for the apex challenge.',
    bioFact:
      'Albatrosses can glide for HOURS without flapping by reading wind layers over the ocean. Frigatebirds stay airborne for two months at a time.',
    color: '#3c4858',
    challenge: {
      arena: 'deep',
      routeId: 'cyclone',
      task: 'Glide the Cyclone-edge route (1000m, extreme winds).',
      // Approximate: any deep "landed" win at 1000m or more.
      check: (r) => r.arena === 'deep' && r.won && (r as { reason?: string }).reason === 'landed' && (r as { maxDepth?: number }).maxDepth !== undefined && (r as { maxDepth: number }).maxDepth >= 1000,
    },
  },
  {
    id: 'apex-final',
    num: 10,
    emoji: '👑',
    title: 'The Apex',
    era: 'A perfectly-balanced ecosystem',
    premise:
      'You have survived every pressure. Now adapt for the final test — sweep all six arenas in a single run.',
    buildHint:
      'Compound traits across generations. A balanced apex creature is hard to design — there is no perfect form, only good trade-offs.',
    bioFact:
      "Real ecosystems have no single 'best' species. The most diverse ecosystems have hundreds of specialists, each fitting a unique niche. No animal wins every arena — that's the lesson.",
    color: '#c0843a',
    challenge: {
      arena: 'chase',  // we'll check this against the gauntlet result externally
      task: 'Win all 6 arenas in a single Gauntlet run.',
      check: () => false, // External: see isApexCampaignCleared() below
    },
  },
];

// ─── Progress tracking ─────────────────────────────────────────────────

const PROGRESS_KEY = 'critter-forge:campaign-progress';

export interface CampaignProgress {
  completed: ChapterId[];
  // The chapter we're currently working on (next undone chapter).
  currentId: ChapterId;
}

export function loadProgress(): CampaignProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return { completed: [], currentId: CHAPTERS[0].id };
    const parsed = JSON.parse(raw);
    return {
      completed: parsed.completed ?? [],
      currentId: parsed.currentId ?? CHAPTERS[0].id,
    };
  } catch {
    return { completed: [], currentId: CHAPTERS[0].id };
  }
}

export function saveProgress(p: CampaignProgress): void {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

/**
 * Returns the chapter currently in progress (next undone after most recently
 * completed). Returns null when all chapters are done.
 */
export function getCurrentChapter(): Chapter | null {
  const p = loadProgress();
  const next = CHAPTERS.find((c) => !p.completed.includes(c.id));
  return next ?? null;
}

/**
 * Call after every arena finish to check if it advances the current chapter.
 * Returns the chapter that was just completed, or null.
 */
export function checkChapterClear(r: ArenaResult): Chapter | null {
  const current = getCurrentChapter();
  if (!current) return null;
  if (current.id === 'apex-final') return null; // external check
  if (!current.challenge.check(r)) return null;
  const p = loadProgress();
  saveProgress({
    completed: [...p.completed, current.id],
    currentId: CHAPTERS[Math.min(CHAPTERS.length - 1, p.completed.length + 1)].id,
  });
  return current;
}

/**
 * Mark the apex chapter complete (called from Gauntlet code when player
 * wins 6/6).
 */
export function markApexClear(): Chapter | null {
  const p = loadProgress();
  if (p.completed.includes('apex-final')) return null;
  saveProgress({
    completed: [...p.completed, 'apex-final'],
    currentId: 'apex-final',
  });
  return CHAPTERS.find((c) => c.id === 'apex-final')!;
}

export function resetCampaign(): void {
  try { localStorage.removeItem(PROGRESS_KEY); } catch { /* ignore */ }
}
