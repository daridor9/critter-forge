import { useEffect, useRef, useState } from 'react';
import type { CreatureStats } from '../physics';
import type { Creature } from '../types';
import { CreatureBody } from './CreatureSVG';
import { BespokeInScene, hasBespokeShape } from './dexShapes';
import { ArenaComboBadge } from './ArenaComboBadge';

export type PlagueAction = 'rest' | 'food' | 'water' | 'herbs' | 'cure';

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
const TOTAL_CURE_INGREDIENTS = 4;

export function PlagueArena({ creature, stats, generation = 1, onFinish }: Props) {
  const goalDays = 60 + (generation - 1) * 10;

  const [action, setAction] = useState<PlagueAction>('rest');
  const actionRef = useRef<PlagueAction>('rest');

  // Immune system strength — bigger + warm-blooded + armored = stronger
  const massKg = stats.massKg;
  const immuneBase = (creature.warmBlooded ? 1.2 : 0.5)
    + Math.min(2.5, Math.log10(Math.max(0.1, massKg)) + 1)
    + creature.defenseTier * 0.4
    + (creature.hybrids.includes('regeneration') ? 1.5 : 0)
    + (creature.hybrids.includes('thick-fur') ? 0.4 : 0)
    + (creature.hybrids.includes('stoneskin') ? 0.5 : 0);

  // Foraging skill — finding food/water/herbs/cure is easier with sensors + brain
  const foragingSkill = 0.4
    + creature.sensorTier * 0.18
    + creature.brainTier * 0.15
    + (creature.hybrids.includes('symbiosis') ? 0.25 : 0)
    + (creature.hybrids.includes('echolocation') ? 0.15 : 0)
    + (creature.hybrids.includes('photosynthesis') ? 0.30 : 0);

  // ─── State ─────────────────────────────────────────────────────────────
  const [day, setDay] = useState(0);
  const [infection, setInfection] = useState(15);
  const [hydration, setHydration] = useState(75);
  const [food, setFood] = useState(75);
  const [herbs, setHerbs] = useState(0);
  const [cureIngredients, setCureIngredients] = useState(0);
  const [cureBrewed, setCureBrewed] = useState(false);
  const [feverFlash, setFeverFlash] = useState(false);
  const [regenFlash, setRegenFlash] = useState(false);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  // Refs (read inside the tick loop)
  const dayRef = useRef(0);
  const infectionRef = useRef(15);
  const hydrationRef = useRef(75);
  const foodRef = useRef(75);
  const herbsRef = useRef(0);
  const cureRef = useRef(0);
  const cureBrewedRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const lastEventDay = useRef(0);

  function reset() {
    dayRef.current = 0;
    infectionRef.current = 15;
    hydrationRef.current = 75;
    foodRef.current = 75;
    herbsRef.current = 0;
    cureRef.current = 0;
    cureBrewedRef.current = false;
    actionRef.current = 'rest';
    setDay(0);
    setInfection(15);
    setHydration(75);
    setFood(75);
    setHerbs(0);
    setCureIngredients(0);
    setCureBrewed(false);
    setAction('rest');
    setLog([]);
    lastEventDay.current = 0;
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
    setLog((prev) => [...prev.slice(-4), msg]);
  }

  // ─── Use a herb (consumable, instant) ─────────────────────────────────
  function useHerb() {
    if (herbsRef.current <= 0) return;
    herbsRef.current -= 1;
    infectionRef.current = Math.max(0, infectionRef.current - 20);
    setHerbs(herbsRef.current);
    setInfection(infectionRef.current);
    pushLog(`🌿 Used a healing herb — infection -20%`);
  }

  // ─── Brew cure (consumes 4 ingredients, halves infection) ──────────────
  function brewCure() {
    if (cureRef.current < TOTAL_CURE_INGREDIENTS) return;
    if (cureBrewedRef.current) return;
    cureBrewedRef.current = true;
    cureRef.current = 0;
    infectionRef.current = Math.max(0, infectionRef.current - 50);
    setCureBrewed(true);
    setCureIngredients(0);
    setInfection(infectionRef.current);
    pushLog(`🧪 BREWED THE CURE! Infection -50%. You're cured.`);
  }

  useEffect(() => {
    if (!running) return;
    const dt = TICK_MS / 1000;

    timerRef.current = window.setInterval(() => {
      const dayPace = DAYS_PER_SEC * dt;
      dayRef.current += dayPace;

      // ─── Per-action modifiers ─────────────────────────────────────────
      // exposureMult: how much new infection comes in
      // foodGain/foodDrain, waterGain/waterDrain
      // herbChance / cureChance: probability per day
      // immuneActive: how aggressively immune fights
      let exposureMult = 1.0;
      let foodDelta = -0.4;     // base food drain (you're still eating something)
      let waterDelta = -0.6;
      let herbChance = 0;
      let cureChance = 0;
      let immuneActive = 0.4;

      switch (actionRef.current) {
        case 'rest':
          exposureMult = 0.6;
          foodDelta = -0.3;
          waterDelta = -0.4;
          immuneActive = 0.9;       // body devotes resources to healing
          break;
        case 'food':
          exposureMult = 1.0;
          foodDelta = +2.2;          // forage success
          waterDelta = -0.7;
          immuneActive = 0.6;
          break;
        case 'water':
          exposureMult = 1.0;
          foodDelta = -0.5;
          waterDelta = +2.4;
          immuneActive = 0.5;
          break;
        case 'herbs':
          exposureMult = 1.2;        // wandering exposes you
          foodDelta = -0.6;
          waterDelta = -0.7;
          herbChance = 0.18 * foragingSkill;
          immuneActive = 0.4;
          break;
        case 'cure':
          exposureMult = 1.3;        // travelling far afield is risky
          foodDelta = -0.8;
          waterDelta = -0.9;
          cureChance = 0.08 * foragingSkill;
          immuneActive = 0.4;
          break;
      }

      // Hunger and thirst hurt your immune system
      const starving = foodRef.current < 20 ? 0.5 : foodRef.current < 50 ? 0.85 : 1;
      const parched = hydrationRef.current < 20 ? 0.5 : hydrationRef.current < 50 ? 0.85 : 1;
      const effectiveImmune = immuneBase * immuneActive * starving * parched;

      // Net infection change per day
      const newExposure = exposureMult * (1 - cureRef.current / (TOTAL_CURE_INGREDIENTS * 2));
      const netInfection = (newExposure - effectiveImmune) * dayPace * 8;
      infectionRef.current = Math.max(0, Math.min(100, infectionRef.current + netInfection));

      // Resources
      foodRef.current = Math.max(0, Math.min(100, foodRef.current + foodDelta * dayPace * 6));
      hydrationRef.current = Math.max(0, Math.min(100, hydrationRef.current + waterDelta * dayPace * 6));

      const isNewDay = Math.floor(dayRef.current) > Math.floor(dayRef.current - dayPace);

      // Fever spikes (warm-blood only)
      if (isNewDay && Math.random() < 0.15 && creature.warmBlooded) {
        infectionRef.current = Math.max(0, infectionRef.current - 5);
        setFeverFlash(true);
        window.setTimeout(() => setFeverFlash(false), 350);
        if (Math.floor(dayRef.current) > lastEventDay.current) {
          pushLog(`🔥 Day ${Math.floor(dayRef.current)}: fever spike (-5%)`);
          lastEventDay.current = Math.floor(dayRef.current);
        }
      }

      // REGENERATION daily heal pulse — axolotl-style tissue regrowth
      // actively pushes infection back each day, on top of the passive
      // immune boost. Stronger when not in "cure" mode (energy already
      // spent on the brew).
      if (isNewDay && creature.hybrids.includes('regeneration')) {
        const healAmount = actionRef.current === 'cure' ? 3 : 6;
        infectionRef.current = Math.max(0, infectionRef.current - healAmount);
        setRegenFlash(true);
        window.setTimeout(() => setRegenFlash(false), 600);
        if (Math.floor(dayRef.current) > lastEventDay.current) {
          pushLog(`🦎 Day ${Math.floor(dayRef.current)}: tissue regenerates (-${healAmount}%)`);
          lastEventDay.current = Math.floor(dayRef.current);
        }
      }

      // Herb find
      if (isNewDay && Math.random() < herbChance) {
        herbsRef.current = Math.min(5, herbsRef.current + 1);
        setHerbs(herbsRef.current);
        pushLog(`🌿 Day ${Math.floor(dayRef.current)}: found a healing herb!`);
        lastEventDay.current = Math.floor(dayRef.current);
      }

      // Cure ingredient find
      if (isNewDay && cureRef.current < TOTAL_CURE_INGREDIENTS && Math.random() < cureChance) {
        cureRef.current = Math.min(TOTAL_CURE_INGREDIENTS, cureRef.current + 1);
        setCureIngredients(cureRef.current);
        pushLog(`🔬 Day ${Math.floor(dayRef.current)}: cure ingredient #${cureRef.current} found!`);
        lastEventDay.current = Math.floor(dayRef.current);
      }

      // Random good food find (if not actively foraging)
      if (isNewDay && actionRef.current !== 'food' && Math.random() < 0.05 * foragingSkill) {
        foodRef.current = Math.min(100, foodRef.current + 10);
        pushLog(`🍖 Day ${Math.floor(dayRef.current)}: stumbled on food (+10)`);
      }

      setDay(dayRef.current);
      setInfection(infectionRef.current);
      setHydration(hydrationRef.current);
      setFood(foodRef.current);

      // Lose conditions
      if (infectionRef.current >= 100) {
        stop({ won: false, reason: 'succumbed', daysSurvived: Math.round(dayRef.current), goalDays });
        return;
      }
      if (hydrationRef.current <= 0 || foodRef.current <= 0) {
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

  const sweat = infection > 30;
  const tremor = infection > 60;
  const dying = infection > 85;
  const cx = W / 2;
  const groundY = 200;

  return (
    <div className="arena">
      <h2>The Plague — 🦟 Survive the outbreak <small className="arena-env">· {goalDays} days</small></h2>
      <ArenaComboBadge creature={creature} arena="plague" />
      <p className="arena-help">
        A virus is spreading. Hold out <strong>{goalDays} days</strong>. Manage food + water + infection.
        Search for <strong>🌿 healing herbs</strong> (consume to reduce infection) or hunt for <strong>🔬 cure
        ingredients</strong> (collect 4 to brew the full cure).
      </p>

      <div className="drought-activity-label">
        <strong>What do you do today?</strong> <small>(switch any time)</small>
      </div>
      <div className="prey-tabs">
        {([
          { id: 'rest' as const, emoji: '😴', label: 'Rest', sub: 'immune ×0.9',
            title: 'Sleep through the worst. Low exposure, strong immune fight.' },
          { id: 'food' as const, emoji: '🍖', label: 'Find food', sub: '+food · -water',
            title: 'Forage for protein. Refills food bar.' },
          { id: 'water' as const, emoji: '💧', label: 'Find water', sub: '+water · -food',
            title: 'Find a stream. Refills hydration bar.' },
          { id: 'herbs' as const, emoji: '🌿', label: 'Find herbs', sub: 'chance: heal -20',
            title: 'Hunt for medicinal plants. Each found herb can be USED later to drop infection 20%.' },
          { id: 'cure' as const, emoji: '🔬', label: 'Search cure', sub: 'collect 4 parts',
            title: 'Search for rare cure ingredients. Collect 4 to brew the cure (drops infection by 50% + halts new exposure).' },
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

      {/* INVENTORY ROW — herbs collected + cure progress, with use buttons */}
      <div className="plague-inventory">
        <div className="plague-inv-slot">
          <span className="plague-inv-icon">🌿</span>
          <span className="plague-inv-label">Healing herbs:</span>
          <span className="plague-inv-count">{herbs}</span>
          <button
            type="button"
            className="btn"
            disabled={!running || herbs <= 0}
            onClick={useHerb}
            title="Consume 1 herb to reduce infection by 20%"
          >Use herb (-20% 🦠)</button>
        </div>
        <div className="plague-inv-slot">
          <span className="plague-inv-icon">🔬</span>
          <span className="plague-inv-label">Cure ingredients:</span>
          <span className="plague-inv-count">{cureIngredients}/{TOTAL_CURE_INGREDIENTS}</span>
          <div className="plague-cure-dots">
            {Array.from({ length: TOTAL_CURE_INGREDIENTS }).map((_, i) => (
              <span key={i} className={`plague-cure-dot${i < cureIngredients ? ' filled' : ''}`}>•</span>
            ))}
          </div>
          <button
            type="button"
            className="btn"
            disabled={!running || cureIngredients < TOTAL_CURE_INGREDIENTS || cureBrewed}
            onClick={brewCure}
            title="Brew the full cure (drops infection by 50% + halves future exposure)"
          >{cureBrewed ? '✓ Cured!' : '🧪 Brew cure (-50% 🦠)'}</button>
        </div>
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

        {/* Action-specific scene props */}
        {action === 'food' && (
          <g>
            {/* berry bush + bones */}
            <ellipse cx={cx + 90} cy={groundY - 14} rx="22" ry="14" fill="#3a5828" />
            <ellipse cx={cx + 96} cy={groundY - 20} rx="14" ry="9" fill="#5a7838" />
            <g fill="#a83040">
              {[0, 1, 2, 3, 4].map((i) => (
                <circle key={i} cx={cx + 78 + i * 7} cy={groundY - 14 + (i % 2) * 4} r="2" />
              ))}
            </g>
          </g>
        )}
        {action === 'water' && (
          <g>
            <ellipse cx={cx + 100} cy={groundY + 4} rx="40" ry="8" fill="#3a85b8" opacity="0.85" />
            <ellipse cx={cx + 100} cy={groundY + 2} rx="32" ry="5" fill="#74c4dc" opacity="0.7" />
            <g stroke="white" strokeWidth="0.6" fill="none" opacity="0.5">
              <ellipse cx={cx + 90} cy={groundY + 3} rx="6" ry="1.2" />
              <ellipse cx={cx + 110} cy={groundY + 3} rx="5" ry="1" />
            </g>
          </g>
        )}
        {action === 'herbs' && (
          <g>
            {/* mushrooms + ferns */}
            <g transform={`translate(${cx + 80} ${groundY - 4})`}>
              <ellipse cx="0" cy="0" rx="8" ry="3" fill="#c84848" />
              <rect x="-1.5" y="0" width="3" height="6" fill="#f0e8d0" />
            </g>
            <g transform={`translate(${cx + 100} ${groundY - 4})`}>
              <ellipse cx="0" cy="0" rx="6" ry="2.5" fill="#c84848" />
              <rect x="-1" y="0" width="2" height="5" fill="#f0e8d0" />
            </g>
            <g stroke="#5a7838" strokeWidth="1.5" fill="none" opacity="0.85" strokeLinecap="round">
              <path d={`M ${cx + 70} ${groundY} q -2 -10 -4 -16`} />
              <path d={`M ${cx + 70} ${groundY} q 2 -10 4 -16`} />
              <path d={`M ${cx + 116} ${groundY} q -2 -10 -4 -16`} />
              <path d={`M ${cx + 116} ${groundY} q 2 -10 4 -16`} />
            </g>
          </g>
        )}
        {action === 'cure' && (
          <g>
            {/* mystical/lab vibe — a small "research" patch with glowing flask */}
            <g transform={`translate(${cx + 100} ${groundY - 30})`}>
              <path d="M -6 -10 L -6 -2 L -12 8 L 12 8 L 6 -2 L 6 -10 Z" fill="#cfe9f5" opacity="0.8" stroke="#5a7090" strokeWidth="1.2" />
              <ellipse cx="0" cy="4" rx="9" ry="3" fill="#9a60d0" opacity="0.85" />
              <circle cx="-3" cy="4" r="1.6" fill="#aef0ff" opacity="0.8" />
              <circle cx="3" cy="2" r="1.4" fill="#aef0ff" opacity="0.8" />
            </g>
            {/* sparkles around the flask */}
            <g fill="#fff7a0" opacity="0.9">
              <circle cx={cx + 90} cy={groundY - 40} r="1.6" />
              <circle cx={cx + 115} cy={groundY - 50} r="1.4" />
              <circle cx={cx + 110} cy={groundY - 35} r="1" />
            </g>
          </g>
        )}
        {action === 'rest' && (
          <g>
            {/* simple resting log + pile of leaves */}
            <ellipse cx={cx + 80} cy={groundY + 6} rx="26" ry="6" fill="#5a3a18" />
            <ellipse cx={cx + 80} cy={groundY + 4} rx="22" ry="4" fill="#7a5828" />
            <text x={cx + 80} y={groundY - 14} textAnchor="middle" fontSize="14" fill="#5a4a36" opacity="0.6">z</text>
            <text x={cx + 86} y={groundY - 20} textAnchor="middle" fontSize="10" fill="#5a4a36" opacity="0.6">z</text>
          </g>
        )}

        {/* Virus particles floating around — denser at higher infection;
            paler/fewer if cure has been brewed */}
        <g>
          {Array.from({ length: cureBrewed ? 3 : Math.max(4, Math.floor(infection / 8)) }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2 + Date.now() / 1500;
            const r = 50 + Math.sin(Date.now() / 500 + i) * 12;
            const x = cx + Math.cos(a) * r;
            const y = groundY - 50 + Math.sin(a) * 30;
            return (
              <g key={i} transform={`translate(${x} ${y})`} opacity={cureBrewed ? 0.3 : 0.7}>
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
        {sweat && !cureBrewed && (
          <g fill="#aef0ff" opacity="0.85">
            <ellipse cx={cx - 30} cy={groundY - 80} rx="2" ry="4" />
            <ellipse cx={cx + 35} cy={groundY - 70} rx="2.5" ry="5" />
          </g>
        )}

        {/* REGENERATION PULSE — pink heart ring + sparkles when the daily
            regen tick fires. Visible "trait did its thing" moment. */}
        {regenFlash && (
          <g style={{ transformOrigin: `${cx}px ${groundY - 40}px` }} className="bob-breathe">
            <ellipse cx={cx} cy={groundY - 40} rx="55" ry="35"
              fill="none" stroke="#ff7ab0" strokeWidth="3" opacity="0.65" strokeDasharray="4 4" />
            <text x={cx} y={groundY - 60} fontSize="28" textAnchor="middle"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}>💗</text>
            <text x={cx - 38} y={groundY - 30} fontSize="16">✨</text>
            <text x={cx + 36} y={groundY - 32} fontSize="16">✨</text>
            <text x={cx} y={groundY - 18} fontSize="10" textAnchor="middle"
              fill="#ff7ab0" fontWeight="700">regenerate!</text>
          </g>
        )}

        {/* PLAYER CREATURE */}
        <g
          style={{
            transition: 'transform 0.2s ease-out',
            transform: tremor && !cureBrewed ? `translate(${(Math.random() - 0.5) * 4}px, 0)` : 'translate(0,0)',
            opacity: dying && !cureBrewed ? 0.55 : 1,
          }}
        >
          {hasBespokeShape(creature) ? (
            <BespokeInScene
              creature={creature}
              x={cx - 50}
              y={groundY - 70}
              width={100}
              height={80}
              animate={action === 'food' || action === 'water' || action === 'herbs' ? 'run' : 'breathe'}
            />
          ) : (
            <CreatureBody
              creature={creature}
              cx={cx}
              footY={groundY}
              scale={0.32}
              animate={action === 'food' || action === 'water' || action === 'herbs' ? 'run' : 'breathe'}
            />
          )}
        </g>

        {/* HUD — 3 bars stacked: infection + hydration + food */}
        <rect x="6" y="6" width="240" height="62" fill="rgba(255,255,255,0.92)" rx="4" stroke="#bbb" />
        <text x="14" y="18" fontSize="10" fill="#333">🦠 infection</text>
        <rect x="86" y="11" width="156" height="8" fill="#eee" stroke="#999" />
        <rect x="86" y="11" width={Math.max(0, 156 * (infection / 100))} height="8"
          fill={infection < 30 ? '#5cc46a' : infection < 70 ? '#e0a040' : '#c44'} />
        <text x="14" y="36" fontSize="10" fill="#333">💧 hydration</text>
        <rect x="86" y="29" width="156" height="8" fill="#eee" stroke="#999" />
        <rect x="86" y="29" width={Math.max(0, 156 * (hydration / 100))} height="8"
          fill={hydration > 30 ? '#5cc46a' : '#c44'} />
        <text x="14" y="54" fontSize="10" fill="#333">🍖 food</text>
        <rect x="86" y="47" width="156" height="8" fill="#eee" stroke="#999" />
        <rect x="86" y="47" width={Math.max(0, 156 * (food / 100))} height="8"
          fill={food > 30 ? '#5cc46a' : '#c44'} />

        <rect x={W - 154} y="6" width="148" height="22" fill="rgba(255,255,255,0.9)" rx="4" stroke="#bbb" />
        <text x={W - 8} y="22" textAnchor="end" fontSize="11" fill="#333">
          Day {Math.floor(day)} / {goalDays}
        </text>

        {/* Mini-log */}
        <g transform={`translate(${W - 240} ${groundY - 80})`}>
          {log.slice(-4).map((line, i) => (
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
            immunity: {immuneBase.toFixed(1)} ({creature.warmBlooded ? 'warm' : 'cold'} blood)
            · foraging: {foragingSkill.toFixed(1)} (sensors+brain)
          </small>
        )}
      </div>
    </div>
  );
}
