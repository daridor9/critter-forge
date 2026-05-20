import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { CreatureStats } from '../physics';
import type { Creature } from '../types';
import { CreatureBody } from './CreatureSVG';

export type ChaseOutcome = {
  won: boolean;
  reason: 'caught' | 'lost-speed' | 'lost-stamina' | 'lost-distance';
};

interface Props {
  creature: Creature;
  stats: CreatureStats;
  onFinish: (o: ChaseOutcome) => void;
}

const TRACK_M = 600;
const START_GAP_M = 25;
const TICK_MS = 50;

const W = 600;
const H = 210;
const GROUND_Y = 160;

type PreyId = 'rabbit' | 'gazelle' | 'kangaroo';
interface PreyDef {
  id: PreyId;
  label: string;
  emoji: string;
  speedKmh: number;
  Render: () => ReactNode;
}

function Rabbit() {
  return (
    <g>
      <line x1="-4" y1="-2" x2="-5" y2="6" stroke="#7a5236" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="0" y1="-2" x2="-1" y2="6" stroke="#7a5236" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="6" y1="-2" x2="7" y2="6" stroke="#7a5236" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="10" y1="-2" x2="11" y2="6" stroke="#7a5236" strokeWidth="2.4" strokeLinecap="round" />
      <ellipse cx="3" cy="-7" rx="11" ry="5" fill="#a48267" />
      <ellipse cx="3" cy="-5" rx="9" ry="2.2" fill="#c7a98a" opacity="0.55" />
      <circle cx="12" cy="-12" r="4" fill="#a48267" />
      <ellipse cx="10" cy="-19" rx="1.6" ry="6" fill="#a48267" transform="rotate(-10 10 -19)" />
      <ellipse cx="13.5" cy="-19" rx="1.6" ry="6" fill="#a48267" transform="rotate(10 13.5 -19)" />
      <ellipse cx="10" cy="-19" rx="0.7" ry="4" fill="#e0b8a0" transform="rotate(-10 10 -19)" />
      <ellipse cx="13.5" cy="-19" rx="0.7" ry="4" fill="#e0b8a0" transform="rotate(10 13.5 -19)" />
      <circle cx="13.5" cy="-12.5" r="0.9" fill="#222" />
      <circle cx="-8" cy="-7" r="2.5" fill="#f0e2c8" />
    </g>
  );
}

function Gazelle() {
  return (
    <g>
      <line x1="-7" y1="-2" x2="-8" y2="12" stroke="#7a5236" strokeWidth="2" strokeLinecap="round" />
      <line x1="-3" y1="-2" x2="-4" y2="12" stroke="#7a5236" strokeWidth="2" strokeLinecap="round" />
      <line x1="5" y1="-2" x2="6" y2="12" stroke="#7a5236" strokeWidth="2" strokeLinecap="round" />
      <line x1="9" y1="-2" x2="10" y2="12" stroke="#7a5236" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="1" cy="-8" rx="12" ry="6" fill="#c89366" />
      <ellipse cx="1" cy="-4" rx="10" ry="3" fill="#e1b489" opacity="0.6" />
      <circle cx="12" cy="-14" r="4" fill="#c89366" />
      <line x1="11.5" y1="-16" x2="10" y2="-21" stroke="#3a2118" strokeWidth="1" strokeLinecap="round" />
      <line x1="13.5" y1="-16" x2="13.5" y2="-22" stroke="#3a2118" strokeWidth="1" strokeLinecap="round" />
      <circle cx="13.5" cy="-13" r="0.8" fill="#222" />
      <path d="M -10 -8 q -4 -1 -6 -4" stroke="#7a5236" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Kangaroo() {
  return (
    <g>
      <path d="M -4 -10 Q -14 -2 -18 8" stroke="#9a6c3a" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M -2 -7 Q -3 1 1 10" stroke="#9a6c3a" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M 3 -7 Q 2 1 5 10" stroke="#9a6c3a" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <ellipse cx="2" cy="-12" rx="6" ry="9" fill="#b58450" />
      <ellipse cx="2" cy="-10" rx="4" ry="6" fill="#d2a673" opacity="0.55" />
      <line x1="6" y1="-10" x2="9" y2="-6" stroke="#9a6c3a" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="8" cy="-21" rx="3" ry="4.5" fill="#b58450" />
      <ellipse cx="7" cy="-26" rx="1" ry="3" fill="#9a6c3a" />
      <ellipse cx="10" cy="-26" rx="1" ry="3" fill="#9a6c3a" />
      <circle cx="9.5" cy="-21" r="0.8" fill="#222" />
    </g>
  );
}

const PREYS: PreyDef[] = [
  { id: 'rabbit', label: 'Rabbit', emoji: '🐰', speedKmh: 40, Render: Rabbit },
  { id: 'gazelle', label: 'Gazelle', emoji: '🦌', speedKmh: 60, Render: Gazelle },
  { id: 'kangaroo', label: 'Kangaroo', emoji: '🦘', speedKmh: 70, Render: Kangaroo },
];

export function ChaseArena({ creature, stats, onFinish }: Props) {
  const E0 = Math.max(1, stats.enduranceKm * 1.5);

  const [preyId, setPreyId] = useState<PreyId>('gazelle');
  const prey = PREYS.find((p) => p.id === preyId)!;

  const [playerDist, setPlayerDist] = useState(0);
  const [gazelleDist, setGazelleDist] = useState(START_GAP_M);
  const [energy, setEnergy] = useState(E0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const energyRef = useRef(E0);
  const playerRef = useRef(0);
  const gazelleRef = useRef(START_GAP_M);
  const timerRef = useRef<number | null>(null);

  function reset() {
    energyRef.current = E0;
    playerRef.current = 0;
    gazelleRef.current = START_GAP_M;
    setEnergy(E0);
    setPlayerDist(0);
    setGazelleDist(START_GAP_M);
  }

  function start() {
    reset();
    setDone(false);
    setRunning(true);
  }

  function stop(o: ChaseOutcome) {
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
    const topMps = stats.topSpeedKmh / 3.6;
    const preyMps = prey.speedKmh / 3.6;
    const drainPerSec = 1.0 * (creature.warmBlooded ? 1 : 1.5);

    timerRef.current = window.setInterval(() => {
      const exhausted = energyRef.current <= 0;
      const playerV = exhausted ? topMps * 0.25 : topMps;
      if (!exhausted) energyRef.current -= drainPerSec * dt;

      playerRef.current += playerV * dt;
      gazelleRef.current += preyMps * dt;

      setEnergy(energyRef.current);
      setPlayerDist(playerRef.current);
      setGazelleDist(gazelleRef.current);

      if (playerRef.current >= gazelleRef.current) {
        stop({ won: true, reason: 'caught' });
        return;
      }
      if (gazelleRef.current >= TRACK_M + START_GAP_M) {
        const reason: ChaseOutcome['reason'] = exhausted
          ? 'lost-stamina'
          : topMps <= preyMps
            ? 'lost-speed'
            : 'lost-distance';
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
  }, [stats.enduranceKm, preyId]);

  const scale = W / (TRACK_M + START_GAP_M);
  const playerX = Math.max(28, Math.min(W - 30, playerDist * scale));
  const gazelleX = Math.max(56, Math.min(W - 24, gazelleDist * scale));
  const energyShown = running || done ? energy : E0;

  return (
    <div className="arena">
      <h2>The Chase — savanna</h2>
      <p className="arena-help">Catch the {prey.label.toLowerCase()} ({prey.speedKmh} km/h) before it covers {TRACK_M} m.</p>

      <div className="prey-tabs">
        {PREYS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`prey-tab${preyId === p.id ? ' active' : ''}`}
            onClick={() => !running && setPreyId(p.id)}
            disabled={running}
            title={`${p.label} — ${p.speedKmh} km/h`}
          >
            <span className="prey-emoji">{p.emoji}</span>
            <span className="prey-name">
              {p.label}
              <small> {p.speedKmh}</small>
            </span>
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="chase-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9fd4ee" />
            <stop offset="1" stopColor="#f9e3a3" />
          </linearGradient>
          <linearGradient id="chase-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f3d27d" />
            <stop offset="1" stopColor="#c9a05a" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width={W} height={GROUND_Y} fill="url(#chase-sky)" />
        <rect x="0" y={GROUND_Y} width={W} height={H - GROUND_Y} fill="url(#chase-ground)" />

        <ellipse cx="120" cy={GROUND_Y + 6} rx="180" ry="14" fill="#d9b568" opacity="0.85" />
        <ellipse cx="480" cy={GROUND_Y + 8} rx="220" ry="16" fill="#d9b568" opacity="0.85" />

        {[
          { x: 70, h: 26 },
          { x: 250, h: 22 },
          { x: 430, h: 28 },
          { x: 555, h: 24 },
        ].map((t) => (
          <g key={t.x}>
            <line x1={t.x} y1={GROUND_Y - 2} x2={t.x} y2={GROUND_Y - t.h} stroke="#5a3b22" strokeWidth="2" />
            <ellipse cx={t.x} cy={GROUND_Y - t.h - 5} rx="16" ry="7" fill="#7a8c3a" />
            <ellipse cx={t.x + 8} cy={GROUND_Y - t.h - 2} rx="9" ry="4" fill="#8a9c4a" />
          </g>
        ))}

        {Array.from({ length: 24 }).map((_, i) => {
          const tx = 10 + i * 25;
          return (
            <g key={i} stroke="#6f8530" strokeWidth="1" strokeLinecap="round">
              <line x1={tx} y1={H - 4} x2={tx - 2} y2={H - 11} />
              <line x1={tx} y1={H - 4} x2={tx} y2={H - 13} />
              <line x1={tx} y1={H - 4} x2={tx + 2} y2={H - 10} />
            </g>
          );
        })}

        <rect x="6" y="6" width="250" height="22" fill="rgba(255,255,255,0.88)" rx="4" stroke="#bbb" />
        <text x="14" y="22" fontSize="11" fill="#333">stamina</text>
        <rect x="68" y="13" width="180" height="10" fill="#eee" stroke="#999" />
        <rect
          x="68"
          y="13"
          width={Math.max(0, 180 * (energyShown / E0))}
          height="10"
          fill={energyShown > 0 ? '#5cc46a' : '#c44'}
        />

        <g transform={`translate(${gazelleX} ${GROUND_Y})`}>
          <g className="bob-run">{prey.Render()}</g>
        </g>

        <g transform={`translate(${playerX} 0)`}>
          <CreatureBody creature={creature} cx={0} footY={GROUND_Y} scale={0.32} animate="run" />
        </g>
      </svg>
      <div className="arena-controls">
        {!running && !done && (
          <button className="btn" onClick={start} type="button">
            Start the chase
          </button>
        )}
        {running && (
          <button className="btn btn-secondary" onClick={() => stop({ won: false, reason: 'lost-distance' })} type="button">
            Give up
          </button>
        )}
        {done && (
          <button className="btn" onClick={start} type="button">
            Run again
          </button>
        )}
      </div>
    </div>
  );
}
