import { useEffect, useMemo, useRef, useState } from 'react';
import type { CreatureStats } from '../physics';
import type { Creature } from '../types';
import { CreatureBody } from './CreatureSVG';
import { BespokeInScene, hasBespokeShape, isMammalShape, SHAPE_EMOJI, NICHE_BY_SHAPE, type Niche } from './dexShapes';
import { ArenaComboBadge } from './ArenaComboBadge';

// While no predator is present, parent decides what to do.
export type NestActivity = 'watch' | 'forage' | 'drink' | 'camo';
// When a predator is approaching, parent picks a defense stance.
export type NestStance = 'block' | 'attack' | 'bluff';

export type NestOutcome = {
  won: boolean;
  reason: 'defended' | 'eggs-stolen' | 'collapsed';
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
const TICK_MS = 50;
const MAX_EGG_LOSS = 3;
const TOTAL_WAVES_BASE = 5;

interface Predator {
  emoji: string;
  name: string;
  speed: number;       // px/sec approaching the nest
  threat: number;      // base difficulty of repelling them
  perception: number;  // how well they spot camouflaged nests (1.0 = baseline)
}

const PREDATOR_POOLS: Record<Niche, Predator[]> = {
  apex: [
    { emoji: '🐆', name: 'Leopard',       speed: 95,  threat: 2.5, perception: 1.4 },
    { emoji: '🐍', name: 'Constrictor',   speed: 30,  threat: 2.0, perception: 1.0 },
    { emoji: '🐊', name: 'Crocodile',     speed: 70,  threat: 3.0, perception: 1.3 },
    { emoji: '🦅', name: 'Vulture',       speed: 130, threat: 1.0, perception: 1.6 },
    { emoji: '🦁', name: 'Rival apex',    speed: 100, threat: 4.0, perception: 1.4 },
  ],
  medium: [
    { emoji: '🦅', name: 'Eagle',         speed: 115, threat: 2.5, perception: 1.6 },
    { emoji: '🐺', name: 'Wolf',          speed: 95,  threat: 3.5, perception: 1.4 },
    { emoji: '🐍', name: 'Snake',         speed: 45,  threat: 1.5, perception: 1.0 },
    { emoji: '🐻', name: 'Bear',          speed: 70,  threat: 4.0, perception: 1.2 },
    { emoji: '🦊', name: 'Rival fox',     speed: 85,  threat: 2.0, perception: 1.3 },
  ],
  small: [
    { emoji: '🐍', name: 'Snake',         speed: 45,  threat: 1.0, perception: 1.0 },
    { emoji: '🦊', name: 'Fox',           speed: 80,  threat: 1.5, perception: 1.3 },
    { emoji: '🦅', name: 'Hawk',          speed: 110, threat: 2.0, perception: 1.6 },
    { emoji: '🦉', name: 'Owl',           speed: 90,  threat: 1.8, perception: 1.7 },
    { emoji: '🐈', name: 'Feral cat',     speed: 75,  threat: 1.5, perception: 1.4 },
  ],
  ungulate: [
    { emoji: '🦁', name: 'Lion pride',    speed: 100, threat: 3.5, perception: 1.4 },
    { emoji: '🐺', name: 'Wolf pack',     speed: 90,  threat: 3.0, perception: 1.5 },
    { emoji: '🐆', name: 'Cheetah',       speed: 140, threat: 2.5, perception: 1.6 },
    { emoji: '🐊', name: 'River croc',    speed: 50,  threat: 3.5, perception: 1.2 },
    { emoji: '🐕', name: 'Hyena clan',    speed: 85,  threat: 2.8, perception: 1.3 },
  ],
  aquatic: [
    { emoji: '🦈', name: 'Shark',         speed: 100, threat: 3.5, perception: 1.5 },
    { emoji: '🐳', name: 'Orca pod',      speed: 110, threat: 4.5, perception: 1.5 },
    { emoji: '🐙', name: 'Giant octopus', speed: 50,  threat: 2.5, perception: 1.3 },
    { emoji: '🪼', name: 'Box jelly',     speed: 30,  threat: 2.0, perception: 0.8 },
    { emoji: '🛟', name: 'Trawler net',   speed: 60,  threat: 3.5, perception: 1.0 },
  ],
  avian: [
    { emoji: '🐈', name: 'Cat',           speed: 80,  threat: 2.0, perception: 1.4 },
    { emoji: '🐍', name: 'Tree snake',    speed: 45,  threat: 1.5, perception: 1.1 },
    { emoji: '🦅', name: 'Bigger raptor', speed: 130, threat: 3.0, perception: 1.7 },
    { emoji: '🐀', name: 'Egg rat',       speed: 70,  threat: 1.2, perception: 0.9 },
    { emoji: '🦊', name: 'Fox',           speed: 85,  threat: 2.0, perception: 1.4 },
  ],
  reptile: [
    { emoji: '🦅', name: 'Hawk',          speed: 115, threat: 2.5, perception: 1.6 },
    { emoji: '🦡', name: 'Honey badger',  speed: 95,  threat: 3.2, perception: 1.4 },
    { emoji: '🐗', name: 'Wild boar',     speed: 80,  threat: 2.5, perception: 1.0 },
    { emoji: '🐍', name: 'Bigger snake',  speed: 45,  threat: 2.8, perception: 1.1 },
    { emoji: '🦦', name: 'Mongoose',      speed: 100, threat: 2.6, perception: 1.5 },
  ],
  arctic: [
    { emoji: '🐳', name: 'Orca',          speed: 110, threat: 4.5, perception: 1.5 },
    { emoji: '🦅', name: 'Skua',          speed: 110, threat: 2.0, perception: 1.6 },
    { emoji: '🦭', name: 'Leopard seal',  speed: 80,  threat: 3.5, perception: 1.4 },
    { emoji: '🐻‍❄️', name: 'Polar bear',    speed: 70,  threat: 4.0, perception: 1.2 },
    { emoji: '🦊', name: 'Arctic fox',    speed: 90,  threat: 1.8, perception: 1.3 },
  ],
  dinosaur: [
    { emoji: '🦖', name: 'Tyrannosaur',   speed: 80,  threat: 4.5, perception: 1.4 },
    { emoji: '🦖', name: 'Raptor pack',   speed: 120, threat: 3.5, perception: 1.6 },
    { emoji: '🦕', name: 'Sauropod tail', speed: 40,  threat: 2.5, perception: 0.8 },
    { emoji: '🦅', name: 'Pterosaur',     speed: 130, threat: 2.8, perception: 1.6 },
    { emoji: '☄️', name: 'Bolide',        speed: 200, threat: 5.0, perception: 2.0 },
  ],
};

// Hybrid predators — when the defender has hybrids, attract bigger
// hybrid-tier threats. Each one mimics a chimeric apex predator.
const HYBRID_PREDATORS: Predator[] = [
  { emoji: '🐉', name: 'Dragon-wolf hybrid', speed: 110, threat: 5.0, perception: 1.7 },
  { emoji: '🦇', name: 'Vampire raptor',     speed: 130, threat: 4.5, perception: 1.8 },
  { emoji: '👹', name: 'Stone-fang shadow',  speed: 90,  threat: 4.8, perception: 1.5 },
];

function getPredatorRoster(creature: Creature): Predator[] {
  const niche = NICHE_BY_SHAPE[creature.shape ?? ''] ?? 'medium';
  let predators = [...PREDATOR_POOLS[niche]];
  // Hybrid defenders draw the attention of hybrid-tier predators AND
  // boost every threat's stats (they hunt smarter prey more aggressively).
  const hybridCount = creature.hybrids.length;
  if (hybridCount > 0) {
    predators = predators.map((p) => ({
      ...p,
      threat: p.threat + hybridCount * 0.3,
      perception: p.perception + hybridCount * 0.08,
    }));
    predators.push(...HYBRID_PREDATORS.slice(0, Math.min(2, hybridCount)));
  }
  return predators;
}

const WAVE_GAP_S = 9;
// Cooperative defense — neighbors / allies. Costs immediate food +
// energy AND adds a persistent drain (you'll have to help them back).
const MAX_HELP = 2;
const HELP_COST_ENERGY = 10;
const HELP_COST_HYDRATION = 25;
const HELP_DEBT_DRAIN = 0.45;  // extra energy per second, per outstanding favor

interface ThreatState {
  index: number;
  x: number;
  resolved: boolean;
  outcome?: 'defended' | 'stolen' | 'fooled';
  flashUntil?: number;
}

export function NestingArena({ creature, stats, generation = 1, onFinish }: Props) {
  const totalWaves = TOTAL_WAVES_BASE + Math.floor((generation - 1) / 2);
  // Species-aware predator roster. Defender's natural enemies — bigger
  // and more numerous when the defender has hybrids (attracts hybrid
  // predators in return).
  const waves = useMemo(() => getPredatorRoster(creature), [creature.shape, creature.hybrids]);

  // Defense stance state (used when threat present)
  const [stance, setStance] = useState<NestStance>('block');
  const stanceRef = useRef<NestStance>('block');
  // Activity state (used when no threat)
  const [activity, setActivity] = useState<NestActivity>('watch');
  const activityRef = useRef<NestActivity>('watch');

  // ─── Stats derived from creature ─────────────────────────────────────
  const massKg = stats.massKg;
  const blockBase = creature.defenseTier + (massKg > 50 ? 1.5 : massKg > 10 ? 0.7 : 0)
    + (creature.hybrids.includes('stoneskin') ? 1.5 : 0)
    + (creature.hybrids.includes('thick-fur') ? 0.4 : 0);
  const attackBase = creature.legTier * 0.7 + Math.min(3, stats.topSpeedKmh / 25)
    + (creature.hybrids.includes('venom') ? 1.5 : 0)
    + (creature.hybrids.includes('electric') ? 1.5 : 0)
    + (creature.hybrids.includes('firebreath') ? 2 : 0);
  // Mass scaling for camouflage/mimicry — small things hide easier
  // than big things (an elephant in a bush is still an elephant). At
  // <50kg: full effect. At 500kg: 60%. At 5000kg: 20%. Never zero —
  // a camouflaged elephant still does SOMETHING.
  const concealMassFactor = massKg <= 50
    ? 1.0
    : Math.max(0.2, 1 - Math.log10(massKg / 50) * 0.4);
  const bluffBase = (massKg > 100 ? 2 : massKg > 30 ? 1.2 : 0.3)
    + creature.brainTier * 0.4
    + (creature.hybrids.includes('camouflage') ? 0.8 * concealMassFactor : 0)
    + (creature.hybrids.includes('mimicry') ? 1.8 * concealMassFactor : 0)
    // Wings make the creature look TWICE its size when spread — even
    // a heavy creature that can't actually fly bluffs better with wings.
    + (creature.hybrids.includes('wings') ? 0.9 : 0)
    + (creature.bodyPlan === 'bird' ? 0.5 : 0);
  // Foraging effectiveness (food/water find rate)
  const foragingSkill = 0.6 + creature.sensorTier * 0.15 + creature.brainTier * 0.1
    + (creature.hybrids.includes('symbiosis') ? 0.2 : 0)
    + (creature.hybrids.includes('photosynthesis') ? 0.4 : 0);
  // Innate camo bonus (the camouflage hybrid starts you with more nest
  // concealment). Mass-scaled — a tiny gecko vanishes; a giraffe doesn't.
  const innateCamoBonus = Math.round(
    (creature.hybrids.includes('camouflage') ? 25 : creature.hybrids.includes('mimicry') ? 15 : 0) * concealMassFactor
  );

  // ─── Resources ──────────────────────────────────────────────────────
  const [eggs, setEggs] = useState(5);
  const [energy, setEnergy] = useState(100);
  const [hydration, setHydration] = useState(80);
  const [camo, setCamo] = useState(innateCamoBonus);
  const [waveIdx, setWaveIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [threat, setThreat] = useState<ThreatState | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const eggsRef = useRef(5);
  const energyRef = useRef(100);
  const hydrationRef = useRef(80);
  const camoRef = useRef(innateCamoBonus);
  const waveIdxRef = useRef(0);
  const elapsedRef = useRef(0);
  const threatRef = useRef<ThreatState | null>(null);
  const timerRef = useRef<number | null>(null);

  // ─── Cooperative defense — call neighbors for help ─────────────────
  // Costs food + energy NOW, and adds a persistent drain (the favor you
  // owe: you'll have to help them defend later, so your forage time
  // splits between two nests).
  const [helpsUsed, setHelpsUsed] = useState(0);
  const helpsUsedRef = useRef(0);
  const [helpDebt, setHelpDebt] = useState(0);
  const helpDebtRef = useRef(0);
  // Tracks when the "allies arrive" FX should be visible (post-help call).
  const [helpFlashUntil, setHelpFlashUntil] = useState(0);

  function reset() {
    eggsRef.current = 5;
    energyRef.current = 100;
    hydrationRef.current = 80;
    camoRef.current = innateCamoBonus;
    waveIdxRef.current = 0;
    elapsedRef.current = 0;
    threatRef.current = null;
    activityRef.current = 'watch';
    stanceRef.current = 'block';
    setEggs(5);
    setEnergy(100);
    setHydration(80);
    setCamo(innateCamoBonus);
    setWaveIdx(0);
    setElapsed(0);
    setThreat(null);
    setActivity('watch');
    setStance('block');
    setLog([]);
    helpsUsedRef.current = 0;
    helpDebtRef.current = 0;
    setHelpsUsed(0);
    setHelpDebt(0);
    setHelpFlashUntil(0);
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
  function pickActivity(a: NestActivity) {
    activityRef.current = a;
    setActivity(a);
  }

  function pushLog(msg: string) {
    setLog((prev) => [...prev.slice(-4), msg]);
  }

  // Symbiosis hybrid = pre-built alliance network. Help costs less,
  // you can call MORE times, and the favor-debt drain is reduced.
  const hasSymbiosis = creature.hybrids.includes('symbiosis');
  const maxHelp = hasSymbiosis ? 4 : MAX_HELP;
  const helpEnergyCost = hasSymbiosis ? Math.round(HELP_COST_ENERGY * 0.5) : HELP_COST_ENERGY;
  const helpHydrationCost = hasSymbiosis ? Math.round(HELP_COST_HYDRATION * 0.5) : HELP_COST_HYDRATION;
  const helpDebtRate = hasSymbiosis ? HELP_DEBT_DRAIN * 0.55 : HELP_DEBT_DRAIN;

  // Call neighbors for cooperative defense. Auto-resolves the current
  // wave as defended, but at a real cost: food + energy now, plus a
  // permanent drain (favor owed). Capped so it can't be spammed.
  function callForHelp() {
    if (!threatRef.current || threatRef.current.resolved) return;
    if (helpsUsedRef.current >= maxHelp) return;
    if (energyRef.current < helpEnergyCost || hydrationRef.current < helpHydrationCost) return;
    const t = threatRef.current;
    const pred = waves[t.index % waves.length];
    energyRef.current -= helpEnergyCost;
    hydrationRef.current -= helpHydrationCost;
    helpDebtRef.current += 1;
    helpsUsedRef.current += 1;
    setEnergy(energyRef.current);
    setHydration(hydrationRef.current);
    setHelpDebt(helpDebtRef.current);
    setHelpsUsed(helpsUsedRef.current);
    t.resolved = true;
    t.outcome = 'defended';
    t.flashUntil = elapsedRef.current + 0.6;
    setThreat({ ...t });
    setHelpFlashUntil(elapsedRef.current + 1.2);
    const suffix = hasSymbiosis ? ' (symbiosis discount)' : '';
    pushLog(`🤝 Allies repelled ${pred.emoji} ${pred.name} (-${helpEnergyCost} energy, -${helpHydrationCost} food, owe favor)${suffix}`);
  }

  function resolveEncounter(t: ThreatState): 'defended' | 'stolen' | 'fooled' {
    const pred = waves[t.index % waves.length];
    const tierBonus = Math.floor(t.index / waves.length) * 0.5;
    const threatPower = pred.threat + tierBonus;

    // CAMOUFLAGE: chance predator never finds the nest at all
    const camoEffective = Math.max(0, camoRef.current - (pred.perception - 1) * 25);
    if (Math.random() < camoEffective / 100) {
      return 'fooled';
    }

    // Energy modifier — low energy = weaker defense
    const energyMod = Math.max(0.3, energyRef.current / 100);
    const stancePower =
      (stanceRef.current === 'block' ? blockBase :
       stanceRef.current === 'attack' ? attackBase :
       bluffBase) * energyMod;
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

      // ─── Activity ticks (only when no current threat) ───────────
      if (!threatRef.current) {
        const act = activityRef.current;
        // Idle drain — watching costs less than running around. Each
        // outstanding favor adds a constant extra drain (you're spending
        // time helping the neighbors who helped you).
        const debtDrain = helpDebtRef.current * helpDebtRate;
        const baseEnergyDrain = (act === 'watch' ? 0.3 : 0.6) + debtDrain;
        const baseHydroDrain = act === 'watch' ? 0.3 : 0.6;
        energyRef.current = Math.max(0, energyRef.current - baseEnergyDrain * dt);
        hydrationRef.current = Math.max(0, hydrationRef.current - baseHydroDrain * dt);

        // Activity gains
        if (act === 'forage') {
          energyRef.current = Math.min(100, energyRef.current + 6 * dt * foragingSkill);
        } else if (act === 'drink') {
          hydrationRef.current = Math.min(100, hydrationRef.current + 8 * dt * foragingSkill);
        } else if (act === 'camo') {
          camoRef.current = Math.min(75, camoRef.current + 3 * dt * foragingSkill);
        }

        setEnergy(energyRef.current);
        setHydration(hydrationRef.current);
        setCamo(camoRef.current);
      }

      // ─── Spawn next wave if it's time ────────────────────────────
      if (!threatRef.current && waveIdxRef.current < totalWaves) {
        const dueAt = waveIdxRef.current * WAVE_GAP_S + 4;
        if (elapsedRef.current >= dueAt) {
          const newThreat: ThreatState = {
            index: waveIdxRef.current,
            x: W + 20,
            resolved: false,
          };
          threatRef.current = newThreat;
          setThreat({ ...newThreat });
          const pred = waves[waveIdxRef.current % waves.length];
          pushLog(`Wave ${waveIdxRef.current + 1}: ${pred.emoji} ${pred.name} approaches`);
          waveIdxRef.current += 1;
          setWaveIdx(waveIdxRef.current);
        }
      }

      // ─── Update active threat ────────────────────────────────────
      if (threatRef.current) {
        const t = threatRef.current;
        const pred = waves[t.index % waves.length];
        if (!t.resolved) {
          t.x -= pred.speed * dt;
          if (t.x <= 200) {
            const outcome = resolveEncounter(t);
            t.resolved = true;
            t.outcome = outcome;
            t.flashUntil = elapsedRef.current + 0.6;
            if (outcome === 'fooled') {
              // Camo worked — predator never engages. Costs some camo (disturbed)
              camoRef.current = Math.max(0, camoRef.current - 8);
              setCamo(camoRef.current);
              pushLog(`🍃 ${pred.emoji} walked right past — nest hidden!`);
            } else if (outcome === 'stolen') {
              eggsRef.current -= 1;
              setEggs(eggsRef.current);
              // Defense still cost energy even if you lost
              const cost = stanceRef.current === 'attack' ? 18 : stanceRef.current === 'block' ? 12 : 6;
              energyRef.current = Math.max(0, energyRef.current - cost);
              setEnergy(energyRef.current);
              pushLog(`💔 ${pred.emoji} stole a ${isMammalShape(creature.shape) ? 'cub' : 'egg'}! (${eggsRef.current} left, -${cost} energy)`);
            } else {
              const cost = stanceRef.current === 'attack' ? 15 : stanceRef.current === 'block' ? 10 : 5;
              energyRef.current = Math.max(0, energyRef.current - cost);
              setEnergy(energyRef.current);
              // List the special traits that visibly fired during this engagement
              const procEmojis: string[] = [];
              if (stanceRef.current === 'attack') {
                if (creature.hybrids.includes('firebreath')) procEmojis.push('🔥');
                if (creature.hybrids.includes('electric')) procEmojis.push('⚡');
                if (creature.hybrids.includes('venom')) procEmojis.push('🐍');
              } else if (stanceRef.current === 'block') {
                if (creature.hybrids.includes('stoneskin')) procEmojis.push('🪨');
                if (creature.hybrids.includes('thick-fur')) procEmojis.push('🌬');
                if (creature.hybrids.includes('regeneration')) procEmojis.push('💗');
              } else {
                if (creature.hybrids.includes('mimicry')) procEmojis.push('🎭');
                if (creature.hybrids.includes('wings')) procEmojis.push('🪽');
                if (creature.hybrids.includes('dragon')) procEmojis.push('🐉');
                if (creature.hybrids.includes('bioluminescence')) procEmojis.push('✨');
              }
              const procSuffix = procEmojis.length > 0 ? ` ${procEmojis.join('')}` : '';
              pushLog(`✅ ${pred.emoji} repelled by ${stanceRef.current}!${procSuffix} (-${cost} energy)`);
            }
          }
          setThreat({ ...t });
        } else {
          // After encounter — predator leaves
          let flee: number;
          if (t.outcome === 'fooled') flee = -1;          // walks past, exits left
          else if (t.outcome === 'defended') flee = +1;   // retreats right
          else flee = -1;                                  // ran off left with egg
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

      // ─── End conditions ──────────────────────────────────────────
      if (energyRef.current <= 0 && !threatRef.current) {
        stop({ won: false, reason: 'collapsed', eggsLost: 5 - eggsRef.current, wavesSurvived: waveIdxRef.current });
        return;
      }
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

  const predator = threat ? waves[threat.index % waves.length] : null;
  const engagementFlash = threat?.flashUntil !== undefined && elapsed < threat.flashUntil;
  const threatPresent = threat !== null && !threat.resolved && threat.x > 200;

  // Mammals have live young (cubs/pups), egg-layers have eggs. The biology
  // matters — swap labels and visuals so a wolf isn't laying eggs.
  const isMammal = isMammalShape(creature.shape);
  const speciesEmoji = SHAPE_EMOJI[creature.shape ?? ''] ?? '🐾';
  const youngEmoji = isMammal ? speciesEmoji : '🥚';
  const youngSiteLabel = isMammal ? 'DEN' : 'NEST';
  const clutchWord = isMammal ? 'litter' : 'clutch';
  const siteTitle = isMammal ? 'The Den' : 'The Nest';

  return (
    <div className="arena">
      <h2>{siteTitle} — {youngEmoji} Defend the {clutchWord} <small className="arena-env">· {totalWaves} waves</small></h2>
      <ArenaComboBadge creature={creature} arena="nest" />
      <p className="arena-help">
        Your natural enemies approach in waves — {creature.hybrids.length > 0 ? (
          <>hybrid creatures attract bigger threats (including other hybrids).</>
        ) : (
          <>each species faces different predators.</>
        )} Between attacks, <strong>forage</strong> for energy, <strong>drink</strong> water,
        or <strong>hide</strong> the nest. When overwhelmed, <strong>call for help</strong> —
        allies will repel a wave, but you'll owe them food + energy AND a permanent drain
        (you'll need to help them back).
      </p>

      {/* Picker switches based on whether a threat is approaching */}
      {threatPresent ? (
        <>
          <div className="drought-activity-label">
            <strong>{predator?.emoji} {predator?.name} incoming — defend!</strong>
          </div>
          <div className="prey-tabs">
            {([
              { id: 'block' as const, emoji: '🛡️', label: 'Block', sub: '-10 energy · tank',
                title: 'Stand firm. Best with armor + heavy body.' },
              { id: 'attack' as const, emoji: '⚔️', label: 'Attack', sub: '-15 energy · charge',
                title: 'Charge the predator. Best with speed or venom/electric/fire.' },
              { id: 'bluff' as const, emoji: '😤', label: 'Bluff', sub: '-5 energy · cheap',
                title: 'Threaten with display. Cheapest in energy. Best with big body + mimicry.' },
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
            {/* CALL FOR HELP — auto-defend at cost. Only shown while a wave
                is actively present, can only be used MAX_HELP times. */}
            <button
              type="button"
              className="prey-tab"
              onClick={callForHelp}
              disabled={
                helpsUsed >= maxHelp ||
                energy < helpEnergyCost ||
                hydration < helpHydrationCost
              }
              title={`Allies repel this wave instantly. Costs ${helpEnergyCost} energy + ${helpHydrationCost} food, and adds a permanent +${helpDebtRate.toFixed(2)}/s energy drain (favor owed). Max ${maxHelp} uses.${hasSymbiosis ? ' Symbiosis hybrid: discounted costs + more uses.' : ''}`}
            >
              <span className="prey-emoji">🤝</span>
              <span className="prey-name">
                Call for help
                <small>{helpsUsed}/{maxHelp} used{hasSymbiosis ? ' · symbiosis discount' : ' · costs favor'}</small>
              </span>
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="drought-activity-label">
            <strong>Between waves — what are you doing?</strong> <small>(switch any time)</small>
          </div>
          <div className="prey-tabs">
            {([
              { id: 'watch' as const, emoji: '👁️', label: 'Watch', sub: 'low drain',
                title: 'Stay alert by the nest. Lowest energy drain.' },
              { id: 'forage' as const, emoji: '🌿', label: 'Forage', sub: '+energy',
                title: 'Search for food. Refills energy. Costs more drain too — net gain.' },
              { id: 'drink' as const, emoji: '💧', label: 'Drink', sub: '+hydration',
                title: 'Find water. Refills hydration.' },
              { id: 'camo' as const, emoji: '🍃', label: 'Camouflage', sub: '+hide %',
                title: 'Cover the nest with leaves and dirt. Higher camo = chance predators walk right past.' },
            ]).map((a) => (
              <button
                key={a.id}
                type="button"
                className={`prey-tab${activity === a.id ? ' active' : ''}`}
                onClick={() => pickActivity(a.id)}
                title={a.title}
              >
                <span className="prey-emoji">{a.emoji}</span>
                <span className="prey-name">{a.label}<small> {a.sub}</small></span>
              </button>
            ))}
          </div>
        </>
      )}

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

        {/* distant trees */}
        <g opacity="0.5">
          {[20, 380, 470].map((tx, i) => (
            <g key={i} transform={`translate(${tx} ${GROUND_Y - 4})`}>
              <rect x="-2" y="-26" width="4" height="26" fill="#3a2418" />
              <ellipse cx="0" cy="-30" rx="14" ry="10" fill="#5a7838" />
            </g>
          ))}
        </g>

        {/* Action-specific scene props (when no threat) */}
        {!threatPresent && activity === 'forage' && (
          <g transform={`translate(${W * 0.55} ${GROUND_Y - 4})`}>
            <ellipse cx="0" cy="0" rx="26" ry="14" fill="#3a5828" />
            <ellipse cx="6" cy="-6" rx="16" ry="9" fill="#5a7838" />
            <g fill="#a83040">
              {[-12, -4, 4, 12, 0].map((x, i) => (
                <circle key={i} cx={x} cy={-2 + (i % 2) * 4} r="2" />
              ))}
            </g>
          </g>
        )}
        {!threatPresent && activity === 'drink' && (
          <g transform={`translate(${W * 0.55} ${GROUND_Y + 4})`}>
            <ellipse cx="0" cy="0" rx="38" ry="6" fill="#3a85b8" opacity="0.85" />
            <ellipse cx="0" cy="-2" rx="32" ry="4" fill="#74c4dc" opacity="0.7" />
          </g>
        )}
        {!threatPresent && activity === 'camo' && (
          <g>
            {/* leaves piling around the nest */}
            <g fill="#5a7838" opacity="0.7">
              <ellipse cx={NEST_X - 14} cy={NEST_Y + 4} rx="8" ry="3" />
              <ellipse cx={NEST_X + 14} cy={NEST_Y + 4} rx="8" ry="3" />
              <ellipse cx={NEST_X - 22} cy={NEST_Y - 2} rx="6" ry="3" />
              <ellipse cx={NEST_X + 22} cy={NEST_Y - 2} rx="6" ry="3" />
            </g>
          </g>
        )}

        {/* NEST */}
        <g transform={`translate(${NEST_X} ${NEST_Y})`} opacity={camo > 40 ? 0.55 + (1 - camo / 100) * 0.45 : 1}>
          {/* nest base */}
          <ellipse cx="0" cy="6" rx="44" ry="8" fill="#5a3a18" />
          <ellipse cx="0" cy="2" rx="40" ry="10" fill="#7a5828" />
          {/* twigs */}
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
          {/* eggs / cubs — eggs for egg-layers, mini species emoji for mammals */}
          {Array.from({ length: 5 }).map((_, i) => {
            const lost = i >= eggs;
            const x = -22 + i * 11;
            if (isMammal) {
              // tiny cub emoji at the nest spot — fades out when stolen
              return (
                <text
                  key={i}
                  x={x}
                  y="4"
                  textAnchor="middle"
                  fontSize="14"
                  opacity={lost ? 0.18 : 1}
                  style={lost ? { filter: 'grayscale(1)' } : undefined}
                >
                  {speciesEmoji}
                </text>
              );
            }
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
          {/* leaves overlay when heavily camouflaged */}
          {camo > 25 && (
            <g fill="#3a5828" opacity={Math.min(0.7, camo / 80)}>
              <ellipse cx="-15" cy="-4" rx="10" ry="5" />
              <ellipse cx="12" cy="-3" rx="9" ry="4" />
              <ellipse cx="-2" cy="-8" rx="7" ry="4" />
              <ellipse cx="22" cy="-5" rx="6" ry="3" />
            </g>
          )}
          <text x="0" y={-22} textAnchor="middle" fontSize="10" fontWeight="700" fill="#3a2010">
            {youngSiteLabel} · {youngEmoji} {eggs}/5 · 🍃 {Math.round(camo)}%
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
            {threat.resolved && threat.outcome === 'fooled' && (
              <text x="0" y="-32" textAnchor="middle" fontSize="12">❓</text>
            )}
            {threat.resolved && threat.outcome === 'stolen' && (
              <text x="-18" y="-8" fontSize="14">{youngEmoji}</text>
            )}
          </g>
        )}

        {/* Engagement flash — base stance icon */}
        {engagementFlash && (
          <text x={W * 0.45} y={GROUND_Y - 50} textAnchor="middle" fontSize="38">
            {threat?.outcome === 'fooled' ? '🍃' : stance === 'attack' ? '⚔️' : stance === 'bluff' ? '😤' : '🛡️'}
          </text>
        )}

        {/* ALLIES ARRIVE FX — when "Call for help" was used, show a flock
            of friendly emoji rushing in to handle the wave. Different
            visual if you have the symbiosis trait (more allies). */}
        {elapsed < helpFlashUntil && (
          <g>
            {(hasSymbiosis ? ['🐦', '🐺', '🐂', '🐝', '🦊'] : ['🐦', '🐺', '🦊']).map((e, i) => {
              const startX = W + 40 + i * 30;
              const endX = W * 0.5 + (i - 2) * 22;
              const progress = Math.min(1, 1 - (helpFlashUntil - elapsed) / 1.2);
              const x = startX + (endX - startX) * progress;
              const y = GROUND_Y - 30 - (i % 2) * 12 + Math.sin(progress * Math.PI) * -8;
              return (
                <text key={i} x={x} y={y} fontSize="22"
                  style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}>
                  {e}
                </text>
              );
            })}
            <text x={W * 0.5} y={GROUND_Y - 90} textAnchor="middle" fontSize="11"
              fill="#3a2010" fontWeight="700">
              🤝 allies arrive!{hasSymbiosis ? ' (symbiosis network)' : ''}
            </text>
          </g>
        )}

        {/* HYBRID PROC FX — fires alongside the stance icon when an engagement
            happens, showing which special trait fired. Position varies so
            multi-hybrid creatures show all their procs visibly. */}
        {engagementFlash && threat?.outcome !== 'fooled' && (() => {
          const procs: { emoji: string; x: number; y: number; label: string }[] = [];
          const baseX = W * 0.32 + 40; // just right of the creature
          const baseY = GROUND_Y - 60;
          // Attack stance — offensive traits fire
          if (stance === 'attack') {
            if (creature.hybrids.includes('firebreath')) procs.push({ emoji: '🔥', x: baseX, y: baseY, label: 'firebreath!' });
            if (creature.hybrids.includes('electric')) procs.push({ emoji: '⚡', x: baseX + 16, y: baseY - 14, label: 'electric!' });
            if (creature.hybrids.includes('venom')) procs.push({ emoji: '🐍', x: baseX - 14, y: baseY + 4, label: 'venom!' });
          }
          // Block stance — defensive traits fire
          if (stance === 'block') {
            if (creature.hybrids.includes('stoneskin')) procs.push({ emoji: '🪨', x: baseX, y: baseY, label: 'stoneskin!' });
            if (creature.hybrids.includes('thick-fur')) procs.push({ emoji: '🌬', x: baseX + 16, y: baseY - 12, label: 'fur puff!' });
            if (creature.hybrids.includes('regeneration')) procs.push({ emoji: '💗', x: baseX - 14, y: baseY + 4, label: 'regen!' });
          }
          // Bluff stance — display traits fire
          if (stance === 'bluff') {
            if (creature.hybrids.includes('mimicry')) procs.push({ emoji: '🎭', x: baseX, y: baseY, label: 'mimic!' });
            if (creature.hybrids.includes('wings')) procs.push({ emoji: '🪽', x: baseX + 18, y: baseY - 12, label: 'wing spread!' });
            if (creature.hybrids.includes('dragon')) procs.push({ emoji: '🐉', x: baseX - 16, y: baseY + 4, label: 'dragon!' });
            if (creature.hybrids.includes('bioluminescence')) procs.push({ emoji: '✨', x: baseX, y: baseY + 18, label: 'dazzle!' });
          }
          return (
            <g style={{ transformOrigin: `${baseX}px ${baseY}px` }} className="bob-breathe">
              {procs.map((p, i) => (
                <g key={i}>
                  <text x={p.x} y={p.y} textAnchor="middle" fontSize="26"
                    style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}>
                    {p.emoji}
                  </text>
                  <text x={p.x} y={p.y + 16} textAnchor="middle" fontSize="9"
                    fill="#3a2010" fontWeight="700">
                    {p.label}
                  </text>
                </g>
              ))}
            </g>
          );
        })()}

        {/* PHOTOSYNTHESIS SUN BEAM — radiating yellow rays around the
            creature whenever it's NOT under threat (between waves, in
            the sun). Mirrors the Drought arena treatment. */}
        {creature.hybrids.includes('photosynthesis') && !threatPresent && (
          <g opacity="0.7" stroke="#ffd34a" strokeWidth="1.6" fill="none" strokeLinecap="round">
            {Array.from({ length: 10 }).map((_, i) => {
              const a = (i / 10) * Math.PI * 2;
              const cxp = W * 0.32;
              const cyp = GROUND_Y - 38;
              return (
                <line key={i}
                  x1={cxp + Math.cos(a) * 50}
                  y1={cyp + Math.sin(a) * 50}
                  x2={cxp + Math.cos(a) * 64}
                  y2={cyp + Math.sin(a) * 64}
                />
              );
            })}
          </g>
        )}

        {/* PLAYER CREATURE — visibly fades into the background when the
            camo bar is high. At camo=75% (cap), creature drops to 0.45
            opacity so the player sees their camo skill working. */}
        {(() => {
          const camoFade = Math.max(0.45, 1 - (camo / 75) * 0.55);
          // MIMICRY SHAPE-SHIFT — when bluffing with mimicry, the creature
          // briefly disguises as a scary predator emoji overlay.
          const isMimicBluff = engagementFlash && stance === 'bluff' && creature.hybrids.includes('mimicry');
          return (
            <g style={{ opacity: camoFade, transition: 'opacity 0.4s ease-out' }}>
              {hasBespokeShape(creature) ? (
                <BespokeInScene
                  creature={creature}
                  x={W * 0.32 - 50}
                  y={GROUND_Y - 70}
                  width={100}
                  height={80}
                  animate={(stance === 'attack' && threatPresent) || activity === 'forage' ? 'run' : 'breathe'}
                />
              ) : (
                <CreatureBody
                  creature={creature}
                  cx={W * 0.32}
                  footY={GROUND_Y}
                  scale={0.32}
                  animate={(stance === 'attack' && threatPresent) || activity === 'forage' ? 'run' : 'breathe'}
                />
              )}
              {isMimicBluff && (
                <text x={W * 0.32} y={GROUND_Y - 30} textAnchor="middle" fontSize="42"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>
                  🐍
                </text>
              )}
            </g>
          );
        })()}

        {/* HUD — three bars stacked: energy + hydration + camo */}
        <rect x="6" y="6" width="240" height="62" fill="rgba(255,255,255,0.92)" rx="4" stroke="#bbb" />
        <text x="14" y="18" fontSize="10" fill="#333">🔥 energy</text>
        <rect x="86" y="11" width="156" height="8" fill="#eee" stroke="#999" />
        <rect x="86" y="11" width={Math.max(0, 156 * (energy / 100))} height="8"
          fill={energy > 50 ? '#5cc46a' : energy > 20 ? '#e0a040' : '#c44'} />
        <text x="14" y="36" fontSize="10" fill="#333">💧 hydration</text>
        <rect x="86" y="29" width="156" height="8" fill="#eee" stroke="#999" />
        <rect x="86" y="29" width={Math.max(0, 156 * (hydration / 100))} height="8"
          fill={hydration > 30 ? '#5cc46a' : '#c44'} />
        <text x="14" y="54" fontSize="10" fill="#333">🍃 hidden</text>
        <rect x="86" y="47" width="156" height="8" fill="#eee" stroke="#999" />
        <rect x="86" y="47" width={Math.max(0, 156 * (camo / 75))} height="8" fill="#5a8a30" />

        <rect x={W - 184} y="6" width="178" height="22" fill="rgba(255,255,255,0.9)" rx="4" stroke="#bbb" />
        <text x={W - 8} y="22" textAnchor="end" fontSize="11" fill="#333">
          Wave {waveIdx}/{totalWaves} · {youngEmoji} {eggs}/5{helpDebt > 0 ? ` · 🤝 ${helpDebt} owed` : ''}
        </text>

        {/* mini-log */}
        <g transform={`translate(${W - 240} ${GROUND_Y - 80})`}>
          {log.slice(-4).map((line, i) => (
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
            · foraging: {foragingSkill.toFixed(1)}
            {innateCamoBonus > 0 && ` · innate camo: +${innateCamoBonus}%`}
          </small>
        )}
      </div>
    </div>
  );
}
