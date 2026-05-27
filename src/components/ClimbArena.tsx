import { useEffect, useRef, useState } from 'react';
import type { CreatureStats } from '../physics';
import type { Creature } from '../types';
import { CreatureBody } from './CreatureSVG';
import { BespokeInScene, hasBespokeShape } from './dexShapes';

export type ClimbOutcome = { won: boolean; reason: 'reached-top' | 'froze' | 'exhausted'; terrain?: ClimbTerrainId };

export type ClimbTerrainId = 'alpine' | 'volcanic' | 'glacial' | 'aurora';

interface Props {
  creature: Creature;
  stats: CreatureStats;
  generation?: number;
  onFinish: (o: ClimbOutcome) => void;
}

interface ClimbTerrain {
  id: ClimbTerrainId;
  label: string;
  emoji: string;
  description: string;
  sky: [string, string];
  rockTop: string;
  rockBottom: string;
  farMountain: string;
  midMountain: string;
  snowCount: number;
  altGoal: number;
  rewardMult: number;
  difficultyLabel: string;
  coldDrainMult: number;       // higher = colder, drains faster
  aurora?: boolean;
  lava?: boolean;
  glacial?: boolean;
}

const CLIMB_TERRAINS: ClimbTerrain[] = [
  {
    id: 'alpine',
    label: 'Alpine',
    emoji: '🏔',
    description: 'Clear day, classic snowy peak.',
    sky: ['#a8c8da', '#e5eef3'],
    rockTop: '#9aa9b1', rockBottom: '#6c7c84',
    farMountain: '#a8b8c4', midMountain: '#c0ccd3',
    snowCount: 14, altGoal: 3000, rewardMult: 1.0,
    difficultyLabel: 'easy', coldDrainMult: 1.0,
  },
  {
    id: 'volcanic',
    label: 'Volcanic',
    emoji: '🌋',
    description: 'Red-hot caldera. Ash rains down. Lava glows below.',
    sky: ['#8a3018', '#e06530'],
    rockTop: '#5a2818', rockBottom: '#3a1808',
    farMountain: '#5a3828', midMountain: '#6a4030',
    snowCount: 0, altGoal: 3500, rewardMult: 1.5,
    difficultyLabel: 'medium', coldDrainMult: 0.4,  // hot, not cold
    lava: true,
  },
  {
    id: 'glacial',
    label: 'Glacial',
    emoji: '❄️',
    description: 'Snowstorm + ice. Extreme cold drains energy.',
    sky: ['#7c8c98', '#b8c4cc'],
    rockTop: '#8d9aa2', rockBottom: '#5d6c76',
    farMountain: '#919fab', midMountain: '#a8b4be',
    snowCount: 60, altGoal: 4200, rewardMult: 1.8,
    difficultyLabel: 'hard', coldDrainMult: 1.8,
    glacial: true,
  },
  {
    id: 'aurora',
    label: 'Aurora peak',
    emoji: '🌌',
    description: 'Night climb under shimmering aurora — pitch dark + cold.',
    sky: ['#1a2244', '#3d2e5e'],
    rockTop: '#4c5566', rockBottom: '#2e3540',
    farMountain: '#3a4258', midMountain: '#4a5266',
    snowCount: 26, altGoal: 4800, rewardMult: 2.2,
    difficultyLabel: 'very hard', coldDrainMult: 1.5,
    aurora: true,
  },
];

const ALT_PER_SEC = 50;
const E0 = 150;
const TICK_MS = 50;

const W = 600;
const H = 240;

export function ClimbArena({ creature, stats, generation = 1, onFinish }: Props) {
  const [terrainId, setTerrainId] = useState<ClimbTerrainId>('alpine');
  const env = CLIMB_TERRAINS.find((t) => t.id === terrainId) ?? CLIMB_TERRAINS[0];
  const altGoal = env.altGoal + (generation - 1) * 100;

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
    const coldDrain = (100 - stats.coldTolerance) * 0.04 * env.coldDrainMult;
    const effortDrain = Math.sqrt(stats.massKg) * 0.15;
    const brainPath = 1 + creature.brainTier * 0.06;

    timerRef.current = window.setInterval(() => {
      energyRef.current -= (coldDrain + effortDrain) * dt;
      altRef.current += ALT_PER_SEC * brainPath * dt;
      setEnergy(energyRef.current);
      setAltitude(altRef.current);

      if (altRef.current >= altGoal) {
        stop({ won: true, reason: 'reached-top', terrain: env.id });
        return;
      }
      if (energyRef.current <= 0) {
        const reason: ClimbOutcome['reason'] = coldDrain >= effortDrain ? 'froze' : 'exhausted';
        stop({ won: false, reason, terrain: env.id });
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
  }, [stats.coldTolerance, stats.massKg, terrainId]);

  const climbFrac = Math.min(1, altitude / altGoal);
  const baseY = H - 24;
  const topY = 36;
  const footY = baseY - climbFrac * (baseY - topY);
  const cx = W / 2;

  const snowflakes = Array.from({ length: env.snowCount }).map((_, i) => ({
    x: (i * 31 + 17) % W,
    y0: -20 + ((i * 53) % 60),
    r: 1.2 + (i % 3) * 0.4,
    duration: 6 + ((i * 7) % 7),
    delay: -((i * 11) % 8),
  }));

  return (
    <div className="arena">
      <h2>The Climb — {env.emoji} {env.label} <small className="arena-env">· {env.difficultyLabel} · ×{env.rewardMult.toFixed(1)} reward</small></h2>
      <p className="arena-help">{env.description} Climb to <strong>{altGoal} m</strong>. {env.lava ? 'Heat saps cold-blooded creatures.' : 'Cold drains energy fast if your cold tolerance is low.'} Heavy bodies tire fast too.</p>

      <div className="prey-tabs">
        {CLIMB_TERRAINS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`prey-tab${terrainId === t.id ? ' active' : ''}`}
            onClick={() => !running && setTerrainId(t.id)}
            disabled={running}
            title={`${t.label} · ${t.difficultyLabel} · ×${t.rewardMult.toFixed(1)} reward`}
          >
            <span className="prey-emoji">{t.emoji}</span>
            <span className="prey-name">
              {t.label}
              <small> {t.altGoal}m · ×{t.rewardMult.toFixed(1)}</small>
            </span>
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="climb-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={env.sky[0]} />
            <stop offset="1" stopColor={env.sky[1]} />
          </linearGradient>
          <linearGradient id="climb-rock" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={env.rockTop} />
            <stop offset="1" stopColor={env.rockBottom} />
          </linearGradient>
          {env.lava && (
            <radialGradient id="lava-glow" cx="0.5" cy="0" r="0.6">
              <stop offset="0" stopColor="#ffd040" stopOpacity="0.6" />
              <stop offset="1" stopColor="#ff5020" stopOpacity="0" />
            </radialGradient>
          )}
        </defs>

        <rect x="0" y="0" width={W} height={H} fill="url(#climb-sky)" />

        {env.aurora && (
          <g opacity="0.7">
            <path d={`M 0 ${H * 0.18} q ${W * 0.25} ${H * 0.08} ${W * 0.5} 0 t ${W * 0.5} 0`} stroke="#7ae5b8" strokeWidth="14" fill="none" opacity="0.4" />
            <path d={`M 0 ${H * 0.24} q ${W * 0.25} ${-H * 0.06} ${W * 0.5} 0 t ${W * 0.5} 0`} stroke="#7aa8e5" strokeWidth="12" fill="none" opacity="0.35" />
            <path d={`M 0 ${H * 0.32} q ${W * 0.25} ${H * 0.05} ${W * 0.5} 0 t ${W * 0.5} 0`} stroke="#c47ae5" strokeWidth="10" fill="none" opacity="0.3" />
          </g>
        )}

        <polygon points={`0,${H} 80,${H * 0.55} 200,${H * 0.7} 340,${H * 0.5} 460,${H * 0.65} ${W},${H * 0.55} ${W},${H}`} fill={env.farMountain} opacity="0.7" />
        <polygon points={`0,${H} 90,${H * 0.45} 180,${H * 0.6} 280,${H * 0.4} 380,${H * 0.55} 480,${H * 0.42} ${W},${H * 0.55} ${W},${H}`} fill={env.midMountain} opacity="0.85" />
        <polygon points={`0,${H} 120,${H * 0.55} 240,${H * 0.35} 360,${H * 0.5} ${W * 0.85},${H * 0.32} ${W},${H * 0.5} ${W},${H}`} fill="#e9eff2" />

        <polygon points={`${W * 0.25},${H} ${W / 2},22 ${W * 0.75},${H}`} fill="url(#climb-rock)" />
        <polygon points={`${W * 0.42},${H * 0.55} ${W / 2},22 ${W * 0.58},${H * 0.55}`} fill="#ffffff" />
        <polygon points={`${W * 0.34},${H} ${W / 2},34 ${W * 0.66},${H}`} fill="#f3f6f8" opacity="0.75" />

        <line x1={cx} y1="22" x2={cx} y2="6" stroke="#3a2118" strokeWidth="1.5" />
        <polygon points={`${cx} 6 ${cx + 12} 10 ${cx} 14`} fill="#e07b5b" />

        {/* LAVA pool + glow at the base for volcanic terrain */}
        {env.lava && (
          <g>
            <rect x="0" y={H - 14} width={W} height="14" fill="#ff5020" />
            <rect x="0" y={H - 14} width={W} height="14" fill="url(#lava-glow)" />
            {/* glowing cracks */}
            <g stroke="#ffd040" strokeWidth="1.5" fill="none" opacity="0.85" strokeLinecap="round">
              <path d={`M 60 ${H} q 5 -20 0 -40 q -5 -16 0 -32`} />
              <path d={`M 200 ${H} q -5 -16 0 -28`} />
              <path d={`M 380 ${H} q 6 -22 0 -42`} />
              <path d={`M 520 ${H} q -4 -18 0 -34 q 4 -12 0 -22`} />
            </g>
            {/* ash particles falling */}
            <g fill="#3a2a18" opacity="0.55">
              {Array.from({ length: 22 }).map((_, i) => (
                <circle
                  key={i}
                  cx={(i * 41 + 15) % W}
                  cy={-10}
                  r={1.2 + (i % 3) * 0.3}
                  className="snowflake"
                  style={{ animationDuration: `${5 + (i % 4)}s`, animationDelay: `-${i * 0.5}s` }}
                />
              ))}
            </g>
          </g>
        )}

        {/* GLACIAL extras — ice cracks + frost overlay */}
        {env.glacial && (
          <g>
            <g stroke="#a8d8e8" strokeWidth="1.2" fill="none" opacity="0.65">
              <path d={`M 0 ${H * 0.7} q 60 -8 100 -2 q 80 -4 140 4 q 80 -6 160 0`} />
              <path d={`M 0 ${H * 0.82} q 80 -6 160 0 q 100 -4 180 6 q 60 -8 160 -2`} />
            </g>
            {/* icicle hints from foreground peak */}
            <g fill="#cfe6ef" opacity="0.85">
              <polygon points={`${cx - 24},22 ${cx - 20},38 ${cx - 26},32`} />
              <polygon points={`${cx + 24},22 ${cx + 20},38 ${cx + 26},32`} />
              <polygon points={`${cx - 8},22 ${cx - 4},44 ${cx - 12},36`} />
            </g>
          </g>
        )}

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

        {hasBespokeShape(creature) ? (
          <BespokeInScene creature={creature} x={cx - 50} y={footY - 80} width={100} height={80} animate="run" />
        ) : (
          <CreatureBody creature={creature} cx={cx - 4} footY={footY} scale={0.32} facingRight={true} animate="run" />
        )}

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
          {Math.round(altitude)} / {altGoal} m
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
