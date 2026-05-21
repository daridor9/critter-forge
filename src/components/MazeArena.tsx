import { useEffect, useMemo, useRef, useState } from 'react';
import type { CreatureStats } from '../physics';
import type { Creature } from '../types';
import { CreatureBody } from './CreatureSVG';

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

const PATHS: PathDef[] = [
  {
    id: 'short',
    label: 'shortcut',
    emoji: '⚡',
    color: '#5cc46a',
    steps: 18,
    points: [
      { x: 30, y: 120 },
      { x: 200, y: 120 },
      { x: 400, y: 120 },
      { x: 570, y: 120 },
    ],
  },
  {
    id: 'medium',
    label: 'standard',
    emoji: '🧭',
    color: '#e8a838',
    steps: 32,
    points: [
      { x: 30, y: 120 },
      { x: 110, y: 120 },
      { x: 110, y: 60 },
      { x: 230, y: 60 },
      { x: 230, y: 180 },
      { x: 380, y: 180 },
      { x: 380, y: 60 },
      { x: 500, y: 60 },
      { x: 500, y: 120 },
      { x: 570, y: 120 },
    ],
  },
  {
    id: 'long',
    label: 'wander',
    emoji: '🌀',
    color: '#c87878',
    steps: 52,
    points: [
      { x: 30, y: 120 },
      { x: 60, y: 200 },
      { x: 140, y: 220 },
      { x: 180, y: 160 },
      { x: 240, y: 220 },
      { x: 300, y: 180 },
      { x: 280, y: 80 },
      { x: 360, y: 40 },
      { x: 430, y: 100 },
      { x: 470, y: 200 },
      { x: 530, y: 160 },
      { x: 570, y: 120 },
    ],
  },
];

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

function pickPath(c: Creature): PathDef {
  const [pS, pM] = pickProbabilities(c);
  const r = Math.random();
  if (r < pS) return PATHS[0];
  if (r < pS + pM) return PATHS[1];
  return PATHS[2];
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
  return base + enduranceBudget + brainBudget + sensorBudget + echoBudget;
}

function maxStepsFor(c: Creature, stats: CreatureStats): number {
  return staminaBudget(c, stats) / energyPerStep(stats);
}

// Total probability of success: sum of (pick-probability × can-this-path-finish-on-stamina).
function successProbability(c: Creature, maxSteps: number): number {
  const probs = pickProbabilities(c);
  let p = 0;
  for (let i = 0; i < 3; i++) {
    if (PATHS[i].steps <= maxSteps) p += probs[i];
  }
  return p;
}

export function MazeArena({ creature, stats, onFinish }: Props) {
  const maxSteps = useMemo(() => maxStepsFor(creature, stats), [creature, stats]);

  const probs = useMemo(() => pickProbabilities(creature), [creature]);
  const successP = useMemo(() => successProbability(creature, maxSteps), [creature, maxSteps]);

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
    setChosenPath(pickPath(creature));
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
  useEffect(() => {
    if (!running) {
      stepRef.current = 0;
      elapsedRef.current = 0;
      setStepsTaken(0);
      setDone(false);
      setChosenPath(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creature]);

  const activePath = chosenPath ?? PATHS[1];
  const progress = chosenPath ? Math.min(1, stepsTaken / activePath.steps) : 0;
  const pos = pointAtPath(activePath.points, progress);
  const energyLeft = Math.max(0, 1 - stepsTaken / maxSteps);

  return (
    <div className="arena">
      <h2>The Maze — find the exit</h2>
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
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="maze-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2c2f3a" />
            <stop offset="1" stopColor="#1a1c24" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width={W} height={H} fill="url(#maze-bg)" />

        {/* faint grid */}
        <g stroke="#3a3f4a" strokeWidth="0.5" opacity="0.35">
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

        {/* creature riding the chosen path */}
        {chosenPath && (
          <g transform={`translate(${pos.x} ${pos.y - 22})`}>
            <CreatureBody creature={creature} cx={0} footY={22} scale={0.22} animate="run" />
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
