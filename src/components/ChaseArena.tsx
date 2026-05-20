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
  generation?: number;
  onFinish: (o: ChaseOutcome) => void;
}

interface ChaseEnv {
  label: string;
  sky: [string, string, string];
  sun: string;
  sunHalo: string;
  ground: [string, string, string];
  hill: string;
  hill2: string;
  treeMain: string;
  treeMid: string;
  treeTop: string;
  stars: boolean;
  preyKmhBonus: number;
}

const CHASE_ENVS: ChaseEnv[] = [
  { label: 'midday', sky: ['#7ec4e0', '#c8d8b8', '#f8d68a'], sun: '#ffd66a', sunHalo: '#ffe9a0', ground: ['#f3d27d', '#dfb066', '#a07a40'], hill: '#d4b56a', hill2: '#c89a55', treeMain: '#3f5a30', treeMid: '#557d3e', treeTop: '#6b9450', stars: false, preyKmhBonus: 0 },
  { label: 'dusk', sky: ['#3a2a5a', '#d68b5a', '#f4a060'], sun: '#f06030', sunHalo: '#ffa060', ground: ['#d4a060', '#a87a45', '#6a4a28'], hill: '#a87a52', hill2: '#8a6238', treeMain: '#2a3a22', treeMid: '#3d5530', treeTop: '#557840', stars: false, preyKmhBonus: 2 },
  { label: 'night', sky: ['#0a1530', '#1f2d5a', '#3a4878'], sun: '#f0f0ff', sunHalo: '#a0b8e0', ground: ['#5a5878', '#3e3c58', '#1e1c30'], hill: '#48506a', hill2: '#363c54', treeMain: '#1a2418', treeMid: '#243024', treeTop: '#2e3a2c', stars: true, preyKmhBonus: 4 },
  { label: 'dawn', sky: ['#4a3a6a', '#e08aa0', '#f4c890'], sun: '#ffb098', sunHalo: '#ffd0c0', ground: ['#e8c590', '#c89a6a', '#8a6840'], hill: '#c79a78', hill2: '#a87a5e', treeMain: '#3c5a38', treeMid: '#577a4a', treeTop: '#6f9558', stars: false, preyKmhBonus: 6 },
];

const NIGHT_STARS = Array.from({ length: 28 }).map((_, i) => ({
  x: ((i * 73 + 19) % 800),
  y: ((i * 41) % 180) + 10,
  r: ((i * 7) % 5 === 0 ? 1.6 : 1),
}));

const TRACK_M = 600;
const START_GAP_M = 25;
const TICK_MS = 50;

const W = 800;
const H = 420;
const GROUND_Y = 300;

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
    <g transform="scale(1.6)">
      <ellipse cx="0" cy="2" rx="13" ry="3" fill="rgba(0,0,0,0.2)" />
      <g className="leg leg-a" style={{ transformOrigin: '-5px 0px' }}>
        <line x1="-4" y1="-2" x2="-5" y2="7" stroke="#7a5236" strokeWidth="2.6" strokeLinecap="round" />
        <ellipse cx="-5" cy="7" rx="2" ry="0.8" fill="#3a2118" />
      </g>
      <g className="leg leg-b" style={{ transformOrigin: '0px 0px' }}>
        <line x1="0" y1="-2" x2="-1" y2="7" stroke="#7a5236" strokeWidth="2.6" strokeLinecap="round" />
        <ellipse cx="-1" cy="7" rx="2" ry="0.8" fill="#3a2118" />
      </g>
      <g className="leg leg-b" style={{ transformOrigin: '6px 0px' }}>
        <line x1="6" y1="-2" x2="7" y2="7" stroke="#7a5236" strokeWidth="2.6" strokeLinecap="round" />
        <ellipse cx="7" cy="7" rx="2" ry="0.8" fill="#3a2118" />
      </g>
      <g className="leg leg-a" style={{ transformOrigin: '10px 0px' }}>
        <line x1="10" y1="-2" x2="11" y2="7" stroke="#7a5236" strokeWidth="2.6" strokeLinecap="round" />
        <ellipse cx="11" cy="7" rx="2" ry="0.8" fill="#3a2118" />
      </g>
      <ellipse cx="3" cy="-8" rx="12" ry="6" fill="#a48267" />
      <ellipse cx="3" cy="-6" rx="10" ry="2.4" fill="#c7a98a" opacity="0.55" />
      <ellipse cx="-6" cy="-9" rx="3" ry="2" fill="#9a7458" opacity="0.6" />
      <ellipse cx="2" cy="-10" rx="3" ry="2" fill="#9a7458" opacity="0.6" />
      <circle cx="12" cy="-13" r="4.5" fill="#a48267" />
      <ellipse cx="10" cy="-21" rx="1.8" ry="7" fill="#a48267" transform="rotate(-12 10 -21)" />
      <ellipse cx="14" cy="-21" rx="1.8" ry="7" fill="#a48267" transform="rotate(12 14 -21)" />
      <ellipse cx="10" cy="-21" rx="0.8" ry="4.5" fill="#e0b8a0" transform="rotate(-12 10 -21)" />
      <ellipse cx="14" cy="-21" rx="0.8" ry="4.5" fill="#e0b8a0" transform="rotate(12 14 -21)" />
      <g className="eye-blink" style={{ transformOrigin: '13.5px -13px' }}>
        <circle cx="13.5" cy="-13" r="1.5" fill="white" stroke="#222" strokeWidth="0.4" />
        <circle cx="13.8" cy="-13" r="1" fill="#222" />
        <circle cx="14.1" cy="-13.3" r="0.4" fill="white" />
      </g>
      <ellipse cx="15" cy="-11" rx="0.6" ry="0.4" fill="#3a2118" />
      <path d="M 11 -11 q 1 1 2.5 0.4" stroke="#3a2118" strokeWidth="0.5" fill="none" strokeLinecap="round" />
      <circle cx="-8" cy="-8" r="3.2" fill="#f0e2c8" />
      <circle cx="-9" cy="-8" r="1.4" fill="white" opacity="0.7" />
    </g>
  );
}

function Gazelle() {
  return (
    <g transform="scale(1.6)">
      <ellipse cx="0" cy="2" rx="14" ry="3" fill="rgba(0,0,0,0.2)" />
      <g className="leg leg-a" style={{ transformOrigin: '-7px -2px' }}>
        <line x1="-7" y1="-2" x2="-9" y2="12" stroke="#7a5236" strokeWidth="2.2" strokeLinecap="round" />
        <ellipse cx="-9" cy="12" rx="1.5" ry="0.6" fill="#3a2118" />
      </g>
      <g className="leg leg-b" style={{ transformOrigin: '-3px -2px' }}>
        <line x1="-3" y1="-2" x2="-5" y2="12" stroke="#7a5236" strokeWidth="2.2" strokeLinecap="round" />
        <ellipse cx="-5" cy="12" rx="1.5" ry="0.6" fill="#3a2118" />
      </g>
      <g className="leg leg-b" style={{ transformOrigin: '5px -2px' }}>
        <line x1="5" y1="-2" x2="7" y2="12" stroke="#7a5236" strokeWidth="2.2" strokeLinecap="round" />
        <ellipse cx="7" cy="12" rx="1.5" ry="0.6" fill="#3a2118" />
      </g>
      <g className="leg leg-a" style={{ transformOrigin: '9px -2px' }}>
        <line x1="9" y1="-2" x2="11" y2="12" stroke="#7a5236" strokeWidth="2.2" strokeLinecap="round" />
        <ellipse cx="11" cy="12" rx="1.5" ry="0.6" fill="#3a2118" />
      </g>
      <ellipse cx="1" cy="-9" rx="13" ry="6.5" fill="#c89366" />
      <ellipse cx="1" cy="-5" rx="11" ry="3" fill="#e1b489" opacity="0.6" />
      <ellipse cx="-5" cy="-10" rx="2.5" ry="1.5" fill="#a87649" opacity="0.55" />
      <ellipse cx="3" cy="-11" rx="2.5" ry="1.5" fill="#a87649" opacity="0.55" />
      <ellipse cx="-7" cy="-7" rx="2.5" ry="1.5" fill="#a87649" opacity="0.55" />
      <circle cx="13" cy="-15" r="4.5" fill="#c89366" />
      <line x1="12" y1="-17" x2="10" y2="-23" stroke="#3a2118" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="14" y1="-17" x2="15" y2="-24" stroke="#3a2118" strokeWidth="1.2" strokeLinecap="round" />
      <g className="eye-blink" style={{ transformOrigin: '14px -14px' }}>
        <circle cx="14" cy="-14" r="1.2" fill="white" stroke="#222" strokeWidth="0.4" />
        <circle cx="14.3" cy="-14" r="0.8" fill="#222" />
      </g>
      <ellipse cx="16" cy="-12" rx="0.6" ry="0.4" fill="#3a2118" />
      <path d="M -12 -9 q -5 -1 -7 -4" stroke="#7a5236" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <circle cx="-19" cy="-13" r="1.2" fill="white" />
    </g>
  );
}

function Kangaroo() {
  return (
    <g transform="scale(1.6)">
      <ellipse cx="0" cy="2" rx="11" ry="3" fill="rgba(0,0,0,0.2)" />
      <path d="M -4 -10 Q -16 -2 -20 10" stroke="#9a6c3a" strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <g className="leg leg-a" style={{ transformOrigin: '-2px -6px' }}>
        <path d="M -2 -7 Q -3 1 1 10" stroke="#9a6c3a" strokeWidth="3.8" fill="none" strokeLinecap="round" />
      </g>
      <g className="leg leg-b" style={{ transformOrigin: '3px -6px' }}>
        <path d="M 3 -7 Q 2 1 5 10" stroke="#9a6c3a" strokeWidth="3.8" fill="none" strokeLinecap="round" />
      </g>
      <ellipse cx="2" cy="-13" rx="6.5" ry="10" fill="#b58450" />
      <ellipse cx="2" cy="-10" rx="4.5" ry="6.5" fill="#d2a673" opacity="0.55" />
      <ellipse cx="0" cy="-7" rx="3" ry="4" fill="#a87649" opacity="0.4" />
      <line x1="6" y1="-11" x2="9" y2="-6" stroke="#9a6c3a" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="6" y1="-12" x2="9.5" y2="-9" stroke="#9a6c3a" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="8" cy="-22" rx="3.2" ry="4.8" fill="#b58450" />
      <ellipse cx="7" cy="-27" rx="1.1" ry="3.2" fill="#9a6c3a" />
      <ellipse cx="10" cy="-27" rx="1.1" ry="3.2" fill="#9a6c3a" />
      <g className="eye-blink" style={{ transformOrigin: '9.5px -22px' }}>
        <circle cx="9.5" cy="-22" r="1.2" fill="white" stroke="#222" strokeWidth="0.4" />
        <circle cx="9.8" cy="-22" r="0.8" fill="#222" />
      </g>
      <ellipse cx="11" cy="-20" rx="0.6" ry="0.4" fill="#3a2118" />
    </g>
  );
}

const PREYS: PreyDef[] = [
  { id: 'rabbit', label: 'Rabbit', emoji: '🐰', speedKmh: 40, Render: Rabbit },
  { id: 'gazelle', label: 'Gazelle', emoji: '🦌', speedKmh: 60, Render: Gazelle },
  { id: 'kangaroo', label: 'Kangaroo', emoji: '🦘', speedKmh: 70, Render: Kangaroo },
];

function Cloud({ x, y, scale, duration, delay }: { x: number; y: number; scale: number; duration: number; delay: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g className="cloud" style={{ animationDuration: `${duration}s`, animationDelay: `${delay}s` }}>
        <ellipse cx="0" cy="0" rx="38" ry="11" fill="white" opacity="0.95" />
        <ellipse cx="-18" cy="-5" rx="22" ry="9" fill="white" opacity="0.92" />
        <ellipse cx="16" cy="-3" rx="26" ry="10" fill="white" opacity="0.9" />
        <ellipse cx="-2" cy="-9" rx="14" ry="7" fill="white" opacity="0.88" />
      </g>
    </g>
  );
}

function Bird({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g className="bird-wing" style={{ transformOrigin: 'center' }}>
        <path d="M -8 0 Q -4 -4 0 0 Q 4 -4 8 0" stroke="#3a2a18" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
}

function Tree({ x, h, colors }: { x: number; h: number; colors: { main: string; mid: string; top: string } }) {
  const baseY = GROUND_Y - 2;
  const topY = baseY - h;
  return (
    <g>
      <rect x={x - 4} y={topY + 20} width="8" height={h - 20} fill="#3e2a18" />
      <rect x={x - 5} y={topY + 20} width="2" height={h - 20} fill="#2a1a0a" opacity="0.5" />
      <line x1={x} y1={topY + 30} x2={x - 14} y2={topY + 20} stroke="#3e2a18" strokeWidth="2.5" />
      <line x1={x} y1={topY + 32} x2={x + 14} y2={topY + 22} stroke="#3e2a18" strokeWidth="2.5" />
      <ellipse cx={x} cy={topY + 10} rx="42" ry="16" fill={colors.main} />
      <ellipse cx={x - 18} cy={topY + 6} rx="24" ry="11" fill={colors.mid} />
      <ellipse cx={x + 18} cy={topY + 14} rx="26" ry="12" fill={colors.mid} />
      <ellipse cx={x - 4} cy={topY - 2} rx="20" ry="9" fill={colors.top} />
      <ellipse cx={x + 8} cy={topY + 4} rx="14" ry="7" fill={colors.top} />
    </g>
  );
}

function GrassTuft({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} className="grass-tuft" style={{ transformOrigin: 'bottom' }}>
      <line x1="0" y1="0" x2="-3" y2="-10" stroke="#5d7d2c" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="0" y1="0" x2="0" y2="-13" stroke="#5d7d2c" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="0" y1="0" x2="3" y2="-10" stroke="#6f8f3a" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="0" y1="0" x2="5" y2="-7" stroke="#6f8f3a" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="0" y1="0" x2="-5" y2="-7" stroke="#5d7d2c" strokeWidth="1.2" strokeLinecap="round" />
    </g>
  );
}

function DustPuffs({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle className="dust" cx="0" cy="0" r="4" fill="#d6c098" style={{ animationDelay: '0s' }} />
      <circle className="dust" cx="-5" cy="-2" r="3.5" fill="#d6c098" style={{ animationDelay: '0.18s' }} />
      <circle className="dust" cx="-10" cy="0" r="3" fill="#cbb585" style={{ animationDelay: '0.36s' }} />
      <circle className="dust" cx="-3" cy="2" r="2.5" fill="#d6c098" style={{ animationDelay: '0.54s' }} />
    </g>
  );
}

const TREES = [
  { x: 60, h: 110 },
  { x: 200, h: 95 },
  { x: 360, h: 115 },
  { x: 510, h: 100 },
  { x: 650, h: 105 },
  { x: 770, h: 88 },
];

const CLOUDS = [
  { x: 80, y: 70, scale: 1, duration: 55, delay: 0 },
  { x: 320, y: 50, scale: 0.7, duration: 70, delay: -15 },
  { x: 560, y: 85, scale: 0.85, duration: 60, delay: -30 },
  { x: -150, y: 105, scale: 1.1, duration: 75, delay: -50 },
];

const BIRDS = [
  { x: 180, y: 100, scale: 1.2 },
  { x: 220, y: 115, scale: 0.9 },
  { x: 250, y: 105, scale: 1.0 },
];

const GRASS_TUFTS: { x: number; y: number }[] = [];
for (let i = 0; i < 36; i++) {
  const x = 5 + i * 22 + (i % 3) * 3;
  const y = H - 6 + ((i * 7) % 4) - 2;
  GRASS_TUFTS.push({ x, y });
}

export function ChaseArena({ creature, stats, generation = 1, onFinish }: Props) {
  const E0 = Math.max(1, stats.enduranceKm * 1.5);

  const env = CHASE_ENVS[(generation - 1) % CHASE_ENVS.length];

  const [preyId, setPreyId] = useState<PreyId>('gazelle');
  const prey = PREYS.find((p) => p.id === preyId)!;
  const preySpeedKmh = prey.speedKmh + env.preyKmhBonus;

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
    const preyMps = preySpeedKmh / 3.6;
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
  const playerX = Math.max(40, Math.min(W - 40, playerDist * scale));
  const gazelleX = Math.max(80, Math.min(W - 40, gazelleDist * scale));
  const energyShown = running || done ? energy : E0;

  return (
    <div className="arena">
      <h2>The Chase — savanna <small className="arena-env">· {env.label}</small></h2>
      <p className="arena-help">Catch the {prey.label.toLowerCase()} ({preySpeedKmh} km/h) before it covers {TRACK_M} m.</p>

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
            <stop offset="0" stopColor={env.sky[0]} />
            <stop offset="0.55" stopColor={env.sky[1]} />
            <stop offset="1" stopColor={env.sky[2]} />
          </linearGradient>
          <linearGradient id="chase-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={env.ground[0]} />
            <stop offset="0.5" stopColor={env.ground[1]} />
            <stop offset="1" stopColor={env.ground[2]} />
          </linearGradient>
          <linearGradient id="far-hill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={env.hill} />
            <stop offset="1" stopColor={env.hill2} />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width={W} height={GROUND_Y} fill="url(#chase-sky)" />

        {env.stars && (
          <g fill="white">
            {NIGHT_STARS.map((s, i) => (
              <circle key={i} cx={s.x} cy={s.y} r={s.r} opacity={0.7 + ((i * 17) % 30) / 100} />
            ))}
          </g>
        )}

        <circle cx={W - 130} cy="70" r="34" fill={env.sunHalo} opacity="0.55" />
        <circle cx={W - 130} cy="70" r="26" fill={env.sun} />
        <circle cx={W - 130} cy="70" r="22" fill={env.sun} opacity="0.5" />

        {CLOUDS.map((c, i) => (
          <Cloud key={i} {...c} />
        ))}

        {BIRDS.map((b, i) => (
          <Bird key={i} {...b} />
        ))}

        <path
          d={`M 0 ${GROUND_Y - 40} Q ${W * 0.2} ${GROUND_Y - 75} ${W * 0.4} ${GROUND_Y - 50} T ${W * 0.8} ${GROUND_Y - 55} T ${W} ${GROUND_Y - 40} L ${W} ${GROUND_Y} L 0 ${GROUND_Y} Z`}
          fill="url(#far-hill)"
          opacity="0.85"
        />
        <path
          d={`M 0 ${GROUND_Y - 15} Q ${W * 0.25} ${GROUND_Y - 38} ${W * 0.5} ${GROUND_Y - 18} T ${W} ${GROUND_Y - 22} L ${W} ${GROUND_Y} L 0 ${GROUND_Y} Z`}
          fill="#c89a55"
        />

        <rect x="0" y={GROUND_Y} width={W} height={H - GROUND_Y} fill="url(#chase-ground)" />

        {TREES.map((t, i) => (
          <Tree key={i} {...t} colors={{ main: env.treeMain, mid: env.treeMid, top: env.treeTop }} />
        ))}

        {Array.from({ length: 14 }).map((_, i) => {
          const rx = 30 + i * 56;
          return (
            <ellipse key={i} cx={rx} cy={GROUND_Y + 18 + (i % 3) * 4} rx={5 + (i % 3) * 2} ry="2" fill="#7a5a32" opacity="0.4" />
          );
        })}

        {GRASS_TUFTS.map((g, i) => (
          <GrassTuft key={i} {...g} />
        ))}

        <rect x="10" y="10" width="280" height="28" fill="rgba(255,255,255,0.92)" rx="6" stroke="#bbb" />
        <text x="22" y="29" fontSize="13" fill="#333">stamina</text>
        <rect x="86" y="18" width="194" height="12" fill="#eee" stroke="#999" />
        <rect
          x="86"
          y="18"
          width={Math.max(0, 194 * (energyShown / E0))}
          height="12"
          fill={energyShown > 0 ? '#5cc46a' : '#c44'}
        />

        {running && <DustPuffs x={gazelleX - 18} y={GROUND_Y - 4} />}
        <g transform={`translate(${gazelleX} ${GROUND_Y})`}>
          <g className="bob-run">{prey.Render()}</g>
        </g>

        {running && <DustPuffs x={playerX - 22} y={GROUND_Y - 2} />}
        <g transform={`translate(${playerX} 0)`}>
          <CreatureBody creature={creature} cx={0} footY={GROUND_Y} scale={0.55} animate="run" />
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
