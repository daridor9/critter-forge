import { useEffect, useRef, useState } from 'react';
import type { CreatureStats } from '../physics';
import type { Creature } from '../types';
import { CreatureBody } from './CreatureSVG';

export type DroughtOutcome = {
  won: boolean;
  reason: 'survived' | 'starved';
  daysSurvived: number;
};

interface Props {
  creature: Creature;
  stats: CreatureStats;
  onFinish: (o: DroughtOutcome) => void;
}

const DAYS_GOAL = 60;
const DAYS_PER_SEC = 2;
const AVAIL_KCAL_PER_DAY = 30;
const TICK_MS = 50;

const W = 600;
const H = 210;
const GROUND_Y = 130;

function fatReserveKcal(massKg: number): number {
  return Math.max(50, massKg * 0.15 * 9000);
}

export function DroughtArena({ creature, stats, onFinish }: Props) {
  const R0 = fatReserveKcal(stats.massKg);

  const [reserve, setReserve] = useState(R0);
  const [day, setDay] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const reserveRef = useRef(R0);
  const dayRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  function reset() {
    reserveRef.current = R0;
    dayRef.current = 0;
    setReserve(R0);
    setDay(0);
  }

  function start() {
    reset();
    setDone(false);
    setRunning(true);
  }

  function stop(o: DroughtOutcome) {
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
    const netLossPerDay = Math.max(1, stats.foodKcalPerDay - AVAIL_KCAL_PER_DAY);

    timerRef.current = window.setInterval(() => {
      const daysElapsed = DAYS_PER_SEC * dt;
      reserveRef.current -= netLossPerDay * daysElapsed;
      dayRef.current += daysElapsed;
      setReserve(reserveRef.current);
      setDay(dayRef.current);

      if (dayRef.current >= DAYS_GOAL) {
        stop({ won: true, reason: 'survived', daysSurvived: DAYS_GOAL });
        return;
      }
      if (reserveRef.current <= 0) {
        stop({ won: false, reason: 'starved', daysSurvived: Math.round(dayRef.current) });
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
  }, [stats.massKg, stats.foodKcalPerDay]);

  const sunCx = W - 70;
  const sunCy = 48;
  const sunRays = Array.from({ length: 10 }).map((_, i) => {
    const a = (i / 10) * Math.PI * 2;
    return {
      x1: sunCx + Math.cos(a) * 28,
      y1: sunCy + Math.sin(a) * 28,
      x2: sunCx + Math.cos(a) * 40,
      y2: sunCy + Math.sin(a) * 40,
    };
  });

  return (
    <div className="arena">
      <h2>The Drought — cracked earth</h2>
      <p className="arena-help">
        Survive {DAYS_GOAL} days with only {AVAIL_KCAL_PER_DAY} kcal of food per day. Big bodies and cold-blooded creatures last longest.
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="drought-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffd589" />
            <stop offset="1" stopColor="#fbe9b0" />
          </linearGradient>
          <linearGradient id="drought-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e3b06a" />
            <stop offset="1" stopColor="#a07a45" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width={W} height={GROUND_Y} fill="url(#drought-sky)" />
        <rect x="0" y={GROUND_Y} width={W} height={H - GROUND_Y} fill="url(#drought-ground)" />

        <g className="sun-rays" style={{ transformOrigin: `${sunCx}px ${sunCy}px` }}>
          {sunRays.map((r, i) => (
            <line key={i} {...r} stroke="#f0a040" strokeWidth="2" opacity="0.6" strokeLinecap="round" />
          ))}
        </g>
        <circle cx={sunCx} cy={sunCy} r="22" fill="#ffb84a" />
        <circle cx={sunCx} cy={sunCy} r="22" fill="#ffd06a" opacity="0.4" />

        <polygon points={`0,${GROUND_Y} 90,${GROUND_Y - 18} 170,${GROUND_Y - 8} 260,${GROUND_Y - 22} 340,${GROUND_Y - 10} 440,${GROUND_Y - 20} ${W},${GROUND_Y - 6} ${W},${GROUND_Y}`} fill="#b88652" opacity="0.6" />

        <g stroke="#7a5a32" strokeWidth="1.5" fill="none" strokeLinecap="round">
          <path d={`M 40 ${GROUND_Y + 22} L 80 ${GROUND_Y + 8} L 110 ${GROUND_Y + 32} L 150 ${GROUND_Y + 16}`} />
          <path d={`M 240 ${GROUND_Y + 36} L 280 ${GROUND_Y + 18} L 320 ${GROUND_Y + 42} L 360 ${GROUND_Y + 22}`} />
          <path d={`M 430 ${GROUND_Y + 28} L 470 ${GROUND_Y + 12} L 510 ${GROUND_Y + 36}`} />
          <path d={`M 110 ${GROUND_Y + 50} L 150 ${GROUND_Y + 70} L 200 ${GROUND_Y + 56}`} />
          <path d={`M 350 ${GROUND_Y + 56} L 400 ${GROUND_Y + 72}`} />
        </g>

        <g transform={`translate(${W - 200} ${GROUND_Y - 4})`}>
          <line x1="0" y1="0" x2="0" y2="-24" stroke="#5a3b22" strokeWidth="2" />
          <path d="M 0 -16 q -8 -10 -10 -22" stroke="#5a3b22" strokeWidth="1.5" fill="none" />
          <path d="M 0 -20 q 8 -6 12 -16" stroke="#5a3b22" strokeWidth="1.5" fill="none" />
        </g>

        <rect x="6" y="6" width="148" height="22" fill="rgba(255,255,255,0.88)" rx="4" stroke="#bbb" />
        <text x="14" y="22" fontSize="11" fill="#333">
          day {Math.floor(day)} / {DAYS_GOAL}
        </text>
        <rect x={W / 2 - 110} y="6" width="220" height="22" fill="rgba(255,255,255,0.88)" rx="4" stroke="#bbb" />
        <text x={W / 2} y="16" fontSize="10" textAnchor="middle" fill="#666">fat reserves</text>
        <rect x={W / 2 - 100} y="18" width="200" height="8" fill="#eee" stroke="#999" />
        <rect
          x={W / 2 - 100}
          y="18"
          width={Math.max(0, 200 * (reserve / R0))}
          height="8"
          fill={reserve > 0 ? '#e07b5b' : '#c44'}
        />

        <CreatureBody creature={creature} cx={W / 2 - 30} footY={GROUND_Y} scale={0.35} animate="breathe" />
      </svg>
      <div className="arena-controls">
        {!running && !done && (
          <button className="btn" onClick={start} type="button">
            Start the drought
          </button>
        )}
        {running && (
          <button
            className="btn btn-secondary"
            onClick={() => stop({ won: false, reason: 'starved', daysSurvived: Math.round(dayRef.current) })}
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
