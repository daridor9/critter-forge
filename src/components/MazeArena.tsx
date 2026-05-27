import { useEffect, useMemo, useRef, useState } from 'react';
import type { CreatureStats } from '../physics';
import type { Creature } from '../types';
import { CreatureBody } from './CreatureSVG';
import { BespokeInScene, hasBespokeShape } from './dexShapes';
import { comboEffects, getActiveCombo } from '../data/hybridCombos';

export type MazeOutcome = {
  won: boolean;
  reason: 'escaped' | 'exhausted';
  stepsTaken: number;
  stepsNeeded: number;
};

interface Props {
  creature: Creature;
  stats: CreatureStats;
  onFinish: (o: MazeOutcome) => void;
}

const TICK_MS = 50;
const STEP_INTERVAL_S = 0.30;

const W = 600;
const H = 240;

// ─── Themes ────────────────────────────────────────────────────────────
export type MazeThemeId = 'cave' | 'hedge' | 'lab' | 'sonar';

interface MazeTheme {
  id: MazeThemeId;
  label: string;
  emoji: string;
  description: string;
  bgTop: string;
  bgBottom: string;
  gridColor: string;
  pathColor: string;        // base path color (overrides PathDef colors per-theme accent)
  rewardMult: number;
  difficultyLabel: string;
}

const MAZE_THEMES: MazeTheme[] = [
  { id: 'cave',  label: 'Cave',         emoji: '🪨', description: 'Dark stone maze. Default difficulty.',                            bgTop: '#2c2f3a', bgBottom: '#1a1c24', gridColor: '#3a3f4a', pathColor: '#f0e2c8', rewardMult: 1.0, difficultyLabel: 'normal' },
  { id: 'hedge', label: 'Hedge garden', emoji: '🌿', description: 'Green hedge maze under sunlight.',                                 bgTop: '#6a9a3a', bgBottom: '#3a6a1a', gridColor: '#4a7a2a', pathColor: '#c8e0a0', rewardMult: 1.3, difficultyLabel: 'medium' },
  { id: 'lab',   label: 'Lab',          emoji: '🔬', description: 'Sci-fi neon maze. Tighter corridors, sharper turns.',             bgTop: '#1a2030', bgBottom: '#0a1020', gridColor: '#3a5080', pathColor: '#9ae0ff', rewardMult: 1.6, difficultyLabel: 'hard' },
  { id: 'sonar', label: 'Sonar cave',   emoji: '📡', description: 'Pitch-dark cavern. You only see a few meters around you, lit by sonar pings.', bgTop: '#06090e', bgBottom: '#020407', gridColor: '#1a2030', pathColor: '#5ad8ff', rewardMult: 1.9, difficultyLabel: 'extreme' },
];

// Three visible paths from START to EXIT. The creature picks one
// stochastically — smarter brains weight toward the shortcut, dumber brains
// weight toward the wander. All three are drawn so the kid can see the
// options and which one the creature actually takes.
interface PathDef {
  id: 'short' | 'medium' | 'long';
  label: string;
  emoji: string;
  color: string;
  steps: number; // length in "steps" — short=18, medium=32, long=52
  points: { x: number; y: number }[];
}

// Path SHAPES differ per theme so each theme reads as a genuinely
// different maze layout, not just a recolor:
//   cave   organic curves with a meandering long route
//   hedge  strict 90-degree right-angle turns (classic hedge maze)
//   lab    grid-aligned shortcuts + a long circuit loop (sci-fi)
const PATHS_BY_THEME: Record<MazeThemeId, PathDef[]> = {
  cave: [
    {
      id: 'short', label: 'shortcut', emoji: '⚡', color: '#5cc46a',
      steps: 18,
      points: [
        { x: 30, y: 120 }, { x: 200, y: 120 }, { x: 400, y: 120 }, { x: 570, y: 120 },
      ],
    },
    {
      id: 'medium', label: 'standard', emoji: '🧭', color: '#e8a838',
      steps: 32,
      points: [
        { x: 30, y: 120 }, { x: 110, y: 120 }, { x: 110, y: 60 },
        { x: 230, y: 60 }, { x: 230, y: 180 }, { x: 380, y: 180 },
        { x: 380, y: 60 }, { x: 500, y: 60 }, { x: 500, y: 120 }, { x: 570, y: 120 },
      ],
    },
    {
      id: 'long', label: 'wander', emoji: '🌀', color: '#c87878',
      steps: 52,
      points: [
        { x: 30, y: 120 }, { x: 60, y: 200 }, { x: 140, y: 220 }, { x: 180, y: 160 },
        { x: 240, y: 220 }, { x: 300, y: 180 }, { x: 280, y: 80 }, { x: 360, y: 40 },
        { x: 430, y: 100 }, { x: 470, y: 200 }, { x: 530, y: 160 }, { x: 570, y: 120 },
      ],
    },
  ],

  // HEDGE — formal garden maze with strict right-angle turns. The
  // shortcut is a clean L-route, the standard goes around a planter,
  // the long path threads through every cardinal compartment.
  hedge: [
    {
      id: 'short', label: 'green way', emoji: '🌱', color: '#5cc46a',
      steps: 22,
      points: [
        { x: 30, y: 120 }, { x: 30, y: 60 }, { x: 290, y: 60 }, { x: 290, y: 120 },
        { x: 570, y: 120 },
      ],
    },
    {
      id: 'medium', label: 'planter loop', emoji: '🌷', color: '#e8a838',
      steps: 38,
      points: [
        { x: 30, y: 120 }, { x: 30, y: 180 }, { x: 150, y: 180 },
        { x: 150, y: 80 }, { x: 270, y: 80 }, { x: 270, y: 180 },
        { x: 410, y: 180 }, { x: 410, y: 80 }, { x: 520, y: 80 },
        { x: 520, y: 120 }, { x: 570, y: 120 },
      ],
    },
    {
      id: 'long', label: 'royal labyrinth', emoji: '👑', color: '#c87878',
      steps: 58,
      points: [
        { x: 30, y: 120 }, { x: 30, y: 200 }, { x: 100, y: 200 },
        { x: 100, y: 60 }, { x: 180, y: 60 }, { x: 180, y: 200 },
        { x: 260, y: 200 }, { x: 260, y: 60 }, { x: 340, y: 60 },
        { x: 340, y: 200 }, { x: 420, y: 200 }, { x: 420, y: 60 },
        { x: 510, y: 60 }, { x: 510, y: 200 }, { x: 570, y: 200 },
        { x: 570, y: 120 },
      ],
    },
  ],

  // LAB — sci-fi maze with sharper diagonals + a circuit-style long
  // route. Shortcut is a diagonal "data bus", standard is a precision
  // zigzag, long is a perimeter circuit.
  lab: [
    {
      id: 'short', label: 'data bus', emoji: '⚡', color: '#5cc46a',
      steps: 16,
      points: [
        { x: 30, y: 120 }, { x: 130, y: 80 }, { x: 280, y: 120 },
        { x: 430, y: 80 }, { x: 570, y: 120 },
      ],
    },
    {
      id: 'medium', label: 'pipeline', emoji: '🔌', color: '#e8a838',
      steps: 30,
      points: [
        { x: 30, y: 120 }, { x: 100, y: 120 }, { x: 100, y: 60 },
        { x: 200, y: 60 }, { x: 200, y: 180 }, { x: 320, y: 180 },
        { x: 320, y: 60 }, { x: 440, y: 60 }, { x: 440, y: 120 },
        { x: 570, y: 120 },
      ],
    },
    {
      id: 'long', label: 'mainframe loop', emoji: '🌀', color: '#c87878',
      steps: 48,
      points: [
        { x: 30, y: 120 }, { x: 30, y: 200 }, { x: 540, y: 200 },
        { x: 540, y: 50 }, { x: 60, y: 50 }, { x: 60, y: 150 },
        { x: 480, y: 150 }, { x: 480, y: 100 }, { x: 200, y: 100 },
        { x: 200, y: 120 }, { x: 570, y: 120 },
      ],
    },
  ],

  // SONAR CAVE — extra-long winding paths since you can't see ahead.
  // The "shortcut" is more chaotic than the cave default; the long
  // path is a multi-chamber descent.
  sonar: [
    {
      id: 'short', label: 'echo gap', emoji: '🔊', color: '#5cc46a',
      steps: 22,
      points: [
        { x: 30, y: 120 }, { x: 110, y: 160 }, { x: 220, y: 100 },
        { x: 350, y: 150 }, { x: 460, y: 100 }, { x: 570, y: 120 },
      ],
    },
    {
      id: 'medium', label: 'cavern run', emoji: '🌀', color: '#e8a838',
      steps: 36,
      points: [
        { x: 30, y: 120 }, { x: 80, y: 60 }, { x: 170, y: 90 },
        { x: 230, y: 180 }, { x: 320, y: 150 }, { x: 360, y: 60 },
        { x: 450, y: 100 }, { x: 510, y: 180 }, { x: 570, y: 120 },
      ],
    },
    {
      id: 'long', label: 'deep chamber', emoji: '🕳', color: '#c87878',
      steps: 56,
      points: [
        { x: 30, y: 120 }, { x: 50, y: 200 }, { x: 130, y: 220 },
        { x: 200, y: 180 }, { x: 240, y: 70 }, { x: 320, y: 50 },
        { x: 380, y: 130 }, { x: 320, y: 200 }, { x: 420, y: 220 },
        { x: 490, y: 170 }, { x: 510, y: 80 }, { x: 570, y: 120 },
      ],
    },
  ],
};

function pathLengths(pts: { x: number; y: number }[]): { segLens: number[]; cumLens: number[]; total: number } {
  const segLens: number[] = [];
  const cumLens: number[] = [];
  let cum = 0;
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i - 1].x;
    const dy = pts[i].y - pts[i - 1].y;
    const len = Math.hypot(dx, dy);
    segLens.push(len);
    cum += len;
    cumLens.push(cum);
  }
  return { segLens, cumLens, total: cum };
}

function pointAtPath(pathPts: { x: number; y: number }[], t: number): { x: number; y: number } {
  const { segLens, cumLens, total } = pathLengths(pathPts);
  const target = Math.max(0, Math.min(1, t)) * total;
  for (let i = 0; i < segLens.length; i++) {
    const start = i > 0 ? cumLens[i - 1] : 0;
    const end = cumLens[i];
    if (target <= end) {
      const local = segLens[i] === 0 ? 0 : (target - start) / segLens[i];
      return {
        x: pathPts[i].x + (pathPts[i + 1].x - pathPts[i].x) * local,
        y: pathPts[i].y + (pathPts[i + 1].y - pathPts[i].y) * local,
      };
    }
  }
  return pathPts[pathPts.length - 1];
}

// How likely is the creature to pick each path, given its brain?
// Smarter brains see the shortcut more easily. Echolocation / sharp senses
// nudge picks toward the shortcut too. Returns [pShort, pMedium, pLong].
function pickProbabilities(c: Creature): [number, number, number] {
  let pShort = [0.05, 0.20, 0.55, 0.92][c.brainTier];
  let pLong  = [0.55, 0.30, 0.07, 0.01][c.brainTier];
  // sharp senses / echolocation help spot the short path
  if (c.hybrids.includes('echolocation')) { pShort += 0.10; pLong -= 0.05; }
  if (c.sensorTier === 2) { pShort += 0.05; pLong -= 0.03; }
  if (c.sensorTier === 0 && c.brainTier === 0) { pShort -= 0.05; pLong += 0.10; }
  pShort = Math.max(0.02, Math.min(0.97, pShort));
  pLong = Math.max(0.005, Math.min(0.9, pLong));
  const pMedium = Math.max(0.01, 1 - pShort - pLong);
  // renormalize
  const total = pShort + pMedium + pLong;
  return [pShort / total, pMedium / total, pLong / total];
}

function pickPath(c: Creature, paths: PathDef[]): PathDef {
  const [pS, pM] = pickProbabilities(c);
  const r = Math.random();
  if (r < pS) return paths[0];
  if (r < pS + pM) return paths[1];
  return paths[2];
}

function energyPerStep(stats: CreatureStats): number {
  return 2 + Math.sqrt(stats.massKg) * 0.3;
}

// The maze is a brain puzzle, not a marathon — a clever creature can solve it
// even in a small body. Stamina budget combines a base buffer (so anything
// gets a fair shot at the shortcut), real-body endurance (so big athletes get
// more rope), and a brain bonus (smart creatures take confident steps that
// don't waste energy). Sensors and echolocation extend the budget too.
function staminaBudget(c: Creature, stats: CreatureStats): number {
  const base = 25;
  const enduranceBudget = Math.max(0, stats.enduranceKm * 1.2);
  const brainBudget = c.brainTier * 22;     // tier 0=0, 1=22, 2=44, 3=66
  const sensorBudget = c.sensorTier * 6;
  const echoBudget = c.hybrids.includes('echolocation') ? 18 : 0;
  const comboBonus = comboEffects(c).mazeStaminaBonus ?? 0;
  return base + enduranceBudget + brainBudget + sensorBudget + echoBudget + comboBonus;
}

function maxStepsFor(c: Creature, stats: CreatureStats): number {
  return staminaBudget(c, stats) / energyPerStep(stats);
}

// Total probability of success: sum of (pick-probability × can-this-path-finish-on-stamina).
function successProbability(c: Creature, maxSteps: number, paths: PathDef[]): number {
  const probs = pickProbabilities(c);
  let p = 0;
  for (let i = 0; i < 3; i++) {
    if (paths[i].steps <= maxSteps) p += probs[i];
  }
  return p;
}

export function MazeArena({ creature, stats, onFinish }: Props) {
  const maxSteps = useMemo(() => maxStepsFor(creature, stats), [creature, stats]);

  const [themeId, setThemeId] = useState<MazeThemeId>('cave');
  const theme = MAZE_THEMES.find((t) => t.id === themeId) ?? MAZE_THEMES[0];
  const PATHS = useMemo(() => PATHS_BY_THEME[themeId], [themeId]);

  const probs = useMemo(() => pickProbabilities(creature), [creature]);
  const successP = useMemo(() => successProbability(creature, maxSteps, PATHS), [creature, maxSteps, PATHS]);

  const [chosenPath, setChosenPath] = useState<PathDef | null>(null);
  const [stepsTaken, setStepsTaken] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const stepRef = useRef(0);
  const elapsedRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  function start() {
    stepRef.current = 0;
    elapsedRef.current = 0;
    setStepsTaken(0);
    setChosenPath(pickPath(creature, PATHS));
    setDone(false);
    setRunning(true);
  }

  function stop(o: MazeOutcome) {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRunning(false);
    setDone(true);
    onFinish(o);
  }

  useEffect(() => {
    if (!running || !chosenPath) return;
    const dt = TICK_MS / 1000;
    const needed = chosenPath.steps;

    timerRef.current = window.setInterval(() => {
      elapsedRef.current += dt;
      const newSteps = elapsedRef.current / STEP_INTERVAL_S;
      stepRef.current = newSteps;
      setStepsTaken(newSteps);

      if (newSteps >= needed) {
        stop({ won: true, reason: 'escaped', stepsTaken: Math.ceil(newSteps), stepsNeeded: needed });
        return;
      }
      if (newSteps >= maxSteps) {
        stop({ won: false, reason: 'exhausted', stepsTaken: Math.floor(newSteps), stepsNeeded: needed });
      }
    }, TICK_MS);

    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, chosenPath]);

  // When the creature changes (e.g. user bumps brain after a fail), reset the
  // done state so Try Again will pick a fresh path with the new probabilities.
  // Also reset when the theme changes so the picked path matches the layout.
  useEffect(() => {
    if (!running) {
      stepRef.current = 0;
      elapsedRef.current = 0;
      setStepsTaken(0);
      setDone(false);
      setChosenPath(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creature, themeId]);

  const activePath = chosenPath ?? PATHS[1];
  const progress = chosenPath ? Math.min(1, stepsTaken / activePath.steps) : 0;
  const pos = pointAtPath(activePath.points, progress);
  const energyLeft = Math.max(0, 1 - stepsTaken / maxSteps);

  return (
    <div className="arena">
      <h2>The Maze — {theme.emoji} {theme.label} <small className="arena-env">· {theme.difficultyLabel} · ×{theme.rewardMult.toFixed(1)} reward</small></h2>
      <p className="arena-help">{theme.description}</p>

      <div className="prey-tabs">
        {MAZE_THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`prey-tab${themeId === t.id ? ' active' : ''}`}
            onClick={() => !running && setThemeId(t.id)}
            disabled={running}
            title={`${t.label} · ${t.difficultyLabel} · ×${t.rewardMult.toFixed(1)} reward`}
          >
            <span className="prey-emoji">{t.emoji}</span>
            <span className="prey-name">{t.label}<small> ×{t.rewardMult.toFixed(1)}</small></span>
          </button>
        ))}
      </div>
      <p className="arena-help">
        Three paths exit the maze. Smarter brains spot the shortcut more often; dull brains wander.
        Each run picks one randomly, weighted by your brain.
      </p>

      <div className="maze-odds">
        {PATHS.map((p, i) => (
          <div key={p.id} className={`maze-odds-row${chosenPath?.id === p.id ? ' active' : ''}`}>
            <span className="maze-odds-emoji" style={{ color: p.color }}>{p.emoji}</span>
            <span className="maze-odds-label">{p.label}</span>
            <span className="maze-odds-steps">{p.steps} steps</span>
            <span className="maze-odds-prob">{Math.round(probs[i] * 100)}%</span>
            <span className={`maze-odds-stam ${p.steps <= maxSteps ? 'ok' : 'no'}`}>
              {p.steps <= maxSteps ? '✓ stamina ok' : '✗ too far'}
            </span>
          </div>
        ))}
        <div className="maze-odds-total">
          Overall odds of escape: <strong>{Math.round(successP * 100)}%</strong>
          <span className="maze-odds-explain">
            (brain tier {creature.brainTier} · stamina lasts ~{Math.floor(maxSteps)} steps)
          </span>
        </div>
        {(() => {
          const combo = getActiveCombo(creature);
          if (!combo || combo.effects.mazeStaminaBonus == null) return null;
          return (
            <div className="combo-badge">
              <span className="combo-badge-emoji">{combo.emoji}</span>
              <span className="combo-badge-text">
                <strong>{combo.name}</strong> · +{combo.effects.mazeStaminaBonus} stamina
              </span>
            </div>
          );
        })()}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="maze-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={theme.bgTop} />
            <stop offset="1" stopColor={theme.bgBottom} />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width={W} height={H} fill="url(#maze-bg)" />

        {/* ─── THEME-SPECIFIC STRUCTURAL DECOR ─────────────────────── */}

        {theme.id === 'cave' && (
          <g>
            {/* STALACTITES hanging from the top */}
            {[40, 110, 180, 260, 330, 410, 480, 560].map((x, i) => {
              const h = 10 + (i % 4) * 8;
              return (
                <g key={`stal-top-${i}`}>
                  <polygon points={`${x - 6},0 ${x + 6},0 ${x},${h}`} fill="#1a1c24" />
                  <polygon points={`${x - 4},0 ${x + 4},0 ${x},${h - 3}`} fill="#3a3a44" />
                </g>
              );
            })}
            {/* STALAGMITES on the floor */}
            {[80, 160, 250, 330, 420, 510, 580].map((x, i) => {
              const h = 12 + (i % 3) * 6;
              return (
                <g key={`stal-bot-${i}`}>
                  <polygon points={`${x - 6},${H} ${x + 6},${H} ${x},${H - h}`} fill="#1a1c24" />
                  <polygon points={`${x - 4},${H} ${x + 4},${H} ${x},${H - h + 3}`} fill="#3a3a44" />
                </g>
              );
            })}
            {/* rocky chunks scattered */}
            <g fill="#2c2f3a">
              <ellipse cx="60" cy={H - 6} rx="14" ry="3" />
              <ellipse cx="290" cy={H - 4} rx="10" ry="2" />
              <ellipse cx="480" cy={H - 5} rx="16" ry="3" />
            </g>
            {/* glowing pair of eyes in the corner */}
            <g fill="#ffd040" opacity="0.85">
              <circle cx="20" cy="100" r="2" />
              <circle cx="26" cy="100" r="2" />
            </g>
            {/* bat silhouette flapping across */}
            <g transform="translate(280 40)">
              <g className="bird-wing">
                <path d="M -12 0 L -6 -3 L 0 0 L 6 -3 L 12 0" stroke="#1a1c24" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </g>
            </g>
          </g>
        )}

        {theme.id === 'hedge' && (
          <g>
            {/* TOP HEDGE BORDER — bumpy green wall */}
            <g fill="#3a6a1a">
              {Array.from({ length: 24 }).map((_, i) => (
                <circle key={`hb-${i}`} cx={i * 26 + 13} cy="6" r={10 + (i % 3) * 2} />
              ))}
            </g>
            <g fill="#5a8a2a">
              {Array.from({ length: 24 }).map((_, i) => (
                <circle key={`hb2-${i}`} cx={i * 26 + 13} cy="4" r={6 + (i % 3)} />
              ))}
            </g>
            {/* BOTTOM HEDGE BORDER */}
            <g fill="#3a6a1a">
              {Array.from({ length: 24 }).map((_, i) => (
                <circle key={`hbb-${i}`} cx={i * 26 + 13} cy={H - 6} r={10 + ((i + 1) % 3) * 2} />
              ))}
            </g>
            <g fill="#5a8a2a">
              {Array.from({ length: 24 }).map((_, i) => (
                <circle key={`hbb2-${i}`} cx={i * 26 + 13} cy={H - 4} r={6 + ((i + 1) % 3)} />
              ))}
            </g>
            {/* SCATTERED FLOWERS along the corridors */}
            {[
              [80, 60, '#ff6688'], [180, 100, '#ffd040'], [280, 70, '#ff6688'],
              [380, 120, '#9a60d0'], [480, 80, '#ffd040'], [540, 100, '#ff6688'],
              [100, 180, '#9a60d0'], [240, 200, '#ffd040'], [380, 180, '#ff6688'],
            ].map(([x, y, c], i) => (
              <g key={`fl-${i}`}>
                <circle cx={x as number} cy={y as number} r="3" fill={c as string} />
                <circle cx={(x as number) - 2.5} cy={(y as number) + 2} r="2" fill={c as string} opacity="0.85" />
                <circle cx={(x as number) + 2.5} cy={(y as number) + 2} r="2" fill={c as string} opacity="0.85" />
                <circle cx={x as number} cy={(y as number) + 1} r="1" fill="#ffd040" />
              </g>
            ))}
            {/* BUTTERFLY drifting */}
            <g transform="translate(200 40)" className="petal" style={{ transformOrigin: 'center' }}>
              <text x="0" y="0" fontSize="14">🦋</text>
            </g>
            {/* STONE BENCH silhouette */}
            <g fill="#6a6a6a">
              <rect x="450" y="200" width="48" height="6" rx="2" />
              <rect x="454" y="206" width="6" height="14" />
              <rect x="488" y="206" width="6" height="14" />
            </g>
          </g>
        )}

        {theme.id === 'lab' && (
          <g>
            {/* NEON BORDER LINES top + bottom + sides */}
            <line x1="0" y1="3" x2={W} y2="3" stroke="#5ad8ff" strokeWidth="2" opacity="0.9" />
            <line x1="0" y1={H - 3} x2={W} y2={H - 3} stroke="#5ad8ff" strokeWidth="2" opacity="0.9" />
            <line x1="3" y1="0" x2="3" y2={H} stroke="#5ad8ff" strokeWidth="2" opacity="0.9" />
            <line x1={W - 3} y1="0" x2={W - 3} y2={H} stroke="#5ad8ff" strokeWidth="2" opacity="0.9" />
            {/* PULSING SENSOR DOTS scattered */}
            <g>
              {[
                [50, 30], [150, 50], [250, 35], [350, 60], [450, 30], [550, 55],
                [80, 200], [200, 210], [320, 195], [440, 215], [520, 200],
              ].map(([x, y], i) => (
                <circle key={`s-${i}`} cx={x} cy={y} r="2" fill="#5ad8ff" opacity="0.85" className="ray"
                  style={{ animationDuration: `${1.5 + (i % 3) * 0.7}s`, animationDelay: `-${i * 0.3}s` }} />
              ))}
            </g>
            {/* SCREEN PANELS — small rectangles with bars */}
            <g>
              <rect x="14" y="20" width="36" height="22" fill="#0c1830" stroke="#5ad8ff" strokeWidth="0.7" />
              <line x1="18" y1="26" x2="34" y2="26" stroke="#5ad8ff" strokeWidth="0.8" />
              <line x1="18" y1="32" x2="46" y2="32" stroke="#5ad8ff" strokeWidth="0.8" />
              <line x1="18" y1="38" x2="42" y2="38" stroke="#5ad8ff" strokeWidth="0.8" />

              <rect x={W - 50} y="20" width="36" height="22" fill="#0c1830" stroke="#5ad8ff" strokeWidth="0.7" />
              <line x1={W - 46} y1="26" x2={W - 30} y2="26" stroke="#5ad8ff" strokeWidth="0.8" />
              <line x1={W - 46} y1="32" x2={W - 18} y2="32" stroke="#5ad8ff" strokeWidth="0.8" />
              <line x1={W - 46} y1="38" x2={W - 22} y2="38" stroke="#5ad8ff" strokeWidth="0.8" />
            </g>
            {/* CONDUIT vertical pipes */}
            <g stroke="#3a5080" strokeWidth="3" fill="none" opacity="0.7">
              <line x1="100" y1="0" x2="100" y2={H} />
              <line x1="500" y1="0" x2="500" y2={H} />
            </g>
            {/* DANGER tape stripe at the bottom */}
            <g>
              <rect x="0" y={H - 16} width={W} height="2" fill="#ffd040" opacity="0.5" />
            </g>
          </g>
        )}

        {/* faint grid */}
        <g stroke={theme.gridColor} strokeWidth="0.5" opacity="0.35">
          {Array.from({ length: 16 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2={H} />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 30} x2={W} y2={i * 30} />
          ))}
        </g>

        {/* draw all three paths underneath — faint when not chosen */}
        {PATHS.map((p) => {
          const pts = p.points.map((pt) => `${pt.x},${pt.y}`).join(' ');
          const isActive = chosenPath?.id === p.id;
          const isFinishedActive = done && chosenPath?.id === p.id;
          return (
            <g key={p.id}>
              {/* dark outline */}
              <polyline
                points={pts}
                stroke="#1c1e26"
                strokeWidth="14"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={isActive ? 1 : 0.7}
              />
              {/* path body */}
              <polyline
                points={pts}
                stroke={p.color}
                strokeWidth="9"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={isActive ? 0.85 : 0.28}
              />
              {/* dashed center line */}
              <polyline
                points={pts}
                stroke="white"
                strokeWidth="1.2"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="4 5"
                opacity={isActive ? 0.8 : 0.35}
              />
              {/* label near the middle of each path */}
              {!running && !done && (
                <text
                  x={p.points[Math.floor(p.points.length / 2)].x}
                  y={p.points[Math.floor(p.points.length / 2)].y - 12}
                  fontSize="11"
                  fontWeight="700"
                  fill={p.color}
                  textAnchor="middle"
                  opacity="0.9"
                >
                  {p.emoji} {p.label}
                </text>
              )}
              {isFinishedActive && (
                <text
                  x={p.points[Math.floor(p.points.length / 2)].x}
                  y={p.points[Math.floor(p.points.length / 2)].y - 14}
                  fontSize="12"
                  fontWeight="700"
                  fill={p.color}
                  textAnchor="middle"
                >
                  ← took the {p.label}
                </text>
              )}
            </g>
          );
        })}

        {/* START marker */}
        <g>
          <circle cx={30} cy={120} r="14" fill="rgba(160, 212, 228, 0.25)" stroke="#a0d4e4" strokeWidth="2" />
          <text x={30} y={108} textAnchor="middle" fontSize="10" fontWeight="700" fill="#a0d4e4">START</text>
        </g>

        {/* EXIT marker */}
        <g>
          <rect x={556} y={94} width="28" height="52" fill="#5cc46a" opacity="0.3" stroke="#5cc46a" strokeWidth="2" strokeDasharray="3 3" />
          <text x={570} y={88} textAnchor="middle" fontSize="11" fontWeight="700" fill="#5cc46a">EXIT</text>
          <text x={570} y={126} textAnchor="middle" fontSize="20">🏁</text>
        </g>

        {/* HUD strip */}
        <rect x="6" y="6" width="270" height="22" fill="rgba(255,255,255,0.92)" rx="4" stroke="#bbb" />
        <text x="14" y="22" fontSize="11" fill="#333">
          {chosenPath
            ? `step ${Math.floor(stepsTaken)} / need ${activePath.steps}`
            : `pick path → run`}
        </text>
        <rect x="118" y="13" width="150" height="10" fill="#eee" stroke="#999" />
        <rect x="118" y="13" width={Math.max(0, 150 * progress)} height="10" fill={activePath.color} />

        <rect x={W - 130} y="6" width="124" height="22" fill="rgba(255,255,255,0.92)" rx="4" stroke="#bbb" />
        <text x={W - 122} y="22" fontSize="11" fill="#333">stamina</text>
        <rect x={W - 68} y="13" width="56" height="10" fill="#eee" stroke="#999" />
        <rect x={W - 68} y="13" width={Math.max(0, 56 * energyLeft)} height="10" fill={energyLeft > 0 ? '#5cc46a' : '#c44'} />

        {/* creature riding the chosen path — use the bespoke shape
            (octopus, tiger, etc.) if loaded from the dex, else the
            generic morph with running legs. */}
        {chosenPath && (
          hasBespokeShape(creature) ? (
            <BespokeInScene creature={creature} x={pos.x - 26} y={pos.y - 30} width={52} height={40} animate="run" />
          ) : (
            <g transform={`translate(${pos.x} ${pos.y - 22})`}>
              <CreatureBody creature={creature} cx={0} footY={22} scale={0.22} animate="run" />
            </g>
          )
        )}

        {/* ─── SONAR CAVE: FOG-OF-WAR overlay + sonar pings ───────── */}
        {themeId === 'sonar' && chosenPath && (
          <g style={{ pointerEvents: 'none' }}>
            <defs>
              {/* visibility radius depends on sensor / brain / echo —
                  high-tier sensors see further. */}
              <radialGradient
                id="sonar-vision"
                cx={pos.x}
                cy={pos.y}
                r={
                  50 +
                  creature.sensorTier * 14 +
                  (creature.hybrids.includes('echolocation') ? 30 : 0) +
                  creature.brainTier * 6
                }
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" stopColor="#06090e" stopOpacity="0" />
                <stop offset="0.55" stopColor="#06090e" stopOpacity="0.15" />
                <stop offset="0.85" stopColor="#06090e" stopOpacity="0.85" />
                <stop offset="1" stopColor="#06090e" stopOpacity="0.97" />
              </radialGradient>
            </defs>
            {/* darkness covering the whole maze with a transparent
                hole around the creature */}
            <rect x="0" y="0" width={W} height={H} fill="url(#sonar-vision)" />

            {/* sonar PING ring expanding outward — gives the cave the
                animated radar feel */}
            <g
              className="sonar-ping"
              style={{ transformOrigin: `${pos.x}px ${pos.y}px`, transformBox: 'fill-box' }}
            >
              <circle cx={pos.x} cy={pos.y} r="8" stroke="#5ad8ff" strokeWidth="2" fill="none" />
            </g>
            <g
              className="sonar-ping sonar-ping-2"
              style={{ transformOrigin: `${pos.x}px ${pos.y}px`, transformBox: 'fill-box' }}
            >
              <circle cx={pos.x} cy={pos.y} r="8" stroke="#5ad8ff" strokeWidth="1.5" fill="none" />
            </g>

            {/* small position indicator dot inside the visible bubble */}
            <circle cx={pos.x} cy={pos.y} r="2" fill="#5ad8ff" opacity="0.9" />
          </g>
        )}
      </svg>

      <div className="arena-controls">
        {!running && !done && (
          <button className="btn" onClick={start} type="button">
            Enter the maze
          </button>
        )}
        {running && (
          <button
            className="btn btn-secondary"
            onClick={() => stop({ won: false, reason: 'exhausted', stepsTaken: Math.floor(stepRef.current), stepsNeeded: chosenPath?.steps ?? PATHS[1].steps })}
            type="button"
          >
            Give up
          </button>
        )}
        {done && (
          <button className="btn" onClick={start} type="button">
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
