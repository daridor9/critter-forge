import { useEffect, useRef, useState } from 'react';
import type { CreatureStats } from '../physics';
import type { Creature } from '../types';
import { CreatureBody } from './CreatureSVG';
import { BespokeInScene, hasBespokeShape } from './dexShapes';

export type MigratePace = 'steady' | 'push' | 'detour';

export type MigrateOutcome = {
  won: boolean;
  reason: 'arrived' | 'lost' | 'starved';
  kmTravelled: number;
  goalKm: number;
};

interface Props {
  creature: Creature;
  stats: CreatureStats;
  generation?: number;
  onFinish: (o: MigrateOutcome) => void;
}

const W = 600;
const H = 240;
const GROUND_Y = 198;
const GOAL_KM = 800;
const TICK_MS = 50;

interface Hazard {
  id: number;
  type: 'river' | 'cliff' | 'predator' | 'forest' | 'food';
  emoji: string;
  label: string;
  km: number;        // position along the journey
}

let hazardIdSeed = 0;

function makeHazards(goalKm: number): Hazard[] {
  const out: Hazard[] = [];
  const types: Hazard['type'][] = ['river', 'cliff', 'predator', 'forest', 'food'];
  const emoji: Record<Hazard['type'], string> = {
    river: '🌊', cliff: '⛰️', predator: '🦊', forest: '🌲', food: '🍇',
  };
  const label: Record<Hazard['type'], string> = {
    river: 'River crossing', cliff: 'Cliff path', predator: 'Predator territory',
    forest: 'Dense forest', food: 'Food cache',
  };
  // ~10 hazards over the journey
  let km = 50;
  while (km < goalKm) {
    const t = types[Math.floor(Math.random() * types.length)];
    out.push({ id: hazardIdSeed++, type: t, emoji: emoji[t], label: label[t], km });
    km += 60 + Math.random() * 50;
  }
  return out;
}

export function MigrationArena({ creature, stats, generation = 1, onFinish }: Props) {
  const goalKm = GOAL_KM + (generation - 1) * 100;

  const [pace, setPace] = useState<MigratePace>('steady');
  const paceRef = useRef<MigratePace>('steady');

  // Computed stats — travel rate depends on top speed + endurance
  const baseKmPerSec = (stats.topSpeedKmh / 8) * 0.7 + Math.min(2, stats.enduranceKm / 20);
  // Stamina cap = endurance × mass factor
  const staminaCap = 60 + Math.min(120, stats.enduranceKm * 1.5) + (creature.warmBlooded ? 0 : 30);
  // Brain helps avoid wrong-route losses
  const brainSavvy = 0.3 + creature.brainTier * 0.18 + creature.sensorTier * 0.1;

  const [kmTravelled, setKmTravelled] = useState(0);
  const [stamina, setStamina] = useState(staminaCap);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [log, setLog] = useState<string[]>([]);

  const kmRef = useRef(0);
  const stamRef = useRef(staminaCap);
  const hazardsRef = useRef<Hazard[]>([]);
  const activeHazardRef = useRef<Hazard | null>(null);
  const timerRef = useRef<number | null>(null);

  function reset() {
    kmRef.current = 0;
    stamRef.current = staminaCap;
    hazardsRef.current = makeHazards(goalKm);
    activeHazardRef.current = null;
    paceRef.current = 'steady';
    setKmTravelled(0);
    setStamina(staminaCap);
    setHazards(hazardsRef.current);
    setLog([]);
    setPace('steady');
  }

  function start() {
    reset();
    setDone(false);
    setRunning(true);
  }

  function stop(o: MigrateOutcome) {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRunning(false);
    setDone(true);
    onFinish(o);
  }

  function pickPace(p: MigratePace) {
    paceRef.current = p;
    setPace(p);
  }

  function pushLog(msg: string) {
    setLog((prev) => [...prev.slice(-3), msg]);
  }

  function resolveHazard(h: Hazard): boolean {
    // Each hazard tests a different stat. Returns true = passed.
    const luck = (Math.random() - 0.5) * 0.5;
    switch (h.type) {
      case 'river':
        return (creature.bodyPlan === 'fish' || creature.hybrids.includes('gills') || stats.enduranceKm > 15) || luck > 0.2;
      case 'cliff':
        return (creature.bodyPlan === 'bird' || creature.hybrids.includes('wings') || creature.legTier >= 2 || stats.massKg < 50) || luck > 0.2;
      case 'predator':
        return (stats.topSpeedKmh > 50 || creature.hybrids.includes('camouflage') || creature.defenseTier >= 2) || luck > 0.2;
      case 'forest':
        return (creature.brainTier >= 1 || creature.sensorTier >= 1) || luck > 0;
      case 'food':
        return true; // food is always good
    }
  }

  useEffect(() => {
    if (!running) return;
    const dt = TICK_MS / 1000;

    timerRef.current = window.setInterval(() => {
      // Pace modifiers
      let speedMult = 1, drainMult = 1, foodHelp = 1;
      switch (paceRef.current) {
        case 'steady': speedMult = 1.0; drainMult = 1.0; break;
        case 'push':   speedMult = 1.7; drainMult = 2.0; break;
        case 'detour': speedMult = 0.6; drainMult = 0.5; foodHelp = 1.4; break;
      }

      // Active hazard: pause progress while resolving
      if (activeHazardRef.current) return;

      // Travel
      kmRef.current += baseKmPerSec * speedMult * dt;
      stamRef.current -= drainMult * dt * 0.5;
      setKmTravelled(kmRef.current);
      setStamina(stamRef.current);

      // Did we hit a hazard?
      const next = hazardsRef.current.find((h) => h.km <= kmRef.current);
      if (next) {
        const passed = resolveHazard(next);
        const isFood = next.type === 'food';
        if (isFood) {
          stamRef.current = Math.min(staminaCap, stamRef.current + 25 * foodHelp);
          setStamina(stamRef.current);
          pushLog(`${next.emoji} Found food — +${Math.round(25 * foodHelp)} stamina`);
        } else if (passed) {
          pushLog(`${next.emoji} ${next.label} cleared`);
        } else {
          // Failure penalty depends on brain savvy
          const lost = Math.random() > brainSavvy + 0.4;
          stamRef.current -= 30;
          setStamina(stamRef.current);
          if (lost) {
            stop({ won: false, reason: 'lost', kmTravelled: Math.round(kmRef.current), goalKm });
            return;
          }
          pushLog(`${next.emoji} ${next.label}: stumbled (-30 stamina)`);
        }
        // Remove from list
        hazardsRef.current = hazardsRef.current.filter((h) => h.id !== next.id);
        setHazards([...hazardsRef.current]);
      }

      // End conditions
      if (stamRef.current <= 0) {
        stop({ won: false, reason: 'starved', kmTravelled: Math.round(kmRef.current), goalKm });
        return;
      }
      if (kmRef.current >= goalKm) {
        stop({ won: true, reason: 'arrived', kmTravelled: goalKm, goalKm });
        return;
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
  }, [stats.massKg]);

  // Visual: creature moves L→R proportional to progress; landscape scrolls.
  const progress = Math.min(1, kmTravelled / goalKm);
  const creatureX = 40 + progress * (W - 80);

  return (
    <div className="arena">
      <h2>The Migration — 🏛 Cross the continent <small className="arena-env">· {goalKm} km</small></h2>
      <p className="arena-help">
        Travel <strong>{goalKm} km</strong> dodging rivers, cliffs, predators, and forests. Endurance fuels you;
        brain helps you not get lost. Food caches refill stamina.
      </p>

      <div className="drought-activity-label">
        <strong>How are you moving?</strong> <small>(switch any time)</small>
      </div>
      <div className="prey-tabs">
        {([
          { id: 'steady' as const, emoji: '🚶', label: 'Steady', sub: 'balanced', title: 'Normal pace, normal drain.' },
          { id: 'push' as const, emoji: '🏃', label: 'Push hard', sub: 'fast · drains 2×', title: 'Travel 1.7× faster but burn through stamina.' },
          { id: 'detour' as const, emoji: '🧭', label: 'Detour to food', sub: 'slow · forages', title: 'Slow down (0.6×) but conserve stamina + food caches give 40% more.' },
        ]).map((p) => (
          <button
            key={p.id}
            type="button"
            className={`prey-tab${pace === p.id ? ' active' : ''}`}
            onClick={() => pickPace(p.id)}
            title={p.title}
          >
            <span className="prey-emoji">{p.emoji}</span>
            <span className="prey-name">{p.label}<small> {p.sub}</small></span>
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="mig-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#a8d0e0" />
            <stop offset="1" stopColor="#e8d8a8" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width={W} height={GROUND_Y} fill="url(#mig-sky)" />
        <rect x="0" y={GROUND_Y} width={W} height={H - GROUND_Y} fill="#c8a868" />

        {/* sun */}
        <circle cx={W - 80} cy={50} r="20" fill="#ffd34a" opacity="0.9" />

        {/* distance markers along the road */}
        <g stroke="#8a6838" strokeWidth="1" strokeDasharray="6 8" opacity="0.6">
          <line x1="40" y1={GROUND_Y + 6} x2={W - 30} y2={GROUND_Y + 6} />
        </g>
        <text x="40" y={GROUND_Y + 22} fontSize="9" fill="#5a3818" fontWeight="700">START</text>
        <text x={W - 30} y={GROUND_Y + 22} fontSize="9" fill="#5a3818" textAnchor="end" fontWeight="700">
          {goalKm} km
        </text>

        {/* upcoming hazards on the timeline */}
        <g>
          {hazards.map((h) => {
            const hx = 40 + (h.km / goalKm) * (W - 80);
            return (
              <g key={h.id}>
                <line x1={hx} y1={GROUND_Y - 4} x2={hx} y2={GROUND_Y + 12} stroke="#8a6838" strokeWidth="1" />
                <text x={hx} y={GROUND_Y - 8} textAnchor="middle" fontSize="14">{h.emoji}</text>
              </g>
            );
          })}
        </g>

        {/* background hills */}
        <g opacity="0.4">
          <path d={`M 0 ${GROUND_Y - 20} Q ${W * 0.25} ${GROUND_Y - 50} ${W * 0.5} ${GROUND_Y - 30} T ${W} ${GROUND_Y - 25} L ${W} ${GROUND_Y} L 0 ${GROUND_Y} Z`}
            fill="#8aa898" />
        </g>

        {/* PLAYER CREATURE — riding the road. Light winged creatures
            visibly glide above the ground line, with a flap arc. */}
        {(() => {
          const canFly = stats.massKg <= 5 && (creature.bodyPlan === 'bird' || creature.hybrids.includes('wings'));
          const yOffset = canFly ? -40 : 0;
          return (
            <>
              {canFly && (
                <g opacity="0.8" className="bob-breathe" style={{ transformOrigin: `${creatureX}px ${GROUND_Y - 70 + yOffset}px` }}>
                  <text x={creatureX - 30} y={GROUND_Y - 76 + yOffset} fontSize="20">🪽</text>
                  <text x={creatureX + 10} y={GROUND_Y - 76 + yOffset} fontSize="20" transform={`scale(-1 1) translate(${-2 * (creatureX + 10)} 0)`}>🪽</text>
                </g>
              )}
              {hasBespokeShape(creature) ? (
                <BespokeInScene
                  creature={creature}
                  x={creatureX - 50}
                  y={GROUND_Y - 70 + yOffset}
                  width={100}
                  height={80}
                  animate={pace === 'push' ? 'run' : 'breathe'}
                />
              ) : (
                <CreatureBody
                  creature={creature}
                  cx={creatureX}
                  footY={GROUND_Y + yOffset}
                  scale={0.32}
                  animate={pace === 'push' ? 'run' : 'breathe'}
                />
              )}
            </>
          );
        })()}

        {/* HUD */}
        <rect x="6" y="6" width="240" height="22" fill="rgba(255,255,255,0.9)" rx="4" stroke="#bbb" />
        <text x="14" y="22" fontSize="11" fill="#333">stamina</text>
        <rect x="76" y="13" width="166" height="10" fill="#eee" stroke="#999" />
        <rect x="76" y="13" width={Math.max(0, 166 * (stamina / staminaCap))} height="10"
          fill={stamina > staminaCap * 0.4 ? '#5cc46a' : stamina > staminaCap * 0.15 ? '#e0a040' : '#c44'} />
        <rect x={W - 160} y="6" width="154" height="22" fill="rgba(255,255,255,0.9)" rx="4" stroke="#bbb" />
        <text x={W - 8} y="22" textAnchor="end" fontSize="11" fill="#333">
          {Math.round(kmTravelled)} / {goalKm} km
        </text>

        {/* mini-log */}
        <g transform={`translate(10 ${GROUND_Y - 80})`}>
          {log.slice(-3).map((line, i) => (
            <text key={i} x="0" y={i * 14} fontSize="11" fill="#3a2010">{line}</text>
          ))}
        </g>
      </svg>

      <div className="arena-controls">
        {!running && !done && (
          <button className="btn" onClick={start} type="button">Begin migration</button>
        )}
        {running && (
          <button
            className="btn btn-secondary"
            onClick={() => stop({ won: false, reason: 'lost', kmTravelled: Math.round(kmRef.current), goalKm })}
            type="button"
          >
            Give up
          </button>
        )}
        {done && (
          <button className="btn" onClick={start} type="button">Try again</button>
        )}
      </div>
    </div>
  );
}
