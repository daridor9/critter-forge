import { useEffect, useRef, useState } from 'react';
import type { CreatureStats } from '../physics';
import type { Creature } from '../types';
import { CreatureBody } from './CreatureSVG';

export type ClimbOutcome = { won: boolean; reason: 'reached-top' | 'froze' | 'exhausted' };

interface Props {
  creature: Creature;
  stats: CreatureStats;
  onFinish: (o: ClimbOutcome) => void;
}

const ALT_GOAL = 3000;
const ALT_PER_SEC = 50;
const E0 = 150;
const TICK_MS = 50;

const W = 600;
const H = 240;

export function ClimbArena({ creature, stats, onFinish }: Props) {
  const [altitude, setAltitude] = useState(0);
  const [energy, setEnergy] = useState(E0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const altRef = useRef(0);
  const energyRef = useRef(E0);
  const timerRef = useRef<number | null>(null);

  function reset() {
    altRef.current = 0;
    energyRef.current = E0;
    setAltitude(0);
    setEnergy(E0);
  }

  function start() {
    reset();
    setDone(false);
    setRunning(true);
  }

  function stop(o: ClimbOutcome) {
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
    const coldDrain = (100 - stats.coldTolerance) * 0.04;
    const effortDrain = Math.sqrt(stats.massKg) * 0.15;

    timerRef.current = window.setInterval(() => {
      energyRef.current -= (coldDrain + effortDrain) * dt;
      altRef.current += ALT_PER_SEC * dt;
      setEnergy(energyRef.current);
      setAltitude(altRef.current);

      if (altRef.current >= ALT_GOAL) {
        stop({ won: true, reason: 'reached-top' });
        return;
      }
      if (energyRef.current <= 0) {
        const reason: ClimbOutcome['reason'] = coldDrain >= effortDrain ? 'froze' : 'exhausted';
        stop({ won: false, reason });
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
  }, [stats.coldTolerance, stats.massKg]);

  const climbFrac = Math.min(1, altitude / ALT_GOAL);
  const baseY = H - 24;
  const topY = 36;
  const footY = baseY - climbFrac * (baseY - topY);
  const cx = W / 2;

  const snowflakes = Array.from({ length: 22 }).map((_, i) => ({
    x: (i * 31 + 17) % W,
    y0: -20 + ((i * 53) % 60),
    r: 1.2 + (i % 3) * 0.4,
    duration: 6 + ((i * 7) % 7),
    delay: -((i * 11) % 8),
  }));

  return (
    <div className="arena">
      <h2>The Climb — snow mountain</h2>
      <p className="arena-help">Climb to {ALT_GOAL} m. Cold drains energy fast if your cold tolerance is low. Heavy bodies tire fast too.</p>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="climb-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#a8c8da" />
            <stop offset="1" stopColor="#e5eef3" />
          </linearGradient>
          <linearGradient id="climb-rock" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9aa9b1" />
            <stop offset="1" stopColor="#6c7c84" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width={W} height={H} fill="url(#climb-sky)" />

        <polygon points={`0,${H} 90,${H * 0.45} 180,${H * 0.6} 280,${H * 0.4} 380,${H * 0.55} 480,${H * 0.42} ${W},${H * 0.55} ${W},${H}`} fill="#c0ccd3" opacity="0.85" />
        <polygon points={`0,${H} 120,${H * 0.55} 240,${H * 0.35} 360,${H * 0.5} ${W * 0.85},${H * 0.32} ${W},${H * 0.5} ${W},${H}`} fill="#e9eff2" />

        <polygon points={`${W * 0.25},${H} ${W / 2},22 ${W * 0.75},${H}`} fill="url(#climb-rock)" />
        <polygon points={`${W * 0.42},${H * 0.55} ${W / 2},22 ${W * 0.58},${H * 0.55}`} fill="#ffffff" />
        <polygon points={`${W * 0.34},${H} ${W / 2},34 ${W * 0.66},${H}`} fill="#f3f6f8" opacity="0.75" />

        <line x1={cx} y1="22" x2={cx} y2="6" stroke="#3a2118" strokeWidth="1.5" />
        <polygon points={`${cx} 6 ${cx + 12} 10 ${cx} 14`} fill="#e07b5b" />

        {snowflakes.map((s, i) => (
          <circle
            key={i}
            className="snowflake"
            cx={s.x}
            cy={s.y0}
            r={s.r}
            fill="white"
            opacity="0.85"
            style={{ animationDuration: `${s.duration}s`, animationDelay: `${s.delay}s` }}
          />
        ))}

        <CreatureBody creature={creature} cx={cx - 4} footY={footY} scale={0.32} facingRight={true} animate="run" />

        <rect x="6" y="6" width="260" height="22" fill="rgba(255,255,255,0.88)" rx="4" stroke="#bbb" />
        <text x="14" y="22" fontSize="11" fill="#333">energy</text>
        <rect x="58" y="13" width="200" height="10" fill="#eee" stroke="#999" />
        <rect
          x="58"
          y="13"
          width={Math.max(0, 200 * (energy / E0))}
          height="10"
          fill={energy > 0 ? '#5cc46a' : '#c44'}
        />
        <rect x={W - 110} y="6" width="104" height="22" fill="rgba(255,255,255,0.88)" rx="4" stroke="#bbb" />
        <text x={W - 102} y="22" fontSize="11" fill="#333">
          {Math.round(altitude)} / {ALT_GOAL} m
        </text>
      </svg>
      <div className="arena-controls">
        {!running && !done && (
          <button className="btn" onClick={start} type="button">
            Start the climb
          </button>
        )}
        {running && (
          <button className="btn btn-secondary" onClick={() => stop({ won: false, reason: 'exhausted' })} type="button">
            Give up
          </button>
        )}
        {done && (
          <button className="btn" onClick={start} type="button">
            Climb again
          </button>
        )}
      </div>
    </div>
  );
}
