import type { Creature } from '../types';
import {
  topSpeedKmh, enduranceKm, coldTolerance, lifespanYears,
  heartRate, brainMassGrams, totalKcalPerDay,
  type CreatureStats,
} from '../physics';
import { sizeToMass } from '../physics';
import { CreatureBody } from './CreatureSVG';
import { BespokeInScene, hasBespokeShape } from './dexShapes';

interface Props {
  creature: Creature;
  W: number;
  H: number;
}

// Format a value with a sensible unit suffix.
function fmtMass(kg: number): string {
  if (kg < 0.1) return `${Math.round(kg * 1000)} g`;
  if (kg < 1) return `${(kg * 1000).toFixed(0)} g`;
  if (kg < 100) return `${kg.toFixed(1)} kg`;
  if (kg < 10000) return `${Math.round(kg)} kg`;
  return `${(kg / 1000).toFixed(1)} t`;
}

// Quick real-animal comparison for a stat — gives kids a tangible reference.
function massComparison(kg: number): string {
  if (kg < 0.05) return 'mouse-tier';
  if (kg < 1) return 'rat / pigeon';
  if (kg < 10) return 'cat / rabbit';
  if (kg < 50) return 'dog territory';
  if (kg < 200) return 'big dog / boar';
  if (kg < 800) return 'horse / cow';
  if (kg < 4000) return 'rhino-class';
  if (kg < 20000) return 'elephant-class';
  return 'whale-class';
}

function speedComparison(kmh: number): string {
  if (kmh < 5) return 'a slow walk';
  if (kmh < 15) return 'jogging pace';
  if (kmh < 35) return 'cycling speed';
  if (kmh < 55) return 'racing greyhound';
  if (kmh < 75) return 'gazelle / wolf';
  if (kmh < 95) return 'cheetah territory';
  return 'faster than a cheetah!';
}

function brainNote(_brainG: number, eq: number): string {
  if (eq > 4) return 'genius (dolphin / octopus tier)';
  if (eq > 2) return 'smart (corvid / ape)';
  if (eq > 1) return 'above average';
  if (eq > 0.5) return 'average mammal';
  return 'small / instinct-driven';
}

function heartNote(bpm: number): string {
  if (bpm > 400) return 'tiny body, racing';
  if (bpm > 150) return 'small mammal pace';
  if (bpm > 60) return 'human-like';
  if (bpm > 25) return 'large mammal';
  return 'whale-slow';
}

function lifespanNote(years: number): string {
  if (years < 2) return 'short, like a mouse';
  if (years < 8) return 'cat / dog range';
  if (years < 20) return 'horse / pig range';
  if (years < 50) return 'human / chimp range';
  if (years < 100) return 'elephant / parrot';
  return 'whale-long';
}

function coldNote(t: number): string {
  if (t < -20) return 'thrives in arctic';
  if (t < 0) return 'handles winter';
  if (t < 10) return 'cool climates';
  if (t < 20) return 'temperate';
  return 'tropical / hot only';
}

interface Annotation {
  emoji: string;
  label: string;
  value: string;
  note: string;
  /** Anchor point on the creature (in 600×300 coords) the connector points to. */
  anchor: { x: number; y: number };
  /** Where the annotation card sits. */
  cardX: number;
  cardY: number;
  category: 'brain' | 'speed' | 'metab' | 'body' | 'sense' | 'life';
}

// Color per category — keeps the cards visually grouped.
const CATEGORY_COLOR: Record<Annotation['category'], string> = {
  brain:  '#9a60d0',
  speed:  '#e07b5b',
  metab:  '#d04848',
  body:   '#5a7838',
  sense:  '#4a8ab8',
  life:   '#c0843a',
};

export function LabView({ creature, W, H }: Props) {
  // Compute the same stats the rest of the game uses.
  const m = sizeToMass(creature.sizeUnit);
  const stats: CreatureStats = {
    massKg: m,
    foodKcalPerDay: totalKcalPerDay(m, creature.warmBlooded, creature.brainTier),
    foodKgPerDay: 0,
    topSpeedKmh: topSpeedKmh(m, creature.bodyPlan, creature.legTier),
    enduranceKm: enduranceKm(m, creature.bodyPlan, creature.warmBlooded, creature.legTier),
    coldTolerance: coldTolerance(m, creature.warmBlooded, creature.defenseTier),
    lifespanYears: lifespanYears(m, creature.warmBlooded),
    boneBreakRisk: 0,
    heartRateBpm: heartRate(m),
    brainMassGrams: brainMassGrams(creature),
    eq: 0,
  };
  // Reference Encephalization Quotient ≈ brainMass / expected-for-mass.
  // Use the tier as a rough proxy: 0/1/2/3 → ~0.4 / 1.0 / 2.2 / 4.5
  const eqProxy = [0.4, 1.0, 2.2, 4.5][creature.brainTier] ?? 1.0;

  // Centre the creature in the canvas. Annotations fan out around it.
  const cx = W / 2;
  const footY = H * 0.78;

  // Anchor points are body-plan aware so the connector lands on the right
  // part (head for brain, legs for speed, mouth for food).
  const headY = footY - 110;
  const chestY = footY - 75;
  const bellyY = footY - 50;
  const legsY = footY - 25;
  const mouthOffsetX = creature.bodyPlan === 'fish' ? 60 : 35;

  const annotations: Annotation[] = [
    {
      emoji: '🧠', label: 'Brain', value: `${stats.brainMassGrams.toFixed(stats.brainMassGrams < 1 ? 2 : stats.brainMassGrams < 10 ? 1 : 0)} g`,
      note: brainNote(stats.brainMassGrams, eqProxy),
      anchor: { x: cx + 50, y: headY },
      cardX: W - 12, cardY: 36, category: 'brain',
    },
    {
      emoji: '❤️', label: 'Heart', value: `${stats.heartRateBpm} bpm`,
      note: heartNote(stats.heartRateBpm),
      anchor: { x: cx - 10, y: chestY },
      cardX: 12, cardY: 36, category: 'metab',
    },
    {
      emoji: '🏃', label: 'Top speed', value: `${stats.topSpeedKmh} km/h`,
      note: speedComparison(stats.topSpeedKmh),
      anchor: { x: cx + 30, y: legsY },
      cardX: W - 12, cardY: 108, category: 'speed',
    },
    {
      emoji: '⚖️', label: 'Mass', value: fmtMass(stats.massKg),
      note: massComparison(stats.massKg),
      anchor: { x: cx - 20, y: bellyY },
      cardX: 12, cardY: 108, category: 'body',
    },
    {
      emoji: '🕰️', label: 'Lifespan', value: `${stats.lifespanYears < 10 ? stats.lifespanYears.toFixed(1) : Math.round(stats.lifespanYears)} yrs`,
      note: lifespanNote(stats.lifespanYears),
      anchor: { x: cx, y: headY - 18 },
      cardX: W - 12, cardY: 180, category: 'life',
    },
    {
      emoji: '🍽️', label: 'Daily food', value: `${stats.foodKcalPerDay.toLocaleString()} kcal`,
      note: creature.warmBlooded ? 'warm-blooded burn' : '~⅒ of a warm-blood',
      anchor: { x: cx + mouthOffsetX, y: chestY - 5 },
      cardX: 12, cardY: 180, category: 'metab',
    },
    {
      emoji: creature.warmBlooded ? '🥶' : '❄️',
      label: 'Cold limit',
      value: `${Math.round(stats.coldTolerance)}°C`,
      note: coldNote(stats.coldTolerance),
      anchor: { x: cx - 35, y: bellyY + 5 },
      cardX: 12, cardY: 252, category: 'sense',
    },
    {
      emoji: '🛣️', label: 'Endurance', value: `${stats.enduranceKm} km`,
      note: creature.warmBlooded ? 'cardio burn' : 'sprint-only',
      anchor: { x: cx + 35, y: legsY - 10 },
      cardX: W - 12, cardY: 252, category: 'speed',
    },
  ];

  // For each annotation we pick text-anchor based on whether the card is
  // on the left or right side of the canvas.
  function renderCard(a: Annotation) {
    const onRight = a.cardX > W / 2;
    const cardW = 144;
    const cardH = 56;
    const cardLeft = onRight ? a.cardX - cardW : a.cardX;
    const color = CATEGORY_COLOR[a.category];
    // Connector endpoint on the card edge facing the creature
    const connectorX = onRight ? cardLeft : cardLeft + cardW;
    const connectorY = a.cardY + cardH / 2;

    return (
      <g key={a.label}>
        {/* dashed connector line from card to body anchor */}
        <line
          x1={connectorX} y1={connectorY}
          x2={a.anchor.x} y2={a.anchor.y}
          stroke={color} strokeWidth="1.4" strokeDasharray="4 3" opacity="0.7"
        />
        {/* tiny dot at the body anchor */}
        <circle cx={a.anchor.x} cy={a.anchor.y} r="3" fill={color} opacity="0.9" />
        <circle cx={a.anchor.x} cy={a.anchor.y} r="6" fill="none" stroke={color} strokeWidth="1.2" opacity="0.5" />
        {/* annotation card */}
        <rect
          x={cardLeft} y={a.cardY} width={cardW} height={cardH}
          fill="white" stroke={color} strokeWidth="1.8" rx="8"
        />
        {/* coloured stripe on the connector side */}
        <rect
          x={onRight ? cardLeft : cardLeft + cardW - 4}
          y={a.cardY} width="4" height={cardH}
          fill={color}
        />
        <text x={cardLeft + 10} y={a.cardY + 17} fontSize="14">{a.emoji}</text>
        <text x={cardLeft + 30} y={a.cardY + 16} fontSize="10" fontWeight="700"
              fill={color} textAnchor="start">
          {a.label.toUpperCase()}
        </text>
        <text x={cardLeft + 30} y={a.cardY + 32} fontSize="14" fontWeight="800"
              fill="#1a1208" textAnchor="start">
          {a.value}
        </text>
        <text x={cardLeft + 8} y={a.cardY + 48} fontSize="9.5"
              fill="#6a4828" textAnchor="start" fontStyle="italic">
          {a.note}
        </text>
      </g>
    );
  }

  return (
    <>
      {/* Parchment background, like a biology textbook page */}
      <rect width={W} height={H} fill="#fbf6e6" />
      {/* faint grid for that lab-paper feel */}
      <g opacity="0.18" stroke="#c8a878">
        {Array.from({ length: Math.floor(W / 24) }).map((_, i) => (
          <line key={`v${i}`} x1={i * 24} y1={0} x2={i * 24} y2={H} strokeWidth="0.5" />
        ))}
        {Array.from({ length: Math.floor(H / 24) }).map((_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 24} x2={W} y2={i * 24} strokeWidth="0.5" />
        ))}
      </g>

      {/* Title strip */}
      <text x={W / 2} y={22} textAnchor="middle" fontSize="13" fontWeight="700" fill="#5a3b18" letterSpacing="0.05em">
        🔬 BIOPHYSICS LAB · {creature.name}
      </text>
      <line x1={W / 2 - 130} y1={28} x2={W / 2 + 130} y2={28} stroke="#5a3b18" strokeWidth="0.8" opacity="0.5" />

      {/* Creature in the centre — same size as the skin view so positions match */}
      {hasBespokeShape(creature) ? (
        <BespokeInScene
          creature={creature}
          x={cx - 65} y={footY - 110}
          width={130} height={110}
          animate="breathe"
        />
      ) : (
        <CreatureBody creature={creature} cx={cx} footY={footY} scale={0.36} animate="breathe" />
      )}

      {/* Annotations */}
      {annotations.map(renderCard)}
    </>
  );
}
