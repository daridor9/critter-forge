// ─── Evolution Suggestion Engine ──────────────────────────────────────────
// Given a creature and a goal (auto / specific arena / specific combo), ranks
// candidate mutations by their impact and returns the top N recommendations.
//
// "Impact" is the gain in the goal-specific score after applying the
// mutation. For arena goals we use the same heuristics ArenaFitView uses.
// For combo goals we look at how close the creature gets to the combo's
// required hybrid pair.

import type { Creature, Hybrid, Tier, BrainTier } from '../types';
import { isHybridValid, topSpeedKmh, enduranceKm, coldTolerance, sizeToMass } from '../physics';
import { HYBRID_COMBOS, type HybridCombo } from '../data/hybridCombos';

export type Goal =
  | 'auto'
  | 'chase' | 'hunt' | 'climb' | 'drought' | 'deep' | 'maze'
  | `combo:${string}`;

export interface EvolutionStep {
  emoji: string;
  trait: string;       // e.g. "Brain"
  from: string;        // e.g. "Big"
  to: string;          // e.g. "Genius"
  why: string;         // one-line rationale
  unlocksCombo?: string;
  impact: number;      // higher = more important
}

// ─── Per-arena fitness scoring (same logic as ArenaFitView, condensed) ──

interface DerivedStats {
  massKg: number;
  topSpeedKmh: number;
  enduranceKm: number;
  coldTolerance: number;
}

function derived(c: Creature): DerivedStats {
  const m = sizeToMass(c.sizeUnit);
  return {
    massKg: m,
    topSpeedKmh: topSpeedKmh(m, c.bodyPlan, c.legTier),
    enduranceKm: enduranceKm(m, c.bodyPlan, c.warmBlooded, c.legTier),
    coldTolerance: coldTolerance(m, c.warmBlooded, c.defenseTier),
  };
}

function chaseScore(c: Creature, s: DerivedStats): number {
  let score = 0;
  if (s.topSpeedKmh > 60) score += 2; else if (s.topSpeedKmh > 40) score += 1.4; else if (s.topSpeedKmh > 25) score += 0.8;
  if (s.enduranceKm > 30) score += 2; else if (s.enduranceKm > 15) score += 1.3; else if (s.enduranceKm > 7) score += 0.7;
  if (c.bodyPlan === 'bird' && s.topSpeedKmh > 30) score += 0.6;
  return Math.min(5, score);
}

function huntScore(c: Creature, s: DerivedStats): number {
  const hide  = (c.hybrids.includes('camouflage') ? 2.5 : 0) + (s.massKg < 5 ? 2 : s.massKg < 30 ? 1 : 0) + c.sensorTier * 0.4;
  const run   = s.topSpeedKmh > 60 ? 3 : s.topSpeedKmh > 40 ? 2 : s.topSpeedKmh > 25 ? 1 : 0;
  const fight = (c.hybrids.includes('venom') ? 2 : 0) + (c.hybrids.includes('electric') ? 2 : 0)
    + (c.hybrids.includes('stoneskin') ? 1.5 : 0) + (c.hybrids.includes('firebreath') ? 2 : 0)
    + c.defenseTier + (s.massKg > 500 ? 1.5 : 0);
  return Math.min(5, Math.max(hide, run, fight) * 1.1);
}

function climbScore(c: Creature, s: DerivedStats): number {
  const massPenalty = s.massKg > 1000 ? -2 : s.massKg > 300 ? -1 : s.massKg > 100 ? -0.5 : 0;
  const coldOk = s.coldTolerance < 5 ? 2 : s.coldTolerance < 15 ? 1 : 0;
  const fitness = (c.legTier >= 2 ? 1.5 : c.legTier >= 1 ? 1 : 0) + coldOk
    + (c.hybrids.includes('thick-fur') ? 1.5 : 0) + (c.hybrids.includes('antifreeze') ? 1 : 0);
  return Math.max(0, Math.min(5, fitness + massPenalty + 2));
}

function droughtScore(c: Creature, s: DerivedStats): number {
  let score = 0;
  if (!c.warmBlooded) score += 2.5;
  if (s.massKg > 50) score += 1.5; else if (s.massKg > 10) score += 0.8;
  if (c.hybrids.includes('thick-fur')) score += 1;
  if (c.hybrids.includes('stoneskin')) score += 0.7;
  return Math.min(5, score);
}

function deepScore(c: Creature, s: DerivedStats): number {
  const aquatic = c.bodyPlan === 'fish' || c.hybrids.includes('gills');
  const diveAdapted = c.adaptations?.some((a) => a.includes('diver') || a.includes('gills') || a.includes('deep-diving')) ?? false;
  const pressureProof = aquatic || diveAdapted || c.defenseTier === 2;
  const canGlide = c.bodyPlan === 'bird' || c.hybrids.includes('wings');
  let score = 0;
  if (aquatic) score += 2.5;
  else if (s.massKg > 100) score += 1.2;
  else if (s.massKg > 20) score += 0.6;
  if (diveAdapted) score += 1.5;
  if (pressureProof) score += 1;
  if (canGlide) score += 0.8;
  return Math.min(5, score);
}

function mazeScore(c: Creature, s: DerivedStats): number {
  const hasEcho = c.hybrids.includes('echolocation');
  let score = c.brainTier * 1.2 + c.sensorTier * 0.5;
  if (hasEcho) score += 1.2;
  if (s.enduranceKm > 20) score += 0.5;
  return Math.min(5, score);
}

function fitnessFor(c: Creature, arena: 'chase' | 'hunt' | 'climb' | 'drought' | 'deep' | 'maze'): number {
  const s = derived(c);
  switch (arena) {
    case 'chase':   return chaseScore(c, s);
    case 'hunt':    return huntScore(c, s);
    case 'climb':   return climbScore(c, s);
    case 'drought': return droughtScore(c, s);
    case 'deep':    return deepScore(c, s);
    case 'maze':    return mazeScore(c, s);
  }
}

function overallFitness(c: Creature): number {
  return (
    fitnessFor(c, 'chase') + fitnessFor(c, 'hunt') + fitnessFor(c, 'climb')
    + fitnessFor(c, 'drought') + fitnessFor(c, 'deep') + fitnessFor(c, 'maze')
  );
}

// ─── Candidate mutations ──────────────────────────────────────────────────

const LEG_LABELS = ['Stubby', 'Standard', 'Runner'];
const BRAIN_LABELS = ['Tiny', 'Standard', 'Big', 'Genius'];
const DEF_LABELS = ['None', 'Fur/scales', 'Armor'];
const SENSOR_LABELS = ['Simple', 'Sharp', 'Sonar'];

interface Candidate {
  apply: (c: Creature) => Creature;
  step: EvolutionStep;
}

function genCandidates(c: Creature): Candidate[] {
  const out: Candidate[] = [];

  // Leg tier
  if (c.legTier < 2) {
    out.push({
      apply: (cc) => ({ ...cc, legTier: (cc.legTier + 1) as Tier }),
      step: { emoji: '🦵', trait: 'Legs', from: LEG_LABELS[c.legTier], to: LEG_LABELS[c.legTier + 1], why: 'Faster top speed + longer endurance', impact: 0 },
    });
  }
  // Brain tier
  if (c.brainTier < 3) {
    out.push({
      apply: (cc) => ({ ...cc, brainTier: (cc.brainTier + 1) as BrainTier }),
      step: { emoji: '🧠', trait: 'Brain', from: BRAIN_LABELS[c.brainTier], to: BRAIN_LABELS[c.brainTier + 1], why: 'Maze gets easier; bigger combos open up', impact: 0 },
    });
  }
  // Defense tier
  if (c.defenseTier < 2) {
    out.push({
      apply: (cc) => ({ ...cc, defenseTier: (cc.defenseTier + 1) as Tier }),
      step: { emoji: '🛡️', trait: 'Defense', from: DEF_LABELS[c.defenseTier], to: DEF_LABELS[c.defenseTier + 1], why: 'Tank Hunt fights, pressure-proof for Deep', impact: 0 },
    });
  }
  // Sensor tier
  if (c.sensorTier < 2) {
    out.push({
      apply: (cc) => ({ ...cc, sensorTier: (cc.sensorTier + 1) as Tier }),
      step: { emoji: '👁️', trait: 'Senses', from: SENSOR_LABELS[c.sensorTier], to: SENSOR_LABELS[c.sensorTier + 1], why: 'Hunt hide and Maze pathfinding both improve', impact: 0 },
    });
  }
  // Size — grow
  if (c.sizeUnit <= 92) {
    out.push({
      apply: (cc) => ({ ...cc, sizeUnit: Math.min(100, cc.sizeUnit + 8) }),
      step: { emoji: '⬆️', trait: 'Size', from: `${c.sizeUnit}`, to: `${Math.min(100, c.sizeUnit + 8)}`, why: 'Big bodies survive Drought + Hunt Fight better', impact: 0 },
    });
  }
  // Size — shrink
  if (c.sizeUnit >= 8) {
    out.push({
      apply: (cc) => ({ ...cc, sizeUnit: Math.max(0, cc.sizeUnit - 8) }),
      step: { emoji: '⬇️', trait: 'Size', from: `${c.sizeUnit}`, to: `${Math.max(0, c.sizeUnit - 8)}`, why: 'Small bodies climb cliffs + hide from predators', impact: 0 },
    });
  }
  // Warm/cold flip
  out.push({
    apply: (cc) => ({ ...cc, warmBlooded: !cc.warmBlooded }),
    step: {
      emoji: c.warmBlooded ? '❄️' : '🔥',
      trait: 'Blood',
      from: c.warmBlooded ? 'Warm' : 'Cold',
      to: c.warmBlooded ? 'Cold' : 'Warm',
      why: c.warmBlooded ? 'Cold-blooded = survive Drought + need less food' : 'Warm-blooded = run faster, survive Climb cold',
      impact: 0,
    },
  });
  // Add hybrids (valid ones only)
  const HYBRIDS: Hybrid[] = [
    'echolocation', 'wings', 'venom', 'electric', 'camouflage',
    'antifreeze', 'thick-fur', 'gills', 'symbiosis',
    'firebreath', 'stoneskin', 'hypersonic', 'dragon',
  ];
  for (const h of HYBRIDS) {
    if (c.hybrids.includes(h)) continue;
    if (!isHybridValid(h, c).valid) continue;
    if (c.hybrids.length >= 2) {
      // can only have 2 — need to swap. Suggest replacement of each existing one
      for (const ex of c.hybrids) {
        out.push({
          apply: (cc) => ({ ...cc, hybrids: cc.hybrids.map((x) => x === ex ? h : x) }),
          step: { emoji: '🧪', trait: 'Hybrid', from: ex, to: h, why: hybridWhy(h), impact: 0 },
        });
      }
    } else {
      out.push({
        apply: (cc) => ({ ...cc, hybrids: [...cc.hybrids, h] }),
        step: { emoji: '🧪', trait: 'Hybrid', from: '–', to: h, why: hybridWhy(h), impact: 0 },
      });
    }
  }
  return out;
}

function hybridWhy(h: Hybrid): string {
  switch (h) {
    case 'echolocation': return 'Half-cost maze pace, unlocks Bat sonar combo';
    case 'wings': return 'Glide mode in Deep; flies in Hunt evade';
    case 'venom': return 'Big Hunt-fight bonus, even on tiny bodies';
    case 'electric': return 'Hunt-fight bonus, shock attackers';
    case 'camouflage': return 'Massive Hunt-hide bonus';
    case 'antifreeze': return 'Cold-bloods survive Climb';
    case 'thick-fur': return 'Climb + Drought boost (camel-wool effect)';
    case 'gills': return 'Aquatic — never drown in Deep, swim Porpoise';
    case 'symbiosis': return 'Spotter helps Hunt; small reward share';
    case 'firebreath': return 'Hunt-fight: melt anything';
    case 'stoneskin': return 'Armor — pressure-safe in Deep, big Drought help';
    case 'hypersonic': return 'Massive Chase + Hunt-run bonus';
    case 'dragon': return 'Apex tier — pairs with firebreath for the dragon combo';
  }
}

// Flag any combo that would activate after this mutation.
function comboUnlocked(before: Creature, after: Creature): HybridCombo | null {
  const wasActive = HYBRID_COMBOS.find((c) => c.hybrids.every((h) => before.hybrids.includes(h)));
  const nowActive = HYBRID_COMBOS.find((c) => c.hybrids.every((h) => after.hybrids.includes(h)));
  if (nowActive && nowActive.id !== wasActive?.id) return nowActive;
  return null;
}

// ─── Main suggestion entry point ─────────────────────────────────────────

export function suggestEvolutions(c: Creature, goal: Goal, count = 4): EvolutionStep[] {
  const candidates = genCandidates(c);

  // For combo goal: score by how close the mutation gets to the combo.
  if (goal.startsWith('combo:')) {
    const comboId = goal.slice('combo:'.length);
    const target = HYBRID_COMBOS.find((cc) => cc.id === comboId);
    if (!target) return [];
    return candidates
      .map((cand) => {
        const after = cand.apply(c);
        const hasBoth = target.hybrids.every((h) => after.hybrids.includes(h));
        const hadBefore = target.hybrids.filter((h) => c.hybrids.includes(h)).length;
        const hasAfter = target.hybrids.filter((h) => after.hybrids.includes(h)).length;
        const gain = hasAfter - hadBefore;
        const unlocked = hasBoth && !target.hybrids.every((h) => c.hybrids.includes(h));
        return {
          ...cand.step,
          unlocksCombo: unlocked ? target.name : undefined,
          impact: gain * 10 + (unlocked ? 50 : 0),
        };
      })
      .filter((s) => s.impact > 0)
      .sort((a, b) => b.impact - a.impact)
      .slice(0, count);
  }

  // For arena/auto goal: score by fitness gain.
  function scoreFor(creature: Creature): number {
    if (goal === 'auto') return overallFitness(creature);
    return fitnessFor(creature, goal as 'chase' | 'hunt' | 'climb' | 'drought' | 'deep' | 'maze');
  }
  const baseScore = scoreFor(c);

  return candidates
    .map((cand) => {
      const after = cand.apply(c);
      const newScore = scoreFor(after);
      const gain = newScore - baseScore;
      const combo = comboUnlocked(c, after);
      return {
        ...cand.step,
        unlocksCombo: combo?.name,
        impact: gain + (combo ? 1.5 : 0),
      };
    })
    .filter((s) => s.impact > 0.1)
    .sort((a, b) => b.impact - a.impact)
    .slice(0, count);
}
