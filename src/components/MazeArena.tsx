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
const STEP_INTERVAL_S = 0.35;

const W = 600;
const H = 230;

const PATH: { x: number; y: number }[] = [
  { x: 30, y: 190 },
  { x: 130, y: 190 },
  { x: 130, y: 90 },
  { x: 230, y: 90 },
  { x: 230, y: 190 },
  { x: 330, y: 190 },
  { x: 330, y: 50 },
  { x: 470, y: 50 },
  { x: 470, y: 190 },
  { x: 570, y: 190 },
];

const PATH_POINTS = PATH.map((p) => `${p.x},${p.y}`).join(' ');

const SEG_LENS: number[] = [];
const CUM_LENS: number[] = [];
{
  let cum = 0;
  for (let i = 1; i < PATH.length; i++) {
    const dx = PATH[i].x - PATH[i - 1].x;
    const dy = PATH[i].y - PATH[i - 1].y;
    const len = Math.hypot(dx, dy);
    SEG_LENS.push(len);
    cum += len;
    CUM_LENS.push(cum);
  }
}
const TOTAL_LEN = CUM_LENS[CUM_LENS.length - 1];

function pointAt(t: number): { x: number; y: number } {
  const target = Math.max(0, Math.min(1, t)) * TOTAL_LEN;
  for (let i = 0; i < SEG_LENS.length; i++) {
    const start = i > 0 ? CUM_LENS[i - 1] : 0;
    const end = CUM_LENS[i];
    if (target <= end) {
      const local = SEG_LENS[i] === 0 ? 0 : (target - start) / SEG_LENS[i];
      return {
        x: PATH[i].x + (PATH[i + 1].x - PATH[i].x) * local,
        y: PATH[i].y + (PATH[i + 1].y - PATH[i].y) * local,
      };
    }
  }
  return PATH[PATH.length - 1];
}

function stepsNeeded(c: Creature): number {
  let s = 60 - c.brainTier * 20;
  if (c.hybrids.includes('echolocation')) s -= 12;
  if (c.sensorTier === 2) s -= 5;
  if (c.brainTier === 0 && c.sensorTier === 0) s += 8;
  return Math.max(5, s);
}

function energyPerStep(stats: CreatureStats): number {
  return 2 + Math.sqrt(stats.massKg) * 0.3;
}

export function MazeArena({ creature, stats, onFinish }: Props) {
  const needed = useMemo(() => stepsNeeded(creature), [creature]);
  const perStep = useMemo(() => energyPerStep(stats), [stats]);
  const budget = Math.max(10, stats.enduranceKm * 1.5);
  const maxSteps = budget / perStep;

  const [stepsTaken, setStepsTaken] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const stepRef = useRef(0);
  const elapsedRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  function reset() {
    stepRef.current = 0;
    elapsedRef.current = 0;
    setStepsTaken(0);
  }

  function start() {
    reset();
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
    if (!running) return;
    const dt = TICK_MS / 1000;

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
  }, [running]);

  useEffect(() => {
    if (!running && !done) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats.massKg, stats.enduranceKm, needed]);

  const progress = Math.min(1, stepsTaken / needed);
  const pos = pointAt(progress);
  const energyLeft = Math.max(0, 1 - stepsTaken / maxSteps);

  return (
    <div className="arena">
      <h2>The Maze — find the exit</h2>
      <p className="arena-help">
        Find your way out. Smarter brains take fewer steps. Echolocation and sharp senses help too. Stamina runs out if you wander too long.
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="maze-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2c2f3a" />
            <stop offset="1" stopColor="#1a1c24" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width={W} height={H} fill="url(#maze-bg)" />

        <g stroke="#3a3f4a" strokeWidth="0.5" opacity="0.4">
          {Array.from({ length: 16 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2={H} />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 30} x2={W} y2={i * 30} />
          ))}
        </g>

        <polyline points={PATH_POINTS} stroke="#3a342a" strokeWidth="52" fill="none" strokeLinecap="square" strokeLinejoin="miter" />
        <polyline points={PATH_POINTS} stroke="#f0e2c8" strokeWidth="42" fill="none" strokeLinecap="square" strokeLinejoin="miter" />

        <g fill="#3a342a" stroke="#2c2620" strokeWidth="1">
          <rect x="80" y="50" width="30" height="40" rx="3" />
          <rect x="180" y="130" width="42" height="22" rx="3" />
          <rect x="280" y="110" width="22" height="56" rx="3" />
          <rect x="380" y="100" width="20" height="34" rx="3" />
          <rect x="490" y="70" width="50" height="22" rx="3" />
          <rect x="40" y="60" width="32" height="22" rx="3" />
          <rect x="320" y="200" width="30" height="22" rx="3" />
          <rect x="500" y="200" width="26" height="22" rx="3" />
        </g>

        <g stroke="#8a7e62" strokeWidth="1.5" fill="none" opacity="0.45" strokeDasharray="4 5">
          <polyline points={PATH_POINTS} />
        </g>

        <g>
          <rect x={PATH[PATH.length - 1].x - 14} y={PATH[PATH.length - 1].y - 26} width="28" height="52" fill="#5cc46a" opacity="0.35" />
          <rect x={PATH[PATH.length - 1].x - 14} y={PATH[PATH.length - 1].y - 26} width="28" height="52" fill="none" stroke="#5cc46a" strokeWidth="2" strokeDasharray="3 3" />
          <text x={PATH[PATH.length - 1].x} y={PATH[PATH.length - 1].y - 32} textAnchor="middle" fontSize="13" fontWeight="700" fill="#5cc46a">EXIT</text>
          <text x={PATH[PATH.length - 1].x} y={PATH[PATH.length - 1].y + 5} textAnchor="middle" fontSize="22">🏁</text>
        </g>

        <g>
          <text x={PATH[0].x} y={PATH[0].y - 18} textAnchor="middle" fontSize="10" fontWeight="700" fill="#a0d4e4">START</text>
        </g>

        <rect x="6" y="6" width="270" height="22" fill="rgba(255,255,255,0.9)" rx="4" stroke="#bbb" />
        <text x="14" y="22" fontSize="11" fill="#333">
          step {Math.floor(stepsTaken)} / need {needed}
        </text>
        <rect x="118" y="13" width="150" height="10" fill="#eee" stroke="#999" />
        <rect x="118" y="13" width={Math.max(0, 150 * progress)} height="10" fill="#5cc46a" />

        <rect x={W - 130} y="6" width="124" height="22" fill="rgba(255,255,255,0.9)" rx="4" stroke="#bbb" />
        <text x={W - 122} y="22" fontSize="11" fill="#333">stamina</text>
        <rect x={W - 68} y="13" width="56" height="10" fill="#eee" stroke="#999" />
        <rect x={W - 68} y="13" width={Math.max(0, 56 * energyLeft)} height="10" fill={energyLeft > 0 ? '#5cc46a' : '#c44'} />

        <g transform={`translate(${pos.x} ${pos.y - 24})`}>
          <CreatureBody creature={creature} cx={0} footY={24} scale={0.22} animate="run" />
        </g>
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
            onClick={() => stop({ won: false, reason: 'exhausted', stepsTaken: Math.floor(stepRef.current), stepsNeeded: needed })}
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
        {!running && !done && (
          <small className="arena-meta">
            brain {creature.brainTier} → {needed} steps · stamina good for {Math.floor(maxSteps)} steps
          </small>
        )}
      </div>
    </div>
  );
}
