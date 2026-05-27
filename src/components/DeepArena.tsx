import { useEffect, useRef, useState } from 'react';
import type { CreatureStats } from '../physics';
import type { Creature } from '../types';
import { CreatureBody } from './CreatureSVG';
import { BespokeInScene, hasBespokeShape } from './dexShapes';
import { comboEffects } from '../data/hybridCombos';

export type DeepOutcome = {
  won: boolean;
  reason: 'foraged' | 'drowned' | 'crushed' | 'crossed' | 'exhausted' | 'caught' | 'landed' | 'stalled' | 'no-wings';
  maxDepth: number;
};

export type DepthZoneId = 'reef' | 'twilight' | 'abyss';
export type TravelMode = 'dive' | 'swim' | 'glide';
export type SwimRouteId = 'lagoon' | 'open-sea' | 'storm-crossing';
export type GlideRouteId = 'thermal' | 'crosswind' | 'cyclone';

interface SwimRoute {
  id: SwimRouteId;
  label: string;
  emoji: string;
  description: string;
  distanceM: number;
  waveHeight: number;     // visual amplitude
  predator: boolean;      // shark interrupt in the middle
  rewardMult: number;
  difficultyLabel: string;
  skyColor: [string, string];
  waterColor: [string, string];
}

interface GlideRoute {
  id: GlideRouteId;
  label: string;
  emoji: string;
  description: string;
  distanceM: number;
  windMps: number;        // tailwind/crosswind strength
  gustChance: number;     // 0-1 per second probability of a downdraft
  rewardMult: number;
  difficultyLabel: string;
  skyColor: [string, string];
  stormy: boolean;
}

const SWIM_ROUTES: SwimRoute[] = [
  {
    id: 'lagoon',
    label: 'Calm lagoon',
    emoji: '🏝️',
    description: 'A still tropical lagoon. Cross 200m of warm shallow water.',
    distanceM: 200,
    waveHeight: 2,
    predator: false,
    rewardMult: 1.0,
    difficultyLabel: 'easy',
    skyColor: ['#bfe6ff', '#7fc6e8'],
    waterColor: ['#7cd0e4', '#2f7aa8'],
  },
  {
    id: 'open-sea',
    label: 'Open sea',
    emoji: '🌊',
    description: 'Cross 500m of open swells. A shark patrols midway — speed matters.',
    distanceM: 500,
    waveHeight: 6,
    predator: true,
    rewardMult: 1.7,
    difficultyLabel: 'medium',
    skyColor: ['#9fc6e0', '#5b94b8'],
    waterColor: ['#3a85b8', '#1f4a78'],
  },
  {
    id: 'storm-crossing',
    label: 'Storm crossing',
    emoji: '⛈️',
    description: 'Race 800m through storm swells. Rain, towering waves, lightning.',
    distanceM: 800,
    waveHeight: 14,
    predator: false,
    rewardMult: 2.4,
    difficultyLabel: 'extreme',
    skyColor: ['#3c4858', '#1f2a3a'],
    waterColor: ['#234058', '#0f2538'],
  },
];

const GLIDE_ROUTES: GlideRoute[] = [
  {
    id: 'thermal',
    label: 'Thermal updraft',
    emoji: '🌤️',
    description: 'Warm thermals carry you 300m over calm sea. Light tailwind.',
    distanceM: 300,
    windMps: 8,
    gustChance: 0.02,
    rewardMult: 1.1,
    difficultyLabel: 'easy',
    skyColor: ['#cfe9f5', '#9fc6e0'],
    stormy: false,
  },
  {
    id: 'crosswind',
    label: 'Crosswind',
    emoji: '💨',
    description: 'Side gusts push you off course over 600m of open sea.',
    distanceM: 600,
    windMps: 4,
    gustChance: 0.06,
    rewardMult: 1.8,
    difficultyLabel: 'medium',
    skyColor: ['#9fc6e0', '#5b94b8'],
    stormy: false,
  },
  {
    id: 'cyclone',
    label: 'Cyclone edge',
    emoji: '🌀',
    description: 'Ride the edge of a cyclone for 1000m. Strong tailwind, vicious downdrafts.',
    distanceM: 1000,
    windMps: 16,
    gustChance: 0.16,
    rewardMult: 2.8,
    difficultyLabel: 'extreme',
    skyColor: ['#3c4858', '#1c2638'],
    stormy: true,
  },
];

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

function canGlide(c: Creature): boolean {
  return c.bodyPlan === 'bird' || c.hybrids.includes('wings');
}

// "Bird+something" creatures with the wings hybrid glide better than a pure bird
// without; cyclone routes basically demand the combo.
function glideQuality(c: Creature): number {
  let q = 0;
  if (c.bodyPlan === 'bird') q += 1;
  if (c.hybrids.includes('wings')) q += 1.2;
  return q;
}

export function DeepArena({ creature, stats, onFinish }: Props) {
  const [travelMode, setTravelMode] = useState<TravelMode>('dive');
  const [zoneId, setZoneId] = useState<DepthZoneId>('reef');
  const [swimRouteId, setSwimRouteId] = useState<SwimRouteId>('lagoon');
  const [glideRouteId, setGlideRouteId] = useState<GlideRouteId>('thermal');

  const zone = DEPTH_ZONES.find((z) => z.id === zoneId) ?? DEPTH_ZONES[0];
  const swimRoute = SWIM_ROUTES.find((r) => r.id === swimRouteId) ?? SWIM_ROUTES[0];
  const glideRoute = GLIDE_ROUTES.find((r) => r.id === glideRouteId) ?? GLIDE_ROUTES[0];
  const TARGET_DEPTH = zone.targetDepth;
  const PRESSURE_SAFE_DEPTH = zone.pressureSafe;

  const aq = isAquatic(creature);
  const diveAdapted = isDiveAdapted(creature);
  const gliderOk = canGlide(creature);
  const gQ = glideQuality(creature);
  const brainBonus = 1 + creature.brainTier * 0.1;
  // Harder zones extend the dive — give a bit more breath base + bigger
  // dive-adapted bonus so it stays survivable in the abyss with the right
  // build.
  const zoneBreathBonus = zone.id === 'abyss' ? 1.6 : zone.id === 'twilight' ? 1.25 : 1.0;
  const comboBreath = comboEffects(creature).deepBreathBonus ?? 1;
  const o2Capacity = aq ? 999 : (4 + Math.sqrt(stats.massKg) * 1.8) * brainBonus * (diveAdapted ? 2.8 : 1) * zoneBreathBonus * comboBreath;
  const pressureProof = aq || diveAdapted || creature.defenseTier === 2;

  // Swim physics: speed in m/s. Aquatic body is huge; legTier + computed top
  // speed contribute. Storm waves slow everyone.
  const swimSpeed = (aq ? 6 : 2) + creature.legTier * 0.8 + Math.min(stats.topSpeedKmh / 25, 3)
    - (swimRoute.waveHeight > 8 ? 1.5 : 0);
  // Swim stamina (non-aquatic only): how long you can keep going.
  const swimStaminaCap = aq ? 9999 : (12 + Math.sqrt(stats.massKg) * 1.4) * brainBonus * (1 + creature.legTier * 0.15);

  // Glide physics: altitude in metres. Sink rate without wings is brutal; with
  // wings it's gentle, esp. with the wings hybrid. Tailwind reduces sink.
  const glideStart = 80;
  const sinkRate = gliderOk ? Math.max(0.4, 3.5 - gQ * 1.2 - glideRoute.windMps * 0.05) : 999;
  // Forward speed across the route: airspeed (lift × wind).
  const glideSpeed = gliderOk ? (10 + gQ * 4 + glideRoute.windMps * 0.6) : 0;
  // Stall threshold — under it you fall.
  const STALL_ALT = 6;

  const [depth, setDepth] = useState(0);
  const [o2, setO2] = useState(o2Capacity);
  const [phase, setPhase] = useState<'descend' | 'ascend' | 'done'>('descend');
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  // Swim state
  const [swimPos, setSwimPos] = useState(0);
  const [swimStamina, setSwimStamina] = useState(swimStaminaCap);
  const [predatorTriggered, setPredatorTriggered] = useState(false);

  // Glide state
  const [glidePos, setGlidePos] = useState(0);
  const [glideAlt, setGlideAlt] = useState(glideStart);
  const [gust, setGust] = useState(false);

  const depthRef = useRef(0);
  const o2Ref = useRef(o2Capacity);
  const phaseRef = useRef<'descend' | 'ascend' | 'done'>('descend');
  const timerRef = useRef<number | null>(null);
  const swimPosRef = useRef(0);
  const swimStamRef = useRef(swimStaminaCap);
  const glidePosRef = useRef(0);
  const glideAltRef = useRef(glideStart);

  function reset() {
    depthRef.current = 0;
    o2Ref.current = o2Capacity;
    phaseRef.current = 'descend';
    setDepth(0);
    setO2(o2Capacity);
    setPhase('descend');
    swimPosRef.current = 0;
    swimStamRef.current = swimStaminaCap;
    setSwimPos(0);
    setSwimStamina(swimStaminaCap);
    setPredatorTriggered(false);
    glidePosRef.current = 0;
    glideAltRef.current = glideStart;
    setGlidePos(0);
    setGlideAlt(glideStart);
    setGust(false);
  }

  function start() {
    // Glide requires wings. Bail early with a clear outcome so the gauntlet
    // doesn't soft-lock on a non-flier.
    if (travelMode === 'glide' && !gliderOk) {
      onFinish({ won: false, reason: 'no-wings', maxDepth: 0 });
      setDone(true);
      return;
    }
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
      if (travelMode === 'dive') {
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
      } else if (travelMode === 'swim') {
        // Forward progress per tick.
        swimPosRef.current += swimSpeed * dt;
        if (!aq) swimStamRef.current -= dt;
        setSwimPos(swimPosRef.current);
        setSwimStamina(swimStamRef.current);

        // Predator interrupt at ~50% on the open-sea route.
        if (swimRoute.predator && !predatorTriggered && swimPosRef.current > swimRoute.distanceM * 0.5) {
          setPredatorTriggered(true);
          // 30% catch chance reduced by agility + speed; aquatic body cuts it further.
          const escape = (aq ? 0.5 : 0) + creature.legTier * 0.2 + Math.min(stats.topSpeedKmh / 80, 0.3);
          if (Math.random() > escape) {
            stop({ won: false, reason: 'caught', maxDepth: Math.round(swimPosRef.current) });
            return;
          }
        }

        if (swimPosRef.current >= swimRoute.distanceM) {
          stop({ won: true, reason: 'crossed', maxDepth: swimRoute.distanceM });
          return;
        }
        if (swimStamRef.current <= 0) {
          stop({ won: false, reason: 'exhausted', maxDepth: Math.round(swimPosRef.current) });
          return;
        }
      } else if (travelMode === 'glide') {
        // Forward progress and slow altitude bleed.
        glidePosRef.current += glideSpeed * dt;
        glideAltRef.current -= sinkRate * dt;

        // Random gust on stormy routes — extra altitude loss + visual.
        if (Math.random() < glideRoute.gustChance * dt * 10) {
          glideAltRef.current -= 4 + Math.random() * 6;
          setGust(true);
          window.setTimeout(() => setGust(false), 220);
        }

        setGlidePos(glidePosRef.current);
        setGlideAlt(glideAltRef.current);

        if (glidePosRef.current >= glideRoute.distanceM) {
          stop({ won: true, reason: 'landed', maxDepth: glideRoute.distanceM });
          return;
        }
        if (glideAltRef.current <= STALL_ALT) {
          stop({ won: false, reason: 'stalled', maxDepth: Math.round(glidePosRef.current) });
          return;
        }
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
  }, [stats.massKg, aq, pressureProof, zoneId, swimRouteId, glideRouteId, travelMode]);

  const creatureY = SURFACE_Y + (depth / TARGET_DEPTH) * (SEABED_Y - SURFACE_Y - 20);
  const pressureLineY = SURFACE_Y + (PRESSURE_SAFE_DEPTH / TARGET_DEPTH) * (SEABED_Y - SURFACE_Y - 20);

  // Headline + help text varies per mode.
  const headerLabel =
    travelMode === 'dive' ? `${zone.emoji} ${zone.label}` :
    travelMode === 'swim' ? `${swimRoute.emoji} ${swimRoute.label}` :
    `${glideRoute.emoji} ${glideRoute.label}`;
  const headerRewardMult =
    travelMode === 'dive' ? zone.rewardMult :
    travelMode === 'swim' ? swimRoute.rewardMult :
    glideRoute.rewardMult;
  const headerDifficulty =
    travelMode === 'dive' ? zone.difficultyLabel :
    travelMode === 'swim' ? swimRoute.difficultyLabel :
    glideRoute.difficultyLabel;
  const headerDesc =
    travelMode === 'dive' ? zone.description :
    travelMode === 'swim' ? swimRoute.description :
    glideRoute.description;

  return (
    <div className="arena">
      <h2>The Deep — {headerLabel} <small className="arena-env">· {headerDifficulty} · ×{headerRewardMult.toFixed(1)} reward</small></h2>
      <p className="arena-help">
        {headerDesc}{' '}
        {travelMode === 'dive' && <>Dive to <strong>{TARGET_DEPTH}m</strong> and return. Past {PRESSURE_SAFE_DEPTH}m the pressure crushes you without armor or a fish body.</>}
        {travelMode === 'swim' && <>Cross <strong>{swimRoute.distanceM}m</strong> of surface water. {aq ? 'Gills + a fish body keep you tireless.' : 'Non-aquatic creatures tire — stamina runs out.'}</>}
        {travelMode === 'glide' && (gliderOk
          ? <>Glide <strong>{glideRoute.distanceM}m</strong> from cliff to landing point. Don't let altitude hit zero.</>
          : <strong style={{ color: '#c44' }}>Glide mode needs wings — give your creature the wings hybrid or a bird body plan.</strong>)}
      </p>

      {/* Travel-mode tabs */}
      <div className="prey-tabs" style={{ marginBottom: 4 }}>
        {([
          { id: 'dive' as const, emoji: '🤿', label: 'Dive' },
          { id: 'swim' as const, emoji: '🏊', label: 'Swim' },
          { id: 'glide' as const, emoji: '🪽', label: 'Glide' },
        ]).map((m) => (
          <button
            key={m.id}
            type="button"
            className={`prey-tab${travelMode === m.id ? ' active' : ''}`}
            onClick={() => !running && setTravelMode(m.id)}
            disabled={running || (m.id === 'glide' && !gliderOk)}
            title={m.id === 'glide' && !gliderOk ? 'Needs wings — bird body plan or wings hybrid' : m.label}
          >
            <span className="prey-emoji">{m.emoji}</span>
            <span className="prey-name">
              {m.label}
              <small>{m.id === 'glide' && !gliderOk ? ' (needs wings)' : ''}</small>
            </span>
          </button>
        ))}
      </div>

      {/* Sub-picker: route/zone within the mode */}
      <div className="prey-tabs">
        {travelMode === 'dive' && DEPTH_ZONES.map((z) => (
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
        {travelMode === 'swim' && SWIM_ROUTES.map((r) => (
          <button
            key={r.id}
            type="button"
            className={`prey-tab${swimRouteId === r.id ? ' active' : ''}`}
            onClick={() => !running && setSwimRouteId(r.id)}
            disabled={running}
            title={`${r.label} · ${r.distanceM}m · ${r.difficultyLabel}`}
          >
            <span className="prey-emoji">{r.emoji}</span>
            <span className="prey-name">
              {r.label}
              <small> {r.distanceM}m · ×{r.rewardMult.toFixed(1)}</small>
            </span>
          </button>
        ))}
        {travelMode === 'glide' && GLIDE_ROUTES.map((r) => (
          <button
            key={r.id}
            type="button"
            className={`prey-tab${glideRouteId === r.id ? ' active' : ''}`}
            onClick={() => !running && setGlideRouteId(r.id)}
            disabled={running}
            title={`${r.label} · ${r.distanceM}m · ${r.difficultyLabel}`}
          >
            <span className="prey-emoji">{r.emoji}</span>
            <span className="prey-name">
              {r.label}
              <small> {r.distanceM}m · ×{r.rewardMult.toFixed(1)}</small>
            </span>
          </button>
        ))}
      </div>

      {travelMode === 'dive' && (
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
      )}

      {/* ───────────────────────── SWIM SCENE ───────────────────────── */}
      {travelMode === 'swim' && (() => {
        const SURFACE = 110;
        const progress = swimPos / swimRoute.distanceM;
        const creatureX = 40 + progress * (W - 80);
        const sharkX = swimRoute.predator && swimPos > swimRoute.distanceM * 0.5 - 30 && !predatorTriggered ? W * 0.5 + 30 : -100;
        return (
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="swim-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={swimRoute.skyColor[0]} />
              <stop offset="1" stopColor={swimRoute.skyColor[1]} />
            </linearGradient>
            <linearGradient id="swim-water" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={swimRoute.waterColor[0]} />
              <stop offset="1" stopColor={swimRoute.waterColor[1]} />
            </linearGradient>
          </defs>
          {/* sky */}
          <rect x="0" y="0" width={W} height={SURFACE} fill="url(#swim-sky)" />
          {/* sun or storm cloud */}
          {swimRoute.id === 'storm-crossing' ? (
            <g opacity="0.85">
              <ellipse cx="100" cy="40" rx="60" ry="14" fill="#0e1622" />
              <ellipse cx="350" cy="32" rx="80" ry="18" fill="#0e1622" />
              <ellipse cx="520" cy="44" rx="50" ry="12" fill="#0e1622" />
              {/* rain streaks */}
              <g stroke="#aef0ff" strokeWidth="0.8" opacity="0.4">
                {Array.from({ length: 50 }).map((_, i) => (
                  <line key={i} x1={(i * 23) % W} y1={50 + (i * 7) % 60} x2={(i * 23) % W - 4} y2={56 + (i * 7) % 60} />
                ))}
              </g>
              {/* lightning every now and then */}
              <polyline points={`${W * 0.7},20 ${W * 0.68},50 ${W * 0.72},55 ${W * 0.7},90`}
                stroke="#fff7a0" strokeWidth="2" fill="none" opacity="0.7" />
            </g>
          ) : (
            <circle cx="80" cy="44" r="22" fill="#ffe9a0" opacity="0.9" />
          )}

          {/* water */}
          <rect x="0" y={SURFACE} width={W} height={H - SURFACE} fill="url(#swim-water)" />

          {/* wave outline */}
          <path
            d={`M 0,${SURFACE} ${Array.from({ length: 40 }).map((_, i) => {
              const x = (i + 1) * (W / 40);
              const y = SURFACE - Math.sin((i + Date.now() / 400) * 0.7) * swimRoute.waveHeight * 0.5;
              return `L ${x},${y}`;
            }).join(' ')}`}
            stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.6"
          />

          {/* underwater fish silhouettes */}
          <g opacity="0.35" fill="#0a2548">
            <ellipse cx={W * 0.2} cy={H - 40} rx="14" ry="4" />
            <ellipse cx={W * 0.65} cy={H - 60} rx="10" ry="3" />
            <ellipse cx={W * 0.85} cy={H - 30} rx="12" ry="4" />
          </g>

          {/* start and goal markers */}
          <g>
            <polygon points={`30,${SURFACE - 6} 40,${SURFACE - 6} 35,${SURFACE - 22}`} fill="#5cc46a" />
            <text x="35" y={SURFACE - 26} fontSize="9" textAnchor="middle" fill="#fff">start</text>
            <polygon points={`${W - 40},${SURFACE - 6} ${W - 30},${SURFACE - 6} ${W - 35},${SURFACE - 22}`} fill="#ffd040" />
            <text x={W - 35} y={SURFACE - 26} fontSize="9" textAnchor="middle" fill="#fff">land</text>
          </g>

          {/* shark predator */}
          {swimRoute.predator && (
            <g transform={`translate(${sharkX} ${SURFACE + 14})`} opacity="0.85">
              <ellipse cx="0" cy="0" rx="22" ry="6" fill="#3a4858" />
              <polygon points="-22,0 -32,-4 -32,4" fill="#3a4858" />
              <polygon points="0,-6 4,-16 8,-6" fill="#3a4858" />
              <circle cx="14" cy="-1" r="1.2" fill="#ff4040" />
            </g>
          )}

          {/* progress + stamina HUD */}
          <rect x="6" y="6" width="260" height="22" fill="rgba(255,255,255,0.9)" rx="4" stroke="#bbb" />
          <text x="14" y="22" fontSize="11" fill="#333">{aq ? 'tireless (aquatic)' : 'stamina'}</text>
          <rect x="92" y="13" width="170" height="10" fill="#eee" stroke="#999" />
          <rect x="92" y="13" width={aq ? 170 : Math.max(0, 170 * (swimStamina / swimStaminaCap))} height="10"
            fill={aq ? '#5cc46a' : swimStamina > 0 ? '#5cc46a' : '#c44'} />
          <rect x={W - 160} y="6" width="154" height="22" fill="rgba(255,255,255,0.9)" rx="4" stroke="#bbb" />
          <text x={W - 152} y="22" fontSize="11" fill="#333">
            {Math.round(swimPos)} / {swimRoute.distanceM} m
          </text>

          {/* creature riding the surface */}
          {hasBespokeShape(creature) ? (
            <BespokeInScene creature={creature} x={creatureX - 50} y={SURFACE - 40} width={100} height={80} animate="breathe" />
          ) : (
            <g transform={`translate(${creatureX} ${SURFACE + 2})`}>
              <CreatureBody creature={creature} cx={0} footY={20} scale={0.32} animate="breathe" />
            </g>
          )}

          {/* splash wake behind creature */}
          <g fill="white" opacity="0.7">
            <circle cx={creatureX - 30} cy={SURFACE + 4} r="2.5" />
            <circle cx={creatureX - 38} cy={SURFACE + 8} r="2" />
            <circle cx={creatureX - 46} cy={SURFACE + 4} r="1.5" />
          </g>
        </svg>
        );
      })()}

      {/* ───────────────────────── GLIDE SCENE ───────────────────────── */}
      {travelMode === 'glide' && gliderOk && (() => {
        const HORIZON = H - 30;
        const progress = glidePos / glideRoute.distanceM;
        const creatureX = 40 + progress * (W - 80);
        // alt 0..glideStart maps to creatureY between HORIZON-2 and 50
        const creatureY = HORIZON - 2 - (glideAlt / glideStart) * (HORIZON - 50);
        return (
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="glide-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={glideRoute.skyColor[0]} />
              <stop offset="1" stopColor={glideRoute.skyColor[1]} />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width={W} height={H} fill="url(#glide-sky)" />

          {/* clouds (more + darker on stormy) */}
          {glideRoute.stormy ? (
            <g opacity="0.85">
              {Array.from({ length: 6 }).map((_, i) => (
                <ellipse key={i} cx={(i * 95 + 40) % W} cy={30 + (i * 17) % 40} rx={50 + (i % 3) * 10} ry={12 + (i % 2) * 4} fill="#0e1622" />
              ))}
              {/* spinning cyclone hint */}
              <g transform={`translate(${W * 0.5} 60)`} opacity="0.6">
                <ellipse cx="0" cy="0" rx="90" ry="14" fill="none" stroke="#3a4858" strokeWidth="2" strokeDasharray="6 4" />
                <ellipse cx="0" cy="6" rx="70" ry="10" fill="none" stroke="#3a4858" strokeWidth="2" strokeDasharray="6 4" />
              </g>
            </g>
          ) : (
            <g opacity="0.75" fill="#ffffff">
              <ellipse cx="120" cy="36" rx="40" ry="9" />
              <ellipse cx="380" cy="28" rx="50" ry="10" />
              <ellipse cx="520" cy="50" rx="36" ry="8" />
            </g>
          )}

          {/* sun on calm routes */}
          {!glideRoute.stormy && <circle cx="80" cy="36" r="20" fill="#ffe9a0" opacity="0.9" />}

          {/* lightning during a gust on cyclone */}
          {glideRoute.stormy && gust && (
            <polyline points={`${W * 0.4},10 ${W * 0.38},40 ${W * 0.42},45 ${W * 0.4},80`}
              stroke="#fff7a0" strokeWidth="2.5" fill="none" opacity="0.95" />
          )}

          {/* wind streaks across the sky — direction shows the tailwind */}
          <g stroke="#cfe9f5" strokeWidth="1" opacity="0.55">
            {Array.from({ length: 14 }).map((_, i) => {
              const y = 18 + (i * 13) % (HORIZON - 30);
              const len = 22 + (i % 4) * 8;
              const x = ((i * 47 + Date.now() / 30) % (W + 60)) - 30;
              return <line key={i} x1={x} y1={y} x2={x + len} y2={y} />;
            })}
          </g>

          {/* gust flash */}
          {gust && <rect x="0" y="0" width={W} height={H} fill="#fff" opacity="0.15" />}

          {/* sea surface at the bottom */}
          <rect x="0" y={HORIZON} width={W} height={H - HORIZON} fill={glideRoute.stormy ? '#1c2a3a' : '#3a85b8'} />
          <path
            d={`M 0,${HORIZON} ${Array.from({ length: 30 }).map((_, i) => {
              const x = (i + 1) * (W / 30);
              const y = HORIZON - Math.sin((i + Date.now() / 500) * 0.9) * 3;
              return `L ${x},${y}`;
            }).join(' ')}`}
            stroke="#fff" strokeWidth="1" fill="none" opacity="0.5"
          />

          {/* cliff at start, island at end */}
          <g>
            <polygon points={`0,${HORIZON} 60,${HORIZON} 60,${HORIZON - 70} 30,${HORIZON - 80} 0,${HORIZON - 60}`} fill="#4a5840" />
            <polygon points={`${W - 60},${HORIZON} ${W},${HORIZON} ${W},${HORIZON - 40} ${W - 30},${HORIZON - 50}`} fill="#4a5840" />
            <polygon points={`${W - 50},${HORIZON - 50} ${W - 35},${HORIZON - 68} ${W - 20},${HORIZON - 50}`} fill="#3a4a30" />
            <text x="30" y={HORIZON - 84} fontSize="9" textAnchor="middle" fill="#fff">start</text>
            <text x={W - 30} y={HORIZON - 72} fontSize="9" textAnchor="middle" fill="#fff">land</text>
          </g>

          {/* altitude + progress HUD */}
          <rect x="6" y="6" width="260" height="22" fill="rgba(255,255,255,0.9)" rx="4" stroke="#bbb" />
          <text x="14" y="22" fontSize="11" fill="#333">altitude</text>
          <rect x="76" y="13" width="186" height="10" fill="#eee" stroke="#999" />
          <rect x="76" y="13" width={Math.max(0, 186 * (glideAlt / glideStart))} height="10"
            fill={glideAlt > STALL_ALT * 2 ? '#5cc46a' : glideAlt > STALL_ALT ? '#e0a040' : '#c44'} />
          <rect x={W - 160} y="6" width="154" height="22" fill="rgba(255,255,255,0.9)" rx="4" stroke="#bbb" />
          <text x={W - 152} y="22" fontSize="11" fill="#333">
            {Math.round(glidePos)} / {glideRoute.distanceM} m
          </text>

          {/* creature with spread wings overlaid (a hint at gliding pose) */}
          {hasBespokeShape(creature) ? (
            <BespokeInScene creature={creature} x={creatureX - 50} y={creatureY - 40} width={100} height={80} animate="breathe" />
          ) : (
            <g transform={`translate(${creatureX} ${creatureY})`}>
              <CreatureBody creature={creature} cx={0} footY={10} scale={0.3} animate="breathe" />
            </g>
          )}
          {/* outstretched glide wings sketch */}
          <g stroke="#fff" strokeWidth="1.4" fill="none" opacity="0.8">
            <path d={`M ${creatureX - 36},${creatureY} Q ${creatureX - 18},${creatureY - 8} ${creatureX},${creatureY}`} />
            <path d={`M ${creatureX + 36},${creatureY} Q ${creatureX + 18},${creatureY - 8} ${creatureX},${creatureY}`} />
          </g>
        </svg>
        );
      })()}

      {/* No-wings glide guard rail */}
      {travelMode === 'glide' && !gliderOk && (
        <div style={{ padding: 40, textAlign: 'center', background: '#fbfaf3', border: '1px solid var(--line)', borderRadius: 10 }}>
          <div style={{ fontSize: 56 }}>🪽</div>
          <p style={{ marginTop: 8 }}>
            This creature can't glide. Add the <strong>wings</strong> hybrid or start from a bird body plan.
          </p>
        </div>
      )}

      <div className="arena-controls">
        {!running && !done && (
          <button className="btn" onClick={start} type="button" disabled={travelMode === 'glide' && !gliderOk}>
            {travelMode === 'dive' ? 'Start the dive' : travelMode === 'swim' ? 'Start the swim' : 'Start the glide'}
          </button>
        )}
        {running && (
          <button
            className="btn btn-secondary"
            onClick={() => {
              if (travelMode === 'dive') stop({ won: false, reason: 'drowned', maxDepth: Math.round(depthRef.current) });
              else if (travelMode === 'swim') stop({ won: false, reason: 'exhausted', maxDepth: Math.round(swimPosRef.current) });
              else stop({ won: false, reason: 'stalled', maxDepth: Math.round(glidePosRef.current) });
            }}
            type="button"
          >
            Give up
          </button>
        )}
        {done && (
          <button className="btn" onClick={start} type="button" disabled={travelMode === 'glide' && !gliderOk}>
            {travelMode === 'dive' ? 'Dive again' : travelMode === 'swim' ? 'Swim again' : 'Glide again'}
          </button>
        )}
        {!running && !done && (
          <small className="arena-meta">
            {travelMode === 'dive' && (
              <>{aq ? 'gills/fish — unlimited breath' : diveAdapted ? `dive adaptation — breath: ${o2Capacity.toFixed(1)}s` : `breath: ${o2Capacity.toFixed(1)}s`} · {pressureProof ? 'pressure-safe' : 'fragile at depth'} · phase: {phase}</>
            )}
            {travelMode === 'swim' && (
              <>swim speed: {swimSpeed.toFixed(1)} m/s · {aq ? 'tireless' : `stamina: ${swimStaminaCap.toFixed(1)}s`}</>
            )}
            {travelMode === 'glide' && gliderOk && (
              <>airspeed: {glideSpeed.toFixed(1)} m/s · sink: {sinkRate.toFixed(1)} m/s · wings: {gQ.toFixed(1)}</>
            )}
          </small>
        )}
      </div>
    </div>
  );
}
