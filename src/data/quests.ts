import type { Creature } from '../types';
import type { ArenaResult } from './insights';
import { computeStats } from '../physics';
import { loadProfile } from './profile';

export type QuestCheckArgs = {
  creature: Creature;
  result?: ArenaResult;
};

export interface Quest {
  id: string;
  emoji: string;
  title: string;
  description: string;
  check: (args: QuestCheckArgs) => boolean;
}

const massKg = (c: Creature) => computeStats(c).massKg;

export const QUESTS: Quest[] = [
  {
    id: 'tiny-survivor',
    emoji: '🐭',
    title: 'Survive as a speck',
    description: 'Win any arena as a creature under 100 g.',
    check: ({ creature, result }) => !!result?.won && massKg(creature) < 0.1,
  },
  {
    id: 'colossal',
    emoji: '🐘',
    title: 'Colossal designer',
    description: 'Design a creature heavier than 5,000 kg.',
    check: ({ creature }) => massKg(creature) > 5000,
  },
  {
    id: 'cold-kangaroo',
    emoji: '🥶',
    title: 'Cold-blooded chaser',
    description: 'Catch the Kangaroo with a cold-blooded creature.',
    check: ({ creature, result }) =>
      result?.arena === 'chase' && result.won && !creature.warmBlooded &&
      'preyId' in result && result.preyId === 'kangaroo',
  },
  {
    id: 'mountain-light',
    emoji: '🏔',
    title: 'Light alpine climber',
    description: 'Reach the summit at under 50 kg.',
    check: ({ creature, result }) =>
      result?.arena === 'climb' && result.won && massKg(creature) < 50,
  },
  {
    id: 'fight-back',
    emoji: '⚔️',
    title: 'Fight back',
    description: 'Win the Hunt by fighting (needs venom or electric).',
    check: ({ result }) => result?.arena === 'hunt' && result.won && result.reason === 'fought',
  },
  {
    id: 'fish-deep',
    emoji: '🐟',
    title: 'Built for water',
    description: 'Complete The Deep as a fish-body creature.',
    check: ({ creature, result }) =>
      result?.arena === 'deep' && result.won && creature.bodyPlan === 'fish',
  },
  {
    id: 'aquatic-by-gills',
    emoji: '🫁',
    title: 'Gill adapter',
    description: 'Complete The Deep with the Gills hybrid (not a fish body).',
    check: ({ creature, result }) =>
      result?.arena === 'deep' && result.won && creature.bodyPlan !== 'fish' && creature.hybrids.includes('gills'),
  },
  {
    id: 'tiny-brain-maze',
    emoji: '🧠',
    title: 'Lucky guess',
    description: 'Escape The Maze with a tiny brain (brain tier 0).',
    check: ({ creature, result }) =>
      result?.arena === 'maze' && result.won && creature.brainTier === 0,
  },
  {
    id: 'drought-long',
    emoji: '☀️',
    title: 'Camel club',
    description: 'Survive the Drought for the full 60 days.',
    check: ({ result }) =>
      result?.arena === 'drought' && result.won && 'daysSurvived' in result && result.daysSurvived >= 60,
  },
  {
    id: 'fast-bird',
    emoji: '🦅',
    title: 'Avian sprinter',
    description: 'Catch any prey with a bird body plan.',
    check: ({ creature, result }) =>
      result?.arena === 'chase' && result.won && creature.bodyPlan === 'bird',
  },
  {
    id: 'tournament-champion',
    emoji: '🏆',
    title: 'Champion',
    description: 'Win 5 or more arenas in a single tournament.',
    check: () => loadProfile().bestTournamentPoints >= 18,
  },
  {
    id: 'tournament-apex',
    emoji: '👑',
    title: 'Apex Designer',
    description: 'Win all 6 arenas in one tournament.',
    check: () => loadProfile().bestTournamentPoints >= 25,
  },
  {
    id: 'gen-ten',
    emoji: '🧬',
    title: 'Ten generations',
    description: 'Evolve through 10 generations.',
    check: () => loadProfile().generationsTotal >= 10,
  },
  {
    id: 'save-five',
    emoji: '💾',
    title: 'Album builder',
    description: 'Save 5 creatures to the Family album.',
    check: () => loadProfile().creaturesSaved >= 5,
  },
  {
    id: 'community-import',
    emoji: '🌐',
    title: 'Hello, world',
    description: 'Import a creature from a friend\'s share link.',
    check: () => loadProfile().sharedImported >= 1,
  },
  {
    id: 'breeder',
    emoji: '👨‍👩‍👧',
    title: 'Family tree',
    description: 'Breed 3 offspring from the Family album.',
    check: () => loadProfile().creaturesBred >= 3,
  },
  {
    id: 'all-arenas',
    emoji: '🎖',
    title: 'Renaissance critter',
    description: 'Win every arena at least once.',
    check: () => {
      const p = loadProfile();
      return ['chase', 'hunt', 'climb', 'drought', 'deep', 'maze'].every((a) => (p.winsByArena[a] ?? 0) >= 1);
    },
  },
  {
    id: 'food-rich',
    emoji: '🥩',
    title: 'Big haul',
    description: 'Catch the Kangaroo for ≥ 4,800 kcal.',
    check: ({ result }) =>
      result?.arena === 'chase' && result.won && 'preyId' in result && result.preyId === 'kangaroo',
  },
];

const QUEST_KEY = 'critter-forge:quests';

export function loadCompletedQuests(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(QUEST_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

function saveCompleted(s: Set<string>) {
  try {
    localStorage.setItem(QUEST_KEY, JSON.stringify([...s]));
  } catch {
    /* ignore */
  }
}

export function checkQuests(args: QuestCheckArgs): Quest[] {
  const completed = loadCompletedQuests();
  const newly: Quest[] = [];
  for (const q of QUESTS) {
    if (completed.has(q.id)) continue;
    if (q.check(args)) {
      completed.add(q.id);
      newly.push(q);
    }
  }
  if (newly.length > 0) saveCompleted(completed);
  return newly;
}

const DAILY_KEY = 'critter-forge:daily';

interface DailyState {
  date: string;
  questId: string;
  completed: boolean;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function dateSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function loadDaily(): DailyState | null {
  try {
    return JSON.parse(localStorage.getItem(DAILY_KEY) || 'null');
  } catch {
    return null;
  }
}

function saveDaily(d: DailyState) {
  try {
    localStorage.setItem(DAILY_KEY, JSON.stringify(d));
  } catch {
    /* ignore */
  }
}

export function getTodayQuest(): { quest: Quest; completed: boolean } {
  const today = todayStr();
  const existing = loadDaily();
  if (existing && existing.date === today) {
    const q = QUESTS.find((x) => x.id === existing.questId) ?? QUESTS[0];
    return { quest: q, completed: existing.completed };
  }
  const seed = dateSeed(today);
  const quest = QUESTS[seed % QUESTS.length];
  saveDaily({ date: today, questId: quest.id, completed: false });
  return { quest, completed: false };
}

export function markDailyComplete(): boolean {
  const today = todayStr();
  const existing = loadDaily();
  if (!existing || existing.date !== today) return false;
  if (existing.completed) return false;
  saveDaily({ ...existing, completed: true });
  return true;
}
