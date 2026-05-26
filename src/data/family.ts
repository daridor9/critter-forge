// ─── Family roster ──────────────────────────────────────────────────────
//
// Each device runs its own roster of family members (Adam, Dad, Mom,
// a friend, etc). Every saved or shared creature is tagged with the
// "maker" — the family member who built it. Maker tags travel with
// share links so when Adam sends his tiger to Mom's iPad it shows up
// as "by Adam" on her album.
//
// Storage:
//   critter-forge:family-roster  →  { members: FamilyMember[],
//                                     activeId: string | null }

import type { Creature } from '../types';

export interface FamilyMember {
  id: string;
  name: string;
  emoji: string;       // avatar — e.g. 🐢, 👦, 👧, 🦁
  color: string;       // accent color for maker tags
  createdAt: number;
}

// What gets stored on a creature / save / share to identify the maker.
// We DON'T store the full member (which can be edited) — only an
// immutable snapshot of identity at the moment of creation, so future
// edits to the local roster don't rewrite history.
export interface MakerStamp {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

interface RosterState {
  members: FamilyMember[];
  activeId: string | null;
}

const KEY = 'critter-forge:family-roster';

const DEFAULT_COLORS = [
  '#c25541', '#3a8dde', '#5cc46a', '#a880e8',
  '#e89a3a', '#d65a5a', '#5b9fe0', '#e88a96',
];

const DEFAULT_EMOJI_SUGGESTIONS = ['👦', '👧', '🧒', '👨', '👩', '🦁', '🐯', '🐺', '🦊', '🐢', '🦒', '🐙', '🦋', '🐉'];

function load(): RosterState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { members: [], activeId: null };
    const parsed = JSON.parse(raw);
    return {
      members: Array.isArray(parsed.members) ? parsed.members : [],
      activeId: typeof parsed.activeId === 'string' ? parsed.activeId : null,
    };
  } catch {
    return { members: [], activeId: null };
  }
}

function save(s: RosterState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

function genId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── CRUD ───────────────────────────────────────────────────────────────

export function loadRoster(): RosterState {
  return load();
}

export function addMember(name: string, emoji?: string, color?: string): FamilyMember {
  const state = load();
  const member: FamilyMember = {
    id: genId(),
    name: name.trim() || `Player ${state.members.length + 1}`,
    emoji: emoji || pickFallbackEmoji(state.members.length),
    color: color || DEFAULT_COLORS[state.members.length % DEFAULT_COLORS.length],
    createdAt: Date.now(),
  };
  const next: RosterState = {
    members: [...state.members, member],
    activeId: state.activeId ?? member.id, // first member becomes active automatically
  };
  save(next);
  return member;
}

export function updateMember(id: string, patch: Partial<Omit<FamilyMember, 'id' | 'createdAt'>>): FamilyMember | null {
  const state = load();
  const idx = state.members.findIndex((m) => m.id === id);
  if (idx < 0) return null;
  const updated: FamilyMember = { ...state.members[idx], ...patch };
  const next = { ...state, members: state.members.map((m, i) => (i === idx ? updated : m)) };
  save(next);
  return updated;
}

export function removeMember(id: string): void {
  const state = load();
  const next: RosterState = {
    members: state.members.filter((m) => m.id !== id),
    activeId: state.activeId === id
      ? state.members.find((m) => m.id !== id)?.id ?? null
      : state.activeId,
  };
  save(next);
}

export function setActiveMember(id: string | null): void {
  const state = load();
  if (id && !state.members.find((m) => m.id === id)) return;
  save({ ...state, activeId: id });
}

export function getActiveMember(): FamilyMember | null {
  const state = load();
  if (!state.activeId) return null;
  return state.members.find((m) => m.id === state.activeId) ?? null;
}

export function getMember(id: string): FamilyMember | null {
  return load().members.find((m) => m.id === id) ?? null;
}

// ─── Maker stamps ───────────────────────────────────────────────────────

export function stampOf(m: FamilyMember | null): MakerStamp | null {
  if (!m) return null;
  return { id: m.id, name: m.name, emoji: m.emoji, color: m.color };
}

export function activeStamp(): MakerStamp | null {
  return stampOf(getActiveMember());
}

// ─── Helpers ────────────────────────────────────────────────────────────

export function pickFallbackEmoji(index: number): string {
  return DEFAULT_EMOJI_SUGGESTIONS[index % DEFAULT_EMOJI_SUGGESTIONS.length];
}

export function emojiOptions(): readonly string[] {
  return DEFAULT_EMOJI_SUGGESTIONS;
}

export function colorOptions(): readonly string[] {
  return DEFAULT_COLORS;
}

// ─── Family leaderboard (derived from points + album) ───────────────────

// Use these in ProfileModal to show a per-member leaderboard. The
// caller supplies the data sources to avoid circular imports.
export interface FamilyStanding {
  member: FamilyMember;
  creaturesSaved: number;       // how many tagged saves
  totalCreaturePoints: number;  // sum of points across their creatures
  topCreatureName: string | null;
  topCreaturePoints: number;
}

export function buildLeaderboard(
  albumEntries: { maker?: MakerStamp | null; creature: Creature; name: string }[],
  pointsByHash: (c: Creature) => number,
): FamilyStanding[] {
  const state = load();
  const standings: Map<string, FamilyStanding> = new Map();
  for (const m of state.members) {
    standings.set(m.id, {
      member: m,
      creaturesSaved: 0,
      totalCreaturePoints: 0,
      topCreatureName: null,
      topCreaturePoints: 0,
    });
  }
  for (const entry of albumEntries) {
    const makerId = entry.maker?.id;
    if (!makerId) continue;
    const cur = standings.get(makerId);
    if (!cur) continue;
    const pts = pointsByHash(entry.creature);
    cur.creaturesSaved++;
    cur.totalCreaturePoints += pts;
    if (pts > cur.topCreaturePoints) {
      cur.topCreaturePoints = pts;
      cur.topCreatureName = entry.name;
    }
  }
  return [...standings.values()].sort((a, b) => b.totalCreaturePoints - a.totalCreaturePoints);
}
