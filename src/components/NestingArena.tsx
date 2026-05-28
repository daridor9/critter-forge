import { useEffect, useRef, useState } from 'react';
import type { CreatureStats } from '../physics';
import type { Creature } from '../types';
import { CreatureBody } from './CreatureSVG';
import { BespokeInScene, hasBespokeShape } from './dexShapes';

export type NestStance = 'block' | 'attack' | 'bluff';

export type NestOutcome = {
  won: boolean;
  reason: 'defended' | 'eggs-stolen';
  eggsLost: number;
  wavesSurvived: number;
};

interface Props {
  creature: Creature;
  stats: CreatureStats;
  generation?: number;
  onFinish: (o: NestOutcome) => void;
}

const W = 600;
const H = 240;
const GROUND_Y = 198;
const NEST_X = 110;
const NEST_Y = GROUND_Y - 8;

// 5 waves of egg-thieves. Each gets harder.
interface Predator {
  emoji: string;
  name: string;
  speed: number;       // px/sec approaching the nest
  threat: number;      // base difficulty of repelling them
}
const WAVES: Predator[] = [
  { emoji: '🐍', name: 'Snake', speed: 45, threat: 1.0 },
  { emoji: '🦊', name: 'Fox', speed: 80, threat: 1.5 },
  { emoji: '🦅', name: 'Hawk', speed: 110, threat: 2.0 },
  { emoji: '🐀', name: 'Rat pack', speed: 65, threat: 2.5 },
  { emoji: '🐺', name: 'Wolf', speed: 95, threat: 3.5 },
];
const WAVE_GAP_S = 7;     // seconds between waves
const TICK_MS = 50;
const MAX_EGG_LOSS = 3;

interface ThreatState {
  index: number;             // which WAVES entry
  x: number;                 // current x position
  resolved: boolean;         // true once the encounter happened
  outcome?: 'defended' | 'stolen';
  flashUntil?: number;        // engagement flash timer
}

export function NestingArena({ creature, stats, generation = 1, onFinish }: Props) {
  const totalWaves = WAVES.length + Math.floor((generation - 1) / 2);  // generation bumps add tougher repeats
  const [stance, setStance] = useState<NestStance>('block');
  const stanceRef = useRef<NestStance>('block');

  // Defense rating based on stance + creature build
  const massKg = stats.massKg;
  const blockBase = creature.defenseTier + (massKg > 50 ? 1.5 : massKg > 10 ? 0.7 : 0)
    + (creature.hybrids.includes('stoneskin') ? 1.5 : 0)
    + (creature.hybrids.includes('thick-fur') ? 0.4 : 0);
  const attackBase = creature.legTier * 0.7 + Math.min(3, stats.topSpeedKmh / 25)
    + (creature.hybrids.includes('venom') ? 1.5 : 0)
    + (creature.hybrids.includes('electric') ? 1.5 : 0)
    + (creature.hybrids.includes('firebreath') ? 2 : 0);
  const bluffBase = (massKg > 100 ? 2 : massKg > 30 ? 1.2 : 0.3)
    + creature.brainTier * 0.4
    + (creature.hybrids.includes('camouflage') ? 0.8 : 0)
    + (creature.hybrids.includes('mimicry') ? 1.8 : 0);

  const [eggs, setEggs] = useState(5);
  const [waveIdx, setWaveIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [threat, setThreat] = useState<ThreatState | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const eggsRef = useRef(5);
  const waveIdxRef = useRef(0);
  const elapsedRef = useRef(0);
  const threatRef = useRef<ThreatState | null>(null);
  const timerRef = useRef<number | null>(null);

  function reset() {
    eggsRef.current = 5;
    waveIdxRef.current = 0;
    elapsedRef.current = 0;
    threatRef.current = null;
    setEggs(5);
    setWaveIdx(0);
    setElapsed(0);
    setThreat(null);
    setLog([]);
  }

  function start() {
    reset();
    setDone(false);
    setRunning(true);
  }

  function stop(o: NestOutcome) {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRunning(false);
    setDone(true);
    onFinish(o);
  }

  function pickStance(s: NestStance) {
    stanceRef.current = s;
    setStance(s);
  }

  function pushLog(msg: string) {
    setLog((prev) => [...prev.slice(-4), msg]);
  }

  function resolveEncounter(t: ThreatState): 'defended' | 'stolen' {
    const pred = WAVES[t.index % WAVES.length];
    const tierBonus = Math.floor(t.index / WAVES.length) * 0.5;
    const threatPower = pred.threat + tierBonus;
    const stancePower =
      stanceRef.current === 'block' ? blockBase :
      stanceRef.current === 'attack' ? attackBase :
      bluffBase;
    // Add a luck swing
    const luck = (Math.random() - 0.5) * 1.5;
    const margin = stancePower + luck - threatPower;
    return margin > 0 ? 'defended' : 'stolen';
  }

  useEffect(() => {
    if (!running) return;
    const dt = TICK_MS / 1000;

    timerRef.current = window.setInterval(() => {
      elapsedRef.current += dt;
      setElapsed(elapsedRef.current);

      // Spawn a wave if it's time and no current threat
      if (!threatRef.current && waveIdxRef.current < totalWaves) {
        const dueAt = waveIdxRef.current * WAVE_GAP_S + 2;
        if (elapsedRef.current >= dueAt) {
          const newThreat: ThreatState = {
            index: waveIdxRef.current,
            x: W + 20,
            resolved: false,
          };
          threatRef.current = newThreat;
          setThreat({ ...newThreat });
          const pred = WAVES[waveIdxRef.current % WAVES.length];
          pushLog(`Wave ${waveIdxRef.current + 1}: ${pred.emoji} ${pred.name} approaches`);
          waveIdxRef.current += 1;
          setWaveIdx(waveIdxRef.current);
        }
      }

      // Update active threat
      if (threatRef.current) {
        const t = threatRef.current;
        const pred = WAVES[t.index % WAVES.length];
        if (!t.resolved) {
          t.x -= pred.speed * dt;
          // Engagement happens at x ≈ 170 (player creature position)
          if (t.x <= 200) {
            const outcome = resolveEncounter(t);
            t.resolved = true;
            t.outcome = outcome;
            t.flashUntil = elapsedRef.current + 0.6;
            if (outcome === 'stolen') {
              eggsRef.current -= 1;
              setEggs(eggsRef.current);
              pushLog(`💔 ${pred.emoji} stole an egg! (${eggsRef.current} left)`);
            } else {
              pushLog(`✅ ${pred.emoji} repelled by ${stanceRef.current}!`);
            }
          }
          setThreat({ ...t });
        } else {
          // After encounter — predator either flees right or runs off with the egg
          const flee = t.outcome === 'defended' ? +1 : -1;   // defended = back to right, stolen = off-screen left
          const fleeSpeed = pred.speed * 1.4;
          t.x += fleeSpeed * dt * flee;
          if (t.x < -40 || t.x > W + 40) {
            threatRef.current = null;
            setThreat(null);
          } else {
            setThreat({ ...t });
          }
        }
      }

      // End conditions
      if (eggsRef.current <= 5 - MAX_EGG_LOSS) {
        stop({ won: false, reason: 'eggs-stolen', eggsLost: 5 - eggsRef.current, wavesSurvived: waveIdxRef.current });
        return;
      }
      if (!threatRef.current && waveIdxRef.current >= totalWaves) {
        stop({ won: true, reason: 'defended', eggsLost: 5 - eggsRef.current, wavesSurvived: totalWaves });
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

  const predator = threat ? WAVES[threat.index % WAVES.length] : null;
  const engagementFlash = threat?.flashUntil !== undefined && elapsed < threat.flashUntil;

  return (
    <div className="arena">
      <h2>The Nest — 🥚 Defend the clutch <small className="arena-env">· {totalWaves} waves</small></h2>
      <p className="arena-help">
        Predators approach from the right. Stand between them and the nest. Defense + speed + size all matter,
        plus your active stance. Lose <strong>3 eggs</strong> and your lineage ends. Survive all waves to win.
      </p>

      {/* Stance picker */}
      <div className="drought-activity-label">
        <strong>How do you defend?</strong> <small>(switch any time)</small>
      </div>
      <div className="prey-tabs">
        {([
          { id: 'block' as const, emoji: '🛡️', label: 'Block', sub: 'tank · defense + size',
            title: 'Stand firm between predator and nest. Best with armor + heavy body.' },
          { id: 'attack' as const, emoji: '⚔️', label: 'Attack', sub: 'charge · speed + venom',
            title: 'Charge the predator. Best with high speed or venom/electric/fire.' },
          { id: 'bluff' as const, emoji: '😤', label: 'Bluff', sub: 'display · size + brain',
            title: 'Threaten with display (puffed-up appearance). Best with big body + brain or mimicry.' },
        ]).map((s) => (
          <button
            key={s.id}
            type="button"
            className={`prey-tab${stance === s.id ? ' active' : ''}`}
            onClick={() => pickStance(s.id)}
            title={s.title}
          >
            <span className="prey-emoji">{s.emoji}</span>
            <span className="prey-name">{s.label}<small> {s.sub}</small></span>
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="nest-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c8d0d8" />
            <stop offset="1" stopColor="#e0e8d8" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width={W} height={GROUND_Y} fill="url(#nest-sky)" />
        <rect x="0" y={GROUND_Y} width={W} height={H - GROUND_Y} fill="#5a7838" />
        {/* grass texture */}
        <g stroke="#3a5828" strokeWidth="0.8" fill="none" opacity="0.6">
          {Array.from({ length: 30 }).map((_, i) => {
            const x = 5 + i * 20;
            return <path key={i} d={`M ${x} ${GROUND_Y + 4} q -2 -3 0 -7`} />;
          })}
        </g>

        {/* sky decoration — distant trees */}
        <g opacity="0.5">
          {[20, 380, 470].map((tx, i) => (
            <g key={i} transform={`translate(${tx} ${GROUND_Y - 4})`}>
              <rect x="-2" y="-26" width="4" height="26" fill="#3a2418" />
              <ellipse cx="0" cy="-30" rx="14" ry="10" fill="#5a7838" />
            </g>
          ))}
        </g>

        {/* NEST — twigs + eggs */}
        <g transform={`translate(${NEST_X} ${NEST_Y})`}>
          {/* nest base — twig pile */}
          <ellipse cx="0" cy="6" rx="44" ry="8" fill="#5a3a18" />
          <ellipse cx="0" cy="2" rx="40" ry="10" fill="#7a5828" />
          {/* twigs around the rim */}
          <g stroke="#5a3a18" strokeWidth="1.2" strokeLinecap="round">
            {Array.from({ length: 10 }).map((_, i) => {
              const a = (i / 10) * Math.PI * 2;
              const x1 = Math.cos(a) * 38;
              const y1 = Math.sin(a) * 9;
              const x2 = Math.cos(a) * 46;
              const y2 = Math.sin(a) * 9 - 2;
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
            })}
          </g>
          {/* the eggs */}
          {Array.from({ length: 5 }).map((_, i) => {
            const lost = i >= eggs;
            const x = -22 + i * 11;
            return (
              <ellipse
                key={i}
                cx={x}
                cy="-2"
                rx="6"
                ry="8"
                fill={lost ? 'rgba(180,150,120,0.3)' : '#fff5d8'}
                stroke={lost ? 'rgba(120,90,60,0.4)' : '#a88858'}
                strokeWidth="0.8"
                strokeDasharray={lost ? '2 3' : ''}
              />
            );
          })}
          {/* nest label */}
          <text x="0" y={-20} textAnchor="middle" fontSize="10" fontWeight="700" fill="#3a2010">
            NEST · {eggs}/5
          </text>
        </g>

        {/* PREDATOR */}
        {threat && predator && (
          <g transform={`translate(${threat.x} ${GROUND_Y - 8})`}>
            <text x="0" y="0" textAnchor="middle" fontSize="36">{predator.emoji}</text>
            {!threat.resolved && (
              <text x="0" y="-32" textAnchor="middle" fontSize="9" fill="#a83030" fontWeight="700">
                {predator.name}
              </text>
            )}
            {threat.resolved && threat.outcome === 'defended' && (
              <text x="0" y="-32" textAnchor="middle" fontSize="14">💨</text>
            )}
            {threat.resolved && threat.outcome === 'stolen' && (
              <text x="-18" y="-8" fontSize="14">🥚</text>
            )}
          </g>
        )}

        {/* Engagement flash */}
        {engagementFlash && (
          <text x={W * 0.45} y={GROUND_Y - 50} textAnchor="middle" fontSize="38">
            {stance === 'attack' ? '⚔️' : stance === 'bluff' ? '😤' : '🛡️'}
          </text>
        )}

        {/* PLAYER CREATURE — guarding the nest */}
        {hasBespokeShape(creature) ? (
          <BespokeInScene
            creature={creature}
            x={W * 0.32 - 50}
            y={GROUND_Y - 70}
            width={100}
            height={80}
            animate={stance === 'attack' ? 'run' : 'breathe'}
          />
        ) : (
          <CreatureBody
            creature={creature}
            cx={W * 0.32}
            footY={GROUND_Y}
            scale={0.32}
            animate={stance === 'attack' ? 'run' : 'breathe'}
          />
        )}

        {/* HUD */}
        <rect x="6" y="6" width="220" height="22" fill="rgba(255,255,255,0.9)" rx="4" stroke="#bbb" />
        <text x="14" y="22" fontSize="11" fill="#333">
          Wave {Math.min(totalWaves, waveIdx + (threat ? 0 : 0))} / {totalWaves} · 🥚 {eggs}/5
        </text>
        <rect x={W - 154} y="6" width="148" height="22" fill="rgba(255,255,255,0.9)" rx="4" stroke="#bbb" />
        <text x={W - 8} y="22" textAnchor="end" fontSize="11" fill="#333">
          {Math.round(elapsed)}s
        </text>

        {/* mini-log */}
        <g transform={`translate(${W - 240} ${GROUND_Y - 80})`}>
          {log.slice(-3).map((line, i) => (
            <text key={i} x="0" y={i * 14} fontSize="11" fill="#3a2010">{line}</text>
          ))}
        </g>
      </svg>

      <div className="arena-controls">
        {!running && !done && (
          <button className="btn" onClick={start} type="button">Defend the nest</button>
        )}
        {running && (
          <button
            className="btn btn-secondary"
            onClick={() => stop({ won: false, reason: 'eggs-stolen', eggsLost: 5 - eggsRef.current, wavesSurvived: waveIdxRef.current })}
            type="button"
          >
            Flee
          </button>
        )}
        {done && (
          <button className="btn" onClick={start} type="button">Try again</button>
        )}
        {!running && !done && (
          <small className="arena-meta">
            block: {blockBase.toFixed(1)} · attack: {attackBase.toFixed(1)} · bluff: {bluffBase.toFixed(1)}
          </small>
        )}
      </div>
    </div>
  );
}
