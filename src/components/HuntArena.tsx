import { useState } from 'react';
import type { CreatureStats } from '../physics';
import { sizeToMass } from '../physics';
import type { Creature } from '../types';
import { CreatureBody } from './CreatureSVG';
import { BespokeInScene, hasBespokeShape } from './dexShapes';

export type HuntOutcome = {
  won: boolean;
  reason: 'hidden' | 'outran' | 'tanked' | 'fought' | 'caught';
  env: 'savanna' | 'forest' | 'mountain' | 'desert' | 'ocean';
  strategy: 'hide' | 'run' | 'fight';
  difficulty?: HuntDifficultyId;
};

export type HuntDifficultyId = 'normal' | 'tough' | 'apex';

interface HuntDifficulty {
  id: HuntDifficultyId;
  label: string;
  emoji: string;
  perceptionMult: number;   // higher = predator sees you better
  biteMult: number;          // higher = predator hits harder
  rewardMult: number;
  description: string;
}

const HUNT_DIFFICULTIES: HuntDifficulty[] = [
  { id: 'normal', label: 'Normal',  emoji: '⭐',     perceptionMult: 1.0, biteMult: 1.0, rewardMult: 1.0, description: 'Standard predator. Beatable with the right strategy.' },
  { id: 'tough',  label: 'Tough',   emoji: '⭐⭐',    perceptionMult: 1.25, biteMult: 1.2, rewardMult: 1.5, description: 'Battle-hardened predator. +25% perception, +20% bite.' },
  { id: 'apex',   label: 'Apex',    emoji: '⭐⭐⭐',   perceptionMult: 1.5,  biteMult: 1.4, rewardMult: 2.2, description: 'Legendary alpha. +50% perception, +40% bite. Bring everything.' },
];

interface Props {
  creature: Creature;
  stats: CreatureStats;
  onFinish: (o: HuntOutcome) => void;
}

type EnvId = 'savanna' | 'forest' | 'mountain' | 'desert' | 'ocean';
type Strategy = 'hide' | 'run' | 'fight';

interface Predator {
  envName: string;
  envEmoji: string;
  name: string;
  emoji: string;
  topKmh: number;
  perception: number;
  bite: number;
  sky: [string, string];
  ground: [string, string];
  envNote: string;
}

const PREDATORS: Record<EnvId, Predator> = {
  savanna: {
    envName: 'Savanna', envEmoji: '🌾',
    name: 'Lion', emoji: '🦁', topKmh: 80, perception: 55, bite: 70,
    sky: ['#9fd4ee', '#f8d68a'], ground: ['#f3d27d', '#c9a05a'],
    envNote: 'Open grassland. Lions run in pride; long sightlines.',
  },
  forest: {
    envName: 'Forest', envEmoji: '🌳',
    name: 'Wolf', emoji: '🐺', topKmh: 65, perception: 70, bite: 50,
    sky: ['#7fa663', '#cfd7a0'], ground: ['#7a6a3a', '#54472a'],
    envNote: 'Dense trees + scent tracking. Wolves work in packs.',
  },
  mountain: {
    envName: 'Mountain', envEmoji: '🏔',
    name: 'Snow Leopard', emoji: '🐆', topKmh: 60, perception: 85, bite: 55,
    sky: ['#b8c8d4', '#e5eef3'], ground: ['#c0ccd3', '#8089a0'],
    envNote: 'Snow + cliffs. Ambush hunter, near-invisible against rock.',
  },
  desert: {
    envName: 'Desert', envEmoji: '🏜',
    name: 'Hyena', emoji: '🐺', topKmh: 60, perception: 50, bite: 75,
    sky: ['#ffd589', '#fbe9b0'], ground: ['#e3b06a', '#a07a45'],
    envNote: 'Bone-crushing bite force, but distracted in heat.',
  },
  ocean: {
    envName: 'Ocean', envEmoji: '🌊',
    name: 'Shark', emoji: '🦈', topKmh: 50, perception: 65, bite: 85,
    sky: ['#74c4dc', '#2a5a85'], ground: ['#2a5a85', '#0c2a45'],
    envNote: 'Electroreception + smell. Bite ignores most armor.',
  },
};

function stealthScore(c: Creature): number {
  const m = sizeToMass(c.sizeUnit);
  let s = 55 - Math.log10(Math.max(0.01, m) + 0.1) * 14;
  if (c.hybrids.includes('camouflage')) s += 30;
  if (c.defenseTier === 1) s += 5;
  if (c.defenseTier === 2) s -= 15;
  if (c.sensorTier === 2) s += 10;
  s += c.brainTier * 5;
  if (c.bodyPlan === 'fish') s -= 25;
  if (c.bodyPlan === 'bird') s += 8;
  return Math.max(0, Math.min(100, s));
}

function fightPower(c: Creature, s: CreatureStats): number {
  let p = 5;
  // Mass is a big deal in a fight: log-scale so even modest creatures get
  // some, and huge creatures dominate.
  // 1 kg → ~12, 100 kg → ~32, 4000 kg → ~52, 100 t → ~72
  p += Math.max(0, (Math.log10(Math.max(0.01, s.massKg)) + 1) * 12);
  if (c.hybrids.includes('venom')) p += 45;
  if (c.hybrids.includes('electric')) p += 55;
  if (c.defenseTier === 2) p += 28;
  if (c.defenseTier === 1) p += 8;
  if (c.brainTier >= 2) p += 12 + (c.brainTier - 2) * 6; // genius gets another +6
  else if (c.brainTier === 1) p += 5;
  if (c.legTier === 2) p += 8;
  if (c.legTier === 1) p += 4;
  if (c.sensorTier === 2) p += 6;
  return Math.min(100, p);
}

function predictHide(c: Creature, p: Predator) {
  const stealth = stealthScore(c);
  return { score: stealth, opp: p.perception, margin: stealth - p.perception };
}
function predictRun(s: CreatureStats, p: Predator) {
  return { score: s.topSpeedKmh, opp: p.topKmh, margin: s.topSpeedKmh - p.topKmh };
}
function predictFight(c: Creature, s: CreatureStats, p: Predator) {
  const power = fightPower(c, s);
  return { score: power, opp: p.bite, margin: power - p.bite };
}

const LUCK_SWING = 15;

function confidence(margin: number): { label: string; cls: string } {
  if (margin > 20) return { label: 'very likely', cls: 'good' };
  if (margin > 5) return { label: 'likely', cls: 'good' };
  if (margin > -5) return { label: 'coin flip', cls: 'ok' };
  if (margin > -20) return { label: 'unlikely', cls: 'risky' };
  return { label: 'long shot', cls: 'bad' };
}

function reasonFor(strategy: Strategy, won: boolean, c: Creature): HuntOutcome['reason'] {
  if (!won) return 'caught';
  if (strategy === 'hide') return 'hidden';
  if (strategy === 'run') return 'outran';
  if (c.hybrids.includes('venom') || c.hybrids.includes('electric')) return 'fought';
  return 'tanked';
}

const W = 600;
const H = 220;
const GROUND_Y = 170;

export function HuntArena({ creature, stats, onFinish }: Props) {
  const [envId, setEnvId] = useState<EnvId>('forest');
  const [difficultyId, setDifficultyId] = useState<HuntDifficultyId>('normal');
  // Three-phase flow: 'choose' (pick strategy) → 'play' (animate the
  // outcome for ~1.7s) → 'done' (insight card shows).
  const [phase, setPhase] = useState<'choose' | 'play' | 'done'>('choose');
  const [playingStrategy, setPlayingStrategy] = useState<Strategy | null>(null);
  const [playWon, setPlayWon] = useState(false);
  const [flashOn, setFlashOn] = useState(false);

  const diff = HUNT_DIFFICULTIES.find((d) => d.id === difficultyId) ?? HUNT_DIFFICULTIES[0];

  // Scale the predator by the chosen difficulty.
  const basePred = PREDATORS[envId];
  const p: Predator = {
    ...basePred,
    perception: Math.round(basePred.perception * diff.perceptionMult),
    bite: Math.round(basePred.bite * diff.biteMult),
  };
  const hide = predictHide(creature, p);
  const run = predictRun(stats, p);
  const fight = predictFight(creature, stats, p);

  function play(strategy: Strategy) {
    const result =
      strategy === 'hide' ? hide :
      strategy === 'run' ? run :
      fight;
    const luck = (Math.random() * 2 - 1) * LUCK_SWING;
    const adjustedMargin = result.margin + luck;
    const won = adjustedMargin > 0;
    setPlayingStrategy(strategy);
    setPlayWon(won);
    setPhase('play');
    // Mid-animation flash for fight + lost-hide collisions.
    if (strategy === 'fight' || (!won && strategy === 'hide')) {
      window.setTimeout(() => setFlashOn(true), 900);
      window.setTimeout(() => setFlashOn(false), 1200);
    }
    // After the animation, settle to 'done' and report the outcome up.
    window.setTimeout(() => {
      setPhase('done');
      onFinish({ won, reason: reasonFor(strategy, won, creature), env: envId, strategy, difficulty: diff.id });
    }, 1800);
  }

  function reset() {
    setPhase('choose');
    setPlayingStrategy(null);
    setFlashOn(false);
  }

  const done = phase === 'done';
  const playing = phase === 'play';

  // Animated positions for creature + predator based on phase / strategy /
  // outcome. Values are svg-coordinates (translateX). Plain numbers go
  // into inline `transform: translateX(...)` with a CSS transition so the
  // bodies actually slide.
  const baseCreatureX = W * 0.28;
  const basePredX = W * 0.72;
  let creatureDX = 0;
  let predDX = 0;
  let creatureOpacity = 1;
  let predOpacity = 1;
  if (playing && playingStrategy === 'hide') {
    // Creature crouches + fades (camouflage). Predator sweeps left,
    // looking. If won, predator passes by; if lost, predator pounces.
    creatureOpacity = 0.35;
    predDX = playWon ? -160 : -(basePredX - baseCreatureX);
  } else if (playing && playingStrategy === 'run') {
    // Both dash left. Creature exits screen first if won, gets caught
    // if lost.
    creatureDX = playWon ? -(W * 0.45) : -(W * 0.32);
    predDX = playWon ? -(W * 0.3) : -(W * 0.48);
  } else if (playing && playingStrategy === 'fight') {
    // Both close to center, then one retreats.
    creatureDX = playWon ? 60 : 100;
    predDX = playWon ? -160 : -100;
    if (playWon) predOpacity = 0.45;     // predator fades on retreat
    else creatureOpacity = 0.55;
  }

  return (
    <div className="arena">
      <h2>The Hunt — encounter <small className="arena-env">· {p.envName} · {diff.emoji} {diff.label} · ×{diff.rewardMult.toFixed(1)} reward</small></h2>
      <p className="arena-help">{p.envNote} <em>{diff.description}</em></p>

      <div className="prey-tabs">
        {(Object.entries(PREDATORS) as [EnvId, Predator][]).map(([id, def]) => (
          <button
            key={id}
            type="button"
            className={`prey-tab${envId === id ? ' active' : ''}`}
            onClick={() => { setEnvId(id); reset(); }}
            disabled={done || playing}
            title={`${def.envName} — ${def.name}`}
          >
            <span className="prey-emoji">{def.envEmoji}</span>
            <span className="prey-name">{def.envName}<small> {def.emoji}</small></span>
          </button>
        ))}
      </div>

      <div className="prey-tabs">
        {HUNT_DIFFICULTIES.map((d) => (
          <button
            key={d.id}
            type="button"
            className={`prey-tab${difficultyId === d.id ? ' active' : ''}`}
            onClick={() => { setDifficultyId(d.id); reset(); }}
            disabled={done || playing}
            title={d.description}
          >
            <span className="prey-emoji">{d.emoji}</span>
            <span className="prey-name">{d.label}<small> ×{d.rewardMult.toFixed(1)}</small></span>
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="hunt-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.sky[0]} />
            <stop offset="1" stopColor={p.sky[1]} />
          </linearGradient>
          <linearGradient id="hunt-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.ground[0]} />
            <stop offset="1" stopColor={p.ground[1]} />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width={W} height={GROUND_Y} fill="url(#hunt-sky)" />
        <rect x="0" y={GROUND_Y} width={W} height={H - GROUND_Y} fill="url(#hunt-ground)" />

        {envId === 'forest' && (
          <>
            {[80, 200, 340, 470].map((tx, i) => (
              <g key={i}>
                <rect x={tx - 4} y={GROUND_Y - 60} width="8" height="60" fill="#3e2a18" />
                <ellipse cx={tx} cy={GROUND_Y - 70} rx="34" ry="22" fill="#3f6b34" />
              </g>
            ))}
          </>
        )}
        {envId === 'savanna' && (
          <>
            {[100, 280, 460].map((tx, i) => (
              <g key={i}>
                <rect x={tx - 3} y={GROUND_Y - 50} width="6" height="50" fill="#5a3b22" />
                <ellipse cx={tx} cy={GROUND_Y - 56} rx="26" ry="10" fill="#557d3e" />
              </g>
            ))}
          </>
        )}
        {envId === 'mountain' && (
          <polygon points={`100,${GROUND_Y} 240,80 380,${GROUND_Y} 480,90 ${W},${GROUND_Y}`} fill="white" stroke="#bbb" strokeWidth="1" />
        )}
        {envId === 'desert' && (
          <>
            <circle cx={W - 80} cy="60" r="30" fill="#ffb84a" opacity="0.85" />
            <ellipse cx="80" cy={GROUND_Y + 8} rx="30" ry="6" fill="#a07a45" />
          </>
        )}
        {envId === 'ocean' && (
          <>
            {Array.from({ length: 5 }).map((_, i) => (
              <ellipse key={i} cx={50 + i * 120} cy={GROUND_Y + 30 + (i % 2) * 10} rx="30" ry="6" fill="#3a6fa3" opacity="0.5" />
            ))}
            {Array.from({ length: 12 }).map((_, i) => (
              <circle key={i} cx={(i * 73) % W} cy={50 + ((i * 37) % 110)} r={1.5} fill="white" opacity="0.5" />
            ))}
          </>
        )}

        {/* AMBIENT LIVE DETAILS — birds, leaves, dust, etc. */}
        <g>
          {/* always 2-3 flapping bird silhouettes high in the sky */}
          {[120, 200, 280].map((bx, i) => (
            <g key={`bird-${i}`} transform={`translate(${bx} ${30 + i * 8})`} className="bird-wing" style={{ transformOrigin: 'center' }}>
              <path d="M -6 0 Q -3 -3 0 0 Q 3 -3 6 0" stroke="#3a2a18" strokeWidth="1.1" fill="none" strokeLinecap="round" />
            </g>
          ))}
          {/* falling leaves in the forest */}
          {envId === 'forest' && Array.from({ length: 8 }).map((_, i) => (
            <g key={`leaf-${i}`} className="snowflake" style={{ animationDuration: `${4 + (i % 4)}s`, animationDelay: `-${i * 0.5}s` }}>
              <ellipse cx={(i * 73 + 10) % W} cy={-10 + (i * 17) % 40} rx="3" ry="1.5" fill="#9a6a30" opacity="0.85" transform={`rotate(${(i * 37) % 90} ${(i * 73 + 10) % W} ${-10 + (i * 17) % 40})`} />
            </g>
          ))}
          {/* sand puffs in desert */}
          {envId === 'desert' && Array.from({ length: 12 }).map((_, i) => (
            <circle key={`sand-${i}`} cx={((i * 53) % W)} cy={GROUND_Y + 6 + ((i * 19) % 12)} r={1.5 + (i % 3) * 0.4} fill="#e6c890" opacity="0.55" className="snowflake"
              style={{ animationDuration: `${3 + (i % 2)}s`, animationDelay: `-${i * 0.3}s` }} />
          ))}
        </g>

        {/* PLAYER CREATURE — animates left/away based on phase */}
        <g
          style={{
            transition: playing ? 'transform 1.5s ease-in-out, opacity 0.6s ease-in-out' : 'none',
            transform: `translateX(${creatureDX}px)`,
            opacity: creatureOpacity,
          }}
        >
          {hasBespokeShape(creature) ? (
            <BespokeInScene creature={creature} x={W * 0.28 - 50} y={GROUND_Y - 80} width={100} height={80} animate="breathe" />
          ) : (
            <g transform={`translate(${W * 0.28} 0)`}>
              <CreatureBody creature={creature} cx={0} footY={GROUND_Y} scale={0.32} animate="breathe" />
            </g>
          )}
        </g>

        {/* PREDATOR — animates toward/away based on phase */}
        <g
          style={{
            transition: playing ? 'transform 1.5s ease-in-out, opacity 0.5s ease-in-out' : 'none',
            transform: `translateX(${predDX}px)`,
            opacity: predOpacity,
          }}
        >
          <g transform={`translate(${W * 0.72} ${GROUND_Y - 10})`}>
            <ellipse cx="0" cy="6" rx="34" ry="4" fill="rgba(0,0,0,0.25)" />
            <text x="0" y="0" fontSize="56" textAnchor="middle">{p.emoji}</text>
            <text x="0" y="22" fontSize="11" textAnchor="middle" fill="#333" fontWeight="700">{p.name}</text>
          </g>
        </g>

        {/* COLLISION FLASH — appears briefly on a fight or a lost hide */}
        {flashOn && (
          <g>
            <rect x="0" y="0" width={W} height={H} fill="white" opacity="0.55" />
            {/* impact starburst at center */}
            <g transform={`translate(${(baseCreatureX + basePredX) / 2 + (creatureDX + predDX) / 2} ${GROUND_Y - 40})`}>
              {Array.from({ length: 10 }).map((_, i) => {
                const a = (i / 10) * Math.PI * 2;
                return <line key={i} x1={Math.cos(a) * 8} y1={Math.sin(a) * 8} x2={Math.cos(a) * 28} y2={Math.sin(a) * 28} stroke="#ffd040" strokeWidth="3" strokeLinecap="round" />;
              })}
              <text x="0" y="6" fontSize="22" textAnchor="middle">💥</text>
            </g>
          </g>
        )}

        {/* PLAYING-PHASE OVERLAY — small caption explaining what's happening */}
        {playing && playingStrategy && (
          <g>
            <rect x={W / 2 - 90} y="8" width="180" height="22" fill="rgba(255,255,255,0.92)" rx="11" stroke="#aaa" />
            <text x={W / 2} y="23" textAnchor="middle" fontSize="12" fill="#333" fontWeight="700">
              {playingStrategy === 'hide' && (playWon ? '🫥 holding still…' : '🫥 hiding… spotted!')}
              {playingStrategy === 'run' && (playWon ? '🏃 sprinting away' : '🏃 chase is on…')}
              {playingStrategy === 'fight' && (playWon ? '⚔️ standing ground' : '⚔️ they bite back!')}
            </text>
          </g>
        )}
      </svg>

      <div className="strategy-row">
        <StrategyButton
          icon="🫥" name="Hide" onClick={() => play('hide')}
          score={hide.score} opp={hide.opp} oppLabel="perception" margin={hide.margin}
          disabled={done || playing}
        />
        <StrategyButton
          icon="🏃" name="Run" onClick={() => play('run')}
          score={run.score} opp={run.opp} oppLabel="speed" scoreSuffix=" km/h" margin={run.margin}
          disabled={done || playing}
        />
        <StrategyButton
          icon="⚔️" name="Fight" onClick={() => play('fight')}
          score={fight.score} opp={fight.opp} oppLabel="bite" margin={fight.margin}
          disabled={done || playing}
        />
      </div>

      <div className="arena-controls">
        {done && (
          <button className="btn" onClick={reset} type="button">Try again</button>
        )}
      </div>
    </div>
  );
}

function StrategyButton({
  icon, name, score, opp, oppLabel, scoreSuffix = '', margin, onClick, disabled,
}: {
  icon: string;
  name: string;
  score: number;
  opp: number;
  oppLabel: string;
  scoreSuffix?: string;
  margin: number;
  onClick: () => void;
  disabled: boolean;
}) {
  const c = confidence(margin);
  return (
    <button type="button" className={`strategy-btn strategy-${c.cls}`} onClick={onClick} disabled={disabled}>
      <div className="strategy-head">
        <span className="strategy-icon">{icon}</span>
        <span className="strategy-name">{name}</span>
      </div>
      <div className="strategy-stats">
        you <strong>{Math.round(score)}{scoreSuffix}</strong> vs {oppLabel} <strong>{Math.round(opp)}</strong>
      </div>
      <div className={`strategy-conf strategy-conf-${c.cls}`}>{c.label}</div>
    </button>
  );
}
