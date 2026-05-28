import type { Creature } from '../types';
import {
  topSpeedKmh, enduranceKm, coldTolerance, sizeToMass,
} from '../physics';

interface Props {
  creature: Creature;
  W: number;
  H: number;
}

// ─── Arena fitness scoring ──────────────────────────────────────────────
// Each arena returns a 0-5 score (where 5 is "this creature shines here")
// and a recommended in-run strategy + a one-line reason. Scores are heuristic
// — they don't run a full simulation, but they capture the dominant signal
// (mass, body plan, brain, hybrids) so the player can see immediately if a
// design tweak helped or hurt their fit for each arena.

interface ArenaFit {
  id: string;
  emoji: string;
  name: string;
  score: number;        // 0-5
  best: string;         // recommended strategy
  reason: string;       // why this score
}

function chaseFit(c: Creature, stats: { topSpeedKmh: number; enduranceKm: number }): ArenaFit {
  const speed = stats.topSpeedKmh;       // ~10-90 in practice
  const stam = stats.enduranceKm;        // ~5-80
  let score = 0;
  if (speed > 60) score += 2; else if (speed > 40) score += 1.4; else if (speed > 25) score += 0.8;
  if (stam > 30) score += 2; else if (stam > 15) score += 1.3; else if (stam > 7) score += 0.7;
  if (c.bodyPlan === 'bird' && speed > 30) score += 0.6;  // bonus for aerial pursuit
  let best: string;
  let reason: string;
  if (speed > 60 && stam > 20) { best = '🐺 Pace yourself'; reason = 'Built for both speed and stamina'; }
  else if (speed > 60) { best = '🐆 Cheetah burst'; reason = 'Fast but tires fast — finish quick'; }
  else if (stam > 25) { best = '🐺 Pace yourself'; reason = 'Endurance hunter — long chases'; }
  else { best = '🏃 Full sprint'; reason = 'Average build — full effort'; }
  return { id: 'chase', emoji: '🐆', name: 'Chase', score: Math.min(5, score), best, reason };
}

function huntFit(c: Creature, stats: { topSpeedKmh: number; massKg: number }): ArenaFit {
  const hide  = (c.hybrids.includes('camouflage') ? 2.5 : 0) + (stats.massKg < 5 ? 2 : stats.massKg < 30 ? 1 : 0) + c.sensorTier * 0.4;
  const run   = stats.topSpeedKmh > 60 ? 3 : stats.topSpeedKmh > 40 ? 2 : stats.topSpeedKmh > 25 ? 1 : 0;
  const fight = (c.hybrids.includes('venom') ? 2 : 0) + (c.hybrids.includes('electric') ? 2 : 0) + (c.hybrids.includes('stoneskin') ? 1.5 : 0) + (c.hybrids.includes('firebreath') ? 2 : 0) + c.defenseTier * 1 + (stats.massKg > 500 ? 1.5 : 0);
  const best = Math.max(hide, run, fight);
  let strategy: string;
  let reason: string;
  if (hide >= best) { strategy = '🛡️ Defensive · Hide'; reason = c.hybrids.includes('camouflage') ? 'Camouflage + small body' : stats.massKg < 5 ? 'Tiny enough to slip away' : 'Sharp senses, low profile'; }
  else if (run >= best) { strategy = '⚖️ Balanced · Run'; reason = 'Outrun the predator'; }
  else { strategy = '⚔️ Aggressive · Fight'; reason = c.hybrids.includes('venom') ? 'Venom: bite back' : c.hybrids.includes('electric') ? 'Shock the attacker' : c.defenseTier >= 2 ? 'Armor takes hits' : 'Big enough to hold ground'; }
  return { id: 'hunt', emoji: '🌳', name: 'Hunt', score: Math.min(5, best * 1.1), best: strategy, reason };
}

function climbFit(c: Creature, stats: { massKg: number; coldTolerance: number }): ArenaFit {
  // Massive creatures struggle; cold-fragile creatures freeze.
  const massPenalty = stats.massKg > 1000 ? -2 : stats.massKg > 300 ? -1 : stats.massKg > 100 ? -0.5 : 0;
  const coldOk = stats.coldTolerance < 5 ? 2 : stats.coldTolerance < 15 ? 1 : 0;
  const fitness = (c.legTier >= 2 ? 1.5 : c.legTier >= 1 ? 1 : 0) + coldOk + (c.hybrids.includes('thick-fur') ? 1.5 : 0) + (c.hybrids.includes('antifreeze') ? 1 : 0);
  const score = Math.max(0, fitness + massPenalty + 2);  // +2 baseline
  let best: string;
  let reason: string;
  if (stats.massKg > 500) { best = '🧗 Cautious'; reason = 'Heavy — slow and careful'; }
  else if (c.hybrids.includes('thick-fur') && stats.coldTolerance < 0) { best = '💪 Power push'; reason = 'Insulated — burn through cold'; }
  else if (stats.massKg < 30 && c.legTier >= 2) { best = '💪 Power push'; reason = 'Light + nimble legs'; }
  else { best = '🪜 Steady'; reason = 'Balanced approach'; }
  return { id: 'climb', emoji: '🏔', name: 'Climb', score: Math.min(5, score), best, reason };
}

function droughtFit(c: Creature, stats: { massKg: number }): ArenaFit {
  // Cold-blooded + big = camel-tier; warm-blooded + small = dies fast.
  let score = 0;
  if (!c.warmBlooded) score += 2.5;
  if (stats.massKg > 50) score += 1.5; else if (stats.massKg > 10) score += 0.8;
  if (c.hybrids.includes('thick-fur')) score += 1;
  if (c.hybrids.includes('stoneskin')) score += 0.7;
  let best: string;
  let reason: string;
  if (!c.warmBlooded && stats.massKg > 50) { best = '🪨 Shelter'; reason = 'Cold-blooded + big — wait it out'; }
  else if (c.warmBlooded && stats.massKg < 10) { best = '💧 Find water'; reason = 'Small warm-blood loses water fast'; }
  else if (c.bodyPlan === 'fish' || c.hybrids.includes('gills')) { best = '💧 Find water'; reason = 'You need a puddle'; }
  else { best = '🌿💧 Split time'; reason = 'Balanced — work both bars'; }
  return { id: 'drought', emoji: '☀️', name: 'Drought', score: Math.min(5, score), best, reason };
}

function deepFit(c: Creature, stats: { massKg: number }): ArenaFit {
  const aquatic = c.bodyPlan === 'fish' || c.hybrids.includes('gills');
  const diveAdapted = c.adaptations?.some((a) => a.includes('diver') || a.includes('gills') || a.includes('deep-diving')) ?? false;
  const pressureProof = aquatic || diveAdapted || c.defenseTier === 2;
  const canGlide = c.bodyPlan === 'bird' || c.hybrids.includes('wings');
  let score = 0;
  if (aquatic) score += 2.5;
  else if (stats.massKg > 100) score += 1.2;     // big lungs
  else if (stats.massKg > 20) score += 0.6;
  if (diveAdapted) score += 1.5;
  if (pressureProof) score += 1;
  if (canGlide) score += 0.8;
  let best: string;
  let reason: string;
  if (aquatic && stats.massKg < 50) { best = '🐬 Swim · Porpoise'; reason = 'Aquatic + small = efficient cruise'; }
  else if (aquatic) { best = '🤿 Dive'; reason = 'Built for the deep'; }
  else if (canGlide && stats.massKg < 5) { best = '🪽 Glide · Soar'; reason = 'Light flier — ride the wind'; }
  else if (stats.massKg > 500) { best = '🤿 Dive · reef'; reason = 'Big lungs but watch pressure'; }
  else { best = '🏊 Swim · Steady'; reason = 'Cross the surface carefully'; }
  return { id: 'deep', emoji: '🌊', name: 'Deep', score: Math.min(5, score), best, reason };
}

function mazeFit(c: Creature, stats: { enduranceKm: number }): ArenaFit {
  const hasEcho = c.hybrids.includes('echolocation');
  let score = 0;
  score += c.brainTier * 1.2;
  score += c.sensorTier * 0.5;
  if (hasEcho) score += 1.2;
  if (stats.enduranceKm > 20) score += 0.5;
  let best: string;
  let reason: string;
  if (hasEcho) { best = '🦇 Echolocate'; reason = 'Hybrid bonus — half the stamina cost'; }
  else if (c.brainTier >= 3) { best = '🏃 Sprint'; reason = 'Genius brain picks the shortcut'; }
  else if (c.brainTier === 0) { best = '👃 Sniff careful'; reason = 'Conserve stamina for the long route'; }
  else { best = '🐾 Follow trail'; reason = 'Balanced pace'; }
  return { id: 'maze', emoji: '🧩', name: 'Maze', score: Math.min(5, score), best, reason };
}

function computeStats(c: Creature) {
  const massKg = sizeToMass(c.sizeUnit);
  return {
    massKg,
    topSpeedKmh: topSpeedKmh(massKg, c.bodyPlan, c.legTier),
    enduranceKm: enduranceKm(massKg, c.bodyPlan, c.warmBlooded, c.legTier),
    coldTolerance: coldTolerance(massKg, c.warmBlooded, c.defenseTier),
  };
}

// Color-code by score band — red for poor, amber for so-so, green for strong.
function scoreColor(s: number): string {
  if (s >= 4) return '#4a8a3a';
  if (s >= 2.5) return '#c08030';
  return '#a83030';
}

function scoreLabel(s: number): string {
  if (s >= 4.5) return 'shines';
  if (s >= 3.5) return 'strong';
  if (s >= 2.5) return 'okay';
  if (s >= 1.5) return 'weak';
  return 'unfit';
}

export function ArenaFitView({ creature, W, H }: Props) {
  const stats = computeStats(creature);
  const fits: ArenaFit[] = [
    chaseFit(creature, stats),
    huntFit(creature, stats),
    climbFit(creature, stats),
    droughtFit(creature, stats),
    deepFit(creature, stats),
    mazeFit(creature, stats),
  ];

  // 2 columns × 3 rows of cards inside the 400×300 stage.
  const cols = 2;
  const rows = 3;
  const pad = 8;
  const headerH = 30;
  const gridW = W - pad * 2;
  const gridH = H - headerH - pad;
  const cardW = (gridW - pad * (cols - 1)) / cols;
  const cardH = (gridH - pad * (rows - 1)) / rows;

  return (
    <>
      <rect width={W} height={H} fill="#fbf6e6" />
      <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fontWeight="700" fill="#5a3b18" letterSpacing="0.05em">
        🎯 ARENA FIT · how good is this design?
      </text>
      <line x1={W / 2 - 130} y1={26} x2={W / 2 + 130} y2={26} stroke="#5a3b18" strokeWidth="0.8" opacity="0.5" />

      {fits.map((f, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = pad + col * (cardW + pad);
        const y = headerH + row * (cardH + pad);
        const color = scoreColor(f.score);
        return (
          <g key={f.id} transform={`translate(${x} ${y})`}>
            <rect width={cardW} height={cardH} fill="white" stroke={color} strokeWidth="1.8" rx="8" />
            <rect width="4" height={cardH} fill={color} />
            {/* arena header */}
            <text x="10" y="16" fontSize="13">{f.emoji}</text>
            <text x="30" y="15" fontSize="11" fontWeight="800" fill="#1a1208">{f.name}</text>
            <text x={cardW - 8} y="15" textAnchor="end" fontSize="9" fontWeight="700" fill={color} letterSpacing="0.04em">
              {scoreLabel(f.score).toUpperCase()}
            </text>
            {/* star rating */}
            <g transform="translate(8 22)">
              {Array.from({ length: 5 }).map((_, s) => {
                const filled = f.score >= s + 1;
                const partial = !filled && f.score > s;
                const cx = s * 12 + 6;
                return (
                  <g key={s}>
                    <text x={cx} y="10" textAnchor="middle" fontSize="11"
                          fill={filled ? color : partial ? color : '#ddd'}
                          opacity={partial ? 0.5 : 1}>
                      ★
                    </text>
                  </g>
                );
              })}
              <text x="72" y="10" fontSize="9" fill="#6a4828">
                {f.score.toFixed(1)} / 5
              </text>
            </g>
            {/* best strategy */}
            <text x="8" y={cardH - 18} fontSize="9.5" fontWeight="700" fill={color}>
              {f.best}
            </text>
            <text x="8" y={cardH - 6} fontSize="8.5" fill="#6a4828" fontStyle="italic">
              {f.reason.length > 38 ? f.reason.slice(0, 36) + '…' : f.reason}
            </text>
          </g>
        );
      })}
    </>
  );
}
