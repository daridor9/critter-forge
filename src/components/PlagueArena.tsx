import { useEffect, useRef, useState } from 'react';
import type { CreatureStats } from '../physics';
import type { Creature } from '../types';
import { CreatureBody } from './CreatureSVG';
import { BespokeInScene, hasBespokeShape } from './dexShapes';

export type PlagueAction = 'rest' | 'eat' | 'quarantine';

export type PlagueOutcome = {
  won: boolean;
  reason: 'recovered' | 'succumbed';
  daysSurvived: number;
  goalDays: number;
};

interface Props {
  creature: Creature;
  stats: CreatureStats;
  generation?: number;
  onFinish: (o: PlagueOutcome) => void;
}

const W = 600;
const H = 240;
const TICK_MS = 60;
const DAYS_PER_SEC = 3;

export function PlagueArena({ creature, stats, generation = 1, onFinish }: Props) {
  const goalDays = 60 + (generation - 1) * 10;

  const [action, setAction] = useState<PlagueAction>('rest');
  const actionRef = useRef<PlagueAction>('rest');

  // Immune system strength
  const massKg = stats.massKg;
  const immuneBase = (creature.warmBlooded ? 1.2 : 0.5)              // cold-bloods can't fever
    + Math.min(2.5, Math.log10(Math.max(0.1, massKg)) + 1)             // bigger = more reserve
    + creature.defenseTier * 0.4                                        // skin barrier
    + (creature.hybrids.includes('regeneration') ? 1.5 : 0)
    + (creature.hybrids.includes('thick-fur') ? 0.4 : 0)
    + (creature.hybrids.includes('stoneskin') ? 0.5 : 0);

  const [day, setDay] = useState(0);
  const [infection, setInfection] = useState(15);
  const [hydration, setHydration] = useState(80);
  const [feverFlash, setFeverFlash] = useState(false);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const dayRef = useRef(0);
  const infectionRef = useRef(15);
  const hydrationRef = useRef(80);
  const timerRef = useRef<number | null>(null);
  const lastLoggedDay = useRef(0);

  function reset() {
    dayRef.current = 0;
    infectionRef.current = 15;
    hydrationRef.current = 80;
    actionRef.current = 'rest';
    setDay(0);
    setInfection(15);
    setHydration(80);
    setAction('rest');
    setLog([]);
    lastLoggedDay.current = 0;
  }

  function start() {
    reset();
    setDone(false);
    setRunning(true);
  }

  function stop(o: PlagueOutcome) {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRunning(false);
    setDone(true);
    onFinish(o);
  }

  function pickAction(a: PlagueAction) {
    actionRef.current = a;
    setAction(a);
  }

  function pushLog(msg: string) {
    setLog((prev) => [...prev.slice(-3), msg]);
  }

  useEffect(() => {
    if (!running) return;
    const dt = TICK_MS / 1000;

    timerRef.current = window.setInterval(() => {
      const dayPace = DAYS_PER_SEC * dt;
      dayRef.current += dayPace;

      // Action modifiers
      let infectionGain = 0;
      let hydrationGain = 0;
      let immuneFight = immuneBase * 0.6;
      switch (actionRef.current) {
        case 'rest':
          infectionGain = 0.5;
          hydrationGain = -0.5;
          immuneFight *= 1.2;
          break;
        case 'eat':
          infectionGain = 0.8;
          hydrationGain = 0.4;
          immuneFight *= 1.6;
          break;
        case 'quarantine':
          infectionGain = -0.3;             // no new exposure, immune kicks in
          hydrationGain = -1.0;             // tougher to find water alone
          immuneFight *= 1.4;
          break;
      }

      // Net infection change: gain from disease minus immune fight
      const netInfection = (infectionGain - immuneFight * 0.4) * dayPace * 8;
      infectionRef.current = Math.max(0, Math.min(100, infectionRef.current + netInfection));

      // Hydration
      hydrationRef.current = Math.max(0, Math.min(100, hydrationRef.current + hydrationGain * dayPace * 6));

      // Random fever spike (15% chance per day on average for warm-bloods)
      const integerDayChange = Math.floor(dayRef.current) > Math.floor(dayRef.current - dayPace);
      if (integerDayChange && Math.random() < 0.15) {
        if (creature.warmBlooded) {
          infectionRef.current = Math.max(0, infectionRef.current - 5);
          setFeverFlash(true);
          window.setTimeout(() => setFeverFlash(false), 350);
          if (Math.floor(dayRef.current) > lastLoggedDay.current) {
            pushLog(`🔥 Day ${Math.floor(dayRef.current)}: fever spike fights infection (-5%)`);
            lastLoggedDay.current = Math.floor(dayRef.current);
          }
        }
      }

      // Random water-source event
      if (integerDayChange && Math.random() < 0.08) {
        hydrationRef.current = Math.min(100, hydrationRef.current + 12);
        if (Math.floor(dayRef.current) > lastLoggedDay.current) {
          pushLog(`💧 Day ${Math.floor(dayRef.current)}: found water (+12)`);
          lastLoggedDay.current = Math.floor(dayRef.current);
        }
      }

      setDay(dayRef.current);
      setInfection(infectionRef.current);
      setHydration(hydrationRef.current);

      // Lose conditions
      if (infectionRef.current >= 100) {
        stop({ won: false, reason: 'succumbed', daysSurvived: Math.round(dayRef.current), goalDays });
        return;
      }
      if (hydrationRef.current <= 0) {
        stop({ won: false, reason: 'succumbed', daysSurvived: Math.round(dayRef.current), goalDays });
        return;
      }
      // Win
      if (dayRef.current >= goalDays) {
        stop({ won: true, reason: 'recovered', daysSurvived: goalDays, goalDays });
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

  // Visual symptom intensity
  const sweat = infection > 30;
  const tremor = infection > 60;
  const dying = infection > 85;
  const cx = W / 2;
  const groundY = 200;

  return (
    <div className="arena">
      <h2>The Plague — 🦟 Survive the outbreak <small className="arena-env">· {goalDays} days</small></h2>
      <p className="arena-help">
        A virus is spreading. Hold out for <strong>{goalDays} days</strong> while your immune system fights it off.
        Warm blood + big body + armor = strong immunity. Cold-bloods can't mount a fever.
      </p>

      <div className="drought-activity-label">
        <strong>What do you do each day?</strong> <small>(switch any time)</small>
      </div>
      <div className="prey-tabs">
        {([
          { id: 'rest' as const, emoji: '😴', label: 'Rest', sub: 'conserve energy',
            title: 'Sleep through the worst of it. Lower exposure, moderate immune fight.' },
          { id: 'eat' as const, emoji: '🍖', label: 'Forage + eat', sub: 'strong immunity',
            title: 'Protein fuels the immune system. Highest immune fight but you stay exposed.' },
          { id: 'quarantine' as const, emoji: '🪨', label: 'Quarantine', sub: 'isolate alone',
            title: 'Find a cave/burrow. No new exposure but harder to find water.' },
        ]).map((a) => (
          <button
            key={a.id}
            type="button"
            className={`prey-tab${action === a.id ? ' active' : ''}`}
            onClick={() => pickAction(a.id)}
            title={a.title}
          >
            <span className="prey-emoji">{a.emoji}</span>
            <span className="prey-name">{a.label}<small> {a.sub}</small></span>
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="plague-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7a8068" />
            <stop offset="1" stopColor="#a8a890" />
          </linearGradient>
          <radialGradient id="plague-vignette" cx="0.5" cy="0.5" r="0.7">
            <stop offset="0.5" stopColor="black" stopOpacity="0" />
            <stop offset="1" stopColor="black" stopOpacity={0.1 + (infection / 200)} />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width={W} height={groundY} fill="url(#plague-sky)" />
        <rect x="0" y={groundY} width={W} height={H - groundY} fill="#6a5848" />

        {/* Sickly fog */}
        <g fill="#a8a890" opacity={0.3 + infection / 300}>
          <ellipse cx={W * 0.3} cy={50} rx="80" ry="14" />
          <ellipse cx={W * 0.7} cy={70} rx="90" ry="16" />
        </g>

        {/* Quarantine cave */}
        {action === 'quarantine' && (
          <g>
            <ellipse cx={cx - 80} cy={groundY - 30} rx="60" ry="42" fill="#3a2a18" />
            <ellipse cx={cx - 80} cy={groundY - 36} rx="50" ry="34" fill="#000814" />
          </g>
        )}

        {/* Virus particles floating around — denser at higher infection */}
        <g>
          {Array.from({ length: Math.max(4, Math.floor(infection / 8)) }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2 + Date.now() / 1500;
            const r = 50 + Math.sin(Date.now() / 500 + i) * 12;
            const x = cx + Math.cos(a) * r;
            const y = groundY - 50 + Math.sin(a) * 30;
            return (
              <g key={i} transform={`translate(${x} ${y})`} opacity="0.7">
                {/* spike-ball virus */}
                <circle r="4" fill="#a83040" />
                <g stroke="#a83040" strokeWidth="1.2" fill="none">
                  {[0, 60, 120, 180, 240, 300].map((deg) => {
                    const rad = (deg * Math.PI) / 180;
                    return (
                      <line key={deg}
                        x1={Math.cos(rad) * 4} y1={Math.sin(rad) * 4}
                        x2={Math.cos(rad) * 7} y2={Math.sin(rad) * 7} />
                    );
                  })}
                </g>
              </g>
            );
          })}
        </g>

        {/* Fever flash */}
        {feverFlash && (
          <rect x="0" y="0" width={W} height={H} fill="#ff7040" opacity="0.25" />
        )}

        {/* Sweat drops on the creature when sick */}
        {sweat && (
          <g fill="#aef0ff" opacity="0.85">
            <ellipse cx={cx - 30} cy={groundY - 80} rx="2" ry="4" />
            <ellipse cx={cx + 35} cy={groundY - 70} rx="2.5" ry="5" />
          </g>
        )}

        {/* PLAYER CREATURE — wobbles when tremor is on */}
        <g
          style={{
            transition: 'transform 0.2s ease-out',
            transform: tremor ? `translate(${(Math.random() - 0.5) * 4}px, 0)` : 'translate(0,0)',
            opacity: dying ? 0.55 : 1,
          }}
        >
          {hasBespokeShape(creature) ? (
            <BespokeInScene
              creature={creature}
              x={cx - 50}
              y={groundY - 70}
              width={100}
              height={80}
              animate="breathe"
            />
          ) : (
            <CreatureBody creature={creature} cx={cx} footY={groundY} scale={0.32} animate="breathe" />
          )}
        </g>

        {/* HUD — infection + hydration + day */}
        <rect x="6" y="6" width="240" height="42" fill="rgba(255,255,255,0.9)" rx="4" stroke="#bbb" />
        <text x="14" y="18" fontSize="10" fill="#333">🦠 infection</text>
        <rect x="76" y="11" width="166" height="8" fill="#eee" stroke="#999" />
        <rect x="76" y="11" width={Math.max(0, 166 * (infection / 100))} height="8"
          fill={infection < 30 ? '#5cc46a' : infection < 70 ? '#e0a040' : '#c44'} />
        <text x="14" y="36" fontSize="10" fill="#333">💧 hydration</text>
        <rect x="76" y="29" width="166" height="8" fill="#eee" stroke="#999" />
        <rect x="76" y="29" width={Math.max(0, 166 * (hydration / 100))} height="8"
          fill={hydration > 30 ? '#5cc46a' : '#c44'} />

        <rect x={W - 154} y="6" width="148" height="22" fill="rgba(255,255,255,0.9)" rx="4" stroke="#bbb" />
        <text x={W - 8} y="22" textAnchor="end" fontSize="11" fill="#333">
          Day {Math.floor(day)} / {goalDays}
        </text>

        {/* mini-log */}
        <g transform={`translate(${W - 240} ${groundY - 80})`}>
          {log.slice(-3).map((line, i) => (
            <text key={i} x="0" y={i * 14} fontSize="11" fill="#3a2010">{line}</text>
          ))}
        </g>

        <rect x="0" y="0" width={W} height={H} fill="url(#plague-vignette)" pointerEvents="none" />
      </svg>

      <div className="arena-controls">
        {!running && !done && (
          <button className="btn" onClick={start} type="button">Brace for outbreak</button>
        )}
        {running && (
          <button
            className="btn btn-secondary"
            onClick={() => stop({ won: false, reason: 'succumbed', daysSurvived: Math.round(dayRef.current), goalDays })}
            type="button"
          >
            Give up
          </button>
        )}
        {done && (
          <button className="btn" onClick={start} type="button">Try again</button>
        )}
        {!running && !done && (
          <small className="arena-meta">
            immunity: {immuneBase.toFixed(1)} ({creature.warmBlooded ? 'warm' : 'cold'} blood
            {creature.warmBlooded ? ' = can fever' : ' = no fever'})
          </small>
        )}
      </div>
    </div>
  );
}
