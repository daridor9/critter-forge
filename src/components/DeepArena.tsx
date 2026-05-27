import { useEffect, useRef, useState } from 'react';
import type { CreatureStats } from '../physics';
import type { Creature } from '../types';
import { CreatureBody } from './CreatureSVG';
import { BespokeInScene, hasBespokeShape } from './dexShapes';
import { comboEffects } from '../data/hybridCombos';

export type DeepOutcome = {
  won: boolean;
  reason: 'foraged' | 'drowned' | 'crushed';
  maxDepth: number;
};

export type DepthZoneId = 'reef' | 'twilight' | 'abyss';

interface Props {
  creature: Creature;
  stats: CreatureStats;
  onFinish: (o: DeepOutcome) => void;
}

interface DepthZone {
  id: DepthZoneId;
  label: string;
  emoji: string;
  description: string;
  targetDepth: number;        // how deep you need to go
  pressureSafe: number;       // threshold past which fragile creatures get crushed
  rewardMult: number;
  difficultyLabel: string;
  waterColor: [string, string, string];  // gradient stops
  // visual flavor
  reef?: boolean;
  bioluminescent?: boolean;
  abyssal?: boolean;
}

const DEPTH_ZONES: DepthZone[] = [
  {
    id: 'reef',
    label: 'Coral reef',
    emoji: '🪸',
    description: 'Shallow tropical water — colorful coral, bright sunlight.',
    targetDepth: 80,
    pressureSafe: 200,
    rewardMult: 1.0,
    difficultyLabel: 'easy',
    waterColor: ['#7cd0e4', '#3a85b8', '#1f4a78'],
    reef: true,
  },
  {
    id: 'twilight',
    label: 'Twilight zone',
    emoji: '🌙',
    description: 'Mid-ocean dimness. Bioluminescent flashes. Pressure crushes without protection.',
    targetDepth: 400,
    pressureSafe: 120,
    rewardMult: 1.6,
    difficultyLabel: 'medium',
    waterColor: ['#3a85b8', '#1f4a78', '#0a2548'],
    bioluminescent: true,
  },
  {
    id: 'abyss',
    label: 'Abyssal',
    emoji: '⚫',
    description: 'Deep darkness, crushing pressure. Only the most extreme adaptations survive.',
    targetDepth: 1200,
    pressureSafe: 60,
    rewardMult: 2.6,
    difficultyLabel: 'extreme',
    waterColor: ['#1a3a60', '#0a1f3a', '#000814'],
    abyssal: true,
  },
];

const DESCENT_MPS = 28;
const TICK_MS = 50;

const W = 600;
const H = 240;
const SURFACE_Y = 22;
const SEABED_Y = H - 16;

function isAquatic(c: Creature): boolean {
  return c.bodyPlan === 'fish' || c.hybrids.includes('gills');
}

function isDiveAdapted(c: Creature): boolean {
  return c.adaptations?.some((a) => a.includes('diver') || a.includes('gills') || a.includes('deep-diving')) ?? false;
}

export function DeepArena({ creature, stats, onFinish }: Props) {
  const [zoneId, setZoneId] = useState<DepthZoneId>('reef');
  const zone = DEPTH_ZONES.find((z) => z.id === zoneId) ?? DEPTH_ZONES[0];
  const TARGET_DEPTH = zone.targetDepth;
  const PRESSURE_SAFE_DEPTH = zone.pressureSafe;

  const aq = isAquatic(creature);
  const diveAdapted = isDiveAdapted(creature);
  const brainBonus = 1 + creature.brainTier * 0.1;
  // Harder zones extend the dive — give a bit more breath base + bigger
  // dive-adapted bonus so it stays survivable in the abyss with the right
  // build.
  const zoneBreathBonus = zone.id === 'abyss' ? 1.6 : zone.id === 'twilight' ? 1.25 : 1.0;
  const comboBreath = comboEffects(creature).deepBreathBonus ?? 1;
  const o2Capacity = aq ? 999 : (4 + Math.sqrt(stats.massKg) * 1.8) * brainBonus * (diveAdapted ? 2.8 : 1) * zoneBreathBonus * comboBreath;
  const pressureProof = aq || diveAdapted || creature.defenseTier === 2;

  const [depth, setDepth] = useState(0);
  const [o2, setO2] = useState(o2Capacity);
  const [phase, setPhase] = useState<'descend' | 'ascend' | 'done'>('descend');
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const depthRef = useRef(0);
  const o2Ref = useRef(o2Capacity);
  const phaseRef = useRef<'descend' | 'ascend' | 'done'>('descend');
  const timerRef = useRef<number | null>(null);

  function reset() {
    depthRef.current = 0;
    o2Ref.current = o2Capacity;
    phaseRef.current = 'descend';
    setDepth(0);
    setO2(o2Capacity);
    setPhase('descend');
  }

  function start() {
    reset();
    setDone(false);
    setRunning(true);
  }

  function stop(o: DeepOutcome) {
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
      if (phaseRef.current === 'descend') {
        depthRef.current += DESCENT_MPS * dt;
        if (depthRef.current >= TARGET_DEPTH) {
          depthRef.current = TARGET_DEPTH;
          phaseRef.current = 'ascend';
          setPhase('ascend');
        }
      } else if (phaseRef.current === 'ascend') {
        depthRef.current -= DESCENT_MPS * dt;
        if (depthRef.current <= 0) {
          depthRef.current = 0;
          stop({ won: true, reason: 'foraged', maxDepth: TARGET_DEPTH });
          return;
        }
      }
      if (!aq) o2Ref.current -= dt;
      setDepth(depthRef.current);
      setO2(o2Ref.current);

      if (!pressureProof && depthRef.current > PRESSURE_SAFE_DEPTH) {
        stop({ won: false, reason: 'crushed', maxDepth: Math.round(depthRef.current) });
        return;
      }
      if (o2Ref.current <= 0) {
        stop({ won: false, reason: 'drowned', maxDepth: Math.round(depthRef.current) });
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
  }, [stats.massKg, aq, pressureProof, zoneId]);

  const creatureY = SURFACE_Y + (depth / TARGET_DEPTH) * (SEABED_Y - SURFACE_Y - 20);
  const pressureLineY = SURFACE_Y + (PRESSURE_SAFE_DEPTH / TARGET_DEPTH) * (SEABED_Y - SURFACE_Y - 20);

  return (
    <div className="arena">
      <h2>The Deep — {zone.emoji} {zone.label} <small className="arena-env">· {zone.difficultyLabel} · ×{zone.rewardMult.toFixed(1)} reward</small></h2>
      <p className="arena-help">
        {zone.description} Dive to <strong>{TARGET_DEPTH}m</strong> and return. Past {PRESSURE_SAFE_DEPTH}m the pressure crushes you without armor or a fish body.
      </p>

      <div className="prey-tabs">
        {DEPTH_ZONES.map((z) => (
          <button
            key={z.id}
            type="button"
            className={`prey-tab${zoneId === z.id ? ' active' : ''}`}
            onClick={() => !running && setZoneId(z.id)}
            disabled={running}
            title={`${z.label} · target ${z.targetDepth}m · ${z.difficultyLabel}`}
          >
            <span className="prey-emoji">{z.emoji}</span>
            <span className="prey-name">
              {z.label}
              <small> {z.targetDepth}m · ×{z.rewardMult.toFixed(1)}</small>
            </span>
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="deep-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={zone.waterColor[0]} />
            <stop offset="0.5" stopColor={zone.waterColor[1]} />
            <stop offset="1" stopColor={zone.waterColor[2]} />
          </linearGradient>
          <linearGradient id="deep-godray" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#cfe9f4" stopOpacity={zone.id === 'abyss' ? '0.08' : zone.id === 'twilight' ? '0.25' : '0.5'} />
            <stop offset="1" stopColor="#cfe9f4" stopOpacity="0" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width={W} height={SURFACE_Y - 4} fill="#cfe8f1" />
        <rect x="0" y={SURFACE_Y - 4} width={W} height={H - SURFACE_Y + 4} fill="url(#deep-water)" />

        {/* ─── ZONE-SPECIFIC LAYOUT — basin walls, open water, or trench ──── */}

        {zone.id === 'reef' && (
          <g>
            {/* Coral REEF BASIN — left and right walls form a basin
                that narrows toward the bottom. */}
            <polygon
              points={`0,${SURFACE_Y} 0,${H} 110,${H} 60,${SURFACE_Y + 60} 50,${SURFACE_Y + 30} 30,${SURFACE_Y + 10}`}
              fill="#3a6850" opacity="0.85"
            />
            <polygon
              points={`${W},${SURFACE_Y} ${W},${H} ${W - 110},${H} ${W - 60},${SURFACE_Y + 60} ${W - 50},${SURFACE_Y + 30} ${W - 30},${SURFACE_Y + 10}`}
              fill="#3a6850" opacity="0.85"
            />
            {/* coral spires along the walls */}
            <g>
              {[30, 70, 90].map((y, i) => (
                <ellipse key={`lcoral-${i}`} cx={20 + i * 12} cy={SURFACE_Y + y} rx="6" ry="14" fill="#e6708a" opacity="0.85" />
              ))}
              {[30, 70, 90].map((y, i) => (
                <ellipse key={`rcoral-${i}`} cx={W - 20 - i * 12} cy={SURFACE_Y + y} rx="6" ry="14" fill="#9a60d0" opacity="0.85" />
              ))}
            </g>
            {/* sun-dappled light bands on the walls */}
            <g stroke="#ffe9a0" strokeWidth="1" opacity="0.55">
              <line x1="40" y1={SURFACE_Y + 40} x2="100" y2={SURFACE_Y + 70} />
              <line x1={W - 40} y1={SURFACE_Y + 40} x2={W - 100} y2={SURFACE_Y + 70} />
            </g>
          </g>
        )}

        {zone.id === 'twilight' && (
          <g>
            {/* OPEN WATER — drifting layered shadows that hint at vast
                space, no walls. A faint mid-depth thermocline band. */}
            <rect
              x="0" y={SURFACE_Y + 80} width={W} height="2"
              fill="#aef0ff" opacity="0.25"
            />
            <text x={W - 10} y={SURFACE_Y + 76} fontSize="9" textAnchor="end" fill="#aef0ff" opacity="0.7">thermocline</text>
            {/* large drifting silhouettes in the open */}
            <g opacity="0.35">
              <ellipse cx={W * 0.7} cy={SURFACE_Y + 110} rx="36" ry="8" fill="#0a1c34" />
              <polygon points={`${W * 0.7 + 36},${SURFACE_Y + 110} ${W * 0.7 + 52},${SURFACE_Y + 102} ${W * 0.7 + 52},${SURFACE_Y + 118}`} fill="#0a1c34" />
            </g>
            {/* a long ribbon-like siphonophore drifting */}
            <g stroke="#9aeaff" strokeWidth="1.2" fill="none" opacity="0.6" strokeLinecap="round">
              <path d={`M ${W * 0.2},${SURFACE_Y + 30} q -4 30 0 60 q 4 30 0 60`} />
              <circle cx={W * 0.2} cy={SURFACE_Y + 30} r="2" fill="#aef0ff" />
            </g>
          </g>
        )}

        {zone.id === 'abyss' && (
          <g>
            {/* ABYSSAL CANYON — vertical walls on either side that
                narrow as they descend into a deep trench. */}
            <polygon
              points={`0,${SURFACE_Y} 0,${H} ${W * 0.42},${H} ${W * 0.18},${H - 30} ${W * 0.12},${H - 80} ${W * 0.08},${H - 130} ${W * 0.04},${H - 180}`}
              fill="#000814" opacity="0.85"
            />
            <polygon
              points={`${W},${SURFACE_Y} ${W},${H} ${W * 0.58},${H} ${W * 0.82},${H - 30} ${W * 0.88},${H - 80} ${W * 0.92},${H - 130} ${W * 0.96},${H - 180}`}
              fill="#000814" opacity="0.85"
            />
            {/* canyon-wall cracks / ledges */}
            <g stroke="#0a1c34" strokeWidth="1" fill="none" opacity="0.85">
              <path d={`M 0,${H - 100} L 30,${H - 110} L 60,${H - 80}`} />
              <path d={`M 0,${H - 60} L 50,${H - 50}`} />
              <path d={`M ${W},${H - 100} L ${W - 30},${H - 110} L ${W - 60},${H - 80}`} />
              <path d={`M ${W},${H - 60} L ${W - 50},${H - 50}`} />
            </g>
            {/* deep-trench glow at the very bottom */}
            <ellipse cx={W / 2} cy={H - 6} rx={W * 0.3} ry="6" fill="#ff5020" opacity="0.5" />
            <ellipse cx={W / 2} cy={H - 4} rx={W * 0.15} ry="3" fill="#ffd040" opacity="0.7" />
            {/* "TRENCH" label */}
            <text x={W / 2} y={H - 26} textAnchor="middle" fontSize="10" fill="#ffa860" opacity="0.85" fontWeight="700">TRENCH</text>
          </g>
        )}

        {Array.from({ length: 7 }).map((_, i) => (
          <line key={i} x1={i * 90} y1={SURFACE_Y - 6} x2={i * 90 + 30} y2={SURFACE_Y - 2} stroke="white" strokeWidth="1.5" opacity="0.6" />
        ))}

        <line x1="0" y1={pressureLineY} x2={W} y2={pressureLineY} stroke="#ff8080" strokeWidth="1" strokeDasharray="6 4" opacity="0.85" />
        <text x={W - 6} y={pressureLineY - 4} fontSize="10" textAnchor="end" fill="#ffb0b0">
          pressure zone — {PRESSURE_SAFE_DEPTH}m
        </text>

        {/* ZONE-SPECIFIC VISUAL FLAVOR */}
        {zone.reef && (
          <>
            {/* god rays from the surface */}
            <g className="ray">
              <polygon points="80,0 50,260 130,260" fill="url(#deep-godray)" />
              <polygon points="240,0 200,260 290,260" fill="url(#deep-godray)" />
              <polygon points="440,0 400,260 490,260" fill="url(#deep-godray)" />
            </g>
            {/* colorful fish swimming */}
            <g transform="translate(0 100)" opacity="0.7">
              <g className="swim" style={{ animationDuration: '18s' }}>
                <ellipse cx="0" cy="0" rx="6" ry="3" fill="#ffb050" />
                <polygon points="-6,0 -10,-3 -10,3" fill="#ffb050" />
              </g>
            </g>
            <g transform="translate(0 130)" opacity="0.6">
              <g className="swim" style={{ animationDuration: '22s', animationDelay: '-8s' }}>
                <ellipse cx="0" cy="0" rx="5" ry="2.5" fill="#9a60d0" />
                <polygon points="-5,0 -8,-2 -8,2" fill="#9a60d0" />
              </g>
            </g>
          </>
        )}
        {zone.bioluminescent && (
          <g fill="#aef0ff">
            {/* bio-luminescent dots scattered through twilight */}
            {Array.from({ length: 28 }).map((_, i) => (
              <circle
                key={i}
                cx={(i * 47 + 20) % W}
                cy={SURFACE_Y + 40 + ((i * 31) % (SEABED_Y - SURFACE_Y - 60))}
                r={1.4 + (i % 3) * 0.4}
                opacity={0.6}
                className="snowflake"
                style={{ animationDuration: `${10 + (i % 5)}s`, animationDelay: `-${i * 0.7}s` }}
              />
            ))}
          </g>
        )}
        {zone.abyssal && (
          <>
            {/* anglerfish silhouettes with glowing lures */}
            <g transform="translate(120 180)" opacity="0.55">
              <ellipse cx="0" cy="0" rx="14" ry="6" fill="#000814" />
              <polygon points="-14,0 -22,-4 -22,4" fill="#000814" />
              {/* lure */}
              <line x1="6" y1="-4" x2="14" y2="-12" stroke="#000814" strokeWidth="1" />
              <circle cx="14" cy="-12" r="2" fill="#9aff90" opacity="0.9" />
            </g>
            <g transform="translate(440 200)" opacity="0.5">
              <ellipse cx="0" cy="0" rx="12" ry="5" fill="#000814" />
              <polygon points="-12,0 -18,-3 -18,3" fill="#000814" />
              <line x1="5" y1="-3" x2="11" y2="-10" stroke="#000814" strokeWidth="1" />
              <circle cx="11" cy="-10" r="1.8" fill="#ffcc40" opacity="0.85" />
            </g>
            {/* scattered hot-spring particles */}
            <g fill="#ff8848">
              {Array.from({ length: 12 }).map((_, i) => (
                <circle key={i} cx={(i * 53 + 30) % W} cy={SEABED_Y - 4 - ((i * 17) % 30)} r={1.5} opacity="0.5" className="bubble"
                  style={{ animationDuration: `${5 + (i % 3)}s`, animationDelay: `-${i * 0.5}s` }} />
              ))}
            </g>
          </>
        )}

        <rect x="0" y={SEABED_Y} width={W} height={H - SEABED_Y} fill="#3a2a18" />

        {/* zone-flavored seabed */}
        {zone.reef ? (
          <g>
            <g fill="#6a8c54">
              <ellipse cx="80" cy={SEABED_Y - 4} rx="20" ry="8" />
              <ellipse cx="200" cy={SEABED_Y - 6} rx="26" ry="10" />
              <ellipse cx="380" cy={SEABED_Y - 4} rx="22" ry="9" />
              <ellipse cx="520" cy={SEABED_Y - 5} rx="18" ry="7" />
            </g>
            {/* CORAL — pink branches, orange brain, purple fan */}
            <g fill="#e6708a">
              <ellipse cx="40" cy={SEABED_Y - 12} rx="6" ry="4" />
              <ellipse cx="46" cy={SEABED_Y - 18} rx="4" ry="3" />
            </g>
            <g fill="#e69050">
              <ellipse cx="140" cy={SEABED_Y - 10} rx="10" ry="5" />
            </g>
            <g fill="#9a60d0" opacity="0.85">
              <ellipse cx="540" cy={SEABED_Y - 16} rx="6" ry="11" />
            </g>
            <g fill="#ffd040">
              {[100, 260, 320, 460].map((x, i) => (
                <circle key={i} cx={x} cy={SEABED_Y - 8} r={2.2} />
              ))}
            </g>
          </g>
        ) : zone.bioluminescent ? (
          <g>
            <g fill="#3a4858">
              <ellipse cx="80" cy={SEABED_Y - 4} rx="20" ry="8" />
              <ellipse cx="380" cy={SEABED_Y - 4} rx="22" ry="9" />
            </g>
            <g fill="#aef0ff" opacity="0.7">
              <circle cx="90" cy={SEABED_Y - 12} r="2" />
              <circle cx="220" cy={SEABED_Y - 6} r="2" />
              <circle cx="380" cy={SEABED_Y - 14} r="2" />
            </g>
          </g>
        ) : (
          <g>
            <g fill="#1a2436">
              <ellipse cx="80" cy={SEABED_Y - 4} rx="22" ry="9" />
              <ellipse cx="380" cy={SEABED_Y - 4} rx="22" ry="9" />
            </g>
            {/* hydrothermal vent silhouette */}
            <g fill="#0a0814">
              <polygon points={`250,${SEABED_Y} 246,${SEABED_Y - 14} 254,${SEABED_Y - 14} 252,${SEABED_Y}`} />
              <ellipse cx="250" cy={SEABED_Y - 14} rx="6" ry="2" />
            </g>
          </g>
        )}

        {Array.from({ length: 8 }).map((_, i) => (
          <circle key={i} cx={W / 2 - 60 + (i * 11) % 30} cy={creatureY - i * 8 - 4} r={1.5 + (i % 3) * 0.4} fill="white" opacity="0.5" />
        ))}

        <rect x="6" y="6" width="260" height="22" fill="rgba(255,255,255,0.9)" rx="4" stroke="#bbb" />
        <text x="14" y="22" fontSize="11" fill="#333">
          {aq ? 'gills — O₂ from water' : 'breath'}
        </text>
        <rect x="92" y="13" width="170" height="10" fill="#eee" stroke="#999" />
        <rect
          x="92"
          y="13"
          width={aq ? 170 : Math.max(0, 170 * (o2 / o2Capacity))}
          height="10"
          fill={aq ? '#5cc46a' : o2 > 0 ? '#5cc46a' : '#c44'}
        />
        <rect x={W - 120} y="6" width="114" height="22" fill="rgba(255,255,255,0.9)" rx="4" stroke="#bbb" />
        <text x={W - 112} y="22" fontSize="11" fill="#333">
          depth {Math.round(depth)} m
        </text>

        {hasBespokeShape(creature) ? (
          <BespokeInScene creature={creature} x={W / 2 - 50} y={creatureY - 50} width={100} height={80} animate="breathe" />
        ) : (
          <g transform={`translate(${W / 2} ${creatureY})`}>
            <CreatureBody creature={creature} cx={0} footY={20} scale={0.32} animate="breathe" />
          </g>
        )}
      </svg>
      <div className="arena-controls">
        {!running && !done && (
          <button className="btn" onClick={start} type="button">
            Start the dive
          </button>
        )}
        {running && (
          <button
            className="btn btn-secondary"
            onClick={() => stop({ won: false, reason: 'drowned', maxDepth: Math.round(depthRef.current) })}
            type="button"
          >
            Give up
          </button>
        )}
        {done && (
          <button className="btn" onClick={start} type="button">
            Dive again
          </button>
        )}
        {!running && !done && (
          <small className="arena-meta">{aq ? 'gills/fish — unlimited breath' : diveAdapted ? `dive adaptation — breath: ${o2Capacity.toFixed(1)}s` : `breath: ${o2Capacity.toFixed(1)}s`} · {pressureProof ? 'pressure-safe' : 'fragile at depth'} · phase: {phase}</small>
        )}
      </div>
    </div>
  );
}
