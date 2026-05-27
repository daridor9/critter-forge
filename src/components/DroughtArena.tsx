import { useEffect, useRef, useState } from 'react';
import type { CreatureStats } from '../physics';
import type { Creature } from '../types';
import { CreatureBody } from './CreatureSVG';
import { BespokeInScene, hasBespokeShape } from './dexShapes';
import { comboEffects } from '../data/hybridCombos';

export type DroughtOutcome = {
  won: boolean;
  reason: 'survived' | 'starved';
  daysSurvived: number;
  severity?: DroughtSeverityId;
};

export type DroughtSeverityId = 'dry' | 'drought' | 'megadrought' | 'apocalypse';

interface Props {
  creature: Creature;
  stats: CreatureStats;
  generation?: number;
  onFinish: (o: DroughtOutcome) => void;
}

interface DroughtSeverity {
  id: DroughtSeverityId;
  label: string;
  emoji: string;
  description: string;
  sky: [string, string];
  ground: [string, string];
  sun: string;
  sunRayColor: string;
  availFood: number;
  daysGoal: number;
  rewardMult: number;
  difficultyLabel: string;
  dustStorm?: boolean;
  bones?: boolean;
}

const DROUGHT_SEVERITIES: DroughtSeverity[] = [
  {
    id: 'dry',
    label: 'Dry season',
    emoji: '🌾',
    description: 'A long dry stretch. Some grass still grows.',
    sky: ['#ffd589', '#fbe9b0'],
    ground: ['#e3b06a', '#a07a45'],
    sun: '#ffb84a', sunRayColor: '#f0a040',
    availFood: 30, daysGoal: 60,
    rewardMult: 1.0, difficultyLabel: 'easy',
  },
  {
    id: 'drought',
    label: 'Drought',
    emoji: '🏜',
    description: 'Cracked earth, sparse vegetation, hot sun.',
    sky: ['#ffba60', '#f0c878'],
    ground: ['#d99850', '#8a6230'],
    sun: '#ff9a30', sunRayColor: '#e08020',
    availFood: 18, daysGoal: 80,
    rewardMult: 1.4, difficultyLabel: 'medium',
  },
  {
    id: 'megadrought',
    label: 'Megadrought',
    emoji: '☠️',
    description: 'Years without rain. Bones in the dust. Scorched earth.',
    sky: ['#ff8845', '#f0a058'],
    ground: ['#c47238', '#6e4818'],
    sun: '#ff6a20', sunRayColor: '#c05010',
    availFood: 12, daysGoal: 110,
    rewardMult: 1.8, difficultyLabel: 'hard',
    bones: true,
  },
  {
    id: 'apocalypse',
    label: 'Dust storm',
    emoji: '🌪',
    description: 'Red dust apocalypse. Almost nothing edible. Only the ancients survive.',
    sky: ['#d65a40', '#e89060'],
    ground: ['#a04828', '#5a2810'],
    sun: '#e03020', sunRayColor: '#a01010',
    availFood: 7, daysGoal: 150,
    rewardMult: 2.3, difficultyLabel: 'extreme',
    dustStorm: true,
    bones: true,
  },
];

const DAYS_PER_SEC = 2;
const TICK_MS = 50;

const W = 600;
const H = 210;
const GROUND_Y = 130;

function fatReserveKcal(massKg: number, brainTier: number): number {
  const brainBonus = 1 + brainTier * 0.08;
  return Math.max(50, massKg * 0.15 * 9000) * brainBonus;
}

export function DroughtArena({ creature, stats, generation = 1, onFinish }: Props) {
  const [severityId, setSeverityId] = useState<DroughtSeverityId>('dry');
  const env = DROUGHT_SEVERITIES.find((s) => s.id === severityId) ?? DROUGHT_SEVERITIES[0];
  const DAYS_GOAL = env.daysGoal + (generation - 1) * 5;
  const AVAIL_KCAL_PER_DAY = env.availFood;
  const R0 = fatReserveKcal(stats.massKg, creature.brainTier);

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
    const foodMult = comboEffects(creature).droughtFoodMult ?? 1;
    const netLossPerDay = Math.max(1, stats.foodKcalPerDay * foodMult - AVAIL_KCAL_PER_DAY);

    timerRef.current = window.setInterval(() => {
      const daysElapsed = DAYS_PER_SEC * dt;
      reserveRef.current -= netLossPerDay * daysElapsed;
      dayRef.current += daysElapsed;
      setReserve(reserveRef.current);
      setDay(dayRef.current);

      if (dayRef.current >= DAYS_GOAL) {
        stop({ won: true, reason: 'survived', daysSurvived: DAYS_GOAL, severity: env.id });
        return;
      }
      if (reserveRef.current <= 0) {
        stop({ won: false, reason: 'starved', daysSurvived: Math.round(dayRef.current), severity: env.id });
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
  }, [stats.massKg, stats.foodKcalPerDay, severityId]);

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
      <h2>The Drought — {env.emoji} {env.label} <small className="arena-env">· {env.difficultyLabel} · ×{env.rewardMult.toFixed(1)} reward</small></h2>
      <p className="arena-help">
        {env.description} Survive <strong>{DAYS_GOAL} days</strong> with only {AVAIL_KCAL_PER_DAY} kcal of food per day. Big bodies and cold-blooded creatures last longest.
      </p>

      <div className="prey-tabs">
        {DROUGHT_SEVERITIES.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`prey-tab${severityId === s.id ? ' active' : ''}`}
            onClick={() => !running && setSeverityId(s.id)}
            disabled={running}
            title={`${s.label} · ${s.difficultyLabel} · ×${s.rewardMult.toFixed(1)} reward`}
          >
            <span className="prey-emoji">{s.emoji}</span>
            <span className="prey-name">
              {s.label}
              <small> {s.daysGoal}d · ×{s.rewardMult.toFixed(1)}</small>
            </span>
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="drought-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={env.sky[0]} />
            <stop offset="1" stopColor={env.sky[1]} />
          </linearGradient>
          <linearGradient id="drought-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={env.ground[0]} />
            <stop offset="1" stopColor={env.ground[1]} />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width={W} height={GROUND_Y} fill="url(#drought-sky)" />
        <rect x="0" y={GROUND_Y} width={W} height={H - GROUND_Y} fill="url(#drought-ground)" />

        <g className="sun-rays" style={{ transformOrigin: `${sunCx}px ${sunCy}px` }}>
          {sunRays.map((r, i) => (
            <line key={i} {...r} stroke={env.sunRayColor} strokeWidth="2" opacity="0.7" strokeLinecap="round" />
          ))}
        </g>
        <circle cx={sunCx} cy={sunCy} r="22" fill={env.sun} />
        <circle cx={sunCx} cy={sunCy} r="22" fill={env.sun} opacity="0.4" />

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

        {/* SEVERITY-SPECIFIC FOREGROUND PROPS */}

        {/* DRY SEASON — sparse green grass tufts + flowers + a small
            WATERING HOLE the creature is foraging around. */}
        {env.id === 'dry' && (
          <g>
            {/* wilting flowers */}
            <g>
              {[80, 180, 320, 450].map((x, i) => (
                <g key={`fl-${i}`}>
                  <line x1={x} y1={GROUND_Y + 12} x2={x} y2={GROUND_Y + 4} stroke="#9a7848" strokeWidth="1" />
                  <circle cx={x} cy={GROUND_Y + 2} r="2.5" fill="#d4a040" opacity="0.7" />
                </g>
              ))}
            </g>
            {/* WATERING HOLE in the foreground — shrinking blue puddle
                with a few ripple lines, plus a scrubby green bush by it */}
            <g transform={`translate(${W * 0.55} ${GROUND_Y + 28})`}>
              <ellipse cx="0" cy="0" rx="40" ry="8" fill="#3a85b8" opacity="0.7" />
              <ellipse cx="0" cy="-2" rx="36" ry="5" fill="#74c4dc" opacity="0.6" />
              {/* ripple rings */}
              <g stroke="white" strokeWidth="0.7" fill="none" opacity="0.55">
                <ellipse cx="-8" cy="-1" rx="6" ry="1.5" />
                <ellipse cx="10" cy="0" rx="5" ry="1.2" />
              </g>
              {/* a thirsty bird sipping at the edge */}
              <g transform="translate(28 -2)">
                <ellipse cx="0" cy="0" rx="4" ry="2.5" fill="#5a3b22" />
                <circle cx="4" cy="-1" r="1.6" fill="#5a3b22" />
                <line x1="5.5" y1="-1" x2="8" y2="2" stroke="#5a3b22" strokeWidth="0.8" />
                <line x1="-2" y1="2" x2="-3" y2="5" stroke="#5a3b22" strokeWidth="0.8" />
                <line x1="2" y1="2" x2="1" y2="5" stroke="#5a3b22" strokeWidth="0.8" />
              </g>
              {/* scrub bush by the edge */}
              <g transform="translate(-46 -2)">
                <ellipse cx="0" cy="0" rx="10" ry="6" fill="#5a7838" />
                <ellipse cx="6" cy="-2" rx="6" ry="4" fill="#6a9048" />
              </g>
            </g>
            {/* small grass tufts still alive */}
            <g stroke="#9a8848" strokeWidth="1" strokeLinecap="round" opacity="0.7">
              {Array.from({ length: 14 }).map((_, i) => {
                const x = 30 + i * 40;
                return (
                  <g key={i}>
                    <line x1={x} y1={GROUND_Y + 20} x2={x - 3} y2={GROUND_Y + 10} />
                    <line x1={x} y1={GROUND_Y + 20} x2={x} y2={GROUND_Y + 8} />
                    <line x1={x} y1={GROUND_Y + 20} x2={x + 3} y2={GROUND_Y + 10} />
                  </g>
                );
              })}
            </g>
          </g>
        )}

        {/* DROUGHT — dry tree silhouettes + heat shimmer waves +
            shrunken muddy puddle (almost dried up). */}
        {env.id === 'drought' && (
          <g>
            {/* dead branching tree silhouettes */}
            <g stroke="#3a2a14" strokeWidth="2.5" strokeLinecap="round" fill="none">
              <g transform="translate(120 0)">
                <line x1="0" y1={GROUND_Y} x2="0" y2={GROUND_Y - 36} />
                <line x1="0" y1={GROUND_Y - 22} x2="-12" y2={GROUND_Y - 32} />
                <line x1="0" y1={GROUND_Y - 28} x2="10" y2={GROUND_Y - 40} />
                <line x1="-8" y1={GROUND_Y - 30} x2="-14" y2={GROUND_Y - 42} />
              </g>
              <g transform="translate(420 0)">
                <line x1="0" y1={GROUND_Y} x2="0" y2={GROUND_Y - 30} />
                <line x1="0" y1={GROUND_Y - 18} x2="-10" y2={GROUND_Y - 28} />
                <line x1="0" y1={GROUND_Y - 24} x2="8" y2={GROUND_Y - 32} />
              </g>
            </g>
            {/* SHRUNKEN muddy puddle (almost dried up) */}
            <g transform={`translate(${W * 0.45} ${GROUND_Y + 36})`}>
              <ellipse cx="0" cy="2" rx="22" ry="6" fill="#6a4a28" opacity="0.85" />
              <ellipse cx="0" cy="0" rx="14" ry="3" fill="#5a8aa8" opacity="0.55" />
              {/* cracked mud rings around the shrinking edge */}
              <g stroke="#3a2a14" strokeWidth="0.8" fill="none" opacity="0.6">
                <ellipse cx="0" cy="2" rx="28" ry="7" strokeDasharray="3 3" />
              </g>
            </g>
            {/* heat-shimmer waves over the horizon */}
            <g className="heat" stroke="#ffd060" strokeWidth="1" opacity="0.45" strokeDasharray="3 5">
              <line x1="40" y1={GROUND_Y - 8} x2="240" y2={GROUND_Y - 8} />
              <line x1="280" y1={GROUND_Y - 12} x2="540" y2={GROUND_Y - 12} />
            </g>
          </g>
        )}

        {/* BONES — for megadrought / dust storm */}
        {env.bones && (
          <g fill="#f4eed8" opacity="0.85" stroke="#a89878" strokeWidth="0.5">
            {/* skull */}
            <g transform={`translate(110 ${GROUND_Y + 50})`}>
              <ellipse cx="0" cy="0" rx="12" ry="10" />
              <circle cx="-4" cy="-2" r="2" fill="#3a2a18" stroke="none" />
              <circle cx="4" cy="-2" r="2" fill="#3a2a18" stroke="none" />
              <path d="M -4 4 q 4 -2 8 0" stroke="#3a2a18" strokeWidth="0.8" fill="none" />
            </g>
            {/* rib bones */}
            <g transform={`translate(280 ${GROUND_Y + 58})`}>
              <line x1="-10" y1="0" x2="14" y2="2" stroke="#a89878" strokeWidth="1.5" />
              <ellipse cx="-10" cy="0" rx="2" ry="1.4" />
              <ellipse cx="14" cy="2" rx="2" ry="1.4" />
            </g>
            <g transform={`translate(420 ${GROUND_Y + 66})`}>
              <line x1="-8" y1="0" x2="10" y2="-1" stroke="#a89878" strokeWidth="1.5" />
              <ellipse cx="-8" cy="0" rx="2" ry="1.2" />
              <ellipse cx="10" cy="-1" rx="2" ry="1.2" />
            </g>
          </g>
        )}

        {/* MEGADROUGHT — dead skeletal tree + circling vulture */}
        {env.id === 'megadrought' && (
          <g>
            {/* dead twisted tree */}
            <g stroke="#3a1a08" strokeWidth="3" fill="none" strokeLinecap="round">
              <path d={`M 350 ${GROUND_Y} L 350 ${GROUND_Y - 50}`} />
              <path d={`M 350 ${GROUND_Y - 30} q -16 -6 -22 -22`} />
              <path d={`M 350 ${GROUND_Y - 42} q 14 -4 22 -18`} />
              <path d={`M 350 ${GROUND_Y - 50} q -6 -10 -16 -14`} />
              <path d={`M 350 ${GROUND_Y - 48} q 6 -14 18 -12`} />
            </g>
            {/* circling vulture */}
            <g style={{ transformOrigin: 'center' }}>
              <g className="circle-slow" style={{ transformOrigin: '200px 30px' }}>
                <text x="200" y="30" fontSize="14" opacity="0.85">🦅</text>
              </g>
            </g>
            {/* tumbleweed rolling across */}
            <g className="swim" style={{ animationDuration: '14s' }}>
              <g transform="translate(0 138)">
                <circle cx="0" cy="0" r="9" fill="#6a4828" opacity="0.85" />
                <g stroke="#3a2818" strokeWidth="0.8" fill="none" opacity="0.7" strokeLinecap="round">
                  <path d="M -6 -4 q 5 -3 9 4 M -3 -6 q 6 1 6 7 M 3 -7 q 3 5 -3 8" />
                </g>
              </g>
            </g>
          </g>
        )}

        {/* DUST STORM — sweeping red dust particles + wall of dust */}
        {env.dustStorm && (
          <g fill="#a04020" opacity="0.45">
            {Array.from({ length: 40 }).map((_, i) => (
              <circle
                key={i}
                cx={(i * 47 + 20) % W}
                cy={-10 + (i * 13) % GROUND_Y}
                r={1.5 + (i % 3) * 0.6}
                className="snowflake"
                style={{ animationDuration: `${3 + (i % 3)}s`, animationDelay: `-${i * 0.3}s` }}
              />
            ))}
            {/* sweeping dust waves at horizon */}
            <g fill="#7a3010" opacity="0.55">
              <ellipse cx={W * 0.3} cy={GROUND_Y - 4} rx="120" ry="10" />
              <ellipse cx={W * 0.7} cy={GROUND_Y - 6} rx="140" ry="12" />
            </g>
          </g>
        )}

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

        {hasBespokeShape(creature) ? (
          <BespokeInScene creature={creature} x={W / 2 - 80} y={GROUND_Y - 90} width={110} height={90} animate="breathe" />
        ) : (
          <CreatureBody creature={creature} cx={W / 2 - 30} footY={GROUND_Y} scale={0.35} animate="breathe" />
        )}
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
