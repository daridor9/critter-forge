import { useEffect, useRef, useState } from 'react';
import type { CreatureStats } from '../physics';
import type { Creature } from '../types';
import { CreatureBody } from './CreatureSVG';
import { BespokeInScene, hasBespokeShape } from './dexShapes';

export type DeepOutcome = {
  won: boolean;
  reason: 'foraged' | 'drowned' | 'crushed';
  maxDepth: number;
};

interface Props {
  creature: Creature;
  stats: CreatureStats;
  onFinish: (o: DeepOutcome) => void;
}

const TARGET_DEPTH = 200;
const DESCENT_MPS = 28;
const PRESSURE_SAFE_DEPTH = 100;
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
  const aq = isAquatic(creature);
  const diveAdapted = isDiveAdapted(creature);
  const brainBonus = 1 + creature.brainTier * 0.1;
  const o2Capacity = aq ? 999 : (4 + Math.sqrt(stats.massKg) * 1.8) * brainBonus * (diveAdapted ? 2.8 : 1);
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
  }, [stats.massKg, aq, pressureProof]);

  const creatureY = SURFACE_Y + (depth / TARGET_DEPTH) * (SEABED_Y - SURFACE_Y - 20);
  const pressureLineY = SURFACE_Y + (PRESSURE_SAFE_DEPTH / TARGET_DEPTH) * (SEABED_Y - SURFACE_Y - 20);

  return (
    <div className="arena">
      <h2>The Deep — ocean dive</h2>
      <p className="arena-help">
        Dive to {TARGET_DEPTH}m and return. Past {PRESSURE_SAFE_DEPTH}m the pressure crushes you without armor or a fish body. Lung capacity scales with body mass.
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="deep-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#74c4dc" />
            <stop offset="0.5" stopColor="#2a5a85" />
            <stop offset="1" stopColor="#0c2a45" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width={W} height={SURFACE_Y - 4} fill="#cfe8f1" />
        <rect x="0" y={SURFACE_Y - 4} width={W} height={H - SURFACE_Y + 4} fill="url(#deep-water)" />

        {Array.from({ length: 7 }).map((_, i) => (
          <line key={i} x1={i * 90} y1={SURFACE_Y - 6} x2={i * 90 + 30} y2={SURFACE_Y - 2} stroke="white" strokeWidth="1.5" opacity="0.6" />
        ))}

        <line x1="0" y1={pressureLineY} x2={W} y2={pressureLineY} stroke="#ff8080" strokeWidth="1" strokeDasharray="6 4" opacity="0.85" />
        <text x={W - 6} y={pressureLineY - 4} fontSize="10" textAnchor="end" fill="#ffb0b0">
          pressure zone — {PRESSURE_SAFE_DEPTH}m
        </text>

        <rect x="0" y={SEABED_Y} width={W} height={H - SEABED_Y} fill="#3a2a18" />
        <g fill="#6a8c54">
          <ellipse cx="80" cy={SEABED_Y - 4} rx="20" ry="8" />
          <ellipse cx="200" cy={SEABED_Y - 6} rx="26" ry="10" />
          <ellipse cx="380" cy={SEABED_Y - 4} rx="22" ry="9" />
          <ellipse cx="520" cy={SEABED_Y - 5} rx="18" ry="7" />
        </g>

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
