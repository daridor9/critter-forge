import type { Creature, AnatomyLayer } from '../types';
import { CreatureBody } from './CreatureSVG';
import { getBespokeShape } from './dexShapes';
import { getBespokeXray } from './xrayShapes';
import { hybridCatalog } from '../data/hybrids';
import { sizeToMass } from '../physics';

const W = 400;
const H = 300;

const FOOT_Y: Record<string, number> = {
  mammal: 252,
  reptile: 252,
  bird: 232,
  fish: 195,
};

interface Props {
  creature: Creature;
  /** Backward compat: `true` is the same as layer='anatomy'. */
  xray?: boolean;
  layer?: AnatomyLayer;
}

export function CreatureStage({ creature, xray = false, layer }: Props) {
  const effLayer: AnatomyLayer = layer ?? (xray ? 'anatomy' : 'skin');
  const isXray = effLayer !== 'skin';
  const footY = FOOT_Y[creature.bodyPlan];

  // If this creature was loaded straight from the dex (and not yet mutated),
  // render the bespoke canonical shape so an octopus actually looks like an
  // octopus instead of a generic fish silhouette.
  const Bespoke = !isXray ? getBespokeShape(creature.shape) : null;
  if (Bespoke && creature.colors) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <Bespoke colors={creature.colors} />
        {creature.hybrids.length > 0 && (
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {creature.hybrids.map((id, i) => {
              const info = hybridCatalog.find((h) => h.id === id);
              if (!info) return null;
              return (
                <text key={id} x={W / 2 + (i - (creature.hybrids.length - 1) / 2) * 30} y={26} textAnchor="middle" fontSize="20">
                  {info.emoji}
                </text>
              );
            })}
          </svg>
        )}
      </div>
    );
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      {effLayer === 'anatomy' ? (
        <rect width={W} height={H} fill="#f4ecd5" />
      ) : effLayer === 'muscles' ? (
        <rect width={W} height={H} fill="#fcefe6" />
      ) : (
        <>
          {creature.bodyPlan === 'mammal' && <MeadowHabitat />}
          {creature.bodyPlan === 'reptile' && <RockyHabitat />}
          {creature.bodyPlan === 'bird' && <SkyHabitat />}
          {creature.bodyPlan === 'fish' && <UnderwaterHabitat />}
        </>
      )}

      {creature.hybrids.length > 0 && !isXray && (
        <g>
          {creature.hybrids.map((id, i) => {
            const info = hybridCatalog.find((h) => h.id === id);
            if (!info) return null;
            return (
              <text key={id} x={W / 2 + (i - (creature.hybrids.length - 1) / 2) * 30} y={26} textAnchor="middle" fontSize="20">
                {info.emoji}
              </text>
            );
          })}
        </g>
      )}

      {effLayer === 'anatomy' ? (
        (() => {
          // Bespoke per-Dex-animal x-rays (octopus 9 brains, whale car-sized
          // heart, shark cartilage) win over the generic procedural one.
          const BespokeXray = getBespokeXray(creature.shape);
          if (BespokeXray) {
            const m = sizeToMass(creature.sizeUnit);
            return (
              <>
                <rect width={W} height={H} fill="#0c1e30" />
                <BespokeXray creature={creature} massKg={m} />
              </>
            );
          }
          return <AnatomyView creature={creature} cx={W / 2} footY={footY} />;
        })()
      ) : effLayer === 'muscles' ? (
        <MusclesView creature={creature} cx={W / 2} footY={footY} />
      ) : (
        <CreatureBody creature={creature} cx={W / 2} footY={footY} scale={1} animate="breathe" />
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Shared metrics for anatomy/muscles views — same math as CreatureBody so the
// skeleton/muscles line up under the skin silhouette.
// ─────────────────────────────────────────────────────────────────────────
interface AnatomyMetrics {
  bodyW: number;
  bodyH: number;
  cx: number;
  cy: number;
  headR: number;
  headCx: number;
  headCy: number;
  legLen: number;
  legXs: number[];
  heartRateBpm: number;
  beatPeriod: number;
  sizeT: number;
  m: number;
}

function getAnatomyMetrics(creature: Creature, cx: number, footY: number, opts?: { presentation?: boolean }): AnatomyMetrics {
  const m = sizeToMass(creature.sizeUnit);
  const logM = Math.log10(Math.max(0.01, m));
  const sizeT = Math.max(0, Math.min(1, (logM + 2) / 7));
  const baseSize = Math.max(15, 30 + logM * 22);
  const bodyAspect = 1.35 + sizeT * 1.15;
  let bodyH = baseSize;
  let bodyW = bodyH * bodyAspect;
  let legLen = [bodyH * 0.4, bodyH * 0.75, bodyH * 1.15][creature.legTier];
  let headR = bodyH * 0.44 * [0.78, 1.0, 1.22, 1.45][creature.brainTier] * (1.42 - sizeT * 1.1);

  // Presentation mode: anatomy and muscle views zoom the creature so it
  // fills the canvas. Otherwise tiny creatures get lost in empty space.
  // Target: total height (body + legs) ≈ 210px in a 300px canvas, capped
  // at 2.6× zoom to avoid overflow for already-large creatures.
  if (opts?.presentation) {
    const rawTotal = bodyH + legLen;
    const zoom = Math.max(1, Math.min(2.6, 210 / rawTotal));
    bodyH *= zoom;
    bodyW *= zoom;
    legLen *= zoom;
    headR *= zoom;
  }

  // In presentation mode anchor the creature vertically near the canvas
  // center; otherwise keep the foot-on-the-ground placement used by the
  // skin/habitat view so habitats line up the way they always have.
  const cy = opts?.presentation
    ? 145 - legLen / 2
    : footY - bodyH / 2 - legLen;

  const headCx = cx + bodyW / 2 - 6;
  const headCy = cy - bodyH * 0.14;
  const numLegs = creature.bodyPlan === 'fish' ? 0 : creature.bodyPlan === 'bird' ? 2 : 4;
  const legXs =
    numLegs === 2 ? [cx - bodyW * 0.2, cx + bodyW * 0.2]
    : numLegs === 4 ? [cx - bodyW * 0.38, cx - bodyW * 0.12, cx + bodyW * 0.12, cx + bodyW * 0.38]
    : [];
  // Allometric heart rate from mass — same formula as physics.ts.
  const heartRateBpm = Math.max(4, Math.round(241 * Math.pow(m, -0.25)));
  const beatPeriod = Math.max(0.25, 60 / heartRateBpm);
  return { bodyW, bodyH, cx, cy, headR, headCx, headCy, legLen, legXs, heartRateBpm, beatPeriod, sizeT, m };
}

// ─────────────────────────────────────────────────────────────────────────
// AnatomyView — biology-textbook style: skeleton + labeled organs.
// Ink-on-parchment palette. Renders on a cream rect set by the parent.
// ─────────────────────────────────────────────────────────────────────────
const INK = '#3a2a1a';
const INK_LIGHT = '#7a5a3a';
const ORGAN = {
  brain: '#b48ad4',
  heart: '#d64558',
  lungs: '#7ab8e0',
  liver: '#a04030',
  stomach: '#e09a40',
  kidney: '#7a3a5a',
};

function AnatomyView({ creature, cx, footY }: { creature: Creature; cx: number; footY: number }) {
  const M = getAnatomyMetrics(creature, cx, footY, { presentation: true });
  const { bodyW, bodyH, cy, headR, headCx, headCy, legLen, legXs, heartRateBpm, beatPeriod, m } = M;

  const isFish = creature.bodyPlan === 'fish';
  const isMammal = creature.bodyPlan === 'mammal';

  // Ribcage: 5 pairs of ribs curving from spine down to body bottom
  const ribCount = 5;
  const ribs: { x: number }[] = [];
  for (let i = 0; i < ribCount; i++) {
    const t = (i + 0.5) / ribCount;          // 0..1 along body
    const x = cx + (t - 0.5) * bodyW * 0.85;
    ribs.push({ x });
  }
  const spineTopY = cy - bodyH * 0.05;       // spine sits near top of body
  const bottomY = cy + bodyH * 0.42;
  const vertCount = 9;

  // Skull control points
  const skullR = headR * 0.95;
  const jawTip = { x: headCx + skullR * 1.05, y: headCy + skullR * 0.4 };

  // Organ positions (relative to body center)
  const heart = { x: cx - bodyW * 0.18, y: cy - bodyH * 0.05 };
  const lungL = { x: cx - bodyW * 0.06, y: cy - bodyH * 0.2 };
  const lungR = { x: cx + bodyW * 0.06, y: cy - bodyH * 0.2 };
  const liver = { x: cx + bodyW * 0.0,  y: cy + bodyH * 0.08 };
  const stomach = { x: cx + bodyW * 0.22, y: cy + bodyH * 0.05 };
  const kidneyL = { x: cx + bodyW * 0.28, y: cy - bodyH * 0.05 };
  const kidneyR = { x: cx + bodyW * 0.38, y: cy };

  return (
    <g>
      {/* Graph-paper grid — sells the "textbook page" feel. Faint
          parchment-on-parchment so it never competes with the anatomy. */}
      <g stroke="#d8c8a0" strokeWidth="0.4" opacity="0.7">
        {Array.from({ length: Math.ceil(W / 20) + 1 }).map((_, i) => (
          <line key={`gv-${i}`} x1={i * 20} y1={0} x2={i * 20} y2={H} />
        ))}
        {Array.from({ length: Math.ceil(H / 20) + 1 }).map((_, i) => (
          <line key={`gh-${i}`} x1={0} y1={i * 20} x2={W} y2={i * 20} />
        ))}
      </g>
      {/* Slightly darker every-100 lines for a real graph-paper feel */}
      <g stroke="#b8a070" strokeWidth="0.6" opacity="0.55">
        {Array.from({ length: Math.ceil(W / 100) + 1 }).map((_, i) => (
          <line key={`gV-${i}`} x1={i * 100} y1={0} x2={i * 100} y2={H} />
        ))}
        {Array.from({ length: Math.ceil(H / 100) + 1 }).map((_, i) => (
          <line key={`gH-${i}`} x1={0} y1={i * 100} x2={W} y2={i * 100} />
        ))}
      </g>

      {/* Textbook title: "Anatomy of [name]" with a mass + body-plan subtitle */}
      <g>
        <text
          x={W / 2} y={22}
          textAnchor="middle"
          fontSize="13" fontWeight="700"
          fontFamily="ui-rounded, Georgia, serif"
          fill={INK}
          style={{ letterSpacing: '0.02em' }}
        >
          Anatomy of {creature.name}
        </text>
        <text
          x={W / 2} y={36}
          textAnchor="middle"
          fontSize="9.5"
          fontFamily="ui-rounded, system-ui, sans-serif"
          fill={INK_LIGHT}
          style={{ fontStyle: 'italic' }}
        >
          {m < 0.1 ? `${(m * 1000).toFixed(0)} g` : m < 10 ? `${m.toFixed(1)} kg` : `${Math.round(m)} kg`} · {creature.bodyPlan}{creature.warmBlooded ? '' : ' (cold-blooded)'}
        </text>
      </g>

      {/* Faint body silhouette so the skeleton has context */}
      <ellipse cx={cx} cy={cy} rx={bodyW / 2} ry={bodyH / 2} fill="#fff" fillOpacity="0.35" stroke={INK_LIGHT} strokeWidth="0.6" strokeDasharray="2 3" />
      <circle cx={headCx} cy={headCy} r={headR} fill="#fff" fillOpacity="0.35" stroke={INK_LIGHT} strokeWidth="0.6" strokeDasharray="2 3" />

      {/* ── SKELETON ── */}
      {/* Spine: connected vertebrae across the body */}
      <g stroke={INK} strokeWidth="1.4" fill="none">
        {Array.from({ length: vertCount }).map((_, i) => {
          const t = i / (vertCount - 1);
          const x1 = cx - bodyW * 0.45 + t * bodyW * 0.9;
          return <circle key={i} cx={x1} cy={spineTopY} r={Math.max(1.4, bodyH * 0.04)} fill={INK} stroke="none" />;
        })}
        <line x1={cx - bodyW * 0.45} y1={spineTopY} x2={cx + bodyW * 0.45} y2={spineTopY} strokeWidth="0.8" />
      </g>

      {/* Ribcage */}
      <g stroke={INK} strokeWidth="1.2" fill="none" strokeLinecap="round">
        {ribs.map((r, i) => (
          <g key={i}>
            <path d={`M ${r.x} ${spineTopY} Q ${r.x - bodyW * 0.06} ${cy + bodyH * 0.05} ${r.x - bodyW * 0.02} ${bottomY}`} />
            <path d={`M ${r.x} ${spineTopY} Q ${r.x + bodyW * 0.06} ${cy + bodyH * 0.05} ${r.x + bodyW * 0.02} ${bottomY}`} />
          </g>
        ))}
      </g>

      {/* Pelvis at rear of body */}
      {!isFish && (
        <g stroke={INK} strokeWidth="1.6" fill="none">
          <path d={`M ${cx + bodyW * 0.32} ${spineTopY} Q ${cx + bodyW * 0.42} ${cy + bodyH * 0.15} ${cx + bodyW * 0.5} ${cy + bodyH * 0.32}`} />
          <path d={`M ${cx + bodyW * 0.32} ${spineTopY} Q ${cx + bodyW * 0.5} ${cy + bodyH * 0.1} ${cx + bodyW * 0.5} ${cy + bodyH * 0.32}`} />
        </g>
      )}

      {/* Legs as femur + tibia with knee joint */}
      {legXs.map((x, i) => {
        const hipY = cy + bodyH * 0.42;
        const kneeY = hipY + legLen * 0.5;
        const footYY = hipY + legLen;
        const kneeOff = (i % 2 === 0 ? 1 : -1) * legLen * 0.04;
        return (
          <g key={`leg-${i}`} stroke={INK} strokeWidth="1.6" strokeLinecap="round">
            <line x1={x} y1={hipY} x2={x + kneeOff} y2={kneeY} />
            <line x1={x + kneeOff} y1={kneeY} x2={x} y2={footYY} />
            <circle cx={x + kneeOff} cy={kneeY} r="1.6" fill={INK} stroke="none" />
            <circle cx={x} cy={footYY} r="1.4" fill={INK} stroke="none" />
          </g>
        );
      })}

      {/* Skull: cranial dome + lower jaw line */}
      <g stroke={INK} strokeWidth="1.4" fill="none" strokeLinecap="round">
        <circle cx={headCx} cy={headCy} r={skullR} />
        <path d={`M ${headCx + skullR * 0.4} ${headCy + skullR * 0.2} L ${jawTip.x} ${jawTip.y} L ${headCx - skullR * 0.3} ${headCy + skullR * 0.55}`} />
        {/* Eye socket */}
        <circle cx={headCx + skullR * 0.45} cy={headCy - skullR * 0.05} r={Math.max(2, skullR * 0.18)} stroke={INK} />
      </g>

      {/* Tail vertebrae for mammals */}
      {isMammal && (() => {
        const tailStart = cx - bodyW * 0.45;
        const tailSegs = 5;
        return (
          <g stroke={INK} strokeWidth="1" fill={INK}>
            {Array.from({ length: tailSegs }).map((_, i) => {
              const t = i / (tailSegs - 1);
              const tx = tailStart - bodyH * 0.5 * t;
              const ty = spineTopY - bodyH * 0.35 * Math.pow(t, 1.5);
              return <circle key={i} cx={tx} cy={ty} r={Math.max(1, 2.2 - t * 1.4)} />;
            })}
          </g>
        );
      })()}

      {/* Neck connector skull→spine */}
      <line x1={cx + bodyW * 0.45} y1={spineTopY} x2={headCx - skullR * 0.4} y2={headCy + skullR * 0.1} stroke={INK} strokeWidth="1.4" strokeLinecap="round" />

      {/* ── ORGANS ── */}
      {/* Lungs (two lobes behind ribcage) */}
      <ellipse cx={lungL.x} cy={lungL.y} rx={Math.max(4, bodyW * 0.09)} ry={Math.max(3, bodyH * 0.13)} fill={ORGAN.lungs} opacity="0.7" />
      <ellipse cx={lungR.x} cy={lungR.y} rx={Math.max(4, bodyW * 0.09)} ry={Math.max(3, bodyH * 0.13)} fill={ORGAN.lungs} opacity="0.7" />
      {/* Bronchi sketch */}
      <g stroke="#4a85b0" strokeWidth="0.8" fill="none">
        <line x1={lungL.x + 2} y1={lungL.y - bodyH * 0.05} x2={lungR.x - 2} y2={lungR.y - bodyH * 0.05} />
        <line x1={(lungL.x + lungR.x) / 2} y1={lungL.y - bodyH * 0.05} x2={(lungL.x + lungR.x) / 2} y2={lungL.y - bodyH * 0.16} />
      </g>

      {/* Heart — animated */}
      <ellipse
        cx={heart.x} cy={heart.y}
        rx={Math.max(4, bodyW * 0.09)} ry={Math.max(4, bodyH * 0.11)}
        fill={ORGAN.heart}
        style={{ animation: `heartbeat ${beatPeriod}s ease-in-out infinite`, transformOrigin: `${heart.x}px ${heart.y}px`, transformBox: 'fill-box' }}
      />
      {/* Aorta arch */}
      <path d={`M ${heart.x} ${heart.y - bodyH * 0.1} q ${bodyW * 0.04} ${-bodyH * 0.06} ${bodyW * 0.08} 0`} stroke="#8a1f2c" strokeWidth="1.4" fill="none" strokeLinecap="round" />

      {/* Liver */}
      <path
        d={`M ${liver.x - bodyW * 0.1} ${liver.y} q ${bodyW * 0.08} ${-bodyH * 0.06} ${bodyW * 0.16} 0 q ${bodyW * 0.04} ${bodyH * 0.08} ${-bodyW * 0.04} ${bodyH * 0.1} q ${-bodyW * 0.16} ${bodyH * 0.02} ${-bodyW * 0.12} ${-bodyH * 0.1} Z`}
        fill={ORGAN.liver} opacity="0.78"
      />

      {/* Stomach: curved pouch */}
      <path
        d={`M ${stomach.x - bodyW * 0.06} ${stomach.y} q ${bodyW * 0.04} ${-bodyH * 0.08} ${bodyW * 0.1} ${-bodyH * 0.02} q ${bodyW * 0.04} ${bodyH * 0.06} ${-bodyW * 0.02} ${bodyH * 0.1} q ${-bodyW * 0.1} ${bodyH * 0.02} ${-bodyW * 0.08} ${-bodyH * 0.08} Z`}
        fill={ORGAN.stomach} opacity="0.75"
      />

      {/* Kidneys (pair behind, near pelvis) */}
      <ellipse cx={kidneyL.x} cy={kidneyL.y} rx={Math.max(2, bodyW * 0.04)} ry={Math.max(3, bodyH * 0.07)} fill={ORGAN.kidney} opacity="0.78" />
      <ellipse cx={kidneyR.x} cy={kidneyR.y} rx={Math.max(2, bodyW * 0.04)} ry={Math.max(3, bodyH * 0.07)} fill={ORGAN.kidney} opacity="0.78" />

      {/* Brain inside skull */}
      <ellipse
        cx={headCx + headR * 0.05} cy={headCy - headR * 0.15}
        rx={headR * 0.55 * [0.5, 0.85, 1.05, 1.3][creature.brainTier]}
        ry={headR * 0.45 * [0.5, 0.85, 1.05, 1.3][creature.brainTier]}
        fill={ORGAN.brain} opacity="0.75"
      />
      {/* Sulci squiggles to read as "brain" */}
      <g stroke="#6a3a8a" strokeWidth="0.7" fill="none" opacity="0.6">
        <path d={`M ${headCx - headR * 0.2} ${headCy - headR * 0.2} q ${headR * 0.2} ${-headR * 0.1} ${headR * 0.4} 0`} />
        <path d={`M ${headCx - headR * 0.15} ${headCy - headR * 0.05} q ${headR * 0.15} ${-headR * 0.08} ${headR * 0.35} 0`} />
      </g>

      {/* ── LEADER LINES + LABELS ── */}
      <AnatomyLabel x1={heart.x} y1={heart.y} x2={36} y2={cy - 24} text="heart" color={ORGAN.heart} />
      <AnatomyLabel x1={lungL.x} y1={lungL.y} x2={36} y2={cy - 50} text="lungs" color={ORGAN.lungs} />
      <AnatomyLabel x1={headCx} y1={headCy - headR * 0.2} x2={W - 60} y2={cy - 60} text="brain" color={ORGAN.brain} anchor="start" />
      <AnatomyLabel x1={liver.x - bodyW * 0.05} y1={liver.y + bodyH * 0.05} x2={36} y2={cy + bodyH * 0.6} text="liver" color={ORGAN.liver} />
      <AnatomyLabel x1={stomach.x + bodyW * 0.02} y1={stomach.y + bodyH * 0.05} x2={W - 60} y2={cy + bodyH * 0.6} text="stomach" color={ORGAN.stomach} anchor="start" />

      {/* Heart-rate readout at bottom */}
      <g fill={INK} fontSize="10" fontFamily="ui-rounded, system-ui, sans-serif">
        <text x="14" y={H - 14}>♥ {heartRateBpm} bpm</text>
        <text x={W - 14} y={H - 14} textAnchor="end" opacity="0.6">anatomy view</text>
      </g>
    </g>
  );
}

function AnatomyLabel({ x1, y1, x2, y2, text, color, anchor = 'end' }: { x1: number; y1: number; x2: number; y2: number; text: string; color: string; anchor?: 'start' | 'end' }) {
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="0.7" opacity="0.85" />
      <circle cx={x1} cy={y1} r="1.6" fill={color} />
      <text x={x2 + (anchor === 'end' ? -3 : 3)} y={y2 + 3} fontSize="9" fontFamily="ui-rounded, system-ui, sans-serif" fill={INK} textAnchor={anchor}>{text}</text>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// MusclesView — body silhouette filled with muscle tone, with visible
// striated muscle groups (shoulder, hip, jaw, abdomen).
// ─────────────────────────────────────────────────────────────────────────
const MUSCLE_DEEP = '#a83a4a';
const MUSCLE_MID = '#c45a68';
const MUSCLE_LIGHT = '#e08a92';

function MusclesView({ creature, cx, footY }: { creature: Creature; cx: number; footY: number }) {
  const M = getAnatomyMetrics(creature, cx, footY, { presentation: true });
  const { bodyW, bodyH, cy, headR, headCx, headCy, legLen, legXs, beatPeriod, m } = M;

  return (
    <g>
      {/* Title strip matching anatomy view (slightly muted to read as a
          'second page' of the same textbook) */}
      <text
        x={W / 2} y={22}
        textAnchor="middle"
        fontSize="13" fontWeight="700"
        fontFamily="ui-rounded, Georgia, serif"
        fill="#5a1a24"
        style={{ letterSpacing: '0.02em' }}
      >
        Musculature of {creature.name}
      </text>
      <text
        x={W / 2} y={36}
        textAnchor="middle"
        fontSize="9.5"
        fontFamily="ui-rounded, system-ui, sans-serif"
        fill="#8a4a52"
        style={{ fontStyle: 'italic' }}
      >
        {m < 0.1 ? `${(m * 1000).toFixed(0)} g` : m < 10 ? `${m.toFixed(1)} kg` : `${Math.round(m)} kg`} · {creature.bodyPlan}{creature.warmBlooded ? '' : ' (cold-blooded)'}
      </text>

      {/* Body in muscle tone */}
      <ellipse cx={cx} cy={cy} rx={bodyW / 2} ry={bodyH / 2} fill={MUSCLE_MID} stroke={MUSCLE_DEEP} strokeWidth="1" />
      <circle cx={headCx} cy={headCy} r={headR} fill={MUSCLE_MID} stroke={MUSCLE_DEEP} strokeWidth="1" />

      {/* Highlight along top for sheen */}
      <ellipse cx={cx - bodyW * 0.05} cy={cy - bodyH * 0.22} rx={bodyW * 0.3} ry={bodyH * 0.12} fill={MUSCLE_LIGHT} opacity="0.55" />

      {/* Striated muscle group patches with fiber lines */}
      <MuscleGroup x={cx - bodyW * 0.2} y={cy - bodyH * 0.05} w={bodyW * 0.22} h={bodyH * 0.34} angle={-15} fibers={5} label="pectoral" />
      <MuscleGroup x={cx + bodyW * 0.18} y={cy + bodyH * 0.05} w={bodyW * 0.22} h={bodyH * 0.36} angle={12} fibers={5} label="gluteal" />
      <MuscleGroup x={cx} y={cy + bodyH * 0.15} w={bodyW * 0.4} h={bodyH * 0.18} angle={0} fibers={6} label="abdominal" />

      {/* Jaw muscle on head */}
      <MuscleGroup x={headCx - headR * 0.15} y={headCy + headR * 0.35} w={headR * 0.7} h={headR * 0.4} angle={8} fibers={3} label="masseter" />

      {/* Legs as muscle bundles with quadriceps fibers */}
      {legXs.map((x, i) => {
        const hipY = cy + bodyH * 0.42;
        const footYY = hipY + legLen;
        return (
          <g key={`leg-m-${i}`}>
            <rect x={x - bodyW * 0.04} y={hipY} width={bodyW * 0.08} height={legLen} fill={MUSCLE_MID} stroke={MUSCLE_DEEP} strokeWidth="0.6" rx="3" />
            {/* Quadriceps fiber lines */}
            <g stroke={MUSCLE_DEEP} strokeWidth="0.5" opacity="0.55">
              {[0.2, 0.4, 0.6, 0.8].map((t) => (
                <line key={t} x1={x - bodyW * 0.03} y1={hipY + legLen * t} x2={x + bodyW * 0.03} y2={hipY + legLen * (t + 0.08)} />
              ))}
            </g>
            <ellipse cx={x} cy={footYY} rx={bodyW * 0.05} ry={bodyH * 0.025} fill={MUSCLE_DEEP} />
          </g>
        );
      })}

      {/* Eye showing through — keeps the character recognizable */}
      <circle cx={headCx + headR * 0.45} cy={headCy - headR * 0.1} r={Math.max(2, headR * 0.18)} fill="#fff" stroke="#3a2118" strokeWidth="0.6" />
      <circle cx={headCx + headR * 0.45} cy={headCy - headR * 0.1} r={Math.max(1, headR * 0.1)} fill="#1a1a1a" />

      {/* Heart pulse showing through (faint) */}
      <circle
        cx={cx - bodyW * 0.18} cy={cy - bodyH * 0.05}
        r={Math.max(3, bodyW * 0.05)}
        fill="#d64558" opacity="0.5"
        style={{ animation: `heartbeat ${beatPeriod}s ease-in-out infinite`, transformOrigin: `${cx - bodyW * 0.18}px ${cy - bodyH * 0.05}px`, transformBox: 'fill-box' }}
      />

      <g fill="#5a1a24" fontSize="10" fontFamily="ui-rounded, system-ui, sans-serif">
        <text x="14" y={H - 14}>muscle view</text>
        <text x={W - 14} y={H - 14} textAnchor="end" opacity="0.6">skin removed</text>
      </g>
    </g>
  );
}

function MuscleGroup({ x, y, w, h, angle, fibers, label: _label }: { x: number; y: number; w: number; h: number; angle: number; fibers: number; label: string }) {
  return (
    <g transform={`rotate(${angle} ${x} ${y})`}>
      <ellipse cx={x} cy={y} rx={w / 2} ry={h / 2} fill={MUSCLE_DEEP} opacity="0.55" />
      <g stroke={MUSCLE_DEEP} strokeWidth="0.6" opacity="0.7">
        {Array.from({ length: fibers }).map((_, i) => {
          const t = (i + 1) / (fibers + 1);
          const fy = y - h / 2 + t * h;
          return <line key={i} x1={x - w * 0.45} y1={fy} x2={x + w * 0.45} y2={fy} />;
        })}
      </g>
    </g>
  );
}

function MeadowHabitat() {
  const groundY = 256;
  return (
    <>
      <defs>
        <linearGradient id="meadow-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9fd4ee" />
          <stop offset="0.7" stopColor="#cfe6c4" />
          <stop offset="1" stopColor="#f8d68a" />
        </linearGradient>
        <linearGradient id="meadow-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#aac470" />
          <stop offset="1" stopColor="#7a9b48" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width={W} height={groundY} fill="url(#meadow-sky)" />
      <rect x="0" y={groundY} width={W} height={H - groundY} fill="url(#meadow-ground)" />

      <g className="sun-rays" style={{ transformOrigin: '340px 50px' }}>
        {Array.from({ length: 10 }).map((_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return <line key={i} x1={340 + Math.cos(a) * 22} y1={50 + Math.sin(a) * 22} x2={340 + Math.cos(a) * 30} y2={50 + Math.sin(a) * 30} stroke="#ffd66a" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />;
        })}
      </g>
      <circle cx="340" cy="50" r="22" fill="#ffe9a0" opacity="0.5" />
      <circle cx="340" cy="50" r="16" fill="#ffd66a" />
      <ellipse cx="336" cy="46" rx="6" ry="4" fill="#fff0a0" opacity="0.7" />

      <g transform="translate(70 40)">
        <g className="cloud" style={{ animationDuration: '60s' }}>
          <ellipse cx="0" cy="0" rx="24" ry="7" fill="white" opacity="0.95" />
          <ellipse cx="-12" cy="-3" rx="14" ry="6" fill="white" opacity="0.9" />
          <ellipse cx="11" cy="-2" rx="15" ry="6" fill="white" opacity="0.9" />
        </g>
      </g>
      <g transform="translate(200 80)">
        <g className="cloud" style={{ animationDuration: '80s', animationDelay: '-30s' }}>
          <ellipse cx="0" cy="0" rx="18" ry="5" fill="white" opacity="0.9" />
          <ellipse cx="-9" cy="-2" rx="10" ry="4" fill="white" opacity="0.85" />
        </g>
      </g>

      <ellipse cx="120" cy={groundY + 4} rx="120" ry="12" fill="#8aa050" opacity="0.6" />
      <ellipse cx="320" cy={groundY + 6} rx="100" ry="10" fill="#8aa050" opacity="0.6" />

      {[28, 75, 320, 372].map((tx, i) => (
        <g key={i}>
          <rect x={tx - 1.5} y={groundY - 22} width="3" height="22" fill="#3e2a18" />
          <ellipse cx={tx} cy={groundY - 26} rx="12" ry="6" fill="#3f6b34" />
          <ellipse cx={tx - 4} cy={groundY - 23} rx="7" ry="4" fill="#557d3e" />
        </g>
      ))}

      <g className="bob-breathe" style={{ transformOrigin: '292px 110px' }}>
        <text x="292" y="110" fontSize="13">🦋</text>
      </g>

      {Array.from({ length: 14 }).map((_, i) => {
        const tx = 8 + i * 28;
        return (
          <g key={i} className="grass-tuft" style={{ transformOrigin: `${tx}px ${H - 4}px` }}>
            <line x1={tx} y1={H - 2} x2={tx - 3} y2={H - 11} stroke="#4d6f22" strokeWidth="1.3" strokeLinecap="round" />
            <line x1={tx} y1={H - 2} x2={tx} y2={H - 14} stroke="#5d7f30" strokeWidth="1.3" strokeLinecap="round" />
            <line x1={tx} y1={H - 2} x2={tx + 3} y2={H - 11} stroke="#4d6f22" strokeWidth="1.3" strokeLinecap="round" />
          </g>
        );
      })}
    </>
  );
}

function RockyHabitat() {
  const groundY = 256;
  return (
    <>
      <defs>
        <linearGradient id="rock-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffba78" />
          <stop offset="1" stopColor="#ffd590" />
        </linearGradient>
        <linearGradient id="rock-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d99850" />
          <stop offset="1" stopColor="#8a5a28" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width={W} height={groundY} fill="url(#rock-sky)" />
      <rect x="0" y={groundY} width={W} height={H - groundY} fill="url(#rock-ground)" />

      <circle cx="340" cy="55" r="24" fill="#ff8a40" opacity="0.6" />
      <circle cx="340" cy="55" r="17" fill="#ff6a30" />
      <g className="sun-rays" style={{ transformOrigin: '340px 55px' }}>
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return <line key={i} x1={340 + Math.cos(a) * 24} y1={55 + Math.sin(a) * 24} x2={340 + Math.cos(a) * 32} y2={55 + Math.sin(a) * 32} stroke="#ff8a40" strokeWidth="2" opacity="0.55" strokeLinecap="round" />;
        })}
      </g>

      <polygon points={`0,${groundY} 90,${groundY - 30} 170,${groundY - 12} ${W},${groundY - 20} ${W},${groundY}`} fill="#a06030" opacity="0.5" />

      <g fill="#6e4628">
        <ellipse cx="55" cy={groundY + 4} rx="34" ry="14" />
        <ellipse cx="35" cy={groundY - 4} rx="22" ry="10" />
        <ellipse cx="345" cy={groundY + 8} rx="38" ry="14" />
        <ellipse cx="370" cy={groundY - 2} rx="22" ry="12" />
      </g>
      <g fill="#8a5a32">
        <ellipse cx="55" cy={groundY + 2} rx="32" ry="11" />
        <ellipse cx="345" cy={groundY + 5} rx="36" ry="11" />
      </g>

      <g stroke="#6a4828" strokeWidth="1.5" fill="none" strokeLinecap="round">
        <path d={`M 130 ${H - 12} L 165 ${H - 22} L 200 ${H - 14} L 240 ${H - 24}`} />
        <path d={`M 110 ${H - 4} L 150 ${H - 14}`} />
      </g>

      {[180, 250].map((tx, i) => (
        <g key={i}>
          <rect x={tx - 3} y={groundY - 16} width="6" height="16" fill="#4a6228" />
          {[-4, 0, 4].map((dx, j) => (
            <ellipse key={j} cx={tx + dx} cy={groundY - 18 + Math.abs(dx)} rx="2.5" ry="4" fill="#6a8a30" transform={`rotate(${dx * 8} ${tx + dx} ${groundY - 18})`} />
          ))}
        </g>
      ))}
    </>
  );
}

function SkyHabitat() {
  const branchY = 240;
  return (
    <>
      <defs>
        <linearGradient id="sky-up" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5fb6e0" />
          <stop offset="1" stopColor="#b8e0ee" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width={W} height={H} fill="url(#sky-up)" />

      <circle cx="340" cy="55" r="20" fill="#ffe9a0" opacity="0.5" />
      <circle cx="340" cy="55" r="14" fill="#ffd66a" />

      <g transform="translate(80 60)">
        <g className="cloud" style={{ animationDuration: '50s' }}>
          <ellipse cx="0" cy="0" rx="28" ry="9" fill="white" opacity="0.95" />
          <ellipse cx="-14" cy="-4" rx="17" ry="7" fill="white" />
          <ellipse cx="14" cy="-3" rx="18" ry="7" fill="white" />
        </g>
      </g>
      <g transform="translate(250 110)">
        <g className="cloud" style={{ animationDuration: '70s', animationDelay: '-20s' }}>
          <ellipse cx="0" cy="0" rx="22" ry="7" fill="white" opacity="0.9" />
          <ellipse cx="-11" cy="-3" rx="13" ry="5" fill="white" opacity="0.85" />
        </g>
      </g>
      <g transform="translate(50 150)">
        <g className="cloud" style={{ animationDuration: '90s', animationDelay: '-45s' }}>
          <ellipse cx="0" cy="0" rx="16" ry="5" fill="white" opacity="0.85" />
        </g>
      </g>

      {[180, 220, 250].map((bx, i) => (
        <g key={i} transform={`translate(${bx} ${100 + i * 8})`}>
          <g className="bird-wing" style={{ transformOrigin: 'center' }}>
            <path d="M -7 0 Q -3 -3 0 0 Q 3 -3 7 0" stroke="#3a2a18" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          </g>
        </g>
      ))}

      <line x1="0" y1={branchY + 6} x2={W} y2={branchY + 8} stroke="#5a3b22" strokeWidth="10" />
      <line x1="20" y1={branchY + 4} x2="160" y2={branchY + 8} stroke="#3e2a18" strokeWidth="2" opacity="0.4" />

      <g>
        {[80, 100, 110, 300, 340, 360].map((lx, i) => (
          <ellipse key={i} cx={lx} cy={branchY + 4 + (i % 2) * 2} rx="6" ry="3" fill="#3f6b34" />
        ))}
      </g>

      <rect x="0" y={H - 24} width={W} height="24" fill="#5a7d3a" opacity="0.4" />
    </>
  );
}

function UnderwaterHabitat() {
  return (
    <>
      <defs>
        <linearGradient id="under-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#74c4dc" />
          <stop offset="0.5" stopColor="#3a85b8" />
          <stop offset="1" stopColor="#1a4878" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width={W} height={H} fill="url(#under-water)" />

      {Array.from({ length: 6 }).map((_, i) => (
        <line key={i} x1={i * 70} y1="6" x2={i * 70 + 24} y2="12" stroke="white" strokeWidth="2" opacity="0.6" />
      ))}

      <g opacity="0.4">
        <g className="cloud" style={{ animationDuration: '40s' }}>
          <ellipse cx="0" cy="60" rx="120" ry="6" fill="white" />
        </g>
      </g>

      <g>
        {Array.from({ length: 14 }).map((_, i) => (
          <circle
            key={i}
            cx={20 + ((i * 37) % (W - 40))}
            cy={H - 40 + ((i * 19) % 30)}
            r={1.5 + (i % 3) * 0.6}
            fill="white"
            opacity="0.7"
            className="snowflake"
            style={{
              animationDuration: `${5 + (i % 4)}s`,
              animationDelay: `-${i * 0.6}s`,
            }}
          />
        ))}
      </g>

      <g fill="#3a6850" opacity="0.85">
        {[20, 70, 360, 380].map((bx, i) => (
          <ellipse key={i} cx={bx} cy={H - 6} rx="22" ry="6" />
        ))}
      </g>
      <g stroke="#3a8848" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8">
        <path d={`M 30 ${H} q -4 -25 0 -50 q 4 -25 0 -50`} />
        <path d={`M 60 ${H} q -3 -20 0 -40 q 3 -20 0 -40`} />
        <path d={`M 360 ${H} q 4 -25 0 -50 q -4 -25 0 -50`} />
        <path d={`M 380 ${H} q 3 -25 0 -40`} />
      </g>

      <g transform="translate(80 130)" opacity="0.5">
        <ellipse cx="0" cy="0" rx="6" ry="3" fill="#1a2c4a" />
        <polygon points="-6,0 -10,-3 -10,3" fill="#1a2c4a" />
      </g>
      <g transform="translate(330 170)" opacity="0.4">
        <ellipse cx="0" cy="0" rx="5" ry="2.5" fill="#1a2c4a" />
        <polygon points="-5,0 -8,-2 -8,2" fill="#1a2c4a" />
      </g>

      <line x1="0" y1={H * 0.78} x2={W} y2={H * 0.78} stroke="white" strokeWidth="0.5" strokeDasharray="3 4" opacity="0.15" />
    </>
  );
}
