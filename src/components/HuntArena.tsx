import { useEffect, useRef, useState } from 'react';
import type { CreatureStats } from '../physics';
import { sizeToMass } from '../physics';
import type { Creature } from '../types';
import { CreatureBody } from './CreatureSVG';

export type HuntOutcome = {
  won: boolean;
  reason: 'hidden' | 'outran' | 'tanked' | 'fought' | 'caught';
};

interface Props {
  creature: Creature;
  stats: CreatureStats;
  onFinish: (o: HuntOutcome) => void;
}

const HIDE_DURATION_S = 14;
const PREDATOR_KMH = 70;
const TICK_MS = 50;

const W = 600;
const H = 220;
const GROUND_Y = 170;

function stealthScore(c: Creature): number {
  const m = sizeToMass(c.sizeUnit);
  let s = 55 - Math.log10(Math.max(0.01, m) + 0.1) * 14;
  if (c.hybrids.includes('camouflage')) s += 30;
  if (c.defenseTier === 1) s += 5;
  if (c.defenseTier === 2) s -= 15;
  if (c.sensorTier === 2) s += 10;
  if (c.brainTier === 2) s += 5;
  if (c.bodyPlan === 'fish') s -= 25;
  if (c.bodyPlan === 'bird') s += 8;
  return Math.max(0, Math.min(100, s));
}

function Predator({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} ${GROUND_Y})`}>
      <ellipse cx="0" cy="2" rx="22" ry="3" fill="rgba(0,0,0,0.25)" />
      <line x1="-10" y1="-2" x2="-12" y2="14" stroke="#3a2118" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="-5" y1="-2" x2="-6" y2="14" stroke="#3a2118" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="6" y1="-2" x2="8" y2="14" stroke="#3a2118" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="11" y1="-2" x2="13" y2="14" stroke="#3a2118" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="2" cy="-8" rx="16" ry="7" fill="#6e4d2c" />
      <ellipse cx="2" cy="-5" rx="13" ry="3" fill="#8b6336" opacity="0.5" />
      <circle cx="-10" cy="-9" r="6" fill="#5a3b22" />
      <circle cx="-13" cy="-8" r="0.8" fill="#fffacc" />
      <polygon points="-14,-13 -12,-16 -10,-13" fill="#5a3b22" />
      <polygon points="-9,-13 -7,-16 -5,-13" fill="#5a3b22" />
      <path d="M 16 -8 q 5 0 8 4" stroke="#3a2118" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </g>
  );
}

export function HuntArena({ creature, stats, onFinish }: Props) {
  const s = stealthScore(creature);
  const [detection, setDetection] = useState(0);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const detRef = useRef(0);
  const timeRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  function reset() {
    detRef.current = 0;
    timeRef.current = 0;
    setDetection(0);
    setTime(0);
  }

  function start() {
    reset();
    setDone(false);
    setRunning(true);
  }

  function stop(o: HuntOutcome) {
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
    const fillRate = Math.max(0.5, (100 - s)) / HIDE_DURATION_S;

    timerRef.current = window.setInterval(() => {
      timeRef.current += dt;
      detRef.current += fillRate * dt;
      setTime(timeRef.current);
      setDetection(detRef.current);

      if (timeRef.current >= HIDE_DURATION_S && detRef.current < 100) {
        stop({ won: true, reason: 'hidden' });
        return;
      }
      if (detRef.current >= 100) {
        if (stats.topSpeedKmh >= PREDATOR_KMH) {
          stop({ won: true, reason: 'outran' });
        } else if (creature.hybrids.includes('venom') || creature.hybrids.includes('electric')) {
          stop({ won: true, reason: 'fought' });
        } else if (creature.defenseTier === 2) {
          stop({ won: true, reason: 'tanked' });
        } else {
          stop({ won: false, reason: 'caught' });
        }
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
  }, [s]);

  const predatorStart = W - 50;
  const predatorEnd = W * 0.6;
  const predatorX = predatorStart - (detection / 100) * (predatorStart - predatorEnd);

  return (
    <div className="arena">
      <h2>The Hunt — forest</h2>
      <p className="arena-help">
        Stay hidden for {HIDE_DURATION_S}s. Stealth = small body + camouflage + senses. If spotted, only speed (&gt; {PREDATOR_KMH} km/h) or armor saves you.
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="hunt-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7fa663" />
            <stop offset="1" stopColor="#cfd7a0" />
          </linearGradient>
          <linearGradient id="hunt-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7a6a3a" />
            <stop offset="1" stopColor="#54472a" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width={W} height={GROUND_Y} fill="url(#hunt-sky)" />
        <rect x="0" y={GROUND_Y} width={W} height={H - GROUND_Y} fill="url(#hunt-ground)" />

        {[80, 200, 340, 470].map((tx, i) => (
          <g key={i}>
            <rect x={tx - 4} y={GROUND_Y - 60} width="8" height="60" fill="#3e2a18" />
            <ellipse cx={tx} cy={GROUND_Y - 70} rx="34" ry="22" fill="#3f6b34" />
            <ellipse cx={tx - 8} cy={GROUND_Y - 78} rx="22" ry="14" fill="#4d7d3e" />
            <ellipse cx={tx + 10} cy={GROUND_Y - 65} rx="20" ry="12" fill="#345a2c" />
          </g>
        ))}

        {Array.from({ length: 10 }).map((_, i) => {
          const bx = 30 + i * 60 + (i % 2) * 15;
          return <ellipse key={i} cx={bx} cy={GROUND_Y + 4} rx="14" ry="5" fill="#3f5a30" opacity="0.7" />;
        })}

        <rect x="6" y="6" width="260" height="22" fill="rgba(255,255,255,0.9)" rx="4" stroke="#bbb" />
        <text x="14" y="22" fontSize="11" fill="#333">detection</text>
        <rect x="78" y="13" width="180" height="10" fill="#eee" stroke="#999" />
        <rect
          x="78"
          y="13"
          width={Math.max(0, 180 * Math.min(1, detection / 100))}
          height="10"
          fill={detection > 75 ? '#c44' : detection > 40 ? '#e0a040' : '#5cc46a'}
        />
        <rect x={W - 140} y="6" width="134" height="22" fill="rgba(255,255,255,0.9)" rx="4" stroke="#bbb" />
        <text x={W - 132} y="22" fontSize="11" fill="#333">
          stealth {Math.round(s)} · {Math.max(0, HIDE_DURATION_S - time).toFixed(1)}s left
        </text>

        <Predator x={predatorX} />

        <g transform={`translate(${W * 0.28} 0)`}>
          <CreatureBody creature={creature} cx={0} footY={GROUND_Y} scale={0.32} animate="breathe" />
        </g>
      </svg>
      <div className="arena-controls">
        {!running && !done && (
          <button className="btn" onClick={start} type="button">
            Start the hunt
          </button>
        )}
        {running && (
          <button className="btn btn-secondary" onClick={() => stop({ won: false, reason: 'caught' })} type="button">
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
