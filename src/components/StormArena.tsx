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
  // COLD-BLOODED creatures react slowly in cold winds — reflexes are
  // metabolism-dependent. They lose stance grip 30% faster in storms
  // (15% if antifreeze hybrid). Doesn't apply in tornado (warm) winds.
  const isColdBlooded = !creature.warmBlooded;
  const hasAntifreeze = creature.hybrids.includes('antifreeze');
  const reflexPenalty = isColdBlooded
    ? (hasAntifreeze ? 1.15 : 1.30)
    : 1.0;

  const [stability, setStability] = useState(100);
  const [elapsed, setElapsed] = useState(0);
  const [debris, setDebris] = useState<Debris[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [windPhase, setWindPhase] = useState(0);
  const [hit, setHit] = useState<{ x: number; y: number; t: number } | null>(null);
  // Lightning: stores the current bolt's path + a fading opacity. Fires
  // randomly during storm + tornado severities.
  const [lightning, setLightning] = useState<{ d: string; opacity: number } | null>(null);

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

      // Random lightning on storm + tornado severity
      const lightningChance = env.id === 'tornado' ? 0.025 : env.id === 'storm' ? 0.012 : 0;
      if (lightningChance > 0 && Math.random() < lightningChance) {
        // Generate a zig-zag bolt path from cloud-line down
        const startX = 80 + Math.random() * (W - 160);
        const segments = 4 + Math.floor(Math.random() * 3);
        let pathStr = `M ${startX} 10`;
        let cx = startX;
        let cy = 10;
        for (let i = 0; i < segments; i++) {
          cx += (Math.random() - 0.5) * 40;
          cy += (GROUND_Y - 10) / segments;
          pathStr += ` L ${cx} ${cy}`;
        }
        setLightning({ d: pathStr, opacity: 1 });
        window.setTimeout(() => setLightning({ d: pathStr, opacity: 0.5 }), 60);
        window.setTimeout(() => setLightning(null), 180);
      }

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

      // Net wind force loss per second. Cold-blooded reflexes are
      // slow — the wind takes more from them before they can compensate.
      const grip = massGrip * gripBonus * stanceGripMult;
      const profile = wingPenalty * stanceProfileMult;
      const netDrain = Math.max(0, env.baseWindForce * profile * 3 - grip * 1.2) * reflexPenalty;
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
            <stop offset="0.6" stopColor={env.sky[1]} />
            <stop offset="1" stopColor={env.id === 'tornado' ? '#1a1018' : env.sky[1]} />
          </linearGradient>
          {/* radial vignette over the whole scene — adds depth */}
          <radialGradient id="storm-vignette" cx="0.5" cy="0.5" r="0.75">
            <stop offset="0.55" stopColor="black" stopOpacity="0" />
            <stop offset="1" stopColor="black" stopOpacity={env.id === 'tornado' ? '0.45' : env.id === 'storm' ? '0.25' : '0.1'} />
          </radialGradient>
          {/* Tornado funnel gradient — darker at the bottom */}
          <linearGradient id="storm-funnel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5a6a78" />
            <stop offset="1" stopColor="#1a2028" />
          </linearGradient>
          <linearGradient id="storm-funnel-core" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3a4858" />
            <stop offset="1" stopColor="#0a0f18" />
          </linearGradient>
        </defs>

        {/* SKY base */}
        <rect x="0" y="0" width={W} height={GROUND_Y} fill="url(#storm-sky)" />

        {/* STORM CLOUDS — rolling dark clouds at the top */}
        {env.id !== 'gust' && (
          <g opacity={env.id === 'tornado' ? 0.95 : 0.85}>
            {Array.from({ length: 6 }).map((_, i) => {
              const cx = ((i * 110 + windPhase * 8) % (W + 200)) - 100;
              const cy = 20 + (i % 2) * 12;
              const fill = env.id === 'tornado' ? '#1a1a26' : '#3a4858';
              return (
                <g key={i}>
                  <ellipse cx={cx} cy={cy} rx="60" ry="14" fill={fill} />
                  <ellipse cx={cx + 30} cy={cy - 4} rx="34" ry="10" fill={fill} opacity="0.85" />
                  <ellipse cx={cx - 20} cy={cy - 2} rx="28" ry="9" fill={fill} opacity="0.85" />
                </g>
              );
            })}
          </g>
        )}

        {/* LIGHTNING — random bolt + sky flash */}
        {lightning && (
          <g>
            {/* full-sky brightening flash */}
            <rect x="0" y="0" width={W} height={GROUND_Y} fill="#fffce8" opacity={lightning.opacity * 0.4} />
            {/* the bolt itself with a glow halo */}
            <path d={lightning.d} stroke="#fff7a0" strokeWidth="8" fill="none" opacity={lightning.opacity * 0.4} strokeLinecap="round" />
            <path d={lightning.d} stroke="#ffffff" strokeWidth="3" fill="none" opacity={lightning.opacity} strokeLinecap="round" />
            <path d={lightning.d} stroke="#fff7a0" strokeWidth="1.2" fill="none" opacity={lightning.opacity} />
          </g>
        )}

        {/* DISTANT BACKGROUND TREES — silhouettes leaning with the wind */}
        <g opacity="0.55">
          {[60, 130, 480, 540].map((tx, i) => {
            const lean = Math.sin(windPhase * 0.6 + i) * env.baseWindForce * 2;
            return (
              <g key={i} transform={`translate(${tx} ${GROUND_Y}) rotate(${lean})`}>
                <rect x="-2" y="-50" width="4" height="50" fill="#2a1808" />
                <ellipse cx="0" cy="-58" rx="14" ry="10" fill="#3a4828" />
                <ellipse cx="-6" cy="-66" rx="10" ry="8" fill="#3a4828" />
                <ellipse cx="6" cy="-66" rx="10" ry="8" fill="#3a4828" />
              </g>
            );
          })}
        </g>

        {/* RAIN — diagonal streaks on storm + tornado */}
        {env.id !== 'gust' && (
          <g stroke={env.id === 'tornado' ? '#7a8a9a' : '#aec0d8'} strokeWidth="1" opacity="0.55" strokeLinecap="round">
            {Array.from({ length: env.id === 'tornado' ? 80 : 50 }).map((_, i) => {
              const baseX = (i * 23 + windPhase * 90) % (W + 100);
              const baseY = ((i * 41) % (GROUND_Y - 20)) + (windPhase * 240) % 240;
              const y = baseY % (GROUND_Y - 10);
              return (
                <line key={i} x1={W + 20 - baseX} y1={y} x2={W + 20 - baseX - 14} y2={y + 18} />
              );
            })}
          </g>
        )}

        {/* GROUND with grass tufts */}
        <rect x="0" y={GROUND_Y} width={W} height={H - GROUND_Y} fill="#5a4828" />
        <rect x="0" y={GROUND_Y} width={W} height="4" fill="#3a3018" opacity="0.6" />
        {/* grass tufts bent in the wind */}
        <g stroke="#7a8848" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.7">
          {Array.from({ length: 24 }).map((_, i) => {
            const x = 15 + i * 25;
            const lean = Math.sin(windPhase * 1.5 + i * 0.5) * 3 + env.baseWindForce * 2;
            return (
              <g key={i}>
                <path d={`M ${x} ${GROUND_Y + 2} q ${-lean} ${-4} ${-lean - 1} ${-8}`} />
                <path d={`M ${x + 3} ${GROUND_Y + 2} q ${-lean * 0.8} ${-3} ${-lean - 1} ${-6}`} />
              </g>
            );
          })}
        </g>

        {/* PUDDLES on storm + tornado */}
        {env.id !== 'gust' && (
          <g opacity="0.4">
            <ellipse cx={W * 0.18} cy={GROUND_Y + 14} rx="40" ry="3" fill="#5a7080" />
            <ellipse cx={W * 0.65} cy={GROUND_Y + 18} rx="60" ry="3" fill="#5a7080" />
            <ellipse cx={W * 0.88} cy={GROUND_Y + 12} rx="28" ry="2" fill="#5a7080" />
          </g>
        )}

        {/* TORNADO FUNNEL — multilayered swirling vortex */}
        {env.id === 'tornado' && (() => {
          // Funnel narrows toward the bottom-center; sways subtly with wind
          const baseX = W / 2 + Math.sin(windPhase * 0.3) * 8;
          const topW = W * 0.62;
          const botW = W * 0.12;
          const topLeft = baseX - topW / 2;
          const topRight = baseX + topW / 2;
          const botLeft = baseX - botW / 2;
          const botRight = baseX + botW / 2;
          return (
            <g>
              {/* outer funnel envelope */}
              <path d={`M ${topLeft} 0 Q ${topLeft - 10} ${GROUND_Y / 2} ${botLeft - 10} ${GROUND_Y - 4}
                       L ${botRight + 10} ${GROUND_Y - 4} Q ${topRight + 10} ${GROUND_Y / 2} ${topRight} 0 Z`}
                fill="url(#storm-funnel)" opacity="0.85" />
              {/* inner core */}
              <path d={`M ${topLeft + 40} 0 Q ${topLeft + 30} ${GROUND_Y / 2} ${botLeft + 4} ${GROUND_Y - 4}
                       L ${botRight - 4} ${GROUND_Y - 4} Q ${topRight - 30} ${GROUND_Y / 2} ${topRight - 40} 0 Z`}
                fill="url(#storm-funnel-core)" opacity="0.85" />
              {/* multiple spiral lines — denser, more dramatic */}
              <g stroke="#8a98a8" strokeWidth="1.5" fill="none" opacity="0.7">
                {Array.from({ length: 14 }).map((_, i) => {
                  const t = i / 14;
                  const y = t * (GROUND_Y - 4);
                  const w = (topW - botW) * (1 - t) + botW;
                  const offset = Math.sin(windPhase * 2 + i * 0.7) * (8 + 6 * (1 - t));
                  return (
                    <path key={i}
                      d={`M ${baseX - w / 2 + offset} ${y} q ${w / 2} ${10 + t * 8} ${w} 0`} />
                  );
                })}
              </g>
              {/* lighter highlight lines */}
              <g stroke="#cfdae5" strokeWidth="0.8" fill="none" opacity="0.5">
                {Array.from({ length: 8 }).map((_, i) => {
                  const t = (i + 0.5) / 8;
                  const y = t * (GROUND_Y - 4);
                  const w = (topW - botW) * (1 - t) + botW;
                  const offset = Math.cos(windPhase * 2 + i * 0.9) * (10 + 7 * (1 - t));
                  return (
                    <path key={i}
                      d={`M ${baseX - w / 2 + offset} ${y} q ${w / 2} ${-12 - t * 6} ${w} 0`} />
                  );
                })}
              </g>
              {/* DUST CLOUD at the base — where the funnel touches the ground */}
              <g>
                <ellipse cx={baseX} cy={GROUND_Y + 6} rx={botW * 2.2} ry="14" fill="#6a5848" opacity="0.6" />
                <ellipse cx={baseX - 30} cy={GROUND_Y + 4} rx="28" ry="10" fill="#7a6858" opacity="0.5" />
                <ellipse cx={baseX + 35} cy={GROUND_Y + 8} rx="34" ry="11" fill="#7a6858" opacity="0.5" />
                <ellipse cx={baseX - 60} cy={GROUND_Y + 12} rx="22" ry="6" fill="#8a7868" opacity="0.4" />
                <ellipse cx={baseX + 70} cy={GROUND_Y + 14} rx="26" ry="7" fill="#8a7868" opacity="0.4" />
              </g>
            </g>
          );
        })()}

        {/* WIND STREAKS — denser + more curved on stronger storms */}
        <g stroke="#cfe9f5" fill="none" opacity={env.id === 'tornado' ? 0.65 : 0.55} strokeLinecap="round">
          {Array.from({ length: env.id === 'tornado' ? 28 : env.id === 'storm' ? 22 : 18 }).map((_, i) => {
            const y = 10 + (i * 11) % (GROUND_Y - 20);
            const x = ((i * 47 + windPhase * 60 * env.baseWindForce) % (W + 100)) - 50;
            const len = 28 + (i % 4) * 10;
            const sw = 1.2 + (i % 3) * 0.4;
            // Slight curve gives streaks a "blown-by-the-wind" feel
            return (
              <path key={i} d={`M ${x} ${y} q ${len / 2} ${-1} ${len} -3`} strokeWidth={sw} />
            );
          })}
        </g>

        {/* AIRBORNE DUST PARTICLES — small swirling specks */}
        <g fill="#a89878" opacity="0.55">
          {Array.from({ length: env.id === 'tornado' ? 35 : env.id === 'storm' ? 22 : 12 }).map((_, i) => {
            const x = ((i * 73 + windPhase * 80 * env.baseWindForce) % (W + 60)) - 30;
            const y = 30 + ((i * 29) % (GROUND_Y - 40)) + Math.sin(windPhase * 2 + i) * 6;
            const r = 1.2 + (i % 3) * 0.5;
            return <circle key={i} cx={x} cy={y} r={r} />;
          })}
        </g>

        {/* DEBRIS */}
        <g>
          {debris.map((d) => (
            <g key={d.id} transform={`translate(${d.x} ${d.y}) rotate(${d.rot})`}>
              {d.type === 'branch' && (
                <g>
                  {/* branch with tiny side twigs */}
                  <rect x={-d.size / 2} y="-2" width={d.size} height="4" fill="#5a3a18" rx="1" />
                  <line x1="0" y1="-2" x2="-4" y2="-7" stroke="#5a3a18" strokeWidth="1.4" />
                  <line x1="2" y1="2" x2="6" y2="6" stroke="#5a3a18" strokeWidth="1.4" />
                </g>
              )}
              {d.type === 'rock' && (
                <g>
                  <ellipse cx="0" cy="0" rx={d.size / 2} ry={d.size / 2.5} fill="#5a5648" />
                  <ellipse cx={-d.size / 6} cy={-d.size / 8} rx={d.size / 5} ry={d.size / 7} fill="#7a7668" opacity="0.6" />
                </g>
              )}
              {d.type === 'leaf' && (
                <g>
                  <ellipse cx="0" cy="0" rx={d.size / 2} ry={d.size / 4} fill="#5a7838" opacity="0.85" />
                  <path d={`M ${-d.size / 2} 0 L ${d.size / 2} 0`} stroke="#3a5828" strokeWidth="0.7" opacity="0.6" />
                </g>
              )}
            </g>
          ))}
        </g>

        {/* MOTION TRAIL behind the fastest debris (tornado only) */}
        {env.id === 'tornado' && debris.length > 0 && (
          <g opacity="0.3">
            {debris.filter((d) => d.type !== 'leaf').slice(0, 6).map((d) => (
              <ellipse key={`tr-${d.id}`} cx={d.x + 18} cy={d.y} rx="14" ry="2.5" fill="#888" />
            ))}
          </g>
        )}

        {/* Hit flash */}
        {hit && (
          <g>
            <circle cx={hit.x} cy={hit.y} r="28" fill="white" opacity="0.7" />
            <circle cx={hit.x} cy={hit.y} r="18" fill="#ffd040" opacity="0.6" />
            <text x={hit.x} y={hit.y + 5} textAnchor="middle" fontSize="26" fontWeight="700" fill="#ff4040">💥</text>
          </g>
        )}

        {/* SHELTER ROCKS — bigger, with grass on top */}
        {stance === 'shelter' && (
          <g>
            {/* main rock */}
            <ellipse cx={creatureX - 60} cy={GROUND_Y - 30} rx="62" ry="44" fill="#5a4830" />
            <ellipse cx={creatureX - 60} cy={GROUND_Y - 32} rx="55" ry="38" fill="#7a6a48" />
            <ellipse cx={creatureX - 70} cy={GROUND_Y - 50} rx="22" ry="6" fill="#8a7a58" opacity="0.8" />
            {/* moss on top */}
            <g fill="#5a7838" opacity="0.85">
              <ellipse cx={creatureX - 78} cy={GROUND_Y - 68} rx="12" ry="3" />
              <ellipse cx={creatureX - 56} cy={GROUND_Y - 70} rx="14" ry="3" />
              <ellipse cx={creatureX - 38} cy={GROUND_Y - 64} rx="10" ry="3" />
            </g>
            {/* small adjacent rock */}
            <ellipse cx={creatureX - 110} cy={GROUND_Y - 12} rx="22" ry="14" fill="#7a6a48" />
          </g>
        )}

        {/* Vignette overlay — gives the whole scene a stormy "edge of frame goes dark" feel */}
        <rect x="0" y="0" width={W} height={H} fill="url(#storm-vignette)" pointerEvents="none" />


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
