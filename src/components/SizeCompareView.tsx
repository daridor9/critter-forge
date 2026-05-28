import { useState } from 'react';
import type { ReactElement } from 'react';
import type { Creature } from '../types';
import { sizeToMass } from '../physics';
import { CreatureBody } from './CreatureSVG';
import { BespokeInScene, hasBespokeShape } from './dexShapes';

interface Props {
  creature: Creature;
  /** Canvas width / height in user units. The parent SVG matches these. */
  W: number;
  H: number;
}

interface Reference {
  id: string;
  emoji: string;
  name: string;
  lengthM: number;     // visual reference length in metres
  massKg: number;      // reference mass for the caption
  /** SVG silhouette drawn into a 100×100 viewBox, baseline at y=92. */
  Silhouette: () => ReactElement;
}

// ─── Reference silhouettes ────────────────────────────────────────────
// Simple monochrome side-views in a 100×100 box, "feet" at y≈92 so they
// stand on the ground line. Drawn here rather than reused from the dex so
// they stay generic — they represent the IDEA of a mouse / horse / whale,
// not a specific dex animal.

function MouseSilhouette() {
  return (
    <g fill="#5a4838">
      <ellipse cx="50" cy="80" rx="22" ry="10" />
      <circle cx="74" cy="74" r="9" />
      <circle cx="80" cy="68" r="4" />     {/* ear */}
      <line x1="84" y1="74" x2="98" y2="76" stroke="#5a4838" strokeWidth="1" />   {/* whisker */}
      <line x1="28" y1="86" x2="14" y2="92" stroke="#5a4838" strokeWidth="2" strokeLinecap="round" />  {/* tail */}
      <rect x="38" y="86" width="3" height="6" />
      <rect x="58" y="86" width="3" height="6" />
    </g>
  );
}

function CatSilhouette() {
  return (
    <g fill="#3a2a1c">
      <ellipse cx="50" cy="62" rx="30" ry="14" />              {/* body */}
      <circle cx="76" cy="50" r="11" />                         {/* head */}
      <polygon points="68 41 72 32 76 41" />                    {/* ear L */}
      <polygon points="80 41 84 32 88 41" />                    {/* ear R */}
      <path d="M 22 60 Q 8 50 4 38" stroke="#3a2a1c" strokeWidth="4" fill="none" strokeLinecap="round" />  {/* tail up */}
      <rect x="32" y="72" width="5" height="20" />
      <rect x="62" y="72" width="5" height="20" />
    </g>
  );
}

function DogSilhouette() {
  return (
    <g fill="#5a4020">
      <ellipse cx="50" cy="58" rx="36" ry="14" />              {/* body */}
      <ellipse cx="82" cy="50" rx="11" ry="10" />              {/* head */}
      <ellipse cx="92" cy="56" rx="6" ry="3" />                {/* snout */}
      <polygon points="76 44 72 32 80 40" />                   {/* ear */}
      <path d="M 18 56 Q 8 48 6 38" stroke="#5a4020" strokeWidth="4" fill="none" strokeLinecap="round" />
      <rect x="30" y="68" width="5" height="24" />
      <rect x="60" y="68" width="5" height="24" />
    </g>
  );
}

function PersonSilhouette() {
  return (
    <g fill="#2a2018">
      <circle cx="50" cy="22" r="10" />                        {/* head */}
      <path d="M 50 32 L 50 64" stroke="#2a2018" strokeWidth="14" strokeLinecap="round" />  {/* torso */}
      <path d="M 50 38 L 36 56" stroke="#2a2018" strokeWidth="5" strokeLinecap="round" />   {/* arm L */}
      <path d="M 50 38 L 64 56" stroke="#2a2018" strokeWidth="5" strokeLinecap="round" />   {/* arm R */}
      <path d="M 46 64 L 42 92" stroke="#2a2018" strokeWidth="6" strokeLinecap="round" />   {/* leg L */}
      <path d="M 54 64 L 58 92" stroke="#2a2018" strokeWidth="6" strokeLinecap="round" />   {/* leg R */}
    </g>
  );
}

function HorseSilhouette() {
  return (
    <g fill="#4a2818">
      <ellipse cx="48" cy="50" rx="36" ry="14" />              {/* body */}
      <path d="M 80 50 L 88 30 L 92 32 L 86 52" />              {/* neck */}
      <ellipse cx="90" cy="28" rx="8" ry="5" transform="rotate(15 90 28)" />  {/* head */}
      <polygon points="86 22 88 14 90 22" />                    {/* ear */}
      <path d="M 12 50 Q 4 40 6 28" stroke="#4a2818" strokeWidth="3" fill="none" strokeLinecap="round" />  {/* tail */}
      <rect x="26" y="62" width="5" height="30" />
      <rect x="42" y="62" width="5" height="30" />
      <rect x="58" y="62" width="5" height="30" />
      <rect x="74" y="62" width="5" height="30" />
    </g>
  );
}

function ElephantSilhouette() {
  return (
    <g fill="#5a5040">
      <ellipse cx="46" cy="56" rx="40" ry="20" />              {/* body */}
      <circle cx="80" cy="56" r="16" />                         {/* head */}
      <path d="M 92 60 Q 96 76 90 86 Q 86 88 84 84 Q 88 76 86 64" fill="#5a5040" />  {/* trunk */}
      <ellipse cx="70" cy="58" rx="10" ry="14" />              {/* ear */}
      <rect x="14" y="74" width="7" height="18" />
      <rect x="32" y="74" width="7" height="18" />
      <rect x="56" y="74" width="7" height="18" />
      <rect x="72" y="78" width="7" height="14" />
    </g>
  );
}

function WhaleSilhouette() {
  return (
    <g fill="#2a3a58">
      <path d="M 4 60 Q 30 30 70 36 Q 90 40 96 52 Q 92 64 76 68 Q 50 76 24 72 Q 8 68 4 60 Z" />
      <polygon points="4 60 -4 50 -4 70" fill="#2a3a58" />     {/* fluke */}
      <circle cx="84" cy="50" r="2" fill="white" />            {/* eye */}
      <path d="M 70 36 L 70 24" stroke="#2a3a58" strokeWidth="2" />  {/* blowhole spray */}
      <circle cx="70" cy="22" r="3" fill="#cfe8f5" />
    </g>
  );
}

const REFERENCES: Reference[] = [
  { id: 'mouse',    emoji: '🐭', name: 'Mouse',        lengthM: 0.10,  massKg: 0.025, Silhouette: MouseSilhouette },
  { id: 'cat',      emoji: '🐱', name: 'House cat',    lengthM: 0.5,   massKg: 4,     Silhouette: CatSilhouette },
  { id: 'dog',      emoji: '🐕', name: 'Dog',          lengthM: 0.9,   massKg: 25,    Silhouette: DogSilhouette },
  { id: 'person',   emoji: '🧍', name: 'Person',       lengthM: 1.7,   massKg: 70,    Silhouette: PersonSilhouette },
  { id: 'horse',    emoji: '🐎', name: 'Horse',        lengthM: 2.5,   massKg: 500,   Silhouette: HorseSilhouette },
  { id: 'elephant', emoji: '🐘', name: 'Elephant',     lengthM: 6,     massKg: 5000,  Silhouette: ElephantSilhouette },
  { id: 'whale',    emoji: '🐳', name: 'Blue whale',   lengthM: 30,    massKg: 150000, Silhouette: WhaleSilhouette },
];

// Body-plan aware length estimate from mass. Real animals don't all scale
// the same way; fish are elongated, birds are compact, mammals/reptiles are
// in the middle.
function estimateLengthM(creature: Creature): number {
  const m = sizeToMass(creature.sizeUnit);
  const cbrt = Math.cbrt(m);
  switch (creature.bodyPlan) {
    case 'fish':    return 0.5 * cbrt;   // long, hydrodynamic
    case 'bird':    return 0.22 * cbrt;  // compact
    case 'reptile': return 0.42 * cbrt;  // mid-elongated
    default:        return 0.35 * cbrt;  // mammal — standard quadruped
  }
}

function formatLength(m: number): string {
  if (m < 0.01) return `${Math.round(m * 1000)} mm`;
  if (m < 1) return `${Math.round(m * 100)} cm`;
  if (m < 10) return `${m.toFixed(1)} m`;
  return `${Math.round(m)} m`;
}

function formatMass(kg: number): string {
  if (kg < 0.1) return `${Math.round(kg * 1000)} g`;
  if (kg < 1000) return `${kg.toFixed(kg < 10 ? 1 : 0)} kg`;
  return `${(kg / 1000).toFixed(kg < 10000 ? 1 : 0)} t`;
}

export function SizeCompareView({ creature, W, H }: Props) {
  const [refId, setRefId] = useState<string>(() => {
    // Default to a reference roughly the same size as the creature, so the
    // first impression isn't "your mouse next to a blue whale".
    const len = estimateLengthM(creature);
    let best = REFERENCES[0];
    let bestRatio = Infinity;
    for (const r of REFERENCES) {
      const ratio = Math.max(r.lengthM / len, len / r.lengthM);
      if (ratio < bestRatio) { bestRatio = ratio; best = r; }
    }
    return best.id;
  });
  const ref = REFERENCES.find((r) => r.id === refId) ?? REFERENCES[3];

  const creatureLengthM = estimateLengthM(creature);
  const creatureMassKg = sizeToMass(creature.sizeUnit);
  const maxLengthM = Math.max(creatureLengthM, ref.lengthM);

  // Layout: the canvas is W=600 wide. We allocate ~520px for drawing (40px
  // padding each side) and scale both silhouettes so the LARGER one fills
  // most of the available width or height (whichever runs out first). Ground
  // line at y=H-30 (matching the parent canvas style).
  const drawAreaW = W - 80;
  const groundY = H - 36;
  const maxDrawHeight = groundY - 50;

  // pxPerMetre: the conversion factor. Pick the smaller of:
  //   - what fits both creatures side-by-side in drawAreaW (each gets half)
  //   - what fits the larger creature vertically within maxDrawHeight
  // assume silhouette height ≈ length × 0.6 (rough, but consistent).
  const pxPerMetreByWidth = (drawAreaW * 0.45) / maxLengthM;
  const pxPerMetreByHeight = maxDrawHeight / (maxLengthM * 0.6);
  const pxPerMetre = Math.min(pxPerMetreByWidth, pxPerMetreByHeight);

  const creatureW = creatureLengthM * pxPerMetre;
  const creatureHpx = Math.max(20, creatureW * 0.6);
  const refW = ref.lengthM * pxPerMetre;
  const refH = Math.max(16, refW * 0.6);

  const creatureX = 40 + drawAreaW * 0.25;   // centered in left half
  const refX = 40 + drawAreaW * 0.75;        // centered in right half

  const RefSil = ref.Silhouette;

  // Caption logic: where does the player's creature land relative to the references?
  const sorted = [...REFERENCES].sort((a, b) => a.lengthM - b.lengthM);
  let captionText: string;
  if (creatureLengthM < sorted[0].lengthM * 0.5) {
    captionText = `Tinier than a ${sorted[0].name.toLowerCase()}.`;
  } else if (creatureLengthM > sorted[sorted.length - 1].lengthM * 1.5) {
    captionText = `Bigger than a ${sorted[sorted.length - 1].name.toLowerCase()}.`;
  } else {
    // find adjacent refs
    let lower: Reference | null = null;
    let upper: Reference | null = null;
    for (let i = 0; i < sorted.length - 1; i++) {
      if (creatureLengthM >= sorted[i].lengthM && creatureLengthM <= sorted[i + 1].lengthM) {
        lower = sorted[i];
        upper = sorted[i + 1];
        break;
      }
    }
    if (lower && upper) {
      captionText = `Between ${lower.emoji} ${lower.name.toLowerCase()} and ${upper.emoji} ${upper.name.toLowerCase()}.`;
    } else {
      captionText = `Roughly ${ref.emoji} ${ref.name.toLowerCase()}-sized.`;
    }
  }

  return (
    <>
      {/* Sky/ground backdrop in the parent SVG's coord space */}
      <rect x="0" y="0" width={W} height={groundY} fill="#e6efe7" />
      <rect x="0" y={groundY} width={W} height={H - groundY} fill="#c8b890" />
      <line x1="0" y1={groundY} x2={W} y2={groundY} stroke="#8a6a3a" strokeWidth="2" />

      {/* Title */}
      <text x={W / 2} y="26" textAnchor="middle" fontSize="14" fontWeight="700" fill="#3a2a1c">
        Size compare
      </text>

      {/* PLAYER CREATURE on the left */}
      <g transform={`translate(${creatureX - creatureW / 2} ${groundY - creatureHpx})`}>
        {hasBespokeShape(creature) ? (
          <BespokeInScene creature={creature} x={0} y={0} width={creatureW} height={creatureHpx} animate="breathe" />
        ) : (
          <g transform={`translate(${creatureW / 2} ${creatureHpx})`}>
            <CreatureBody creature={creature} cx={0} footY={0} scale={Math.min(0.5, creatureW / 200)} animate="breathe" />
          </g>
        )}
      </g>
      <text x={creatureX} y={groundY - creatureHpx - 8} textAnchor="middle" fontSize="11" fontWeight="700" fill="#3a2a1c">
        Your creature
      </text>
      <text x={creatureX} y={groundY - creatureHpx - 22} textAnchor="middle" fontSize="11" fill="#3a2a1c">
        {formatLength(creatureLengthM)} · {formatMass(creatureMassKg)}
      </text>

      {/* REFERENCE on the right — render the 100×100 silhouette scaled to refW×refH */}
      <g transform={`translate(${refX - refW / 2} ${groundY - refH}) scale(${refW / 100} ${refH / 100})`}>
        <RefSil />
      </g>
      <text x={refX} y={groundY - refH - 8} textAnchor="middle" fontSize="11" fontWeight="700" fill="#3a2a1c">
        {ref.emoji} {ref.name}
      </text>
      <text x={refX} y={groundY - refH - 22} textAnchor="middle" fontSize="11" fill="#3a2a1c">
        {formatLength(ref.lengthM)} · {formatMass(ref.massKg)}
      </text>

      {/* CAPTION at the bottom */}
      <text x={W / 2} y={H - 12} textAnchor="middle" fontSize="12" fill="#3a2a1c" fontWeight="600">
        {captionText}
      </text>

      {/* Reference picker — using foreignObject to embed HTML buttons */}
      <foreignObject x="8" y={H - 30} width={W - 16} height="22">
        <div className="size-compare-picker">
          {REFERENCES.map((r) => (
            <button
              key={r.id}
              type="button"
              className={r.id === refId ? 'active' : ''}
              onClick={() => setRefId(r.id)}
              title={`Compare to ${r.name}`}
            >
              <span style={{ fontSize: 16 }}>{r.emoji}</span>
            </button>
          ))}
        </div>
      </foreignObject>
    </>
  );
}
