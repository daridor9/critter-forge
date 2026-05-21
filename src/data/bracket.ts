import type { Creature } from '../types';
import { simulateBattle } from './battle';
import type { Venue, BattleResult } from './battle';

// Single-elimination bracket. 4 or 8 entrants → log2(N) rounds.
// Each match is one simulated battle (no rematch); on a draw, the higher-seed
// advances (seed 0 = top-of-bracket).
export interface BracketMatch {
  id: string;
  round: number;       // 0 = first round, 1 = semis, etc.
  slot: number;        // position within the round
  aSeed: number | null;
  bSeed: number | null;
  winner: 'A' | 'B' | 'draw' | null;
  result: BattleResult | null;
  venue: Venue;
}

export interface BracketEntrant {
  seed: number;
  label: string;
  creature: Creature;
}

export interface Bracket {
  entrants: BracketEntrant[];
  matches: BracketMatch[];      // ordered by round, then slot
  size: 4 | 8;
  venuePolicy: 'mixed' | Venue;  // mixed → cycle Venues per round
}

const VENUE_CYCLE: Venue[] = ['brawl', 'race', 'maze', 'dive'];

function venueForMatch(policy: Bracket['venuePolicy'], round: number, slot: number): Venue {
  if (policy !== 'mixed') return policy;
  return VENUE_CYCLE[(round * 2 + slot) % VENUE_CYCLE.length];
}

export function buildBracket(entrants: BracketEntrant[], venuePolicy: Bracket['venuePolicy']): Bracket {
  const size = (entrants.length === 8 ? 8 : 4) as 4 | 8;
  const matches: BracketMatch[] = [];
  // First round — pair seed i with seed (size - 1 - i) for classic bracket.
  const firstRoundPairs: [number, number][] = [];
  for (let i = 0; i < size / 2; i++) {
    firstRoundPairs.push([i, size - 1 - i]);
  }
  firstRoundPairs.forEach(([a, b], slot) => {
    matches.push({
      id: `r0-m${slot}`,
      round: 0,
      slot,
      aSeed: a,
      bSeed: b,
      winner: null,
      result: null,
      venue: venueForMatch(venuePolicy, 0, slot),
    });
  });
  // Empty later rounds — filled as matches resolve.
  const rounds = Math.log2(size);
  for (let r = 1; r < rounds; r++) {
    const slots = size / Math.pow(2, r + 1);
    for (let s = 0; s < slots; s++) {
      matches.push({
        id: `r${r}-m${s}`,
        round: r,
        slot: s,
        aSeed: null,
        bSeed: null,
        winner: null,
        result: null,
        venue: venueForMatch(venuePolicy, r, s),
      });
    }
  }
  return { entrants, matches, size, venuePolicy };
}

// Resolve a single match — simulate and mutate the bracket; populate the
// downstream parent match's empty slot.
export function playMatch(b: Bracket, matchId: string): Bracket {
  const matches = b.matches.map((m) => ({ ...m }));
  const match = matches.find((m) => m.id === matchId);
  if (!match || match.result || match.aSeed == null || match.bSeed == null) return b;

  const cA = b.entrants[match.aSeed].creature;
  const cB = b.entrants[match.bSeed].creature;
  const result = simulateBattle(cA, cB, match.venue);
  match.result = result;
  // Draws — higher seed (lower seed-number) advances by convention.
  const winnerSeed =
    result.winner === 'A' ? match.aSeed :
    result.winner === 'B' ? match.bSeed :
    Math.min(match.aSeed, match.bSeed);
  match.winner = result.winner === 'draw'
    ? (winnerSeed === match.aSeed ? 'A' : 'B')
    : result.winner;

  // Propagate winner to the next round's match.
  if (match.round + 1 < Math.log2(b.size)) {
    const parentSlot = Math.floor(match.slot / 2);
    const parent = matches.find((m) => m.round === match.round + 1 && m.slot === parentSlot);
    if (parent) {
      if (match.slot % 2 === 0) parent.aSeed = winnerSeed;
      else parent.bSeed = winnerSeed;
    }
  }

  return { ...b, matches };
}

export function nextPlayableMatch(b: Bracket): BracketMatch | null {
  for (const m of b.matches) {
    if (!m.result && m.aSeed != null && m.bSeed != null) return m;
  }
  return null;
}

export function isBracketDone(b: Bracket): boolean {
  const finalRound = Math.log2(b.size) - 1;
  const final = b.matches.find((m) => m.round === finalRound);
  return !!final?.result;
}

export function bracketChampion(b: Bracket): BracketEntrant | null {
  const finalRound = Math.log2(b.size) - 1;
  const final = b.matches.find((m) => m.round === finalRound);
  if (!final?.result || final.aSeed == null || final.bSeed == null) return null;
  const seed = final.winner === 'A' ? final.aSeed : final.bSeed;
  return b.entrants[seed];
}
