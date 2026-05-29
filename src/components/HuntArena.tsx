import { useState } from 'react';
import type { CreatureStats } from '../physics';
import { sizeToMass } from '../physics';
import type { Creature } from '../types';
import { CreatureBody } from './CreatureSVG';
import { BespokeInScene, hasBespokeShape, getNiche, type Niche } from './dexShapes';
import { comboEffects, getActiveCombo } from '../data/hybridCombos';

export type HuntOutcome = {
  won: boolean;
  reason: 'hidden' | 'outran' | 'tanked' | 'fought' | 'caught';
  env: 'savanna' | 'forest' | 'mountain' | 'desert' | 'ocean';
  strategy: 'hide' | 'run' | 'fight';
  difficulty?: HuntDifficultyId;
};

export type HuntDifficultyId = 'normal' | 'tough' | 'apex';

interface HuntDifficulty {
  id: HuntDifficultyId;
  label: string;
  emoji: string;
  perceptionMult: number;   // higher = predator sees you better
  biteMult: number;          // higher = predator hits harder
  rewardMult: number;
  description: string;
}

const HUNT_DIFFICULTIES: HuntDifficulty[] = [
  { id: 'normal', label: 'Normal',  emoji: '⭐',     perceptionMult: 1.0, biteMult: 1.0, rewardMult: 1.0, description: 'Standard predator. Beatable with the right strategy.' },
  { id: 'tough',  label: 'Tough',   emoji: '⭐⭐',    perceptionMult: 1.25, biteMult: 1.2, rewardMult: 1.5, description: 'Battle-hardened predator. +25% perception, +20% bite.' },
  { id: 'apex',   label: 'Apex',    emoji: '⭐⭐⭐',   perceptionMult: 1.5,  biteMult: 1.4, rewardMult: 2.2, description: 'Legendary alpha. +50% perception, +40% bite. Bring everything.' },
];

interface Props {
  creature: Creature;
  stats: CreatureStats;
  onFinish: (o: HuntOutcome) => void;
}

type EnvId = 'savanna' | 'forest' | 'mountain' | 'desert' | 'ocean';
type Strategy = 'hide' | 'run' | 'fight';

// HUNT TACTIC — modifies the outcome margin within the chosen strategy.
// Defensive boosts hide/run odds; aggressive boosts fight odds.
export type HuntTactic = 'defensive' | 'balanced' | 'aggressive';

interface HuntTacticMod {
  hideMargin: number;
  runMargin: number;
  fightMargin: number;
}

const HUNT_TACTIC_MODS: Record<HuntTactic, HuntTacticMod> = {
  // Skews toward survival outcomes — better at hiding/running, worse at fighting.
  defensive:  { hideMargin: +0.18, runMargin: +0.15, fightMargin: -0.12 },
  // No modifier — pure strategy roll.
  balanced:   { hideMargin: 0, runMargin: 0, fightMargin: 0 },
  // Skews toward decisive outcomes — worse at hiding/running, better at fighting.
  aggressive: { hideMargin: -0.10, runMargin: -0.08, fightMargin: +0.20 },
};

interface Predator {
  envName: string;
  envEmoji: string;
  name: string;
  emoji: string;
  topKmh: number;
  perception: number;
  bite: number;
  sky: [string, string];
  ground: [string, string];
  envNote: string;
}

// Per-env visuals (sky, ground, env label). Predator picked separately
// by creature niche — a mouse and a lion in the SAME savanna face very
// different threats.
interface HuntEnv {
  envName: string;
  envEmoji: string;
  sky: [string, string];
  ground: [string, string];
}
const HUNT_ENVS: Record<EnvId, HuntEnv> = {
  savanna:  { envName: 'Savanna',  envEmoji: '🌾', sky: ['#9fd4ee', '#f8d68a'], ground: ['#f3d27d', '#c9a05a'] },
  forest:   { envName: 'Forest',   envEmoji: '🌳', sky: ['#7fa663', '#cfd7a0'], ground: ['#7a6a3a', '#54472a'] },
  mountain: { envName: 'Mountain', envEmoji: '🏔', sky: ['#b8c8d4', '#e5eef3'], ground: ['#c0ccd3', '#8089a0'] },
  desert:   { envName: 'Desert',   envEmoji: '🏜', sky: ['#ffd589', '#fbe9b0'], ground: ['#e3b06a', '#a07a45'] },
  ocean:    { envName: 'Ocean',    envEmoji: '🌊', sky: ['#74c4dc', '#2a5a85'], ground: ['#2a5a85', '#0c2a45'] },
};

// Predator's combat profile only — name/emoji/stats. The env visuals
// and label come from HUNT_ENVS above.
interface PredatorCore {
  name: string;
  emoji: string;
  topKmh: number;
  perception: number;
  bite: number;
  envNote: string;
}

// Niche-aware predator selection. For each environment, what KIND of
// hunter pursues YOU depends on your size class. A mouse in savanna gets
// chased by a vulture; a wildebeest gets chased by a lion pride; a
// rival lion gets stalked by an even bigger rival.
const HUNT_PREDATORS: Record<EnvId, Partial<Record<Niche, PredatorCore>>> = {
  savanna: {
    small:    { name: 'Vulture',       emoji: '🦅', topKmh: 70,  perception: 60, bite: 25, envNote: 'Carrion bird. Sees you from 1km up.' },
    medium:   { name: 'Hyena clan',    emoji: '🐕', topKmh: 65,  perception: 55, bite: 60, envNote: 'Bone-crushers that hunt in packs.' },
    ungulate: { name: 'Lion pride',    emoji: '🦁', topKmh: 80,  perception: 55, bite: 70, envNote: 'Open grassland. Lions hunt in pride.' },
    apex:     { name: 'Rival pride',   emoji: '🦁', topKmh: 85,  perception: 60, bite: 75, envNote: 'Territorial dispute. Both sides serious.' },
    aquatic:  { name: 'Waterhole croc',emoji: '🐊', topKmh: 50,  perception: 50, bite: 80, envNote: 'Hidden at the only watering hole for miles.' },
    avian:    { name: 'Martial eagle', emoji: '🦅', topKmh: 110, perception: 70, bite: 40, envNote: 'Africa\'s heaviest raptor.' },
    reptile:  { name: 'Honey badger',  emoji: '🦡', topKmh: 60,  perception: 55, bite: 60, envNote: 'Famous for fearlessness.' },
    dinosaur: { name: 'Tyrannosaur',   emoji: '🦖', topKmh: 80,  perception: 60, bite: 95, envNote: 'Bite force 12,800 N.' },
  },
  forest: {
    small:    { name: 'Great horned owl', emoji: '🦉', topKmh: 65,  perception: 80, bite: 30, envNote: 'Silent flight. Kills before you hear it.' },
    medium:   { name: 'Wolf',             emoji: '🐺', topKmh: 65,  perception: 70, bite: 50, envNote: 'Dense trees + scent tracking.' },
    ungulate: { name: 'Wolf pack',        emoji: '🐺', topKmh: 70,  perception: 75, bite: 65, envNote: 'Coordinated relay hunting.' },
    apex:     { name: 'Brown bear',       emoji: '🐻', topKmh: 55,  perception: 65, bite: 85, envNote: 'Will fight anything — and win.' },
    aquatic:  { name: 'Otter pack',       emoji: '🦦', topKmh: 35,  perception: 60, bite: 30, envNote: 'River raiders.' },
    avian:    { name: 'Goshawk',          emoji: '🦅', topKmh: 100, perception: 75, bite: 35, envNote: 'Threads dense canopy at full speed.' },
    reptile:  { name: 'Wild boar',        emoji: '🐗', topKmh: 65,  perception: 55, bite: 60, envNote: 'Tramples and gores.' },
    dinosaur: { name: 'Raptor pack',      emoji: '🦖', topKmh: 95,  perception: 70, bite: 70, envNote: 'Sickle claws + pack tactics.' },
  },
  mountain: {
    small:    { name: 'Golden eagle',    emoji: '🦅', topKmh: 105, perception: 85, bite: 30, envNote: 'Snatches prey off cliffs.' },
    medium:   { name: 'Lynx',            emoji: '🐈', topKmh: 70,  perception: 75, bite: 50, envNote: 'Tufted ears, silent paws.' },
    ungulate: { name: 'Snow Leopard',    emoji: '🐆', topKmh: 60,  perception: 85, bite: 55, envNote: 'Ambush hunter, near-invisible against rock.' },
    apex:     { name: 'Rival big cat',   emoji: '🐆', topKmh: 65,  perception: 80, bite: 65, envNote: 'Same predator, opposite team.' },
    aquatic:  { name: 'River otter',     emoji: '🦦', topKmh: 30,  perception: 55, bite: 25, envNote: 'Mountain stream raider.' },
    avian:    { name: 'Peregrine falcon',emoji: '🦅', topKmh: 130, perception: 85, bite: 30, envNote: 'Stoops at 320 km/h. Mid-air kill.' },
    reptile:  { name: 'Lammergeier',     emoji: '🦅', topKmh: 105, perception: 80, bite: 35, envNote: 'Drops bones from height to crack them.' },
    arctic:   { name: 'Polar bear',      emoji: '🐻‍❄️', topKmh: 60,  perception: 65, bite: 85, envNote: 'Outweighs everything else by tons.' },
    dinosaur: { name: 'Pterosaur',       emoji: '🦅', topKmh: 130, perception: 75, bite: 50, envNote: 'Wing-spans of 10 metres.' },
  },
  desert: {
    small:    { name: 'Sidewinder',      emoji: '🐍', topKmh: 30,  perception: 50, bite: 50, envNote: 'Heat-pit vision. Strikes from concealment.' },
    medium:   { name: 'Hyena',           emoji: '🐺', topKmh: 60,  perception: 50, bite: 75, envNote: 'Bone-crushing bite, distracted in heat.' },
    ungulate: { name: 'Hyena pack',      emoji: '🐺', topKmh: 70,  perception: 55, bite: 80, envNote: 'Endurance pursuit over the dunes.' },
    apex:     { name: 'Migrating lion',  emoji: '🦁', topKmh: 75,  perception: 55, bite: 70, envNote: 'Stray apex looking for any kill.' },
    aquatic:  { name: 'Salt-water croc', emoji: '🐊', topKmh: 35,  perception: 55, bite: 80, envNote: 'Hidden at the wadi.' },
    avian:    { name: 'Saker falcon',    emoji: '🦅', topKmh: 125, perception: 75, bite: 30, envNote: 'Open-sky ambush.' },
    reptile:  { name: 'Sand viper',      emoji: '🐍', topKmh: 30,  perception: 50, bite: 65, envNote: 'Buried in the dunes.' },
    dinosaur: { name: 'Allosaur',        emoji: '🦖', topKmh: 70,  perception: 60, bite: 85, envNote: 'Apex of its desert epoch.' },
  },
  ocean: {
    small:    { name: 'Tuna school',     emoji: '🐟', topKmh: 65,  perception: 55, bite: 25, envNote: 'Bigger fish eat smaller fish.' },
    medium:   { name: 'Barracuda',       emoji: '🐟', topKmh: 70,  perception: 60, bite: 55, envNote: 'Lightning strike from cover.' },
    ungulate: { name: 'Killer whale',    emoji: '🐳', topKmh: 65,  perception: 75, bite: 90, envNote: 'Orcas hunt anything that swims.' },
    apex:     { name: 'Rival orca pod',  emoji: '🐳', topKmh: 65,  perception: 75, bite: 90, envNote: 'Territorial pod dispute.' },
    aquatic:  { name: 'Great white',     emoji: '🦈', topKmh: 50,  perception: 65, bite: 85, envNote: 'Electroreception + smell. Bite ignores most armor.' },
    avian:    { name: 'Diving osprey',   emoji: '🦅', topKmh: 90,  perception: 70, bite: 30, envNote: 'Plunges 30m below the surface.' },
    reptile:  { name: 'Saltie',          emoji: '🐊', topKmh: 45,  perception: 50, bite: 80, envNote: 'Estuary ambush.' },
    arctic:   { name: 'Orca pod',        emoji: '🐳', topKmh: 65,  perception: 75, bite: 90, envNote: 'Coordinated pack hunt.' },
    dinosaur: { name: 'Mosasaur',        emoji: '🦕', topKmh: 50,  perception: 60, bite: 90, envNote: 'Marine reptile, apex of its seas.' },
  },
};

// Fallback when no niche-specific predator exists for an env+niche pair
// (e.g. arctic creature in savanna). Falls back to the medium predator.
function pickPredator(envId: EnvId, creature: Creature): Predator {
  const env = HUNT_ENVS[envId];
  const niche = getNiche(creature.shape);
  const core = HUNT_PREDATORS[envId][niche]
    ?? HUNT_PREDATORS[envId].medium
    ?? HUNT_PREDATORS[envId].ungulate!;
  return { ...env, ...core };
}

function stealthScore(c: Creature): number {
  const m = sizeToMass(c.sizeUnit);
  let s = 55 - Math.log10(Math.max(0.01, m) + 0.1) * 14;
  // Mass-scaled camouflage — small camo'd creatures vanish, large ones
  // (think a tiger-striped elephant) still get less than half the
  // benefit a stick insect would.
  if (c.hybrids.includes('camouflage')) {
    const concealFactor = m <= 50 ? 1.0 : Math.max(0.2, 1 - Math.log10(m / 50) * 0.4);
    s += 30 * concealFactor;
  }
  if (c.defenseTier === 1) s += 5;
  if (c.defenseTier === 2) s -= 15;
  if (c.sensorTier === 2) s += 10;
  s += c.brainTier * 5;
  if (c.bodyPlan === 'fish') s -= 25;
  if (c.bodyPlan === 'bird') s += 8;
  // Hybrid combo bonus (ambush-hunter, bat-sonar, etc.)
  s += comboEffects(c).huntHideBonus ?? 0;
  return Math.max(0, Math.min(100, s));
}

function fightPower(c: Creature, s: CreatureStats): number {
  let p = 5;
  // Mass is a big deal in a fight: log-scale so even modest creatures get
  // some, and huge creatures dominate.
  // 1 kg → ~12, 100 kg → ~32, 4000 kg → ~52, 100 t → ~72
  p += Math.max(0, (Math.log10(Math.max(0.01, s.massKg)) + 1) * 12);
  if (c.hybrids.includes('venom')) p += 45;
  if (c.hybrids.includes('electric')) p += 55;
  if (c.defenseTier === 2) p += 28;
  if (c.defenseTier === 1) p += 8;
  if (c.brainTier >= 2) p += 12 + (c.brainTier - 2) * 6; // genius gets another +6
  else if (c.brainTier === 1) p += 5;
  if (c.legTier === 2) p += 8;
  if (c.legTier === 1) p += 4;
  if (c.sensorTier === 2) p += 6;
  // Hybrid combo bonus (electric-eel, volcanic-breath, etc.)
  p += comboEffects(c).huntFightBonus ?? 0;
  return Math.min(100, p);
}

function predictHide(c: Creature, p: Predator) {
  const stealth = stealthScore(c);
  return { score: stealth, opp: p.perception, margin: stealth - p.perception };
}
function predictRun(s: CreatureStats, p: Predator) {
  return { score: s.topSpeedKmh, opp: p.topKmh, margin: s.topSpeedKmh - p.topKmh };
}
function predictFight(c: Creature, s: CreatureStats, p: Predator) {
  const power = fightPower(c, s);
  return { score: power, opp: p.bite, margin: power - p.bite };
}

const LUCK_SWING = 15;

function confidence(margin: number): { label: string; cls: string } {
  if (margin > 20) return { label: 'very likely', cls: 'good' };
  if (margin > 5) return { label: 'likely', cls: 'good' };
  if (margin > -5) return { label: 'coin flip', cls: 'ok' };
  if (margin > -20) return { label: 'unlikely', cls: 'risky' };
  return { label: 'long shot', cls: 'bad' };
}

function reasonFor(strategy: Strategy, won: boolean, c: Creature): HuntOutcome['reason'] {
  if (!won) return 'caught';
  if (strategy === 'hide') return 'hidden';
  if (strategy === 'run') return 'outran';
  if (c.hybrids.includes('venom') || c.hybrids.includes('electric')) return 'fought';
  return 'tanked';
}

const W = 600;
const H = 220;
const GROUND_Y = 170;

export function HuntArena({ creature, stats, onFinish }: Props) {
  const [envId, setEnvId] = useState<EnvId>('forest');
  const [difficultyId, setDifficultyId] = useState<HuntDifficultyId>('normal');
  const [tactic, setTactic] = useState<HuntTactic>('balanced');
  // Three-phase flow: 'choose' (pick strategy) → 'play' (animate the
  // outcome) → 'done' (insight card shows).
  const [phase, setPhase] = useState<'choose' | 'play' | 'done'>('choose');
  const [playingStrategy, setPlayingStrategy] = useState<Strategy | null>(null);
  const [playWon, setPlayWon] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  // Fight choreography: charge → clash1 → recoil → clash2 → finish.
  // Beat is 0..4 — each beat is ~700ms. Total fight is ~3.5s.
  const [fightBeat, setFightBeat] = useState(0);
  // Whole-scene shake on impacts.
  const [shake, setShake] = useState(false);

  const diff = HUNT_DIFFICULTIES.find((d) => d.id === difficultyId) ?? HUNT_DIFFICULTIES[0];

  // Pick a niche-aware predator (mouse vs lion in the same savanna face
  // very different threats), then scale by the chosen difficulty.
  const basePred = pickPredator(envId, creature);
  const p: Predator = {
    ...basePred,
    perception: Math.round(basePred.perception * diff.perceptionMult),
    bite: Math.round(basePred.bite * diff.biteMult),
  };
  const hide = predictHide(creature, p);
  const run = predictRun(stats, p);
  const fight = predictFight(creature, stats, p);

  function play(strategy: Strategy) {
    const result =
      strategy === 'hide' ? hide :
      strategy === 'run' ? run :
      fight;
    const tacticMod = HUNT_TACTIC_MODS[tactic];
    const tacticDelta =
      strategy === 'hide'  ? tacticMod.hideMargin :
      strategy === 'run'   ? tacticMod.runMargin :
                             tacticMod.fightMargin;
    const luck = (Math.random() * 2 - 1) * LUCK_SWING;
    const adjustedMargin = result.margin + tacticDelta + luck;
    const won = adjustedMargin > 0;
    setPlayingStrategy(strategy);
    setPlayWon(won);
    setPhase('play');
    setFightBeat(0);

    if (strategy === 'fight') {
      // Multi-beat fight choreography ~3.5s:
      //   T+0     charge       — both close to center
      //   T+700   clash 1       — flash + shake + 💥
      //   T+1400  recoil        — both bounce back
      //   T+2100  clash 2       — bigger flash + shake + 💥
      //   T+2800  finish        — winner stands, loser fades
      window.setTimeout(() => { setFightBeat(1); setFlashOn(true); setShake(true); }, 700);
      window.setTimeout(() => { setFlashOn(false); setShake(false); }, 1000);
      window.setTimeout(() => { setFightBeat(2); }, 1400);
      window.setTimeout(() => { setFightBeat(3); setFlashOn(true); setShake(true); }, 2100);
      window.setTimeout(() => { setFlashOn(false); setShake(false); }, 2400);
      window.setTimeout(() => { setFightBeat(4); }, 2800);
      window.setTimeout(() => {
        setPhase('done');
        onFinish({ won, reason: reasonFor(strategy, won, creature), env: envId, strategy, difficulty: diff.id });
      }, 3500);
    } else {
      // Hide / Run keep the ~1.8s simple animation.
      if (!won && strategy === 'hide') {
        window.setTimeout(() => { setFlashOn(true); setShake(true); }, 900);
        window.setTimeout(() => { setFlashOn(false); setShake(false); }, 1200);
      }
      window.setTimeout(() => {
        setPhase('done');
        onFinish({ won, reason: reasonFor(strategy, won, creature), env: envId, strategy, difficulty: diff.id });
      }, 1800);
    }
  }

  function reset() {
    setPhase('choose');
    setPlayingStrategy(null);
    setFlashOn(false);
    setShake(false);
    setFightBeat(0);
  }

  const done = phase === 'done';
  const playing = phase === 'play';

  // Animated positions for creature + predator based on phase / strategy /
  // outcome. Values are svg-coordinates (translateX). Plain numbers go
  // into inline `transform: translateX(...)` with a CSS transition so the
  // bodies actually slide.
  const baseCreatureX = W * 0.28;
  const basePredX = W * 0.72;
  let creatureDX = 0;
  let creatureDY = 0;
  let predDX = 0;
  let creatureOpacity = 1;
  let predOpacity = 1;
  if (playing && playingStrategy === 'hide') {
    // Body-plan-specific HIDE behavior:
    //   bird     flies UP into the canopy (translateY -50)
    //   fish     dives DOWN into the water (translateY +30)
    //   reptile  freezes in place (no Y shift — pure opacity fade)
    //   mammal   crouches behind cover (translateY +18, current)
    creatureOpacity = playWon ? 0.3 : 0.55;
    if (creature.bodyPlan === 'bird') {
      creatureDY = playWon ? -50 : -18;   // flies up
    } else if (creature.bodyPlan === 'fish') {
      creatureDY = playWon ? 30 : 12;     // dives down
    } else if (creature.bodyPlan === 'reptile') {
      creatureDY = 0;                     // motionless camouflage
      // reptiles rely entirely on stillness — opacity drops harder
      creatureOpacity = playWon ? 0.2 : 0.6;
    } else {
      creatureDY = playWon ? 18 : 6;      // mammal crouch
    }
    predDX = playWon ? -160 : -(basePredX - baseCreatureX);
  } else if (playing && playingStrategy === 'run') {
    // Body-plan-specific RUN:
    //   bird     takes off in a steep upward arc (Y rises as X falls)
    //   fish     zooms with a downward dive arc
    //   others   sprint horizontally (current)
    creatureDX = playWon ? -(W * 0.45) : -(W * 0.32);
    if (creature.bodyPlan === 'bird') {
      creatureDY = playWon ? -60 : -30;
    } else if (creature.bodyPlan === 'fish') {
      creatureDY = playWon ? 24 : 12;
    }
    predDX = playWon ? -(W * 0.3) : -(W * 0.48);
  } else if (playing && playingStrategy === 'fight') {
    // Beat-driven choreography:
    //   0 = pre-fight pose (idle)
    //   1 = first clash (close to center)
    //   2 = recoil (bounce back)
    //   3 = second clash (close again, bigger)
    //   4 = finish (winner stands, loser retreats + fades)
    if (fightBeat === 0) {
      creatureDX = 30;
      predDX = -80;
    } else if (fightBeat === 1) {
      creatureDX = 110;
      predDX = -170;
    } else if (fightBeat === 2) {
      creatureDX = 60;
      predDX = -110;
    } else if (fightBeat === 3) {
      creatureDX = 120;
      predDX = -180;
    } else {
      // finish
      creatureDX = playWon ? 80 : -20;
      predDX = playWon ? -50 : -150;
      if (playWon) predOpacity = 0.4;
      else creatureOpacity = 0.5;
    }
  }

  return (
    <div className="arena">
      <h2>The Hunt — encounter <small className="arena-env">· {p.envName} · {diff.emoji} {diff.label} · ×{diff.rewardMult.toFixed(1)} reward</small></h2>
      <p className="arena-help">{p.envNote} <em>{diff.description}</em></p>

      {(() => {
        const combo = getActiveCombo(creature);
        if (!combo) return null;
        const e = combo.effects;
        const bonusBits: string[] = [];
        if (e.huntHideBonus) bonusBits.push(`+${e.huntHideBonus} hide`);
        if (e.huntFightBonus) bonusBits.push(`+${e.huntFightBonus} fight`);
        if (bonusBits.length === 0) return null;
        return (
          <div className="combo-badge">
            <span className="combo-badge-emoji">{combo.emoji}</span>
            <span className="combo-badge-text"><strong>{combo.name}</strong> · {bonusBits.join(' · ')}</span>
          </div>
        );
      })()}

      <div className="prey-tabs">
        {(Object.entries(HUNT_ENVS) as [EnvId, HuntEnv][]).map(([id, env]) => {
          // Show the niche-aware predator preview so the user sees who
          // they'll actually face in each biome — different per creature.
          const previewPred = pickPredator(id, creature);
          return (
            <button
              key={id}
              type="button"
              className={`prey-tab${envId === id ? ' active' : ''}`}
              onClick={() => { setEnvId(id); reset(); }}
              disabled={done || playing}
              title={`${env.envName} — ${previewPred.name}`}
            >
              <span className="prey-emoji">{env.envEmoji}</span>
              <span className="prey-name">{env.envName}<small> {previewPred.emoji}</small></span>
            </button>
          );
        })}
      </div>

      <div className="prey-tabs">
        {HUNT_DIFFICULTIES.map((d) => (
          <button
            key={d.id}
            type="button"
            className={`prey-tab${difficultyId === d.id ? ' active' : ''}`}
            onClick={() => { setDifficultyId(d.id); reset(); }}
            disabled={done || playing}
            title={d.description}
          >
            <span className="prey-emoji">{d.emoji}</span>
            <span className="prey-name">{d.label}<small> ×{d.rewardMult.toFixed(1)}</small></span>
          </button>
        ))}
      </div>

      {/* TACTIC PICKER — defensive/balanced/aggressive modifies how the chosen
          strategy plays out. Pick this BEFORE choosing hide/run/fight. */}
      <div className="drought-activity-label">
        <strong>What's your mood?</strong> <small>(pick before Hide / Run / Fight)</small>
      </div>
      <div className="prey-tabs">
        {([
          { id: 'defensive'  as const, emoji: '🛡️', label: 'Defensive',  sub: '+hide · +run · -fight',   title: 'Play it safe. Better odds when hiding or running, worse when fighting. Good for fragile creatures.' },
          { id: 'balanced'   as const, emoji: '⚖️', label: 'Balanced',   sub: 'no modifier',             title: 'No skew — pure strategy roll. Default.' },
          { id: 'aggressive' as const, emoji: '⚔️', label: 'Aggressive', sub: '-hide · -run · +fight',  title: 'Go on the offensive. Better odds when fighting, worse when hiding or running. Good for armored or venomous creatures.' },
        ]).map((t) => (
          <button
            key={t.id}
            type="button"
            className={`prey-tab${tactic === t.id ? ' active' : ''}`}
            onClick={() => setTactic(t.id)}
            disabled={done || playing}
            title={t.title}
          >
            <span className="prey-emoji">{t.emoji}</span>
            <span className="prey-name">
              {t.label}
              <small> {t.sub}</small>
            </span>
          </button>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        style={{
          transition: 'transform 0.08s ease-out',
          transform: shake ? `translate(${(Math.random() - 0.5) * 8}px, ${(Math.random() - 0.5) * 6}px)` : 'translate(0, 0)',
        }}
      >
        <defs>
          <linearGradient id="hunt-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.sky[0]} />
            <stop offset="1" stopColor={p.sky[1]} />
          </linearGradient>
          <linearGradient id="hunt-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.ground[0]} />
            <stop offset="1" stopColor={p.ground[1]} />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width={W} height={GROUND_Y} fill="url(#hunt-sky)" />
        <rect x="0" y={GROUND_Y} width={W} height={H - GROUND_Y} fill="url(#hunt-ground)" />

        {envId === 'forest' && (
          <>
            {[80, 200, 340, 470].map((tx, i) => (
              <g key={i}>
                <rect x={tx - 4} y={GROUND_Y - 60} width="8" height="60" fill="#3e2a18" />
                <ellipse cx={tx} cy={GROUND_Y - 70} rx="34" ry="22" fill="#3f6b34" />
              </g>
            ))}
          </>
        )}
        {envId === 'savanna' && (
          <>
            {[100, 280, 460].map((tx, i) => (
              <g key={i}>
                <rect x={tx - 3} y={GROUND_Y - 50} width="6" height="50" fill="#5a3b22" />
                <ellipse cx={tx} cy={GROUND_Y - 56} rx="26" ry="10" fill="#557d3e" />
              </g>
            ))}
          </>
        )}
        {envId === 'mountain' && (
          <polygon points={`100,${GROUND_Y} 240,80 380,${GROUND_Y} 480,90 ${W},${GROUND_Y}`} fill="white" stroke="#bbb" strokeWidth="1" />
        )}
        {envId === 'desert' && (
          <>
            <circle cx={W - 80} cy="60" r="30" fill="#ffb84a" opacity="0.85" />
            <ellipse cx="80" cy={GROUND_Y + 8} rx="30" ry="6" fill="#a07a45" />
          </>
        )}
        {envId === 'ocean' && (
          <>
            {Array.from({ length: 5 }).map((_, i) => (
              <ellipse key={i} cx={50 + i * 120} cy={GROUND_Y + 30 + (i % 2) * 10} rx="30" ry="6" fill="#3a6fa3" opacity="0.5" />
            ))}
            {Array.from({ length: 12 }).map((_, i) => (
              <circle key={i} cx={(i * 73) % W} cy={50 + ((i * 37) % 110)} r={1.5} fill="white" opacity="0.5" />
            ))}
          </>
        )}

        {/* AMBIENT LIVE DETAILS — birds, leaves, dust, etc. */}
        <g>
          {/* always 2-3 flapping bird silhouettes high in the sky */}
          {[120, 200, 280].map((bx, i) => (
            <g key={`bird-${i}`} transform={`translate(${bx} ${30 + i * 8})`} className="bird-wing" style={{ transformOrigin: 'center' }}>
              <path d="M -6 0 Q -3 -3 0 0 Q 3 -3 6 0" stroke="#3a2a18" strokeWidth="1.1" fill="none" strokeLinecap="round" />
            </g>
          ))}
          {/* falling leaves in the forest */}
          {envId === 'forest' && Array.from({ length: 8 }).map((_, i) => (
            <g key={`leaf-${i}`} className="snowflake" style={{ animationDuration: `${4 + (i % 4)}s`, animationDelay: `-${i * 0.5}s` }}>
              <ellipse cx={(i * 73 + 10) % W} cy={-10 + (i * 17) % 40} rx="3" ry="1.5" fill="#9a6a30" opacity="0.85" transform={`rotate(${(i * 37) % 90} ${(i * 73 + 10) % W} ${-10 + (i * 17) % 40})`} />
            </g>
          ))}
          {/* sand puffs in desert */}
          {envId === 'desert' && Array.from({ length: 12 }).map((_, i) => (
            <circle key={`sand-${i}`} cx={((i * 53) % W)} cy={GROUND_Y + 6 + ((i * 19) % 12)} r={1.5 + (i % 3) * 0.4} fill="#e6c890" opacity="0.55" className="snowflake"
              style={{ animationDuration: `${3 + (i % 2)}s`, animationDelay: `-${i * 0.3}s` }} />
          ))}
        </g>

        {/* RUN motion streaks — drawn BEHIND the creature, originating
            from its current x position and trailing right. */}
        {playing && playingStrategy === 'run' && (
          <g
            style={{
              transition: 'transform 1.5s ease-in-out',
              transform: `translateX(${creatureDX}px)`,
            }}
          >
            <g opacity="0.7">
              {[0, 6, 14, 26, 40].map((dx, i) => (
                <line
                  key={i}
                  x1={W * 0.28 + dx + 30}
                  y1={GROUND_Y - 32 + (i % 2) * 6}
                  x2={W * 0.28 + dx + 64}
                  y2={GROUND_Y - 30 + (i % 2) * 6}
                  stroke="#d6c098"
                  strokeWidth={3 - i * 0.4}
                  strokeLinecap="round"
                  opacity={0.85 - i * 0.15}
                />
              ))}
              {/* dust puffs trailing on the ground */}
              {[0, 24, 50, 78].map((dx, i) => (
                <ellipse
                  key={`d-${i}`}
                  cx={W * 0.28 + dx + 30}
                  cy={GROUND_Y + 2}
                  rx={6 + i * 2}
                  ry={2}
                  fill="#d6c098"
                  opacity={0.6 - i * 0.12}
                />
              ))}
            </g>
          </g>
        )}

        {/* PLAYER CREATURE — animates left/away based on phase.
            Hide adds a Y-down crouch; Run uses the same translateX but
            with the run animation on the body. */}
        <g
          style={{
            transition: playing ? 'transform 1.5s ease-in-out, opacity 0.6s ease-in-out' : 'none',
            transform: `translate(${creatureDX}px, ${creatureDY}px)`,
            opacity: creatureOpacity,
          }}
        >
          {hasBespokeShape(creature) ? (
            <BespokeInScene
              creature={creature}
              x={W * 0.28 - 50}
              y={GROUND_Y - 70}
              width={100}
              height={80}
              animate={playing && playingStrategy === 'run' ? 'run' : 'breathe'}
            />
          ) : (
            <g transform={`translate(${W * 0.28} 0)`}>
              <CreatureBody
                creature={creature}
                cx={0}
                footY={GROUND_Y}
                scale={0.32}
                animate={playing && playingStrategy === 'run' ? 'run' : 'breathe'}
              />
            </g>
          )}
        </g>

        {/* HIDE COVER — biome-specific concealment that appears in
            front of the creature when Hide is chosen. Bird/fish hide
            differently (up into canopy, down into water) so the
            cover sprite changes location accordingly. */}
        {playing && playingStrategy === 'hide' && (
          <g
            style={{
              transition: 'opacity 0.3s ease-in',
              opacity: 0.95,
            }}
          >
            {/* Bird hides UP in tree canopy — cluster of leaves above the start */}
            {creature.bodyPlan === 'bird' && (
              <g transform={`translate(${W * 0.28 + 4} ${GROUND_Y - 100})`}>
                <ellipse cx="0" cy="0" rx="34" ry="14" fill="#3f6b34" />
                <ellipse cx="-16" cy="-4" rx="18" ry="9" fill="#557d3e" />
                <ellipse cx="16" cy="4" rx="20" ry="10" fill="#557d3e" />
                <ellipse cx="0" cy="-6" rx="14" ry="6" fill="#6b9450" />
              </g>
            )}
            {/* Fish hides DOWN in a kelp / coral patch below — render
                under the ground line as a low-cover blue ripple */}
            {creature.bodyPlan === 'fish' && (
              <g transform={`translate(${W * 0.28} ${GROUND_Y - 4})`}>
                {/* water shimmer band */}
                <ellipse cx="0" cy="0" rx="50" ry="6" fill="#3a85b8" opacity="0.7" />
                <ellipse cx="0" cy="-2" rx="45" ry="4" fill="#74c4dc" opacity="0.5" />
                {/* a sway of seaweed / kelp */}
                <g stroke="#3a8848" strokeWidth="3" strokeLinecap="round" fill="none">
                  <path d="M -16 4 q -2 -10 0 -22" />
                  <path d="M 0 4 q 2 -12 -2 -24" />
                  <path d="M 16 4 q -2 -8 2 -18" />
                </g>
              </g>
            )}
            {/* Reptile freezes in place — no overlay cover, just
                a subtle shimmer near it to signal "frozen" */}
            {creature.bodyPlan === 'reptile' && (
              <g transform={`translate(${W * 0.28 + 4} ${GROUND_Y - 40})`}>
                <text x="0" y="0" fontSize="14" textAnchor="middle" opacity="0.7">🥶</text>
              </g>
            )}
            {/* Mammals get BIOME-specific ground cover. Bird, fish,
                reptile cover handled above. */}
            {creature.bodyPlan === 'mammal' && envId === 'forest' && (
              <g transform={`translate(${W * 0.28 + 10} ${GROUND_Y - 20})`}>
                <ellipse cx="-12" cy="0" rx="18" ry="14" fill="#3a5a22" />
                <ellipse cx="8" cy="-4" rx="22" ry="16" fill="#4a7028" />
                <ellipse cx="28" cy="2" rx="16" ry="12" fill="#3a5a22" />
                <ellipse cx="-2" cy="-10" rx="14" ry="9" fill="#5a8a3a" opacity="0.85" />
              </g>
            )}
            {creature.bodyPlan === 'mammal' && envId === 'savanna' && (
              <g transform={`translate(${W * 0.28 + 8} ${GROUND_Y - 16})`}>
                <g stroke="#a08a48" strokeWidth="2.5" strokeLinecap="round" fill="none">
                  {[-12, -6, 0, 6, 12, 18, 24].map((x, i) => (
                    <line key={i} x1={x} y1="14" x2={x + (i % 2 === 0 ? -2 : 2)} y2={-14 - (i % 3) * 2} />
                  ))}
                </g>
                <g stroke="#7a6428" strokeWidth="1.5" strokeLinecap="round" fill="none">
                  {[-9, -3, 3, 9, 15, 21].map((x, i) => (
                    <line key={i} x1={x} y1="14" x2={x + (i % 2 === 0 ? -2 : 2)} y2={-10 - (i % 3) * 2} />
                  ))}
                </g>
              </g>
            )}
            {creature.bodyPlan === 'mammal' && envId === 'mountain' && (
              <g transform={`translate(${W * 0.28 + 4} ${GROUND_Y - 20})`}>
                <ellipse cx="0" cy="6" rx="32" ry="18" fill="#aab4be" />
                <ellipse cx="0" cy="4" rx="28" ry="14" fill="#dde4e8" />
                <ellipse cx="0" cy="-6" rx="22" ry="6" fill="white" opacity="0.95" />
              </g>
            )}
            {creature.bodyPlan === 'mammal' && envId === 'desert' && (
              <g transform={`translate(${W * 0.28 + 6} ${GROUND_Y - 18})`}>
                <ellipse cx="0" cy="10" rx="34" ry="14" fill="#a07a45" />
                <ellipse cx="0" cy="6" rx="32" ry="12" fill="#c89a55" />
                <rect x="-2" y="-12" width="4" height="20" rx="2" fill="#3f5e22" />
                <ellipse cx="0" cy="-12" rx="3" ry="2" fill="#ffd140" />
              </g>
            )}
            {creature.bodyPlan === 'mammal' && envId === 'ocean' && (
              <g transform={`translate(${W * 0.28 + 4} ${GROUND_Y - 16})`}>
                <g stroke="#3a8848" strokeWidth="5" strokeLinecap="round" fill="none">
                  <path d="M -10 14 q -3 -10 0 -22 q 3 -10 0 -22" />
                  <path d="M 0 14 q -2 -8 0 -16 q 2 -10 0 -22" />
                  <path d="M 10 14 q 3 -12 0 -22 q -3 -10 0 -22" />
                </g>
                <g stroke="#5aa868" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7">
                  <path d="M -10 14 q -3 -10 0 -22 q 3 -10 0 -22" />
                  <path d="M 0 14 q -2 -8 0 -16 q 2 -10 0 -22" />
                </g>
              </g>
            )}
            {/* a "..." thought bubble while hiding (won) or "!" if spotted */}
            <text
              x={W * 0.28 + 50}
              y={GROUND_Y - 88}
              fontSize="18"
              fontWeight="700"
              fill={playWon ? '#5a6a6a' : '#c25541'}
              opacity={0.85}
            >
              {playWon ? '…' : '!'}
            </text>
          </g>
        )}

        {/* PREDATOR — animates toward/away based on phase */}
        <g
          style={{
            transition: playing ? 'transform 1.5s ease-in-out, opacity 0.5s ease-in-out' : 'none',
            transform: `translateX(${predDX}px)`,
            opacity: predOpacity,
          }}
        >
          <g transform={`translate(${W * 0.72} ${GROUND_Y - 10})`}>
            <ellipse cx="0" cy="6" rx="34" ry="4" fill="rgba(0,0,0,0.25)" />
            <text x="0" y="0" fontSize="56" textAnchor="middle">{p.emoji}</text>
            <text x="0" y="22" fontSize="11" textAnchor="middle" fill="#333" fontWeight="700">{p.name}</text>
          </g>
        </g>

        {/* COLLISION FLASH — appears briefly on a fight clash or a lost hide */}
        {flashOn && (
          <g>
            <rect x="0" y="0" width={W} height={H} fill="white" opacity="0.55" />
            {/* impact starburst at the collision point. Beat 1 = small,
                beat 3 = bigger second clash. */}
            <g transform={`translate(${(baseCreatureX + basePredX) / 2 + (creatureDX + predDX) / 2} ${GROUND_Y - 40})`}>
              {Array.from({ length: fightBeat === 3 ? 14 : 10 }).map((_, i) => {
                const total = fightBeat === 3 ? 14 : 10;
                const a = (i / total) * Math.PI * 2;
                const inner = fightBeat === 3 ? 10 : 8;
                const outer = fightBeat === 3 ? 38 : 28;
                return <line key={i} x1={Math.cos(a) * inner} y1={Math.sin(a) * inner} x2={Math.cos(a) * outer} y2={Math.sin(a) * outer} stroke="#ffd040" strokeWidth={fightBeat === 3 ? 4 : 3} strokeLinecap="round" />;
              })}
              <text x="0" y={fightBeat === 3 ? 10 : 6} fontSize={fightBeat === 3 ? 30 : 22} textAnchor="middle">
                {playingStrategy === 'fight' ? (fightBeat === 3 ? '💢' : '💥') : '💥'}
              </text>
              {/* secondary smaller stars around */}
              {fightBeat === 3 && (
                <>
                  <text x="-30" y="-20" fontSize="14">✨</text>
                  <text x="28" y="-22" fontSize="14">✨</text>
                  <text x="-22" y="22" fontSize="14">⚡</text>
                  <text x="26" y="20" fontSize="14">⚡</text>
                </>
              )}
            </g>
            {/* ground-level dust cloud during fight clashes */}
            {playingStrategy === 'fight' && (
              <g fill="#d6c098" opacity="0.7">
                <ellipse cx={(baseCreatureX + basePredX) / 2 + (creatureDX + predDX) / 2} cy={GROUND_Y - 2} rx="60" ry="8" />
                <circle cx={(baseCreatureX + basePredX) / 2 + (creatureDX + predDX) / 2 - 30} cy={GROUND_Y - 8} r="6" opacity="0.85" />
                <circle cx={(baseCreatureX + basePredX) / 2 + (creatureDX + predDX) / 2 + 30} cy={GROUND_Y - 6} r="5" opacity="0.85" />
              </g>
            )}
          </g>
        )}

        {/* GROWL bubbles during fight beats 0, 2 (before the clashes) */}
        {playing && playingStrategy === 'fight' && (fightBeat === 0 || fightBeat === 2) && (
          <g>
            <text x={baseCreatureX + creatureDX} y={GROUND_Y - 100} textAnchor="middle" fontSize="18" fontWeight="800" fill="#5a2820" style={{ animation: 'fadeIn 0.3s' }}>RRRR!</text>
            <text x={basePredX + predDX} y={GROUND_Y - 100} textAnchor="middle" fontSize="18" fontWeight="800" fill="#5a2820" style={{ animation: 'fadeIn 0.3s' }}>GRRR!</text>
          </g>
        )}

        {/* PLAYING-PHASE OVERLAY — small caption explaining what's happening */}
        {playing && playingStrategy && (
          <g>
            <rect x={W / 2 - 100} y="8" width="200" height="22" fill="rgba(255,255,255,0.92)" rx="11" stroke="#aaa" />
            <text x={W / 2} y="23" textAnchor="middle" fontSize="12" fill="#333" fontWeight="700">
              {playingStrategy === 'hide' && (playWon ? '🫥 holding still…' : '🫥 hiding… spotted!')}
              {playingStrategy === 'run' && (playWon ? '🏃 sprinting away' : '🏃 chase is on…')}
              {playingStrategy === 'fight' && (
                fightBeat === 0 ? '⚔️ closing in…' :
                fightBeat === 1 ? '💥 first clash!' :
                fightBeat === 2 ? '… they recoil …' :
                fightBeat === 3 ? '💢 second strike!' :
                playWon ? '⚔️ stood the ground!' : '⚔️ took the bite!'
              )}
            </text>
          </g>
        )}
      </svg>

      <div className="strategy-row">
        <StrategyButton
          icon="🫥" name="Hide" onClick={() => play('hide')}
          score={hide.score} opp={hide.opp} oppLabel="perception" margin={hide.margin}
          disabled={done || playing}
        />
        <StrategyButton
          icon="🏃" name="Run" onClick={() => play('run')}
          score={run.score} opp={run.opp} oppLabel="speed" scoreSuffix=" km/h" margin={run.margin}
          disabled={done || playing}
        />
        <StrategyButton
          icon="⚔️" name="Fight" onClick={() => play('fight')}
          score={fight.score} opp={fight.opp} oppLabel="bite" margin={fight.margin}
          disabled={done || playing}
        />
      </div>

      <div className="arena-controls">
        {done && (
          <button className="btn" onClick={reset} type="button">Try again</button>
        )}
      </div>
    </div>
  );
}

function StrategyButton({
  icon, name, score, opp, oppLabel, scoreSuffix = '', margin, onClick, disabled,
}: {
  icon: string;
  name: string;
  score: number;
  opp: number;
  oppLabel: string;
  scoreSuffix?: string;
  margin: number;
  onClick: () => void;
  disabled: boolean;
}) {
  const c = confidence(margin);
  return (
    <button type="button" className={`strategy-btn strategy-${c.cls}`} onClick={onClick} disabled={disabled}>
      <div className="strategy-head">
        <span className="strategy-icon">{icon}</span>
        <span className="strategy-name">{name}</span>
      </div>
      <div className="strategy-stats">
        you <strong>{Math.round(score)}{scoreSuffix}</strong> vs {oppLabel} <strong>{Math.round(opp)}</strong>
      </div>
      <div className={`strategy-conf strategy-conf-${c.cls}`}>{c.label}</div>
    </button>
  );
}
