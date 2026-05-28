import { useEffect, useRef, useState } from 'react';
import type { CreatureStats } from '../physics';
import type { Creature } from '../types';
import { CreatureBody } from './CreatureSVG';
import { BespokeInScene, hasBespokeShape } from './dexShapes';

export type StormSeverityId = 'gust' | 'storm' | 'tornado';
export type StormStance = 'hunker' | 'anchor' | 'shelter';

export type StormOutcome = {
  won: boolean;
  reason: 'survived' | 'blown-away' | 'struck-by-debris';
  secondsHeld: number;
  severity?: StormSeverityId;
};

interface Props {
  creature: Creature;
  stats: CreatureStats;
  generation?: number;
  onFinish: (o: StormOutcome) => void;
}

interface Severity {
  id: StormSeverityId;
  label: string;
  emoji: string;
  description: string;
  durationSec: number;       // how long the storm lasts
  baseWindForce: number;     // base wind force per second
  debrisChance: number;      // per-second chance of debris strike
  rewardMult: number;
  difficultyLabel: string;
  sky: [string, string];
}

const SEVERITIES: Severity[] = [
  {
    id: 'gust',
    label: 'Strong gust',
    emoji: '⛅',
    description: 'A short bluster — 30 seconds of high wind, no debris. Easy intro.',
    durationSec: 30,
    baseWindForce: 1.0,
    debrisChance: 0,
    rewardMult: 1.0,
    difficultyLabel: 'easy',
    sky: ['#aac8d8', '#cfeaf4'],
  },
  {
    id: 'storm',
    label: 'Storm',
    emoji: '🌬️',
    description: 'A real storm — 60 seconds, heavier wind, occasional flying branches.',
    durationSec: 60,
    baseWindForce: 1.8,
    debrisChance: 0.03,
    rewardMult: 1.6,
    difficultyLabel: 'medium',
    sky: ['#5a6878', '#8a98a8'],
  },
  {
    id: 'tornado',
    label: 'Tornado',
    emoji: '🌪️',
    description: 'A full F4 tornado — 90 seconds of extreme wind with frequent killer debris.',
    durationSec: 90,
    baseWindForce: 3.2,
    debrisChance: 0.10,
    rewardMult: 2.5,
    difficultyLabel: 'extreme',
    sky: ['#1a1f2a', '#3a4a5a'],
  },
];

const TICK_MS = 50;
const W = 600;
const H = 240;
const GROUND_Y = 200;

interface Debris {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  type: 'branch' | 'rock' | 'leaf';
  rot: number;
}

let debrisIdSeed = 0;

export function StormArena({ creature, stats, generation = 1, onFinish }: Props) {
  const [severityId, setSeverityId] = useState<StormSeverityId>('gust');
  const env = SEVERITIES.find((s) => s.id === severityId) ?? SEVERITIES[0];
  const DURATION = env.durationSec + (generation - 1) * 5;

  const [stance, setStance] = useState<StormStance>('hunker');
  const stanceRef = useRef<StormStance>('hunker');

  // Computed survivability factors
  const massKg = stats.massKg;
  // Mass anchors you: bigger creatures lose grip slower.
  const massGrip = Math.min(2.5, Math.log10(Math.max(0.1, massKg)) + 1.5);
  // Insulation against debris hits — defense + thick fur + stoneskin
  const armor = creature.defenseTier
    + (creature.hybrids.includes('thick-fur') ? 0.6 : 0)
    + (creature.hybrids.includes('stoneskin') ? 1.4 : 0);
  // Wings make storms WORSE for grip (you catch wind), unless big body
  const wingPenalty = (creature.bodyPlan === 'bird' || creature.hybrids.includes('wings')) && massKg < 5 ? 1.5 : 1;
  // legTier improves grip
  const gripBonus = 1 + creature.legTier * 0.25;

  const [stability, setStability] = useState(100);
  const [elapsed, setElapsed] = useState(0);
  const [debris, setDebris] = useState<Debris[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [windPhase, setWindPhase] = useState(0);
  const [hit, setHit] = useState<{ x: number; y: number; t: number } | null>(null);

  const stabilityRef = useRef(100);
  const elapsedRef = useRef(0);
  const debrisRef = useRef<Debris[]>([]);
  const timerRef = useRef<number | null>(null);

  function reset() {
    stabilityRef.current = 100;
    elapsedRef.current = 0;
    debrisRef.current = [];
    stanceRef.current = 'hunker';
    setStability(100);
    setElapsed(0);
    setDebris([]);
    setStance('hunker');
    setHit(null);
  }

  function pickStance(s: StormStance) {
    if (s === 'shelter' && !canShelter()) return;
    stanceRef.current = s;
    setStance(s);
  }

  function canShelter(): boolean {
    // Wings or small bodies can hide; everyone else has to anchor down
    return massKg < 50 || creature.hybrids.includes('camouflage');
  }

  function start() {
    reset();
    setDone(false);
    setRunning(true);
  }

  function stop(o: StormOutcome) {
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
      setElapsed(elapsedRef.current);
      setWindPhase((p) => p + dt * 8);

      // Stance modifiers
      let stanceGripMult = 1;
      let stanceProfileMult = 1;
      let stanceDebrisMult = 1;
      switch (stanceRef.current) {
        case 'hunker':
          // Low profile, less wind catches you, but no special grip
          stanceProfileMult = 0.55;
          break;
        case 'anchor':
          // Dig in — better grip but full wind profile
          stanceGripMult = 2.0;
          break;
        case 'shelter':
          // Best stance — small/agile creatures find cover
          stanceProfileMult = 0.25;
          stanceDebrisMult = 0.3;
          break;
      }

      // Net wind force loss per second
      const grip = massGrip * gripBonus * stanceGripMult;
      const profile = wingPenalty * stanceProfileMult;
      const netDrain = Math.max(0, env.baseWindForce * profile * 3 - grip * 1.2);
      stabilityRef.current -= netDrain * dt;

      // Random debris strike
      if (Math.random() < env.debrisChance * dt * 10 * stanceDebrisMult) {
        const types: Array<'branch' | 'rock' | 'leaf'> = ['branch', 'rock', 'leaf', 'leaf', 'leaf'];
        const newDebris: Debris = {
          id: debrisIdSeed++,
          x: W + 20,
          y: 30 + Math.random() * (GROUND_Y - 30),
          vx: -(180 + Math.random() * 120) * env.baseWindForce,
          vy: (Math.random() - 0.5) * 40,
          size: 6 + Math.random() * 14,
          type: types[Math.floor(Math.random() * types.length)],
          rot: 0,
        };
        debrisRef.current = [...debrisRef.current, newDebris];

        // Did it hit the creature? Aim at center for hard hits.
        const aimed = Math.random() < 0.3;
        if (aimed && newDebris.type !== 'leaf') {
          // Check if hits creature center area
          const damage = Math.max(0, 12 - armor * 4);
          if (damage > 0) {
            stabilityRef.current -= damage;
            setHit({ x: W / 2, y: GROUND_Y - 40, t: elapsedRef.current });
            window.setTimeout(() => setHit(null), 250);
            if (stabilityRef.current <= 0) {
              setStability(0);
              stop({ won: false, reason: 'struck-by-debris', secondsHeld: Math.round(elapsedRef.current), severity: env.id });
              return;
            }
          }
        }
      }

      // Tick debris positions
      const surviving: Debris[] = [];
      for (const d of debrisRef.current) {
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.rot += dt * 360;
        if (d.x > -40 && d.y < GROUND_Y + 10) surviving.push(d);
      }
      debrisRef.current = surviving;
      setDebris([...surviving]);

      setStability(stabilityRef.current);

      // Check loss
      if (stabilityRef.current <= 0) {
        stop({ won: false, reason: 'blown-away', secondsHeld: Math.round(elapsedRef.current), severity: env.id });
        return;
      }

      // Check win
      if (elapsedRef.current >= DURATION) {
        stop({ won: true, reason: 'survived', secondsHeld: DURATION, severity: env.id });
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
  }, [stats.massKg, severityId]);

  // Creature shake — rotation/translation based on stance + wind
  const shakeIntensity = stanceRef.current === 'shelter' ? 0.3 : stanceRef.current === 'anchor' ? 0.6 : 1.0;
  const windShake = Math.sin(windPhase) * 4 * shakeIntensity * env.baseWindForce;
  const creatureX = W / 2 + windShake * 0.5;
  const creatureLean = windShake * 0.6;

  return (
    <div className="arena">
      <h2>The Storm — {env.emoji} {env.label} <small className="arena-env">· {env.difficultyLabel} · ×{env.rewardMult.toFixed(1)} reward</small></h2>
      <p className="arena-help">
        {env.description} Hold your ground for <strong>{DURATION} seconds</strong>. Wind drains your stability —
        heavy bodies + good legs grip the ground; armor + thick-fur reduce damage from flying debris.
      </p>

      <div className="prey-tabs">
        {SEVERITIES.map((s) => (
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
              <small> {s.durationSec}s · ×{s.rewardMult.toFixed(1)}</small>
            </span>
          </button>
        ))}
      </div>

      {/* Stance picker */}
      <div className="drought-activity-label">
        <strong>How are you holding on?</strong> <small>(switch any time during the storm)</small>
      </div>
      <div className="prey-tabs">
        {([
          { id: 'hunker' as const,  emoji: '🐢', label: 'Hunker down', sub: 'low profile',
            title: 'Press low to the ground. Less wind catches you. Default safe stance.' },
          { id: 'anchor' as const,  emoji: '⚓', label: 'Anchor in', sub: 'grip ×2 · full wind',
            title: 'Dig in with all your legs. Better grip but you still catch full wind.' },
          { id: 'shelter' as const, emoji: '🪨', label: 'Take shelter', sub: canShelter() ? 'tiny/agile only' : 'needs <50kg or camo',
            title: canShelter()
              ? 'Find cover behind rocks/trees. Cuts wind to 25% and debris to 30%. Only available for small or camouflaged creatures.'
              : 'Too big to slip into cover. Add camouflage or shrink below 50kg.' },
        ]).map((s) => (
          <button
            key={s.id}
            type="button"
            className={`prey-tab${stance === s.id ? ' active' : ''}`}
            onClick={() => pickStance(s.id)}
            disabled={s.id === 'shelter' && !canShelter()}
            title={s.title}
          >
            <span className="prey-emoji">{s.emoji}</span>
            <span className="prey-name">
              {s.label}
              <small> {s.sub}</small>
            </span>
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="storm-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={env.sky[0]} />
            <stop offset="1" stopColor={env.sky[1]} />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width={W} height={GROUND_Y} fill="url(#storm-sky)" />
        <rect x="0" y={GROUND_Y} width={W} height={H - GROUND_Y} fill="#5a4828" />

        {/* TORNADO FUNNEL (only on tornado severity) */}
        {env.id === 'tornado' && (
          <g opacity="0.75">
            <path d={`M ${W * 0.2} 0 L ${W * 0.4} ${GROUND_Y} L ${W * 0.6} ${GROUND_Y} L ${W * 0.8} 0 Z`}
              fill="#3a4a5a" />
            <path d={`M ${W * 0.3} 0 L ${W * 0.45} ${GROUND_Y} L ${W * 0.55} ${GROUND_Y} L ${W * 0.7} 0 Z`}
              fill="#2a3a4a" />
            {/* spinning swirl lines */}
            <g stroke="#7a8a9a" strokeWidth="1.2" fill="none" opacity="0.5">
              {Array.from({ length: 6 }).map((_, i) => {
                const y = i * (GROUND_Y / 6);
                const offset = Math.sin(windPhase + i) * 8;
                const w = (W * 0.4) * (1 - i / 8);
                return (
                  <path key={i} d={`M ${W / 2 - w / 2 + offset} ${y} q ${w / 2} 10 ${w} 0`} />
                );
              })}
            </g>
          </g>
        )}

        {/* WIND STREAKS */}
        <g stroke="#cfe9f5" strokeWidth="1.4" fill="none" opacity="0.5" strokeLinecap="round">
          {Array.from({ length: 18 }).map((_, i) => {
            const y = 10 + (i * 13) % (GROUND_Y - 20);
            const x = ((i * 47 + windPhase * 40) % (W + 80)) - 40;
            const len = 22 + (i % 4) * 8;
            return <line key={i} x1={x} y1={y} x2={x + len} y2={y - 2} />;
          })}
        </g>

        {/* DEBRIS */}
        <g>
          {debris.map((d) => (
            <g key={d.id} transform={`translate(${d.x} ${d.y}) rotate(${d.rot})`}>
              {d.type === 'branch' && (
                <rect x={-d.size / 2} y="-2" width={d.size} height="4" fill="#5a3a18" rx="1" />
              )}
              {d.type === 'rock' && (
                <ellipse cx="0" cy="0" rx={d.size / 2} ry={d.size / 2.5} fill="#5a5648" />
              )}
              {d.type === 'leaf' && (
                <ellipse cx="0" cy="0" rx={d.size / 2} ry={d.size / 4} fill="#5a7838" opacity="0.8" />
              )}
            </g>
          ))}
        </g>

        {/* Hit flash */}
        {hit && (
          <g>
            <circle cx={hit.x} cy={hit.y} r="20" fill="white" opacity="0.6" />
            <text x={hit.x} y={hit.y + 5} textAnchor="middle" fontSize="20" fontWeight="700" fill="#ff4040">💥</text>
          </g>
        )}

        {/* TREES / ROCKS (shelter visual) */}
        {stance === 'shelter' && (
          <g>
            {/* sheltering rock */}
            <ellipse cx={creatureX - 50} cy={GROUND_Y - 30} rx="55" ry="40" fill="#7a6a48" />
            <ellipse cx={creatureX - 50} cy={GROUND_Y - 30} rx="45" ry="32" fill="#8a7a58" />
          </g>
        )}

        {/* HUD */}
        <rect x="6" y="6" width="260" height="22" fill="rgba(255,255,255,0.9)" rx="4" stroke="#bbb" />
        <text x="14" y="22" fontSize="11" fill="#333">Stability</text>
        <rect x="74" y="13" width="186" height="10" fill="#eee" stroke="#999" />
        <rect
          x="74"
          y="13"
          width={Math.max(0, 186 * (stability / 100))}
          height="10"
          fill={stability > 50 ? '#5cc46a' : stability > 20 ? '#e0a040' : '#c44'}
        />
        <rect x={W - 154} y="6" width="148" height="22" fill="rgba(255,255,255,0.9)" rx="4" stroke="#bbb" />
        <text x={W - 8} y="22" textAnchor="end" fontSize="11" fill="#333">
          {Math.round(elapsed)}s / {DURATION}s
        </text>

        {/* CREATURE — shake with the wind, lean if stance is hunker/anchor */}
        <g transform={`translate(${creatureX - W / 2} 0) rotate(${creatureLean} ${W / 2} ${GROUND_Y - 30})`}>
          {hasBespokeShape(creature) ? (
            <BespokeInScene
              creature={creature}
              x={W / 2 - 50}
              y={GROUND_Y - 70 + (stance === 'hunker' ? 10 : 0)}
              width={100}
              height={80}
              animate="breathe"
            />
          ) : (
            <CreatureBody
              creature={creature}
              cx={W / 2}
              footY={GROUND_Y + (stance === 'hunker' ? 5 : 0)}
              scale={0.32}
              animate="breathe"
            />
          )}
        </g>

        {/* Foot-grip indicator (anchor stance shows roots/claws gripping ground) */}
        {stance === 'anchor' && (
          <g stroke="#3a2818" strokeWidth="2" fill="none" opacity="0.7" strokeLinecap="round">
            <path d={`M ${W / 2 - 30} ${GROUND_Y + 2} q -4 6 -8 8`} />
            <path d={`M ${W / 2 - 10} ${GROUND_Y + 2} q -2 8 -4 12`} />
            <path d={`M ${W / 2 + 10} ${GROUND_Y + 2} q 2 8 4 12`} />
            <path d={`M ${W / 2 + 30} ${GROUND_Y + 2} q 4 6 8 8`} />
          </g>
        )}
      </svg>
      <div className="arena-controls">
        {!running && !done && (
          <button className="btn" onClick={start} type="button">
            Brace yourself
          </button>
        )}
        {running && (
          <button
            className="btn btn-secondary"
            onClick={() => stop({ won: false, reason: 'blown-away', secondsHeld: Math.round(elapsedRef.current), severity: env.id })}
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
            mass: {massKg.toFixed(1)} kg · grip ×{(massGrip * gripBonus).toFixed(2)} · armor +{armor.toFixed(1)}
            {wingPenalty > 1 && ' · ⚠ wings catch wind (light + winged)'}
          </small>
        )}
      </div>
    </div>
  );
}
