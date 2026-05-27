import type { Creature } from '../types';
import { computeStats } from '../physics';
import { comboEffects } from './hybridCombos';

// Pure battle simulation — pits two creatures against each other in one of
// four venues and returns a turn-by-turn log + winner. The UI consumes the
// log to play back live commentary while the result is computed up-front
// (deterministic from a seed if needed; here we just use Math.random).

export type Venue = 'brawl' | 'race' | 'maze' | 'dive';

export interface BattleStep {
  t: number;          // simulation tick (0..1 for race/dive, integer turn for brawl/maze)
  text: string;       // commentary line
  hpA?: number;       // 0..1 for brawl
  hpB?: number;
  posA?: number;      // 0..1 for race / dive
  posB?: number;
  flash?: 'A' | 'B';  // briefly highlight the affected side
}

export interface BattleResult {
  winner: 'A' | 'B' | 'draw';
  reason: string;
  steps: BattleStep[];
}

const has = (c: Creature, h: string) => c.hybrids.includes(h as never);

// ─── Brawl ───────────────────────────────────────────────────────────────
// Turn-based combat. Power per attack scales with mass^0.5 + defense + leg
// (mobility) + brain (tactics) + venom/electric burst bonuses. HP scales with
// mass + armor. Camouflage gives dodge chance, electric chance to stun,
// wings chance to disengage.
function powerFor(c: Creature): number {
  const s = computeStats(c);
  const comboBonus = comboEffects(c).brawlPowerBonus ?? 0;
  return (
    Math.sqrt(s.massKg) * 6 +
    c.defenseTier * 8 +
    c.legTier * 4 +
    c.brainTier * 3 +
    (has(c, 'venom') ? 35 : 0) +
    (has(c, 'electric') ? 45 : 0) +
    comboBonus
  );
}
function maxHpFor(c: Creature): number {
  const s = computeStats(c);
  return Math.sqrt(s.massKg) * 12 + c.defenseTier * 20 + 40;
}
function dodgeChance(c: Creature): number {
  let d = 0.05;
  if (has(c, 'camouflage')) d += 0.20;
  if (c.brainTier === 2) d += 0.05;
  if (c.brainTier === 3) d += 0.10;
  if (c.legTier === 2) d += 0.08;
  return Math.min(0.55, d);
}
function nameOf(c: Creature): string { return c.name || 'Critter'; }

function simulateBrawl(a: Creature, b: Creature): BattleResult {
  const maxHpA = maxHpFor(a);
  const maxHpB = maxHpFor(b);
  let hpA = maxHpA;
  let hpB = maxHpB;
  const powA = powerFor(a);
  const powB = powerFor(b);
  const steps: BattleStep[] = [];
  let stunA = 0, stunB = 0;
  let turn = 0;
  const maxTurns = 18;

  steps.push({ t: 0, text: `${nameOf(a)} (HP ${Math.round(maxHpA)}) faces off against ${nameOf(b)} (HP ${Math.round(maxHpB)}).`, hpA: 1, hpB: 1 });

  while (hpA > 0 && hpB > 0 && turn < maxTurns) {
    turn++;
    // A attacks B
    if (stunA > 0) {
      stunA--;
      steps.push({ t: turn, text: `${nameOf(a)} is stunned — skips a turn.`, hpA: hpA / maxHpA, hpB: hpB / maxHpB, flash: 'A' });
    } else {
      if (Math.random() < dodgeChance(b)) {
        steps.push({ t: turn, text: `${nameOf(b)} ${has(b, 'camouflage') ? 'vanishes into the foliage' : 'dodges'} the attack!`, hpA: hpA / maxHpA, hpB: hpB / maxHpB, flash: 'B' });
      } else {
        const raw = powA * 0.55 + Math.random() * powA * 0.35 - b.defenseTier * 4;
        const dmg = Math.max(1, Math.round(raw));
        hpB -= dmg;
        const verb = has(a, 'electric') ? 'zaps' : has(a, 'venom') ? 'envenomates' : a.legTier === 2 ? 'lunges at' : 'strikes';
        steps.push({ t: turn, text: `${nameOf(a)} ${verb} ${nameOf(b)} for ${dmg} dmg.`, hpA: hpA / maxHpA, hpB: Math.max(0, hpB) / maxHpB, flash: 'B' });
        if (has(a, 'electric') && Math.random() < 0.25) {
          stunB = 1;
          steps.push({ t: turn, text: `⚡ The shock stuns ${nameOf(b)}!`, hpA: hpA / maxHpA, hpB: Math.max(0, hpB) / maxHpB });
        }
      }
    }
    if (hpB <= 0) break;

    // B attacks A
    if (stunB > 0) {
      stunB--;
      steps.push({ t: turn, text: `${nameOf(b)} is stunned — skips a turn.`, hpA: hpA / maxHpA, hpB: hpB / maxHpB, flash: 'B' });
    } else {
      if (Math.random() < dodgeChance(a)) {
        steps.push({ t: turn, text: `${nameOf(a)} ${has(a, 'camouflage') ? 'blends out of sight' : 'sidesteps'} the strike!`, hpA: hpA / maxHpA, hpB: hpB / maxHpB, flash: 'A' });
      } else {
        const raw = powB * 0.55 + Math.random() * powB * 0.35 - a.defenseTier * 4;
        const dmg = Math.max(1, Math.round(raw));
        hpA -= dmg;
        const verb = has(b, 'electric') ? 'zaps' : has(b, 'venom') ? 'envenomates' : b.legTier === 2 ? 'lunges at' : 'strikes';
        steps.push({ t: turn, text: `${nameOf(b)} ${verb} ${nameOf(a)} for ${dmg} dmg.`, hpA: Math.max(0, hpA) / maxHpA, hpB: hpB / maxHpB, flash: 'A' });
        if (has(b, 'electric') && Math.random() < 0.25) {
          stunA = 1;
          steps.push({ t: turn, text: `⚡ The shock stuns ${nameOf(a)}!`, hpA: Math.max(0, hpA) / maxHpA, hpB: hpB / maxHpB });
        }
      }
    }
  }

  let winner: 'A' | 'B' | 'draw';
  let reason: string;
  if (hpA <= 0 && hpB <= 0) { winner = 'draw'; reason = 'Both creatures collapse — mutual KO.'; }
  else if (hpA <= 0) { winner = 'B'; reason = `${nameOf(b)} stands over a defeated ${nameOf(a)}.`; }
  else if (hpB <= 0) { winner = 'A'; reason = `${nameOf(a)} stands over a defeated ${nameOf(b)}.`; }
  else {
    // time-out — more HP fraction remaining wins
    const fa = hpA / maxHpA, fb = hpB / maxHpB;
    if (Math.abs(fa - fb) < 0.05) { winner = 'draw'; reason = 'The fight is called — both are still standing.'; }
    else if (fa > fb) { winner = 'A'; reason = `Time called. ${nameOf(a)} is fresher.`; }
    else { winner = 'B'; reason = `Time called. ${nameOf(b)} is fresher.`; }
  }
  return { winner, reason, steps };
}

// ─── Race ────────────────────────────────────────────────────────────────
// Side-by-side dash over a fixed course. Speed sets pace; running past your
// enduranceKm forces a slowdown.
function simulateRace(a: Creature, b: Creature): BattleResult {
  const sA = computeStats(a);
  const sB = computeStats(b);
  const courseKm = Math.max(1, (sA.enduranceKm + sB.enduranceKm) * 0.35);
  const steps: BattleStep[] = [];
  let posA = 0, posB = 0;
  let t = 0;
  const dt = 0.06; // 60 ms tick → simulate ~6 min max
  const maxT = 6;
  steps.push({ t: 0, text: `Course: ${courseKm.toFixed(1)} km. Speeds — ${nameOf(a)} ${sA.topSpeedKmh} km/h vs ${nameOf(b)} ${sB.topSpeedKmh} km/h.`, posA: 0, posB: 0 });

  let lastCommentary = 0;

  while (posA < courseKm && posB < courseKm && t < maxT) {
    t += dt;
    const fatigueA = posA > sA.enduranceKm ? 0.35 : posA > sA.enduranceKm * 0.7 ? 0.7 : 1;
    const fatigueB = posB > sB.enduranceKm ? 0.35 : posB > sB.enduranceKm * 0.7 ? 0.7 : 1;
    const gust = 0.92 + Math.random() * 0.16;
    posA += (sA.topSpeedKmh / 60) * dt * fatigueA * gust;   // km per minute
    posB += (sB.topSpeedKmh / 60) * dt * fatigueB * (0.92 + Math.random() * 0.16);
    if (t - lastCommentary > 0.6) {
      lastCommentary = t;
      const lead = posA - posB;
      const fA = posA / courseKm, fB = posB / courseKm;
      const text = Math.abs(lead) < courseKm * 0.05
        ? `${(fA * 100).toFixed(0)}% / ${(fB * 100).toFixed(0)}% — neck and neck.`
        : lead > 0
          ? `${nameOf(a)} leads (${(fA * 100).toFixed(0)}% / ${(fB * 100).toFixed(0)}%).`
          : `${nameOf(b)} leads (${(fA * 100).toFixed(0)}% / ${(fB * 100).toFixed(0)}%).`;
      steps.push({ t, text, posA: Math.min(1, fA), posB: Math.min(1, fB) });
    }
  }

  posA = Math.min(courseKm, posA);
  posB = Math.min(courseKm, posB);
  let winner: 'A' | 'B' | 'draw';
  let reason: string;
  if (posA >= courseKm && posB >= courseKm) {
    if (Math.abs(posA - posB) < 0.05) { winner = 'draw'; reason = 'Photo finish — too close to call.'; }
    else if (posA > posB) { winner = 'A'; reason = `${nameOf(a)} crosses first.`; }
    else { winner = 'B'; reason = `${nameOf(b)} crosses first.`; }
  } else if (posA >= courseKm) { winner = 'A'; reason = `${nameOf(a)} crosses the line.`; }
  else if (posB >= courseKm) { winner = 'B'; reason = `${nameOf(b)} crosses the line.`; }
  else {
    // both gassed out — whoever made more ground wins
    if (Math.abs(posA - posB) < 0.1) { winner = 'draw'; reason = 'Both collapse from exhaustion.'; }
    else if (posA > posB) { winner = 'A'; reason = `Both gas out; ${nameOf(a)} made more ground.`; }
    else { winner = 'B'; reason = `Both gas out; ${nameOf(b)} made more ground.`; }
  }
  steps.push({ t, text: reason, posA: Math.min(1, posA / courseKm), posB: Math.min(1, posB / courseKm) });
  return { winner, reason, steps };
}

// ─── Maze (puzzle race) ──────────────────────────────────────────────────
// Both creatures run the maze in parallel. Smarter brains pick shorter paths
// and finish faster; tiny brains often run out of stamina.
function simulateMaze(a: Creature, b: Creature): BattleResult {
  const sA = computeStats(a);
  const sB = computeStats(b);
  function pick(c: Creature) {
    const r = Math.random();
    const pShort = [0.05, 0.20, 0.55, 0.92][c.brainTier];
    const pLong = [0.55, 0.30, 0.07, 0.01][c.brainTier];
    if (r < pShort) return { name: 'shortcut', steps: 18 };
    if (r < pShort + (1 - pShort - pLong)) return { name: 'standard', steps: 32 };
    return { name: 'wander', steps: 52 };
  }
  function budget(c: Creature) {
    const sc = computeStats(c);
    return 25 + sc.enduranceKm * 1.2 + c.brainTier * 22 + c.sensorTier * 6 + (has(c, 'echolocation') ? 18 : 0);
  }
  const pA = pick(a);
  const pB = pick(b);
  const bA = budget(a);
  const bB = budget(b);
  const stepCostA = 2 + Math.sqrt(sA.massKg) * 0.3;
  const stepCostB = 2 + Math.sqrt(sB.massKg) * 0.3;
  const maxA = bA / stepCostA;
  const maxB = bB / stepCostB;
  const completesA = pA.steps <= maxA;
  const completesB = pB.steps <= maxB;
  const timeA = pA.steps;
  const timeB = pB.steps;

  const steps: BattleStep[] = [];
  steps.push({ t: 0, text: `${nameOf(a)} picks the ${pA.name} path (${pA.steps} steps); ${nameOf(b)} picks the ${pB.name} path (${pB.steps} steps).`, posA: 0, posB: 0 });
  steps.push({ t: 1, text: completesA ? `${nameOf(a)} has stamina for ${Math.floor(maxA)} steps — enough.` : `${nameOf(a)} has stamina for only ${Math.floor(maxA)} steps — short.` });
  steps.push({ t: 2, text: completesB ? `${nameOf(b)} has stamina for ${Math.floor(maxB)} steps — enough.` : `${nameOf(b)} has stamina for only ${Math.floor(maxB)} steps — short.` });

  let winner: 'A' | 'B' | 'draw';
  let reason: string;
  if (completesA && completesB) {
    if (timeA < timeB) { winner = 'A'; reason = `${nameOf(a)} finishes first (${timeA} steps vs ${timeB}).`; }
    else if (timeB < timeA) { winner = 'B'; reason = `${nameOf(b)} finishes first (${timeB} steps vs ${timeA}).`; }
    else { winner = 'draw'; reason = 'Both reach the exit at the same step.'; }
  } else if (completesA) { winner = 'A'; reason = `${nameOf(b)} runs out of stamina; ${nameOf(a)} walks out alone.`; }
  else if (completesB) { winner = 'B'; reason = `${nameOf(a)} runs out of stamina; ${nameOf(b)} walks out alone.`; }
  else { winner = 'draw'; reason = 'Both collapse before finding the exit.'; }

  steps.push({ t: 3, text: reason, posA: completesA ? 1 : timeA / pA.steps, posB: completesB ? 1 : timeB / pB.steps });
  return { winner, reason, steps };
}

// ─── Dive ────────────────────────────────────────────────────────────────
// Depth contest. Whoever can safely reach the deeper depth wins.
function divePotential(c: Creature): number {
  const s = computeStats(c);
  let d = 60;
  if (c.bodyPlan === 'fish') d += 500;
  if (has(c, 'gills')) d += 250;
  if (c.bodyPlan === 'mammal' && s.massKg > 500) d += 800;     // whales
  if (has(c, 'echolocation')) d += 150;
  if (c.defenseTier === 2) d += 80;
  if (c.warmBlooded && c.bodyPlan !== 'mammal' && c.bodyPlan !== 'bird') d -= 30;
  if (s.massKg < 0.1) d *= 0.3;  // tiny bodies can't dive
  return Math.round(d * (0.85 + Math.random() * 0.3));
}
function simulateDive(a: Creature, b: Creature): BattleResult {
  const dA = divePotential(a);
  const dB = divePotential(b);
  const maxDepth = Math.max(dA, dB);
  const steps: BattleStep[] = [];
  const ticks = 12;
  for (let i = 1; i <= ticks; i++) {
    const t = i / ticks;
    const depth = Math.round(maxDepth * t);
    const okA = depth <= dA;
    const okB = depth <= dB;
    let note = `${depth}m down...`;
    if (!okA && okB) note += ` ${nameOf(a)} can't go further!`;
    if (!okB && okA) note += ` ${nameOf(b)} can't go further!`;
    steps.push({ t, text: note, posA: okA ? t : Math.min(t, dA / maxDepth), posB: okB ? t : Math.min(t, dB / maxDepth) });
  }
  let winner: 'A' | 'B' | 'draw';
  let reason: string;
  if (Math.abs(dA - dB) < 30) { winner = 'draw'; reason = `Both bottom out near ${Math.min(dA, dB)}m — tied.`; }
  else if (dA > dB) { winner = 'A'; reason = `${nameOf(a)} dives to ${dA}m; ${nameOf(b)} stops at ${dB}m.`; }
  else { winner = 'B'; reason = `${nameOf(b)} dives to ${dB}m; ${nameOf(a)} stops at ${dA}m.`; }
  steps.push({ t: 1, text: reason });
  return { winner, reason, steps };
}

export function simulateBattle(a: Creature, b: Creature, venue: Venue): BattleResult {
  switch (venue) {
    case 'brawl': return simulateBrawl(a, b);
    case 'race':  return simulateRace(a, b);
    case 'maze':  return simulateMaze(a, b);
    case 'dive':  return simulateDive(a, b);
  }
}

export const VENUE_META: Record<Venue, { emoji: string; label: string; desc: string }> = {
  brawl: { emoji: '🥊', label: 'Brawl',        desc: 'Direct combat — HP, attacks, venom, electric stuns.' },
  race:  { emoji: '🏁', label: 'Race',         desc: 'Speed + endurance dash. Sprinters lead early; long-haulers win long.' },
  maze:  { emoji: '🧩', label: 'Puzzle race',  desc: 'Brain picks a path. Genius almost always finds the shortcut.' },
  dive:  { emoji: '🌊', label: 'Deep dive',    desc: 'Who survives the deeper depth — gills, body plan, blubber decide.' },
};
