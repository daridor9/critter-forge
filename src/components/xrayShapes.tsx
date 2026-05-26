import type { ComponentType } from 'react';
import type { Creature } from '../types';
import { heartRate } from '../physics';

// Per-shape x-ray anatomies. Each component renders as an <g> group inside
// CreatureStage's parent SVG (viewBox 0 0 400 300), on top of the dark blue
// xray backdrop. Every anatomy shows BOTH skeleton (where applicable) and
// internal organs, with species-specific features that make the animal real
// to a 9-year-old: octopus shows 9 brains + 3 hearts + no bones, whale shows
// a car-sized heart, shark shows cartilage instead of bones, snake shows the
// 200-rib spine, tortoise shows the shell-as-fused-ribs trick, etc.

interface XrayProps {
  creature: Creature;
  massKg: number;
}

const BONE = '#ffffff';
const MUSCLE_DARK = '#8a3838';
const TENDON = '#f0e8c8';
const BRAIN = '#c890e0';
const HEART = '#ff5a78';
const LUNG = '#7ab8e0';
const STOMACH = '#f0c850';
const CARTILAGE = '#9fb4cc';
const MUSCLE = '#d97a78';
const INK = '#3a2a48';
const LIVER = '#6a9456';

function beatPeriodFor(massKg: number, mult = 1): number {
  return Math.max(0.25, (60 / heartRate(massKg)) / mult);
}

// Visual brain scale per tier so a Tiny brain is a pinpoint and a Genius
// brain fills the skull. Used as a multiplier on every brain ellipse radius
// inside the bespoke x-rays.
function brainScaleFor(tier: number): number {
  return [0.45, 0.85, 1.15, 1.5][tier] ?? 1;
}

function HeartLabel({ x, y, bpm }: { x: number; y: number; bpm: number }) {
  return (
    <text x={x} y={y} fontSize="8" fill="white" opacity="0.75" textAnchor="middle">♥ {bpm} bpm</text>
  );
}

function Caption({ text, y = 286 }: { text: string; y?: number }) {
  return (
    <text x={200} y={y} textAnchor="middle" fontSize="9" fill="white" opacity="0.85" fontWeight="600">{text}</text>
  );
}

// ─── Octopus ─────────────────────────────────────────────────────────────
// 9 brains (1 central + 1 ganglion per arm), 3 hearts (2 branchial + 1 systemic),
// ink sac, NO bones, copper-based blue blood. The showcase x-ray.
export function OctopusXray({ creature, massKg }: XrayProps) {
  const beat = beatPeriodFor(massKg, 1.4);          // systemic
  const beatBranchial = beatPeriodFor(massKg, 1.8); // gill hearts beat faster
  const bs = brainScaleFor(creature.brainTier);
  const tentacles = [
    { sx: 155, sy: 175, c1x: 90,  c1y: 195, c2x: 50,  c2y: 250, ex: 30,  ey: 270 },
    { sx: 170, sy: 185, c1x: 130, c1y: 230, c2x: 110, c2y: 270, ex: 95,  ey: 290 },
    { sx: 185, sy: 190, c1x: 175, c1y: 240, c2x: 155, c2y: 280, ex: 160, ey: 290 },
    { sx: 200, sy: 192, c1x: 205, c1y: 245, c2x: 205, c2y: 280, ex: 210, ey: 295 },
    { sx: 215, sy: 190, c1x: 225, c1y: 240, c2x: 245, c2y: 280, ex: 250, ey: 290 },
    { sx: 230, sy: 185, c1x: 270, c1y: 230, c2x: 290, c2y: 270, ex: 305, ey: 290 },
    { sx: 245, sy: 175, c1x: 310, c1y: 195, c2x: 350, c2y: 250, ex: 370, ey: 270 },
    { sx: 200, sy: 190, c1x: 220, c1y: 250, c2x: 235, c2y: 285, ex: 230, ey: 295 },
  ];
  // 1 mini-brain (ganglion) at the tip of each tentacle — really the
  // ganglion runs the whole length, but a blob near the tip reads clearest.
  return (
    <g>
      {/* mantle outline */}
      <ellipse cx="200" cy="125" rx="86" ry="70" fill="rgba(160,180,220,0.18)" stroke="rgba(180,200,240,0.5)" strokeWidth="1" />

      {/* tentacles — entirely muscle, no bones. Each one shows:
          1) a soft mantle outline (faint blue)
          2) a thick MUSCLE core
          3) a darker red INNER bundle running through
          4) parallel longitudinal striations along the curve. */}
      {tentacles.map((t, i) => {
        const d = `M ${t.sx} ${t.sy} C ${t.c1x} ${t.c1y}, ${t.c2x} ${t.c2y}, ${t.ex} ${t.ey}`;
        return (
          <g key={i}>
            <path d={d} stroke="rgba(180,200,240,0.45)" strokeWidth="15" fill="none" strokeLinecap="round" />
            <path d={d} stroke={MUSCLE} strokeWidth="11" fill="none" strokeLinecap="round" opacity="0.65" />
            <path d={d} stroke={MUSCLE_DARK} strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.55" />
            {/* striation lines */}
            <path d={d} stroke={MUSCLE_DARK} strokeWidth="0.9" fill="none" strokeLinecap="round"
              strokeDasharray="6 3" opacity="0.75"
              transform={`translate(-1.5 -1.5)`} />
            <path d={d} stroke={MUSCLE_DARK} strokeWidth="0.9" fill="none" strokeLinecap="round"
              strokeDasharray="6 3" opacity="0.6"
              transform={`translate(1.5 1.5)`} />
          </g>
        );
      })}
      {/* MANTLE RING — circular muscle that squeezes the body through
          gaps; striations radiate outward from the central brain. */}
      <ellipse cx="200" cy="148" rx="50" ry="13" fill={MUSCLE} opacity="0.5" />
      <ellipse cx="200" cy="148" rx="40" ry="9" fill={MUSCLE_DARK} opacity="0.4" />
      <g stroke={MUSCLE_DARK} strokeWidth="0.7" opacity="0.85" fill="none" strokeLinecap="round">
        {Array.from({ length: 14 }).map((_, k) => {
          const a = (k / 14) * Math.PI * 2;
          const x1 = 200 + Math.cos(a) * 22;
          const y1 = 148 + Math.sin(a) * 6;
          const x2 = 200 + Math.cos(a) * 46;
          const y2 = 148 + Math.sin(a) * 12;
          return <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
      </g>
      {/* nerve cord down each tentacle */}
      {tentacles.map((t, i) => (
        <path key={`n${i}`} d={`M ${t.sx} ${t.sy} C ${t.c1x} ${t.c1y}, ${t.c2x} ${t.c2y}, ${t.ex} ${t.ey}`}
          stroke="#ffe48a" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.75" strokeDasharray="2 4" />
      ))}

      {/* central brain (the "main" one — donut-shaped around the esophagus in real octopi) */}
      <ellipse cx="200" cy="105" rx={22 * bs} ry={14 * bs} fill={BRAIN} opacity="0.85" />
      <ellipse cx="200" cy="105" rx={8 * bs} ry={5 * bs} fill="#0c1e30" opacity="0.7" />
      <text x="200" y={108} fontSize="7" textAnchor="middle" fill="white" opacity="0.85">🧠</text>

      {/* 8 arm ganglia — "mini brains" — at base of each tentacle */}
      {tentacles.slice(0, 7).map((t, i) => (
        <g key={`g${i}`}>
          <circle cx={t.sx} cy={t.sy} r={5 * bs} fill={BRAIN} opacity="0.8" />
          <circle cx={t.sx} cy={t.sy} r={2 * bs} fill="#0c1e30" opacity="0.6" />
        </g>
      ))}
      <circle cx={205} cy={195} r={5 * bs} fill={BRAIN} opacity="0.8" />
      <circle cx={205} cy={195} r={2 * bs} fill="#0c1e30" opacity="0.6" />

      {/* 3 hearts: 1 systemic (center, big), 2 branchial (gill hearts, smaller, beat faster) */}
      <ellipse cx="200" cy="145" rx="14" ry="10" fill={HEART} opacity="0.9"
        style={{ animation: `heartbeat ${beat}s ease-in-out infinite`, transformOrigin: 'center', transformBox: 'fill-box' }} />
      <text x="200" y="148" fontSize="7" textAnchor="middle" fill="white" opacity="0.9">♥</text>

      <ellipse cx="170" cy="165" rx="8" ry="6" fill={HEART} opacity="0.85"
        style={{ animation: `heartbeat ${beatBranchial}s ease-in-out infinite`, transformOrigin: 'center', transformBox: 'fill-box' }} />
      <ellipse cx="230" cy="165" rx="8" ry="6" fill={HEART} opacity="0.85"
        style={{ animation: `heartbeat ${beatBranchial}s ease-in-out infinite`, transformOrigin: 'center', transformBox: 'fill-box' }} />

      {/* gills under each branchial heart */}
      <g stroke={LUNG} strokeWidth="1" fill="none" opacity="0.7">
        <path d="M 162 173 q -6 5 0 10 q 6 -5 0 -10" />
        <path d="M 178 173 q -6 5 0 10 q 6 -5 0 -10" />
        <path d="M 222 173 q -6 5 0 10 q 6 -5 0 -10" />
        <path d="M 238 173 q -6 5 0 10 q 6 -5 0 -10" />
      </g>

      {/* ink sac */}
      <ellipse cx="200" cy="170" rx="6" ry="9" fill={INK} opacity="0.85" />
      <text x="200" y="173" fontSize="6" textAnchor="middle" fill="white" opacity="0.6">ink</text>

      {/* eyes */}
      <circle cx="178" cy="125" r="6" fill="white" opacity="0.4" />
      <circle cx="222" cy="125" r="6" fill="white" opacity="0.4" />

      <text x="14" y="20" fontSize="9" fill="white" opacity="0.9" fontWeight="600">9 brains · 3 hearts · blue blood</text>
      <Caption text="No bones · ink sac · color-change skin" />
    </g>
  );
}

// ─── Whale ───────────────────────────────────────────────────────────────
// Heart the size of a small car, ribcage that flexes under pressure,
// massive lungs, baleen plates (for filter feeders).
export function WhaleXray({ creature, massKg }: XrayProps) {
  const beat = beatPeriodFor(massKg, 1);
  const bs = brainScaleFor(creature.brainTier);
  return (
    <g>
      {/* body outline */}
      <ellipse cx="205" cy="172" rx="166" ry="52" fill="rgba(160,180,220,0.18)" stroke="rgba(180,200,240,0.5)" strokeWidth="1" />

      {/* spine */}
      <line x1="50" y1="158" x2="365" y2="160" stroke={BONE} strokeWidth="2.5" opacity="0.9" />

      {/* ribs (curved, lots of them) */}
      <g stroke={BONE} strokeWidth="1.4" fill="none" opacity="0.8">
        {[-0.42, -0.32, -0.22, -0.12, -0.02, 0.08, 0.18].map((off) => {
          const x = 205 + 280 * off;
          return (
            <g key={off}>
              <path d={`M ${x} 158 Q ${x + 8} 195 ${x} 220`} />
              <path d={`M ${x} 158 Q ${x + 4} 130 ${x - 4} 118`} />
            </g>
          );
        })}
      </g>

      {/* skull (front-left) */}
      <ellipse cx="55" cy="170" rx="32" ry="22" fill="none" stroke={BONE} strokeWidth="1.6" opacity="0.9" />
      <line x1="35" y1="178" x2="78" y2="184" stroke={BONE} strokeWidth="1" opacity="0.7" />

      {/* tail vertebrae */}
      <g fill="none" stroke={BONE} strokeWidth="1.2" opacity="0.8">
        {[365, 375, 385].map((x, i) => (
          <ellipse key={i} cx={x} cy={160 + i * 2} rx="4" ry="3" />
        ))}
      </g>

      {/* EPAXIAL + HYPAXIAL — fluke drive muscles above and below the
          spine. Whales beat their flukes vertically with these. */}
      <path d="M 260 160
               Q 320 158 378 162
               Q 380 168 378 172
               Q 320 170 260 168 Z"
        fill={MUSCLE} opacity="0.55" />
      <path d="M 260 178
               Q 320 178 378 178
               Q 380 184 378 186
               Q 320 188 260 184 Z"
        fill={MUSCLE} opacity="0.5" />
      <path d="M 270 163 Q 320 162 370 165" stroke={MUSCLE_DARK} strokeWidth="1.4" fill="none" opacity="0.55" />
      <path d="M 270 184 Q 320 184 370 184" stroke={MUSCLE_DARK} strokeWidth="1.4" fill="none" opacity="0.55" />
      {/* striations — short cross-fibers showing pull direction */}
      <g stroke={MUSCLE_DARK} strokeWidth="0.6" opacity="0.7" strokeLinecap="round" fill="none">
        {[270, 285, 300, 315, 330, 345, 360].map((x) => (
          <g key={x}>
            <line x1={x} y1="162" x2={x + 4} y2="170" />
            <line x1={x} y1="178" x2={x + 4} y2="186" />
          </g>
        ))}
      </g>

      {/* fluke bones (flat) */}
      <path d="M 385 160 L 398 130 L 398 188 Z" stroke={BONE} strokeWidth="1.2" fill="none" opacity="0.6" />

      {/* HUGE heart — proportional to body */}
      <ellipse cx="130" cy="180" rx="26" ry="20" fill={HEART} opacity="0.92"
        style={{ animation: `heartbeat ${beat}s ease-in-out infinite`, transformOrigin: 'center', transformBox: 'fill-box' }} />
      <text x="130" y="184" fontSize="11" textAnchor="middle" fill="white" opacity="0.9">♥</text>

      {/* two huge lungs */}
      <ellipse cx="180" cy="150" rx="32" ry="18" fill={LUNG} opacity="0.55" />
      <ellipse cx="240" cy="150" rx="32" ry="18" fill={LUNG} opacity="0.55" />
      <text x="210" y="152" fontSize="8" textAnchor="middle" fill="white" opacity="0.8">🫁</text>

      {/* brain — small relative to body */}
      <ellipse cx="55" cy="158" rx={9 * bs} ry={7 * bs} fill={BRAIN} opacity="0.85" />
      <text x="55" y="161" fontSize="6" textAnchor="middle" fill="white" opacity="0.85">🧠</text>

      {/* blowhole channel */}
      <path d="M 60 148 Q 60 130 70 122" stroke={LUNG} strokeWidth="2" fill="none" opacity="0.7" />
      <circle cx="70" cy="121" r="2" fill="white" opacity="0.7" />

      <HeartLabel x={130} y={210} bpm={heartRate(massKg)} />
      <Caption text="Heart the size of a small car · blowhole airway" />
    </g>
  );
}

// ─── Dolphin ─────────────────────────────────────────────────────────────
// Echolocation "melon" on forehead, big brain, flexible ribs that collapse
// at depth so air doesn't crush them.
export function DolphinXray({ creature, massKg }: XrayProps) {
  const beat = beatPeriodFor(massKg, 1);
  const bs = brainScaleFor(creature.brainTier);
  return (
    <g>
      {/* streamlined body */}
      <ellipse cx="200" cy="170" rx="140" ry="42" fill="rgba(160,180,220,0.18)" stroke="rgba(180,200,240,0.5)" strokeWidth="1" />

      {/* spine */}
      <path d="M 70 165 Q 200 158 340 168" stroke={BONE} strokeWidth="2" fill="none" opacity="0.9" />

      {/* flexible ribs */}
      <g stroke={BONE} strokeWidth="1.2" fill="none" opacity="0.75">
        {[-0.4, -0.28, -0.16, -0.04, 0.08, 0.2].map((off) => {
          const x = 200 + 240 * off;
          return <path key={off} d={`M ${x} 162 Q ${x + 6} 188 ${x - 2} 206`} />;
        })}
      </g>

      {/* skull */}
      <path d="M 60 175 Q 80 160 110 172 Q 80 192 60 180 Z" fill="none" stroke={BONE} strokeWidth="1.5" opacity="0.9" />

      {/* MELON — fatty echolocation lens on forehead */}
      <ellipse cx="92" cy="156" rx="20" ry="11" fill="#f0d090" opacity="0.65" />
      <text x="92" y="159" fontSize="6" textAnchor="middle" fill="#0c1e30" opacity="0.8">melon</text>

      {/* echolocation pings */}
      <g stroke="#ffe48a" strokeWidth="1" fill="none" opacity="0.55" strokeDasharray="2 3">
        <path d="M 45 156 Q 30 156 28 148" />
        <path d="M 40 162 Q 22 168 18 158" />
      </g>

      {/* big brain */}
      <ellipse cx="118" cy="154" rx={13 * bs} ry={10 * bs} fill={BRAIN} opacity="0.9" />
      <text x="118" y="157" fontSize="7" textAnchor="middle" fill="white" opacity="0.9">🧠</text>

      {/* heart */}
      <ellipse cx="160" cy="180" rx="14" ry="11" fill={HEART} opacity="0.9"
        style={{ animation: `heartbeat ${beat}s ease-in-out infinite`, transformOrigin: 'center', transformBox: 'fill-box' }} />

      {/* lungs (collapsible) */}
      <ellipse cx="210" cy="160" rx="22" ry="11" fill={LUNG} opacity="0.5" />
      <ellipse cx="250" cy="160" rx="22" ry="11" fill={LUNG} opacity="0.5" />

      {/* EPAXIAL MUSCLES — myoglobin-rich tail muscle, dark red, runs
          from mid-body down to the fluke. Stores 10× more O₂ than human
          muscle. Striations show the fiber direction. */}
      <path d="M 240 162
               Q 290 158 340 168
               Q 342 174 340 178
               Q 290 172 240 174 Z"
        fill={MUSCLE} opacity="0.6" />
      <path d="M 250 165 Q 290 162 335 170" stroke={MUSCLE_DARK} strokeWidth="2" fill="none" opacity="0.55" />
      <g stroke={MUSCLE_DARK} strokeWidth="0.6" opacity="0.7" fill="none" strokeLinecap="round">
        {[250, 270, 290, 310, 325].map((x) => (
          <line key={x} x1={x} y1="161" x2={x + 4} y2="176" />
        ))}
      </g>

      {/* fluke vertebrae */}
      <g fill="none" stroke={BONE} strokeWidth="1.1" opacity="0.7">
        {[325, 335, 345].map((x, i) => <ellipse key={i} cx={x} cy={168 + i * 1.5} rx="3" ry="2.4" />)}
      </g>

      <HeartLabel x={160} y={205} bpm={heartRate(massKg)} />
      <Caption text="Melon lens for echolocation · myoglobin-rich muscle" />
    </g>
  );
}

// ─── Shark ───────────────────────────────────────────────────────────────
// Cartilage skeleton (not bone — drawn with dashed/lighter strokes),
// 5 gill slits, huge oily liver (buoyancy, not a swim bladder).
export function SharkXray({ creature, massKg }: XrayProps) {
  const beat = beatPeriodFor(massKg, 1);
  const bs = brainScaleFor(creature.brainTier);
  return (
    <g>
      {/* body outline */}
      <path d="M 60 175 Q 100 138 200 138 Q 290 138 340 168 Q 290 200 200 200 Q 100 200 60 175 Z"
        fill="rgba(160,180,220,0.18)" stroke="rgba(180,200,240,0.5)" strokeWidth="1" />

      {/* LATERAL RED MUSCLE BAND — thin strip of slow-twitch aerobic
          muscle (some sharks keep it 10°C warmer than surrounding water).
          Drawn over a series of W-shaped myomeres, the segmental
          muscle blocks that propel every fish + shark. */}
      <path d="M 90 168 Q 200 158 320 170" stroke={MUSCLE} strokeWidth="7" fill="none" opacity="0.6" strokeLinecap="round" />
      <path d="M 90 168 Q 200 158 320 170" stroke={MUSCLE_DARK} strokeWidth="3" fill="none" opacity="0.55" strokeLinecap="round" />
      {/* myomere W-shaped segments along the side */}
      <g stroke={MUSCLE_DARK} strokeWidth="0.9" fill="none" opacity="0.85" strokeLinecap="round">
        {Array.from({ length: 12 }).map((_, i) => {
          const t = (i + 0.5) / 12;
          const x = 90 + t * 230;
          const y = 162 + 6 * Math.sin(t * Math.PI);
          return (
            <path key={i} d={`M ${x - 10} ${y - 6} L ${x - 4} ${y + 4} L ${x} ${y - 4} L ${x + 4} ${y + 4} L ${x + 10} ${y - 6}`} />
          );
        })}
      </g>
      {/* belly white-muscle band — for burst attacks */}
      <path d="M 110 182 Q 200 178 310 188" stroke={MUSCLE} strokeWidth="4" fill="none" opacity="0.3" strokeLinecap="round" />

      {/* CARTILAGE — drawn dashed/grey to distinguish from real bone */}
      <path d="M 90 170 Q 200 158 320 172" stroke={CARTILAGE} strokeWidth="3" fill="none" strokeDasharray="4 3" opacity="0.85" />

      {/* skull cartilage */}
      <path d="M 60 175 Q 75 160 100 168 Q 80 184 60 180 Z" fill="none" stroke={CARTILAGE} strokeDasharray="3 2" strokeWidth="1.6" opacity="0.85" />

      {/* dorsal fin cartilage */}
      <path d="M 195 138 L 205 100 L 220 138" stroke={CARTILAGE} strokeWidth="1.6" fill="none" strokeDasharray="3 2" opacity="0.85" />

      {/* "ribs" (just a few cartilage rings) */}
      <g stroke={CARTILAGE} strokeWidth="1.2" fill="none" opacity="0.7" strokeDasharray="2 2">
        {[-0.25, -0.1, 0.05, 0.2].map((off) => {
          const x = 200 + 240 * off;
          return <path key={off} d={`M ${x} 158 Q ${x + 4} 178 ${x} 198`} />;
        })}
      </g>

      {/* 5 gill slits */}
      <g stroke={LUNG} strokeWidth="2" fill="none" opacity="0.85" strokeLinecap="round">
        {[105, 115, 125, 135, 145].map((x) => (
          <path key={x} d={`M ${x} 158 q -2 12 0 22`} />
        ))}
      </g>

      {/* huge OILY LIVER — takes up much of body, provides buoyancy */}
      <ellipse cx="210" cy="180" rx="60" ry="14" fill={LIVER} opacity="0.55" />
      <text x="210" y="183" fontSize="7" textAnchor="middle" fill="white" opacity="0.85">liver</text>

      {/* small 2-chamber heart */}
      <ellipse cx="155" cy="175" rx="9" ry="7" fill={HEART} opacity="0.9"
        style={{ animation: `heartbeat ${beat}s ease-in-out infinite`, transformOrigin: 'center', transformBox: 'fill-box' }} />

      {/* brain */}
      <ellipse cx="80" cy="170" rx={7 * bs} ry={5 * bs} fill={BRAIN} opacity="0.85" />

      {/* ampullae of Lorenzini — electrosense pores on snout */}
      <g fill="#ffe48a" opacity="0.7">
        {[[68, 168], [72, 162], [76, 175], [70, 180], [78, 170]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="0.9" />
        ))}
      </g>

      <text x="14" y="20" fontSize="9" fill="white" opacity="0.9" fontWeight="600">Cartilage skeleton · no bones</text>
      <Caption text="5 gills · oily liver for buoyancy · electrosense" />
    </g>
  );
}

// ─── Snake ───────────────────────────────────────────────────────────────
// Single long spine with 200-400 ribs (we draw ~30 to suggest it),
// one elongated functional lung, long single stomach.
export function SnakeXray({ creature, massKg }: XrayProps) {
  const beat = beatPeriodFor(massKg, 0.5); // cold-blooded — slower
  const bs = brainScaleFor(creature.brainTier);
  return (
    <g>
      {/* body outline — an undulating line */}
      <path d="M 30 175 Q 80 130 130 175 Q 180 220 230 175 Q 280 130 330 175 Q 360 200 380 180"
        stroke="rgba(160,180,220,0.18)" strokeWidth="40" fill="none" strokeLinecap="round" />

      {/* spine — same undulation, white */}
      <path d="M 30 175 Q 80 130 130 175 Q 180 220 230 175 Q 280 130 330 175 Q 360 200 380 180"
        stroke={BONE} strokeWidth="2" fill="none" />

      {/* SEGMENTAL (myomere) MUSCLES — paired W-shaped segments along
          the spine. Snakes contract them in alternating waves to slither;
          fish use the same arrangement. Each segment shows diagonal
          fiber striations. */}
      <g fill={MUSCLE} opacity="0.55">
        {Array.from({ length: 15 }).map((_, i) => {
          const t = (i + 0.5) / 15;
          const x = 30 + t * 350;
          const baseY = 175 + 45 * Math.sin(t * Math.PI * 3) * (t < 0.95 ? 1 : 0.4);
          // chevron shape — like a wide arrow pointing forward
          return (
            <path key={i}
              d={`M ${x - 9} ${baseY - 11} L ${x + 3} ${baseY} L ${x - 9} ${baseY + 11} L ${x - 3} ${baseY} Z`} />
          );
        })}
      </g>
      <g fill={MUSCLE_DARK} opacity="0.45">
        {Array.from({ length: 15 }).map((_, i) => {
          const t = (i + 0.5) / 15;
          const x = 30 + t * 350;
          const baseY = 175 + 45 * Math.sin(t * Math.PI * 3) * (t < 0.95 ? 1 : 0.4);
          return (
            <path key={i}
              d={`M ${x - 4} ${baseY - 7} L ${x + 1} ${baseY} L ${x - 4} ${baseY + 7} L ${x - 1} ${baseY} Z`} />
          );
        })}
      </g>
      {/* fiber striations */}
      <g stroke={MUSCLE_DARK} strokeWidth="0.6" opacity="0.7" fill="none" strokeLinecap="round">
        {Array.from({ length: 15 }).map((_, i) => {
          const t = (i + 0.5) / 15;
          const x = 30 + t * 350;
          const baseY = 175 + 45 * Math.sin(t * Math.PI * 3) * (t < 0.95 ? 1 : 0.4);
          return (
            <g key={i}>
              <line x1={x - 7} y1={baseY - 8} x2={x} y2={baseY - 2} />
              <line x1={x - 7} y1={baseY + 8} x2={x} y2={baseY + 2} />
            </g>
          );
        })}
      </g>

      {/* SO many ribs — draw 30 along the curve (over the muscle) */}
      <g stroke={BONE} strokeWidth="1" fill="none" opacity="0.85">
        {Array.from({ length: 30 }).map((_, i) => {
          const t = i / 29;
          // approximate position along the spine path
          const x = 30 + t * 350;
          const baseY = 175 + 45 * Math.sin(t * Math.PI * 3) * (t < 0.95 ? 1 : 0.4);
          return <line key={i} x1={x} y1={baseY - 14} x2={x} y2={baseY + 14} />;
        })}
      </g>

      {/* skull */}
      <ellipse cx="380" cy="180" rx="13" ry="7" fill="none" stroke={BONE} strokeWidth="1.5" />
      {/* fangs */}
      <line x1="385" y1="184" x2="386" y2="190" stroke="white" strokeWidth="1.2" />
      <line x1="389" y1="184" x2="390" y2="190" stroke="white" strokeWidth="1.2" />

      {/* heart — small, near head end */}
      <ellipse cx="340" cy="178" rx="6" ry="4.5" fill={HEART} opacity="0.9"
        style={{ animation: `heartbeat ${beat}s ease-in-out infinite`, transformOrigin: 'center', transformBox: 'fill-box' }} />

      {/* one elongated lung */}
      <ellipse cx="260" cy="172" rx="55" ry="6" fill={LUNG} opacity="0.55" transform="rotate(-8 260 172)" />
      <text x="260" y="174" fontSize="6" textAnchor="middle" fill="white" opacity="0.8">single lung</text>

      {/* long stomach */}
      <ellipse cx="150" cy="178" rx="55" ry="5" fill={STOMACH} opacity="0.55" transform="rotate(5 150 178)" />

      {/* brain (tiny) */}
      <circle cx="380" cy="178" r={3 * bs} fill={BRAIN} opacity="0.9" />

      <HeartLabel x={340} y={205} bpm={heartRate(massKg)} />
      <Caption text="200+ ribs · 1 functional lung · cold-blooded" />
    </g>
  );
}

// ─── Tortoise ────────────────────────────────────────────────────────────
// Shell = fused ribs + vertebrae. The skeleton IS the shell.
export function TortoiseXray({ creature, massKg }: XrayProps) {
  const beat = beatPeriodFor(massKg, 0.3); // very slow, cold-blooded
  const bs = brainScaleFor(creature.brainTier);
  return (
    <g>
      {/* shell dome outline */}
      <path d="M 100 200 Q 100 110 200 105 Q 300 110 300 200 Z"
        fill="rgba(160,180,220,0.18)" stroke="rgba(180,200,240,0.5)" strokeWidth="1" />

      {/* shell is FUSED ribs + spine — show the hex pattern as bone */}
      <g stroke={BONE} strokeWidth="1.3" fill="none" opacity="0.85">
        {/* central spine ridge */}
        <path d="M 200 105 Q 200 150 200 200" strokeWidth="2" />
        {/* radiating ribs that fuse into the shell */}
        {[-60, -40, -20, 0, 20, 40, 60].map((off) => (
          <path key={off} d={`M 200 ${130 + Math.abs(off) * 0.3} Q ${200 + off * 1.4} ${160 + Math.abs(off) * 0.2} ${200 + off * 2.1} 198`} />
        ))}
        {/* shell-plate (scute) lines */}
        <path d="M 110 175 Q 200 168 290 175" opacity="0.6" />
        <path d="M 120 145 Q 200 138 280 145" opacity="0.5" />
      </g>

      {/* head poking out */}
      <ellipse cx="315" cy="208" rx="20" ry="10" fill="rgba(160,180,220,0.22)" stroke="rgba(180,200,240,0.45)" strokeWidth="1" />
      <ellipse cx="318" cy="208" rx="6" ry="5" fill="none" stroke={BONE} strokeWidth="1.2" />
      <ellipse cx="320" cy="208" rx={2 * bs} ry={2 * bs} fill={BRAIN} opacity="0.9" />
      {/* legs */}
      <ellipse cx="125" cy="222" rx="14" ry="7" fill="rgba(160,180,220,0.2)" />
      <ellipse cx="275" cy="222" rx="14" ry="7" fill="rgba(160,180,220,0.2)" />
      <line x1="125" y1="215" x2="125" y2="232" stroke={BONE} strokeWidth="1.3" />
      <line x1="275" y1="215" x2="275" y2="232" stroke={BONE} strokeWidth="1.3" />

      {/* tiny slow heart UNDER shell */}
      <ellipse cx="180" cy="182" rx="9" ry="7" fill={HEART} opacity="0.9"
        style={{ animation: `heartbeat ${beat}s ease-in-out infinite`, transformOrigin: 'center', transformBox: 'fill-box' }} />

      {/* small lungs against the shell ceiling */}
      <ellipse cx="170" cy="150" rx="22" ry="8" fill={LUNG} opacity="0.45" />
      <ellipse cx="230" cy="150" rx="22" ry="8" fill={LUNG} opacity="0.45" />

      {/* LIMB RETRACTOR MUSCLES — tucked inside the shell, pull the legs
          and head back in when threatened. Strong but slow. */}
      <path d="M 116 178 Q 134 178 138 200 Q 132 210 120 208 Q 112 198 116 178 Z"
        fill={MUSCLE} opacity="0.6" />
      <path d="M 262 178 Q 286 178 286 200 Q 280 210 268 208 Q 258 198 262 178 Z"
        fill={MUSCLE} opacity="0.6" />
      <path d="M 280 190 Q 300 188 304 198 Q 296 204 286 202 Z"
        fill={MUSCLE} opacity="0.5" />
      <g stroke={MUSCLE_DARK} strokeWidth="0.7" opacity="0.8" fill="none" strokeLinecap="round">
        <path d="M 120 180 L 132 208" />
        <path d="M 126 180 L 134 206" />
        <path d="M 266 180 L 278 208" />
        <path d="M 274 180 L 282 206" />
      </g>

      <HeartLabel x={180} y={205} bpm={heartRate(massKg)} />
      <Caption text="Shell = fused ribs + spine · lives 150+ years" />
    </g>
  );
}

// ─── Elephant ─────────────────────────────────────────────────────────────
// Biggest land brain, columnar leg bones (square-cube survival),
// trunk = 40,000 muscles + ZERO bones, continuously-growing tusks.
export function ElephantXray({ creature, massKg }: XrayProps) {
  const beat = beatPeriodFor(massKg, 1);
  const bs = brainScaleFor(creature.brainTier);
  return (
    <g>
      {/* body outline */}
      <ellipse cx="200" cy="160" rx="100" ry="50" fill="rgba(160,180,220,0.18)" stroke="rgba(180,200,240,0.5)" strokeWidth="1" />

      {/* spine */}
      <line x1="105" y1="135" x2="300" y2="138" stroke={BONE} strokeWidth="2.6" opacity="0.9" />

      {/* skull (front) */}
      <ellipse cx="305" cy="148" rx="32" ry="26" fill="none" stroke={BONE} strokeWidth="1.8" opacity="0.9" />

      {/* tusks — continuously growing incisors */}
      <path d="M 320 168 Q 340 175 358 182" stroke="#fff5d8" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 322 175 Q 340 184 360 192" stroke="#fff5d8" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.85" />

      {/* TRUNK — pure muscle, no bones — drawn as striations */}
      <path d="M 332 168 Q 360 200 358 235" stroke={MUSCLE} strokeWidth="14" fill="none" strokeLinecap="round" opacity="0.6" />
      <g stroke={MUSCLE} strokeWidth="0.8" fill="none" opacity="0.85">
        {[0.1, 0.25, 0.4, 0.55, 0.7, 0.85].map((t, i) => {
          const x = 332 + (360 - 332) * t + 6 * Math.sin(t * 4);
          const y = 168 + (235 - 168) * t;
          return <line key={i} x1={x - 5} y1={y} x2={x + 5} y2={y} />;
        })}
      </g>
      <text x="368" y="208" fontSize="6" fill="white" opacity="0.85">trunk · no bones</text>

      {/* ribs (curved) */}
      <g stroke={BONE} strokeWidth="1.3" fill="none" opacity="0.8">
        {[-0.4, -0.25, -0.1, 0.05, 0.2, 0.35].map((off) => {
          const x = 200 + 200 * off;
          return <path key={off} d={`M ${x} 138 Q ${x + 6} 180 ${x - 4} 210`} />;
        })}
      </g>

      {/* columnar leg bones — thick (square-cube law) */}
      {[140, 175, 230, 265].map((x) => (
        <rect key={x} x={x - 5} y={210} width="10" height="45" rx="3" fill="none" stroke={BONE} strokeWidth="1.6" opacity="0.9" />
      ))}

      {/* huge brain (biggest land brain) */}
      <ellipse cx="298" cy="140" rx={16 * bs} ry={13 * bs} fill={BRAIN} opacity="0.9" />
      <text x="298" y="144" fontSize="8" textAnchor="middle" fill="white" opacity="0.9">🧠</text>

      {/* heart */}
      <ellipse cx="180" cy="170" rx="14" ry="11" fill={HEART} opacity="0.9"
        style={{ animation: `heartbeat ${beat}s ease-in-out infinite`, transformOrigin: 'center', transformBox: 'fill-box' }} />

      {/* lungs */}
      <ellipse cx="160" cy="148" rx="18" ry="10" fill={LUNG} opacity="0.5" />
      <ellipse cx="220" cy="148" rx="18" ry="10" fill={LUNG} opacity="0.5" />

      <HeartLabel x={180} y={195} bpm={heartRate(massKg)} />
      <Caption text="Trunk = 40,000 muscles (no bones) · biggest land brain" />
    </g>
  );
}

// ─── Bat ─────────────────────────────────────────────────────────────────
// Wing bones are elongated FINGERS — the only mammal with true flapping flight.
export function BatXray({ creature, massKg }: XrayProps) {
  const beat = beatPeriodFor(massKg, 1);
  const bs = brainScaleFor(creature.brainTier);

  // Geometry shared between bones and muscles so they line up exactly.
  const SHOULDER_L = { x: 178, y: 162 };
  const ELBOW_L    = { x: 138, y: 134 };
  const WRIST_L    = { x: 110, y: 130 };
  const SHOULDER_R = { x: 222, y: 162 };
  const ELBOW_R    = { x: 262, y: 134 };
  const WRIST_R    = { x: 290, y: 130 };

  // Left wing finger tips
  const FINGERS_L = [
    { x: 78, y: 96 },     // thumb-side wing-leading finger
    { x: 78, y: 132 },
    { x: 88, y: 168 },
    { x: 104, y: 196 },
  ];
  const FINGERS_R = [
    { x: 322, y: 96 },
    { x: 322, y: 132 },
    { x: 312, y: 168 },
    { x: 296, y: 196 },
  ];

  return (
    <g>
      {/* body — slightly larger than before so muscle detail can read */}
      <ellipse cx="200" cy="174" rx="30" ry="44" fill="rgba(160,180,220,0.22)" stroke="rgba(180,200,240,0.5)" strokeWidth="1" />

      {/* wing membranes (faint) — span from finger tip down to body */}
      <path d={`M ${SHOULDER_L.x} ${SHOULDER_L.y} L ${FINGERS_L[0].x} ${FINGERS_L[0].y} L ${FINGERS_L[1].x} ${FINGERS_L[1].y} L ${FINGERS_L[2].x} ${FINGERS_L[2].y} L ${FINGERS_L[3].x} ${FINGERS_L[3].y} L 200 200 Z`}
        fill="rgba(140,150,200,0.16)" stroke="rgba(180,200,240,0.35)" strokeWidth="0.7" />
      <path d={`M ${SHOULDER_R.x} ${SHOULDER_R.y} L ${FINGERS_R[0].x} ${FINGERS_R[0].y} L ${FINGERS_R[1].x} ${FINGERS_R[1].y} L ${FINGERS_R[2].x} ${FINGERS_R[2].y} L ${FINGERS_R[3].x} ${FINGERS_R[3].y} L 200 200 Z`}
        fill="rgba(140,150,200,0.16)" stroke="rgba(180,200,240,0.35)" strokeWidth="0.7" />

      {/* ─── MUSCLE LAYER ──── drawn before the bones so bones overlay
          on top. A bat is essentially a flying chest: pectoralis +
          supracoracoideus make up roughly 25% of total body mass. */}

      {/* SUPRACORACOIDEUS — the UPSTROKE muscle. Sits deep, beneath the
          pectoralis. The tendon loops up and over the shoulder joint
          (a unique pulley-like arrangement). Drawn as a smaller mass
          on either side of the lower keel. */}
      <path d="M 192 196 Q 200 200 208 196 Q 210 210 200 212 Q 190 210 192 196 Z"
        fill={MUSCLE_DARK} opacity="0.55" />
      <text x="200" y="222" fontSize="5.5" textAnchor="middle" fill="white" opacity="0.65">supracoracoid (upstroke)</text>

      {/* PECTORALIS MAJOR — the dominant chest muscle, drives the
          DOWNSTROKE. Massive fan running from the keel to a tendon
          attaching to the upper arm bone (humerus). Drawn as two
          huge fans, one for each wing. */}
      {/* left fan — from keel out to the left shoulder (178, 162) */}
      <path d="M 199 152
               Q 200 150 178 158
               Q 184 200 199 210
               Q 196 196 199 168 Z"
        fill={MUSCLE} opacity="0.7" />
      <path d="M 199 158 Q 188 168 184 196 Q 196 204 199 196 Z" fill={MUSCLE_DARK} opacity="0.4" />
      {/* left fan striations — converge toward the shoulder */}
      <g stroke={MUSCLE_DARK} strokeWidth="0.8" opacity="0.9" strokeLinecap="round" fill="none">
        <path d={`M 198 156 L ${SHOULDER_L.x - 4} ${SHOULDER_L.y + 2}`} />
        <path d={`M 198 168 L ${SHOULDER_L.x - 2} ${SHOULDER_L.y + 4}`} />
        <path d={`M 198 182 L ${SHOULDER_L.x + 1} ${SHOULDER_L.y + 4}`} />
        <path d={`M 198 196 L ${SHOULDER_L.x + 4} ${SHOULDER_L.y + 4}`} />
      </g>
      {/* right fan — mirror */}
      <path d="M 201 152
               Q 200 150 222 158
               Q 216 200 201 210
               Q 204 196 201 168 Z"
        fill={MUSCLE} opacity="0.7" />
      <path d="M 201 158 Q 212 168 216 196 Q 204 204 201 196 Z" fill={MUSCLE_DARK} opacity="0.4" />
      <g stroke={MUSCLE_DARK} strokeWidth="0.8" opacity="0.9" strokeLinecap="round" fill="none">
        <path d={`M 202 156 L ${SHOULDER_R.x + 4} ${SHOULDER_R.y + 2}`} />
        <path d={`M 202 168 L ${SHOULDER_R.x + 2} ${SHOULDER_R.y + 4}`} />
        <path d={`M 202 182 L ${SHOULDER_R.x - 1} ${SHOULDER_R.y + 4}`} />
        <path d={`M 202 196 L ${SHOULDER_R.x - 4} ${SHOULDER_R.y + 4}`} />
      </g>

      {/* PECTORALIS TENDONS — pale yellow cords attaching to each
          humerus (upper arm) just past the shoulder. */}
      <path d={`M ${SHOULDER_L.x - 2} ${SHOULDER_L.y + 2} L ${SHOULDER_L.x + 4} ${SHOULDER_L.y - 2}`} stroke={TENDON} strokeWidth="2" strokeLinecap="round" />
      <path d={`M ${SHOULDER_R.x + 2} ${SHOULDER_R.y + 2} L ${SHOULDER_R.x - 4} ${SHOULDER_R.y - 2}`} stroke={TENDON} strokeWidth="2" strokeLinecap="round" />

      {/* DELTOID — small cap over each shoulder joint, stabilizes the
          arm during the stroke transition. */}
      <ellipse cx={SHOULDER_L.x - 2} cy={SHOULDER_L.y - 4} rx="6" ry="5" fill={MUSCLE} opacity="0.6" />
      <ellipse cx={SHOULDER_R.x + 2} cy={SHOULDER_R.y - 4} rx="6" ry="5" fill={MUSCLE} opacity="0.6" />
      <g stroke={MUSCLE_DARK} strokeWidth="0.5" opacity="0.85" fill="none">
        <line x1={SHOULDER_L.x - 7} y1={SHOULDER_L.y - 4} x2={SHOULDER_L.x + 1} y2={SHOULDER_L.y - 4} />
        <line x1={SHOULDER_R.x + 7} y1={SHOULDER_R.y - 4} x2={SHOULDER_R.x - 1} y2={SHOULDER_R.y - 4} />
      </g>

      {/* BICEPS / TRICEPS — bulge along the humerus (between shoulder
          and elbow). Bats flex/extend the wing partly through these. */}
      <BatArmMuscle a={SHOULDER_L} b={ELBOW_L} side="L" />
      <BatArmMuscle a={SHOULDER_R} b={ELBOW_R} side="R" />

      {/* FOREARM MUSCLE — between elbow and wrist. Controls the
          terminal finger spread + membrane tension. */}
      <BatForearmMuscle a={ELBOW_L} b={WRIST_L} />
      <BatForearmMuscle a={ELBOW_R} b={WRIST_R} />

      {/* FINGER-FLEXOR STRIATIONS — tiny diagonal hatch marks along
          the proximal finger bones, where small flexor muscles tune
          the wing-membrane tension at each beat. */}
      <g stroke={MUSCLE_DARK} strokeWidth="0.5" opacity="0.7" strokeLinecap="round">
        {FINGERS_L.map((f, i) => (
          <g key={`fl-${i}`}>
            <line x1={WRIST_L.x + (f.x - WRIST_L.x) * 0.15} y1={WRIST_L.y + (f.y - WRIST_L.y) * 0.15}
                  x2={WRIST_L.x + (f.x - WRIST_L.x) * 0.30 + 1} y2={WRIST_L.y + (f.y - WRIST_L.y) * 0.30 - 1} />
            <line x1={WRIST_L.x + (f.x - WRIST_L.x) * 0.30} y1={WRIST_L.y + (f.y - WRIST_L.y) * 0.30}
                  x2={WRIST_L.x + (f.x - WRIST_L.x) * 0.45 + 1} y2={WRIST_L.y + (f.y - WRIST_L.y) * 0.45 - 1} />
          </g>
        ))}
        {FINGERS_R.map((f, i) => (
          <g key={`fr-${i}`}>
            <line x1={WRIST_R.x + (f.x - WRIST_R.x) * 0.15} y1={WRIST_R.y + (f.y - WRIST_R.y) * 0.15}
                  x2={WRIST_R.x + (f.x - WRIST_R.x) * 0.30 - 1} y2={WRIST_R.y + (f.y - WRIST_R.y) * 0.30 - 1} />
            <line x1={WRIST_R.x + (f.x - WRIST_R.x) * 0.30} y1={WRIST_R.y + (f.y - WRIST_R.y) * 0.30}
                  x2={WRIST_R.x + (f.x - WRIST_R.x) * 0.45 - 1} y2={WRIST_R.y + (f.y - WRIST_R.y) * 0.45 - 1} />
          </g>
        ))}
      </g>

      {/* ─── SKELETON OVERLAY ──── */}

      {/* spine */}
      <line x1="200" y1="138" x2="200" y2="218" stroke={BONE} strokeWidth="1.8" />

      {/* arm bones (humerus) */}
      <line x1={SHOULDER_L.x} y1={SHOULDER_L.y} x2={ELBOW_L.x} y2={ELBOW_L.y} stroke={BONE} strokeWidth="2.2" />
      <line x1={SHOULDER_R.x} y1={SHOULDER_R.y} x2={ELBOW_R.x} y2={ELBOW_R.y} stroke={BONE} strokeWidth="2.2" />
      {/* forearm bones (radius/ulna) */}
      <line x1={ELBOW_L.x} y1={ELBOW_L.y} x2={WRIST_L.x} y2={WRIST_L.y} stroke={BONE} strokeWidth="1.9" />
      <line x1={ELBOW_R.x} y1={ELBOW_R.y} x2={WRIST_R.x} y2={WRIST_R.y} stroke={BONE} strokeWidth="1.9" />

      {/* FINGERS — elongated digits supporting the wing membrane */}
      <g stroke={BONE} strokeWidth="1.3" fill="none" strokeLinecap="round">
        {FINGERS_L.map((f, i) => (
          <line key={`bl-${i}`} x1={WRIST_L.x} y1={WRIST_L.y} x2={f.x} y2={f.y} />
        ))}
        {FINGERS_R.map((f, i) => (
          <line key={`br-${i}`} x1={WRIST_R.x} y1={WRIST_R.y} x2={f.x} y2={f.y} />
        ))}
      </g>

      {/* joints */}
      <g fill={BONE} opacity="0.95">
        <circle cx={SHOULDER_L.x} cy={SHOULDER_L.y} r="2.2" />
        <circle cx={SHOULDER_R.x} cy={SHOULDER_R.y} r="2.2" />
        <circle cx={ELBOW_L.x} cy={ELBOW_L.y} r="1.8" />
        <circle cx={ELBOW_R.x} cy={ELBOW_R.y} r="1.8" />
        <circle cx={WRIST_L.x} cy={WRIST_L.y} r="1.6" />
        <circle cx={WRIST_R.x} cy={WRIST_R.y} r="1.6" />
      </g>

      {/* KEEL STERNUM — pronounced bony ridge where the pectoralis
          attaches. Bats and flying birds both have one. */}
      <path d="M 196 154 L 200 218 L 204 154 Z" fill={BONE} opacity="0.7" stroke="#bbb" strokeWidth="0.4" />
      <text x="208" y="200" fontSize="5" fill="white" opacity="0.7">keel</text>

      {/* RIBCAGE — short, curved */}
      <g stroke={BONE} strokeWidth="0.9" fill="none" opacity="0.7">
        <path d="M 200 160 Q 215 168 220 184" />
        <path d="M 200 168 Q 218 174 223 188" />
        <path d="M 200 178 Q 218 184 222 198" />
        <path d="M 200 160 Q 185 168 180 184" />
        <path d="M 200 168 Q 182 174 177 188" />
        <path d="M 200 178 Q 182 184 178 198" />
      </g>

      {/* skull */}
      <ellipse cx="200" cy="138" rx="10" ry="8" fill="none" stroke={BONE} strokeWidth="1.4" />

      {/* large brain (sonar processing) */}
      <ellipse cx="200" cy="138" rx={6 * bs} ry={5 * bs} fill={BRAIN} opacity="0.85" />

      {/* ears (huge, for echolocation) */}
      <path d="M 194 130 Q 188 116 190 128" stroke={BONE} strokeWidth="1.2" fill="none" />
      <path d="M 206 130 Q 212 116 210 128" stroke={BONE} strokeWidth="1.2" fill="none" />

      {/* tiny fast heart — squeezed in between the pectoral fans */}
      <ellipse cx="200" cy="178" rx="3.5" ry="3" fill={HEART} opacity="0.95"
        style={{ animation: `heartbeat ${beat}s ease-in-out infinite`, transformOrigin: 'center', transformBox: 'fill-box' }} />

      {/* echolocation pings from mouth */}
      <g stroke="#ffe48a" strokeWidth="0.9" fill="none" opacity="0.55" strokeDasharray="2 3">
        <path d="M 200 148 Q 200 156 195 160" />
        <path d="M 200 148 Q 200 162 188 168" />
      </g>

      <HeartLabel x={200} y={232} bpm={heartRate(massKg)} />
      <Caption text="Pectoralis is ~15% of body mass · downstroke + upstroke have separate muscles" />
    </g>
  );
}

// Helper: a muscle group along an arm bone (biceps + triceps swelling),
// drawn parallel to the bone with striations.
function BatArmMuscle({ a, b, side }: { a: { x: number; y: number }; b: { x: number; y: number }; side: 'L' | 'R' }) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  const nx = -dy / len; // perpendicular
  const ny = dx / len;
  const off = side === 'L' ? -5 : 5;
  // midpoint of the bone
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  // offset both sides of the bone for biceps + triceps
  const px1 = mx + nx * off;
  const py1 = my + ny * off;
  const px2 = mx - nx * off;
  const py2 = my - ny * off;
  return (
    <g>
      {/* biceps bulge above the bone */}
      <ellipse cx={px1} cy={py1} rx={len * 0.42} ry={3.6} fill={MUSCLE} opacity="0.6"
        transform={`rotate(${Math.atan2(dy, dx) * 180 / Math.PI} ${px1} ${py1})`} />
      {/* triceps bulge below */}
      <ellipse cx={px2} cy={py2} rx={len * 0.42} ry={3.2} fill={MUSCLE} opacity="0.55"
        transform={`rotate(${Math.atan2(dy, dx) * 180 / Math.PI} ${px2} ${py2})`} />
      {/* striations along the bone */}
      <g stroke={MUSCLE_DARK} strokeWidth="0.5" opacity="0.85" strokeLinecap="round">
        {[0.25, 0.5, 0.75].map((t) => (
          <line key={t}
            x1={a.x + dx * t + nx * (off - 3)} y1={a.y + dy * t + ny * (off - 3)}
            x2={a.x + dx * t + nx * (off + 3)} y2={a.y + dy * t + ny * (off + 3)} />
        ))}
      </g>
    </g>
  );
}

// Helper: forearm muscle (a smaller swelling between elbow and wrist).
function BatForearmMuscle({ a, b }: { a: { x: number; y: number }; b: { x: number; y: number } }) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  const mx = a.x + dx * 0.5;
  const my = a.y + dy * 0.5;
  return (
    <g>
      <ellipse cx={mx} cy={my} rx={len * 0.42} ry="2.6" fill={MUSCLE} opacity="0.55"
        transform={`rotate(${Math.atan2(dy, dx) * 180 / Math.PI} ${mx} ${my})`} />
      <g stroke={MUSCLE_DARK} strokeWidth="0.45" opacity="0.8">
        {[0.3, 0.6].map((t) => (
          <line key={t}
            x1={a.x + dx * t - 2} y1={a.y + dy * t - 1}
            x2={a.x + dx * t + 2} y2={a.y + dy * t + 1} />
        ))}
      </g>
    </g>
  );
}

// ─── Mouse ───────────────────────────────────────────────────────────────
// Tiny body, fast heart (~600 bpm), proportionally huge brain.
export function MouseXray({ creature, massKg }: XrayProps) {
  const beat = beatPeriodFor(massKg, 1);
  const bs = brainScaleFor(creature.brainTier);
  return (
    <g>
      {/* tiny body */}
      <ellipse cx="200" cy="180" rx="40" ry="28" fill="rgba(160,180,220,0.22)" stroke="rgba(180,200,240,0.5)" strokeWidth="1" />

      {/* skull */}
      <ellipse cx="240" cy="172" rx="14" ry="12" fill="none" stroke={BONE} strokeWidth="1.5" />

      {/* spine */}
      <line x1="165" y1="175" x2="232" y2="173" stroke={BONE} strokeWidth="1.6" />

      {/* tail vertebrae — long */}
      <path d="M 162 178 Q 130 195 95 210 Q 70 222 55 235" stroke={BONE} strokeWidth="1.4" fill="none" />
      <g fill="none" stroke={BONE} strokeWidth="0.7" opacity="0.6">
        {Array.from({ length: 8 }).map((_, i) => {
          const t = (i + 1) / 9;
          const x = 162 - t * 110;
          const y = 178 + t * 60;
          return <line key={i} x1={x - 3} y1={y - 2} x2={x + 3} y2={y + 2} />;
        })}
      </g>

      {/* ribs (small) */}
      <g stroke={BONE} strokeWidth="0.9" fill="none" opacity="0.75">
        {[-0.3, -0.15, 0, 0.15].map((off) => {
          const x = 200 + 60 * off;
          return <path key={off} d={`M ${x} 170 Q ${x + 2} 188 ${x - 2} 202`} />;
        })}
      </g>

      {/* HINDLEG + JAW MUSCLES — proportionally enormous incisor-jaw
          muscle lets a mouse gnaw through wood; the hindleg muscle
          powers their 30 cm vertical leap (4× their body length). */}
      <path d="M 170 188 Q 182 188 182 202 Q 178 210 172 208 Q 166 198 170 188 Z" fill={MUSCLE} opacity="0.6" />
      <path d="M 220 188 Q 232 188 232 202 Q 228 210 222 208 Q 216 198 220 188 Z" fill={MUSCLE} opacity="0.6" />
      <g stroke={MUSCLE_DARK} strokeWidth="0.5" opacity="0.85" fill="none" strokeLinecap="round">
        <path d="M 172 190 L 178 206" />
        <path d="M 176 190 L 180 206" />
        <path d="M 222 190 L 228 206" />
        <path d="M 226 190 L 230 206" />
      </g>
      {/* jaw masseter behind the cheek */}
      <ellipse cx="236" cy="174" rx="5" ry="4" fill={MUSCLE} opacity="0.6" />
      <line x1="232" y1="173" x2="240" y2="175" stroke={MUSCLE_DARK} strokeWidth="0.5" opacity="0.8" />

      {/* legs */}
      {[175, 225].map((x) => (
        <g key={x}>
          <line x1={x} y1={205} x2={x - 4} y2={222} stroke={BONE} strokeWidth="1.2" />
          <line x1={x} y1={205} x2={x + 4} y2={222} stroke={BONE} strokeWidth="1.2" />
        </g>
      ))}

      {/* big-relative-to-body brain */}
      <ellipse cx="244" cy="170" rx={8 * bs} ry={6 * bs} fill={BRAIN} opacity="0.9" />

      {/* huge ears */}
      <circle cx="232" cy="158" r="6" fill="none" stroke={BONE} strokeWidth="1" />
      <circle cx="252" cy="158" r="6" fill="none" stroke={BONE} strokeWidth="1" />

      {/* tiny fast heart */}
      <ellipse cx="190" cy="180" rx="5" ry="4" fill={HEART} opacity="0.95"
        style={{ animation: `heartbeat ${beat}s ease-in-out infinite`, transformOrigin: 'center', transformBox: 'fill-box' }} />

      {/* whisker indicators */}
      <g stroke="white" strokeWidth="0.5" opacity="0.5">
        <line x1="252" y1="174" x2="270" y2="170" />
        <line x1="252" y1="178" x2="272" y2="180" />
      </g>

      <HeartLabel x={190} y={210} bpm={heartRate(massKg)} />
      <Caption text="Heart at 600 bpm · 2-year lifespan ≈ 1.5 billion beats" />
    </g>
  );
}

// ─── Hummingbird ─────────────────────────────────────────────────────────
// Huge keel sternum for flight muscles, fastest vertebrate heart.
export function HummingbirdXray({ creature, massKg }: XrayProps) {
  const beat = beatPeriodFor(massKg, 1);
  const bs = brainScaleFor(creature.brainTier);
  return (
    <g>
      {/* tiny body */}
      <ellipse cx="200" cy="180" rx="22" ry="28" fill="rgba(160,180,220,0.22)" stroke="rgba(180,200,240,0.5)" strokeWidth="1" />

      {/* skull + long beak */}
      <ellipse cx="200" cy="148" rx="10" ry="9" fill="none" stroke={BONE} strokeWidth="1.4" />
      <line x1="200" y1="142" x2="200" y2="115" stroke={BONE} strokeWidth="2" />

      {/* HUGE keel sternum — supports the flight muscles */}
      <path d="M 184 170 L 200 215 L 216 170 Z" fill="none" stroke={BONE} strokeWidth="1.6" />
      <text x="225" y="200" fontSize="6" fill="white" opacity="0.85">keel</text>

      {/* flight muscles flanking the keel */}
      <ellipse cx="186" cy="180" rx="6" ry="14" fill={MUSCLE} opacity="0.55" />
      <ellipse cx="214" cy="180" rx="6" ry="14" fill={MUSCLE} opacity="0.55" />

      {/* hollow wing bones */}
      <g stroke={BONE} strokeWidth="1.4" fill="none">
        <line x1="184" y1="170" x2="140" y2="175" />
        <line x1="216" y1="170" x2="260" y2="175" />
        <line x1="140" y1="175" x2="110" y2="170" />
        <line x1="260" y1="175" x2="290" y2="170" />
      </g>

      {/* huge brain (proportional) */}
      <ellipse cx="200" cy="148" rx={5 * bs} ry={4 * bs} fill={BRAIN} opacity="0.9" />

      {/* heart — super fast (1200 bpm in flight) */}
      <ellipse cx="200" cy="180" rx="4" ry="3.5" fill={HEART} opacity="0.95"
        style={{ animation: `heartbeat ${beat}s ease-in-out infinite`, transformOrigin: 'center', transformBox: 'fill-box' }} />

      {/* leg bones (tiny) */}
      <line x1="195" y1="205" x2="192" y2="222" stroke={BONE} strokeWidth="1" />
      <line x1="205" y1="205" x2="208" y2="222" stroke={BONE} strokeWidth="1" />

      <HeartLabel x={200} y={232} bpm={heartRate(massKg)} />
      <Caption text="Keel sternum · 1200 bpm heart · 80 wingbeats/sec" />
    </g>
  );
}

// ─── Eagle / Pterodactyl-style flying skeleton ───────────────────────────
// Hollow bones, big keel, long wing.
export function EagleXray({ creature, massKg }: XrayProps) {
  const beat = beatPeriodFor(massKg, 1);
  const bs = brainScaleFor(creature.brainTier);
  return (
    <g>
      <ellipse cx="200" cy="175" rx="46" ry="36" fill="rgba(160,180,220,0.22)" stroke="rgba(180,200,240,0.5)" strokeWidth="1" />

      {/* skull + hooked beak */}
      <ellipse cx="200" cy="135" rx="14" ry="11" fill="none" stroke={BONE} strokeWidth="1.5" />
      <path d="M 200 142 L 205 156 L 196 152 Z" fill="none" stroke={BONE} strokeWidth="1.3" />

      {/* keel sternum */}
      <path d="M 175 165 L 200 218 L 225 165 Z" fill="none" stroke={BONE} strokeWidth="1.8" />

      {/* big flight muscles */}
      <ellipse cx="180" cy="180" rx="9" ry="20" fill={MUSCLE} opacity="0.5" />
      <ellipse cx="220" cy="180" rx="9" ry="20" fill={MUSCLE} opacity="0.5" />

      {/* hollow wing bones (lighter for flight) */}
      <g stroke={BONE} strokeWidth="2" fill="none" strokeLinecap="round">
        <line x1="175" y1="165" x2="110" y2="135" />
        <line x1="110" y1="135" x2="45" y2="155" />
        <line x1="225" y1="165" x2="290" y2="135" />
        <line x1="290" y1="135" x2="355" y2="155" />
      </g>
      <g stroke={BONE} strokeWidth="0.8" fill="none" opacity="0.5">
        <line x1="60" y1="153" x2="80" y2="170" />
        <line x1="78" y1="148" x2="100" y2="162" />
        <line x1="340" y1="153" x2="320" y2="170" />
        <line x1="322" y1="148" x2="300" y2="162" />
      </g>

      {/* spine */}
      <line x1="200" y1="145" x2="200" y2="210" stroke={BONE} strokeWidth="1.8" />

      {/* heart */}
      <ellipse cx="200" cy="185" rx="7" ry="5.5" fill={HEART} opacity="0.92"
        style={{ animation: `heartbeat ${beat}s ease-in-out infinite`, transformOrigin: 'center', transformBox: 'fill-box' }} />

      {/* brain */}
      <ellipse cx="200" cy="135" rx={7 * bs} ry={5 * bs} fill={BRAIN} opacity="0.9" />

      {/* talons / legs */}
      <line x1="195" y1="208" x2="190" y2="232" stroke={BONE} strokeWidth="1.3" />
      <line x1="205" y1="208" x2="210" y2="232" stroke={BONE} strokeWidth="1.3" />
      <g stroke={BONE} strokeWidth="1" fill="none" strokeLinecap="round">
        <line x1="190" y1="232" x2="184" y2="240" />
        <line x1="190" y1="232" x2="192" y2="240" />
        <line x1="210" y1="232" x2="216" y2="240" />
        <line x1="210" y1="232" x2="208" y2="240" />
      </g>

      <HeartLabel x={200} y={250} bpm={heartRate(massKg)} />
      <Caption text="Hollow bones · keel sternum · hooked beak" />
    </g>
  );
}

// ─── Penguin ─────────────────────────────────────────────────────────────
// Dense (not hollow) bones — sinks better for diving.
export function PenguinXray({ creature, massKg }: XrayProps) {
  const beat = beatPeriodFor(massKg, 1);
  const bs = brainScaleFor(creature.brainTier);
  return (
    <g>
      <ellipse cx="200" cy="180" rx="46" ry="60" fill="rgba(160,180,220,0.22)" stroke="rgba(180,200,240,0.5)" strokeWidth="1" />

      {/* skull */}
      <ellipse cx="200" cy="118" rx="14" ry="11" fill="none" stroke={BONE} strokeWidth="1.6" />
      {/* short beak */}
      <path d="M 200 124 L 214 132 L 200 135 Z" fill="none" stroke={BONE} strokeWidth="1.3" />

      {/* heavy spine */}
      <line x1="200" y1="128" x2="200" y2="232" stroke={BONE} strokeWidth="2.4" />

      {/* dense rib cage */}
      <g stroke={BONE} strokeWidth="1.4" fill="none">
        {[-0.25, -0.1, 0.05, 0.2].map((off) => {
          const y = 180 + 80 * off;
          return <path key={off} d={`M 200 ${y} Q 175 ${y + 6} 162 ${y + 18}`} />;
        })}
        {[-0.25, -0.1, 0.05, 0.2].map((off) => {
          const y = 180 + 80 * off;
          return <path key={`r${off}`} d={`M 200 ${y} Q 225 ${y + 6} 238 ${y + 18}`} />;
        })}
      </g>

      {/* FLIPPER PECTORALIS — penguins repurposed flight muscle for
          underwater paddling. Slow-twitch fibers for sustained dives,
          denser than air-flying birds. */}
      <path d="M 170 152
               Q 186 154 188 208
               Q 180 214 172 210
               Q 162 180 170 152 Z"
        fill={MUSCLE} opacity="0.6" />
      <path d="M 230 152
               Q 214 154 212 208
               Q 220 214 228 210
               Q 238 180 230 152 Z"
        fill={MUSCLE} opacity="0.6" />
      <g stroke={MUSCLE_DARK} strokeWidth="0.7" opacity="0.85" fill="none" strokeLinecap="round">
        <path d="M 174 156 L 182 208" />
        <path d="M 180 156 L 184 208" />
        <path d="M 226 156 L 218 208" />
        <path d="M 220 156 L 216 208" />
      </g>
      <path d="M 180 212 L 178 220" stroke={TENDON} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M 220 212 L 222 220" stroke={TENDON} strokeWidth="1.4" strokeLinecap="round" />

      {/* flipper-wing bones (fused, paddle-like) */}
      <g stroke={BONE} strokeWidth="1.6" fill="none" strokeLinecap="round">
        <line x1="160" y1="158" x2="115" y2="200" />
        <line x1="115" y1="200" x2="120" y2="232" />
        <line x1="240" y1="158" x2="285" y2="200" />
        <line x1="285" y1="200" x2="280" y2="232" />
      </g>

      {/* brain */}
      <ellipse cx="200" cy="118" rx={6 * bs} ry={5 * bs} fill={BRAIN} opacity="0.9" />

      {/* big lungs (for diving breath-holds) */}
      <ellipse cx="183" cy="170" rx="12" ry="22" fill={LUNG} opacity="0.55" />
      <ellipse cx="217" cy="170" rx="12" ry="22" fill={LUNG} opacity="0.55" />

      {/* heart */}
      <ellipse cx="200" cy="200" rx="8" ry="6" fill={HEART} opacity="0.92"
        style={{ animation: `heartbeat ${beat}s ease-in-out infinite`, transformOrigin: 'center', transformBox: 'fill-box' }} />

      {/* feet bones */}
      <line x1="190" y1="235" x2="186" y2="248" stroke={BONE} strokeWidth="1.4" />
      <line x1="210" y1="235" x2="214" y2="248" stroke={BONE} strokeWidth="1.4" />

      <HeartLabel x={200} y={258} bpm={heartRate(massKg)} />
      <Caption text="Dense (not hollow) bones · big lungs for diving" />
    </g>
  );
}

// ─── Generic Quadruped Mammal ────────────────────────────────────────────
// Reused for Lion / Cheetah / Wolf / SnowLeopard / PolarBear / Gorilla.
// Big-cat sprint skeleton: long spine, deep ribcage, leg bones, heart, lungs.
export function QuadrupedXray({ creature, massKg }: XrayProps) {
  const beat = beatPeriodFor(massKg, 1);
  const bs = brainScaleFor(creature.brainTier);
  // tweak by shape: gorilla = upright-ish, polar bear = thicker, cheetah = slim
  const isUpright = creature.shape === 'gorilla';
  return (
    <g>
      <ellipse cx="200" cy="170" rx={isUpright ? 50 : 90} ry={isUpright ? 60 : 38}
        fill="rgba(160,180,220,0.22)" stroke="rgba(180,200,240,0.5)" strokeWidth="1" />

      {/* spine */}
      <line x1={isUpright ? 200 : 115} y1={isUpright ? 115 : 142}
            x2={isUpright ? 200 : 285} y2={isUpright ? 232 : 148}
            stroke={BONE} strokeWidth="2.4" />

      {/* skull */}
      <ellipse cx={isUpright ? 200 : 295} cy={isUpright ? 115 : 145} rx="16" ry="13" fill="none" stroke={BONE} strokeWidth="1.6" />
      {/* jaw */}
      <path d={isUpright ? "M 188 122 L 212 122 L 200 132 Z" : "M 282 152 L 312 152 L 295 161 Z"} fill="none" stroke={BONE} strokeWidth="1.2" />

      {/* ribs */}
      <g stroke={BONE} strokeWidth="1.3" fill="none" opacity="0.85">
        {[-0.35, -0.2, -0.05, 0.1, 0.25].map((off) => {
          const x = (isUpright ? 200 : 200) + (isUpright ? 0 : 200 * off);
          const y = (isUpright ? 150 + 80 * (off + 0.35) : 148);
          return isUpright
            ? <path key={off} d={`M 200 ${y} Q 175 ${y + 5} 168 ${y + 15}`} />
            : <path key={off} d={`M ${x} ${y} Q ${x + 4} ${y + 30} ${x - 2} ${y + 50}`} />;
        })}
        {isUpright && [-0.35, -0.2, -0.05, 0.1, 0.25].map((off) => {
          const y = 150 + 80 * (off + 0.35);
          return <path key={`r${off}`} d={`M 200 ${y} Q 225 ${y + 5} 232 ${y + 15}`} />;
        })}
      </g>

      {/* MUSCLES — anatomically shaped, with parallel fiber striations
          and tendons attaching to the bones. */}
      {!isUpright && (
        <g>
          {/* HINDQUARTER — biceps femoris / glute. Teardrop shape sweeping
              from the hip down to a tendon at the back of the knee. */}
          <path d="M 102 175
                   Q 145 168 152 198
                   Q 145 215 120 215
                   Q 100 208 96 192
                   Z"
            fill={MUSCLE} opacity="0.65" />
          {/* deeper red core where the muscle is thickest */}
          <path d="M 112 182
                   Q 138 178 144 198
                   Q 138 210 122 210
                   Q 108 204 108 194
                   Z"
            fill={MUSCLE_DARK} opacity="0.45" />
          {/* fiber striations along the muscle's pull direction */}
          <g stroke={MUSCLE_DARK} strokeWidth="0.8" opacity="0.85" strokeLinecap="round" fill="none">
            <path d="M 108 180 Q 122 192 138 210" />
            <path d="M 102 188 Q 120 198 135 215" />
            <path d="M 100 197 Q 118 207 132 218" />
            <path d="M 112 175 Q 128 190 148 205" />
          </g>
          {/* tendon connecting muscle to leg bone — pale yellow line */}
          <path d="M 138 212 Q 142 222 138 232" stroke={TENDON} strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* PECTORALIS — chest. Fan shape radiating from sternum out to
              the shoulder, with horizontal-ish fibers. */}
          <path d="M 168 178
                   Q 200 172 232 178
                   Q 230 200 200 204
                   Q 170 200 168 178
                   Z"
            fill={MUSCLE} opacity="0.55" />
          <g stroke={MUSCLE_DARK} strokeWidth="0.7" opacity="0.8" strokeLinecap="round" fill="none">
            <path d="M 172 184 Q 200 182 228 184" />
            <path d="M 174 192 Q 200 192 226 192" />
            <path d="M 178 200 Q 200 200 222 200" />
          </g>

          {/* DELTOID / SHOULDER — short rounded muscle over the
              shoulder joint, fibers radiating down toward the front leg. */}
          <path d="M 246 168
                   Q 268 172 268 188
                   Q 264 200 248 198
                   Q 238 192 240 178 Z"
            fill={MUSCLE} opacity="0.6" />
          <g stroke={MUSCLE_DARK} strokeWidth="0.7" opacity="0.85" fill="none" strokeLinecap="round">
            <path d="M 248 172 L 258 192" />
            <path d="M 252 170 L 262 192" />
            <path d="M 256 170 L 265 188" />
          </g>
          {/* shoulder tendon to front leg */}
          <path d="M 256 198 Q 260 208 256 218" stroke={TENDON} strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      )}
      {isUpright && (
        <g>
          {/* GORILLA pectoralis + deltoids — far bigger than typical
              quadrupeds. Fibers run vertically. */}
          {/* left shoulder mass */}
          <path d="M 160 138
                   Q 184 142 188 174
                   Q 180 196 162 192
                   Q 152 166 160 138 Z"
            fill={MUSCLE} opacity="0.6" />
          {/* darker core */}
          <path d="M 168 148 Q 182 152 184 174 Q 178 190 168 188 Q 162 168 168 148 Z" fill={MUSCLE_DARK} opacity="0.4" />
          <g stroke={MUSCLE_DARK} strokeWidth="0.8" opacity="0.85" fill="none" strokeLinecap="round">
            <path d="M 168 145 L 172 185" />
            <path d="M 174 142 L 176 188" />
            <path d="M 180 145 L 180 185" />
          </g>
          {/* right shoulder mass — mirror */}
          <path d="M 240 138
                   Q 216 142 212 174
                   Q 220 196 238 192
                   Q 248 166 240 138 Z"
            fill={MUSCLE} opacity="0.6" />
          <path d="M 232 148 Q 218 152 216 174 Q 222 190 232 188 Q 238 168 232 148 Z" fill={MUSCLE_DARK} opacity="0.4" />
          <g stroke={MUSCLE_DARK} strokeWidth="0.8" opacity="0.85" fill="none" strokeLinecap="round">
            <path d="M 232 145 L 228 185" />
            <path d="M 226 142 L 224 188" />
            <path d="M 220 145 L 220 185" />
          </g>
          {/* central abdominal slab */}
          <path d="M 188 178 Q 200 174 212 178 L 212 200 Q 200 204 188 200 Z"
            fill={MUSCLE} opacity="0.45" />
          <g stroke={MUSCLE_DARK} strokeWidth="0.6" opacity="0.7" fill="none">
            <line x1="195" y1="184" x2="205" y2="184" />
            <line x1="195" y1="192" x2="205" y2="192" />
          </g>
        </g>
      )}

      {/* legs */}
      {(isUpright ? [180, 220] : [135, 170, 235, 270]).map((x) => (
        <g key={x}>
          <line x1={x} y1={isUpright ? 215 : 195} x2={x - 2} y2={isUpright ? 240 : 230} stroke={BONE} strokeWidth="1.6" />
          <line x1={x - 2} y1={isUpright ? 240 : 230} x2={x + 3} y2={isUpright ? 260 : 250} stroke={BONE} strokeWidth="1.4" />
        </g>
      ))}

      {/* tail bones (not for gorilla) */}
      {!isUpright && (
        <path d="M 115 142 Q 80 160 50 195" stroke={BONE} strokeWidth="1.4" fill="none" />
      )}

      {/* heart */}
      <ellipse cx={isUpright ? 200 : 175} cy={isUpright ? 185 : 175} rx="10" ry="8" fill={HEART} opacity="0.92"
        style={{ animation: `heartbeat ${beat}s ease-in-out infinite`, transformOrigin: 'center', transformBox: 'fill-box' }} />

      {/* lungs */}
      <ellipse cx={isUpright ? 183 : 195} cy={isUpright ? 160 : 158} rx={isUpright ? 12 : 22} ry={isUpright ? 14 : 9} fill={LUNG} opacity="0.5" />
      <ellipse cx={isUpright ? 217 : 240} cy={isUpright ? 160 : 158} rx={isUpright ? 12 : 22} ry={isUpright ? 14 : 9} fill={LUNG} opacity="0.5" />

      {/* brain */}
      <ellipse cx={isUpright ? 200 : 295} cy={isUpright ? 115 : 142} rx={7 * bs} ry={5.5 * bs} fill={BRAIN} opacity="0.9" />

      {/* stomach */}
      <ellipse cx={isUpright ? 200 : 210} cy={isUpright ? 200 : 178} rx={isUpright ? 14 : 22} ry={isUpright ? 10 : 8} fill={STOMACH} opacity="0.45" />

      <HeartLabel x={isUpright ? 200 : 175} y={isUpright ? 268 : 210} bpm={heartRate(massKg)} />
    </g>
  );
}

// ─── Crocodile ───────────────────────────────────────────────────────────
// Long armored skull, 4-chamber heart (unique among reptiles),
// powerful jaw, sprawling stance.
export function CrocodileXray({ creature, massKg }: XrayProps) {
  const beat = beatPeriodFor(massKg, 0.6); // cold-blooded
  const bs = brainScaleFor(creature.brainTier);
  return (
    <g>
      {/* low elongated body */}
      <ellipse cx="200" cy="178" rx="135" ry="36" fill="rgba(160,180,220,0.18)" stroke="rgba(180,200,240,0.5)" strokeWidth="1" />

      {/* long spine */}
      <line x1="78" y1="175" x2="322" y2="178" stroke={BONE} strokeWidth="2.2" opacity="0.9" />

      {/* armored back plates (osteoderms) */}
      <g fill={BONE} opacity="0.85">
        {[-0.32, -0.18, -0.05, 0.08, 0.2, 0.32].map((off) => (
          <polygon key={off}
            points={`${200 + 240 * off - 5} 168 ${200 + 240 * off} 158 ${200 + 240 * off + 5} 168`} />
        ))}
      </g>

      {/* tail vertebrae trailing right */}
      <g fill="none" stroke={BONE} strokeWidth="1.4" opacity="0.85">
        <path d="M 322 178 Q 348 188 372 202" />
        {[330, 345, 360].map((x, i) => <ellipse key={i} cx={x} cy={181 + i * 3} rx="3.5" ry="2.5" />)}
      </g>

      {/* MASSETER + PTERYGOID — the jaw-closing muscles. Anchor up on
          the skull and pull the jaw shut with 16,000 N of force. */}
      <path d="M 78 158
               Q 110 154 110 178
               Q 100 188 84 184
               Q 72 174 78 158 Z"
        fill={MUSCLE} opacity="0.65" />
      <path d="M 84 162 Q 104 160 102 178 Q 92 184 86 180 Q 80 172 84 162 Z" fill={MUSCLE_DARK} opacity="0.45" />
      {/* striations — fibers angle from skull down to jaw */}
      <g stroke={MUSCLE_DARK} strokeWidth="0.8" opacity="0.9" strokeLinecap="round" fill="none">
        <path d="M 84 158 L 90 180" />
        <path d="M 92 156 L 96 182" />
        <path d="M 100 158 L 100 180" />
        <path d="M 106 162 L 102 178" />
      </g>
      {/* tendons attaching to the skull and jaw */}
      <path d="M 80 156 L 78 160" stroke={TENDON} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M 105 186 L 110 188" stroke={TENDON} strokeWidth="1.6" strokeLinecap="round" />

      {/* long jaw / skull */}
      <path d="M 78 175 L 18 178 L 18 188 L 78 188 Z" fill="none" stroke={BONE} strokeWidth="1.6" />
      {/* teeth (top + bottom interlocking) */}
      <g fill="white" stroke="#9aa6b0" strokeWidth="0.4">
        {[28, 38, 48, 58, 68].map((x) => (
          <g key={x}>
            <polygon points={`${x - 2} 178 ${x} 184 ${x + 2} 178`} />
            <polygon points={`${x - 2} 185 ${x} 179 ${x + 2} 185`} />
          </g>
        ))}
      </g>

      {/* short sprawling legs */}
      {[125, 175, 235, 285].map((x, i) => (
        <g key={x}>
          <line x1={x} y1="200" x2={x + (i % 2 === 0 ? -10 : 10)} y2="218" stroke={BONE} strokeWidth="1.6" />
          <line x1={x + (i % 2 === 0 ? -10 : 10)} y1="218" x2={x + (i % 2 === 0 ? -16 : 16)} y2="228" stroke={BONE} strokeWidth="1.3" />
        </g>
      ))}

      {/* 4-chamber heart — uniquely among reptiles, crocodiles have one */}
      <ellipse cx="160" cy="180" rx="11" ry="9" fill={HEART} opacity="0.92"
        style={{ animation: `heartbeat ${beat}s ease-in-out infinite`, transformOrigin: 'center', transformBox: 'fill-box' }} />
      <text x="160" y="183" fontSize="6" textAnchor="middle" fill="white" opacity="0.85">4-ch</text>

      {/* small lungs */}
      <ellipse cx="195" cy="170" rx="14" ry="7" fill={LUNG} opacity="0.5" />
      <ellipse cx="225" cy="170" rx="14" ry="7" fill={LUNG} opacity="0.5" />

      {/* brain (small) */}
      <ellipse cx="65" cy="180" rx={4 * bs} ry={3 * bs} fill={BRAIN} opacity="0.9" />

      <HeartLabel x={160} y={208} bpm={heartRate(massKg)} />
      <Caption text="4-chamber heart (rare in reptiles) · 200 M years old design" />
    </g>
  );
}

// ─── Chameleon ───────────────────────────────────────────────────────────
// Turret eye sockets, prehensile-tail spine, projectile-tongue muscle.
export function ChameleonXray({ creature, massKg }: XrayProps) {
  const beat = beatPeriodFor(massKg, 0.6); // cold-blooded
  const bs = brainScaleFor(creature.brainTier);
  return (
    <g>
      {/* hump-backed body */}
      <path d="M 100 200 Q 180 130 280 165 Q 300 200 280 215 Q 180 230 100 215 Z"
        fill="rgba(160,180,220,0.22)" stroke="rgba(180,200,240,0.45)" strokeWidth="1" />

      {/* arched spine with extension into prehensile tail */}
      <path d="M 100 200 Q 180 145 280 175 Q 320 195 350 230 Q 365 245 360 270 Q 355 280 345 275 Q 350 260 340 250"
        stroke={BONE} strokeWidth="2" fill="none" />

      {/* vertebrae along the spine + curled tail */}
      <g fill="none" stroke={BONE} strokeWidth="0.9" opacity="0.7">
        {Array.from({ length: 14 }).map((_, i) => {
          const t = i / 13;
          const x = 100 + t * 180;
          const y = 200 + 50 * Math.sin(t * Math.PI) * -1;
          return <line key={i} x1={x - 3} y1={y + 4} x2={x + 3} y2={y - 4} />;
        })}
      </g>

      {/* skull */}
      <ellipse cx="290" cy="170" rx="18" ry="14" fill="none" stroke={BONE} strokeWidth="1.5" />

      {/* TURRET EYE SOCKETS — chameleon's most famous feature, independently aimed */}
      <g>
        <circle cx="278" cy="160" r="7" fill="none" stroke={BONE} strokeWidth="1.4" />
        <circle cx="278" cy="160" r="3.5" fill={BRAIN} opacity="0.85" />
        <circle cx="302" cy="162" r="7" fill="none" stroke={BONE} strokeWidth="1.4" />
        <circle cx="302" cy="162" r="3.5" fill={BRAIN} opacity="0.85" />
        {/* small sight cones showing independent aim */}
        <path d="M 278 160 L 268 145 L 270 140" stroke="#ffe48a" strokeWidth="0.7" fill="none" opacity="0.6" strokeDasharray="2 2" />
        <path d="M 302 162 L 322 168 L 326 178" stroke="#ffe48a" strokeWidth="0.7" fill="none" opacity="0.6" strokeDasharray="2 2" />
      </g>

      {/* PROJECTILE TONGUE — coiled muscle that fires 2× body length */}
      <g>
        <path d="M 308 175 q 12 8 6 16 q -8 6 0 14" stroke={MUSCLE} strokeWidth="2.6" fill="none" strokeLinecap="round" opacity="0.85" />
        <text x="320" y="170" fontSize="6" fill="white" opacity="0.85">tongue</text>
      </g>

      {/* gripping feet bones (zygodactyl — toes split 2+3) */}
      {[150, 230].map((x) => (
        <g key={x}>
          <line x1={x} y1="220" x2={x} y2="234" stroke={BONE} strokeWidth="1.5" />
          {/* opposing toes */}
          <line x1={x} y1="234" x2={x - 6} y2="244" stroke={BONE} strokeWidth="1.1" />
          <line x1={x} y1="234" x2={x - 3} y2="246" stroke={BONE} strokeWidth="1.1" />
          <line x1={x} y1="234" x2={x + 3} y2="246" stroke={BONE} strokeWidth="1.1" />
          <line x1={x} y1="234" x2={x + 6} y2="244" stroke={BONE} strokeWidth="1.1" />
        </g>
      ))}

      {/* small heart */}
      <ellipse cx="195" cy="195" rx="6" ry="5" fill={HEART} opacity="0.9"
        style={{ animation: `heartbeat ${beat}s ease-in-out infinite`, transformOrigin: 'center', transformBox: 'fill-box' }} />

      {/* brain */}
      <ellipse cx="290" cy="168" rx={5 * bs} ry={4 * bs} fill={BRAIN} opacity="0.85" />

      <HeartLabel x={195} y={218} bpm={heartRate(massKg)} />
      <Caption text="Turret eyes (aim separately) · 2× body-length tongue · gripping toes" />
    </g>
  );
}

// ─── Raptor ──────────────────────────────────────────────────────────────
// Bipedal hunter — sickle claw on the second toe, feathered arms,
// long stiff tail for balance.
export function RaptorXray({ creature, massKg }: XrayProps) {
  const beat = beatPeriodFor(massKg, 0.7);
  const bs = brainScaleFor(creature.brainTier);
  return (
    <g>
      {/* body outline (bipedal) */}
      <ellipse cx="200" cy="160" rx="38" ry="46" fill="rgba(160,180,220,0.22)" stroke="rgba(180,200,240,0.45)" strokeWidth="1" />

      {/* spine + long stiff balancing tail */}
      <path d="M 200 120 Q 200 160 215 200 Q 230 220 280 232 Q 320 240 360 244"
        stroke={BONE} strokeWidth="2.2" fill="none" />
      {/* tail vertebrae */}
      <g fill="none" stroke={BONE} strokeWidth="1" opacity="0.7">
        {Array.from({ length: 12 }).map((_, i) => {
          const t = (i + 1) / 12;
          const x = 225 + t * 130;
          const y = 215 + t * 28;
          return <line key={i} x1={x - 3} y1={y - 1} x2={x + 3} y2={y + 1} />;
        })}
      </g>

      {/* skull */}
      <ellipse cx="200" cy="120" rx="13" ry="10" fill="none" stroke={BONE} strokeWidth="1.5" />
      {/* jaw with teeth */}
      <path d="M 195 124 L 220 130 L 195 132 Z" fill="none" stroke={BONE} strokeWidth="1.2" />
      <g fill="white" stroke="#888" strokeWidth="0.3">
        {[200, 207, 214].map((x) => <polygon key={x} points={`${x - 1.5} 130 ${x} 134 ${x + 1.5} 130`} />)}
      </g>

      {/* ribs */}
      <g stroke={BONE} strokeWidth="1.2" fill="none" opacity="0.8">
        {[-0.3, -0.1, 0.1, 0.3].map((off) => (
          <path key={off} d={`M 200 ${145 + off * 35} Q ${200 + 20} ${152 + off * 35} ${200 + 18} ${170 + off * 35}`} />
        ))}
      </g>

      {/* feathered arms (small bones) */}
      <g stroke={BONE} strokeWidth="1.4" fill="none">
        <line x1="180" y1="155" x2="155" y2="185" />
        <line x1="155" y1="185" x2="145" y2="210" />
        <line x1="220" y1="155" x2="225" y2="185" />
        <line x1="225" y1="185" x2="220" y2="205" />
      </g>
      {/* feather hints */}
      <g stroke="#ddd" strokeWidth="0.7" fill="none" opacity="0.5">
        <path d="M 155 185 L 145 190" />
        <path d="M 150 198 L 138 200" />
        <path d="M 225 185 L 235 190" />
      </g>

      {/* DRUMSTICK — gastrocnemius + thigh quadriceps. Massive in
          theropods. Shape is a swelling teardrop with striations along
          the leg, ending in an Achilles tendon at the heel. */}
      {[185, 215].map((x) => (
        <g key={`m${x}`}>
          {/* upper thigh teardrop */}
          <path d={`M ${x - 12} 204
                    Q ${x + 8} 200 ${x + 6} 236
                    Q ${x - 3} 240 ${x - 12} 232
                    Q ${x - 16} 218 ${x - 12} 204 Z`}
            fill={MUSCLE} opacity="0.6" />
          <path d={`M ${x - 8} 210 Q ${x + 4} 208 ${x + 2} 234 Q ${x - 4} 236 ${x - 8} 228 Z`}
            fill={MUSCLE_DARK} opacity="0.45" />
          {/* fiber striations */}
          <g stroke={MUSCLE_DARK} strokeWidth="0.7" opacity="0.85" strokeLinecap="round" fill="none">
            <path d={`M ${x - 10} 210 L ${x + 2} 234`} />
            <path d={`M ${x - 6} 208 L ${x + 4} 234`} />
            <path d={`M ${x - 2} 208 L ${x + 4} 232`} />
          </g>
          {/* lower drumstick / calf */}
          <path d={`M ${x - 6} 244 Q ${x + 8} 246 ${x + 4} 264 Q ${x - 3} 264 ${x - 6} 256 Z`}
            fill={MUSCLE} opacity="0.55" />
          <g stroke={MUSCLE_DARK} strokeWidth="0.6" opacity="0.75" strokeLinecap="round" fill="none">
            <path d={`M ${x - 4} 246 L ${x + 2} 262`} />
            <path d={`M ${x} 246 L ${x + 4} 262`} />
          </g>
          {/* Achilles tendon to ankle */}
          <path d={`M ${x + 4} 263 L ${x + 6} 268`} stroke={TENDON} strokeWidth="1.6" strokeLinecap="round" />
        </g>
      ))}

      {/* powerful legs */}
      {[185, 215].map((x) => (
        <g key={x}>
          <line x1={x} y1="205" x2={x - 5} y2="240" stroke={BONE} strokeWidth="2" />
          <line x1={x - 5} y1="240" x2={x + 3} y2="270" stroke={BONE} strokeWidth="1.8" />
          {/* normal toes */}
          <line x1={x + 3} y1="270" x2={x + 8} y2="278" stroke={BONE} strokeWidth="1.2" />
          <line x1={x + 3} y1="270" x2={x - 4} y2="278" stroke={BONE} strokeWidth="1.2" />
          {/* SICKLE CLAW — the famous one, raised off the ground */}
          <path d={`M ${x + 3} 270 q -2 -10 -10 -12 q 4 6 6 14`}
            stroke="#fff" strokeWidth="1.8" fill="#ffeb8a" opacity="0.9" />
        </g>
      ))}
      <text x="200" y="290" textAnchor="middle" fontSize="7" fill="#ffeb8a" opacity="0.9" fontWeight="700">sickle claws</text>

      {/* heart */}
      <ellipse cx="200" cy="165" rx="8" ry="6" fill={HEART} opacity="0.92"
        style={{ animation: `heartbeat ${beat}s ease-in-out infinite`, transformOrigin: 'center', transformBox: 'fill-box' }} />

      {/* brain — big for a dinosaur */}
      <ellipse cx="200" cy="120" rx={6 * bs} ry={4.5 * bs} fill={BRAIN} opacity="0.9" />

      <HeartLabel x={200} y={45} bpm={heartRate(massKg)} />
      <Caption text="Pack hunter · sickle claw on toe 2 · feathered (despite Jurassic Park)" />
    </g>
  );
}

// ─── Triceratops ─────────────────────────────────────────────────────────
// Three horns, huge bony frill, parrot-like beak, massive ribcage.
export function TriceratopsXray({ creature, massKg }: XrayProps) {
  const beat = beatPeriodFor(massKg, 0.8);
  const bs = brainScaleFor(creature.brainTier);
  return (
    <g>
      {/* body */}
      <ellipse cx="190" cy="170" rx="110" ry="48" fill="rgba(160,180,220,0.22)" stroke="rgba(180,200,240,0.45)" strokeWidth="1" />

      {/* spine */}
      <line x1="100" y1="145" x2="290" y2="148" stroke={BONE} strokeWidth="2.4" />

      {/* huge bony frill (drawn behind head) */}
      <path d="M 300 100 Q 360 130 360 195 Q 340 215 300 215 Z"
        fill="none" stroke={BONE} strokeWidth="2" opacity="0.9" />
      {/* frill ridges */}
      <g stroke={BONE} strokeWidth="1" fill="none" opacity="0.6">
        {[0.2, 0.4, 0.6, 0.8].map((t) => (
          <path key={t} d={`M 300 ${100 + (215 - 100) * t} Q ${330} ${150 + 30 * t} ${360} ${195 - 95 * (1 - t)}`} />
        ))}
      </g>

      {/* skull — large with frill base */}
      <ellipse cx="310" cy="160" rx="32" ry="22" fill="none" stroke={BONE} strokeWidth="1.8" />

      {/* THREE HORNS — two brow + one nose */}
      <g fill="none" stroke="#fff5d8" strokeWidth="3" strokeLinecap="round">
        <path d="M 305 145 L 320 105" />
        <path d="M 318 148 L 338 110" />
        <path d="M 322 168 L 348 172" />
      </g>

      {/* parrot beak */}
      <path d="M 332 178 Q 348 185 332 192 Z" fill={BONE} stroke="#888" strokeWidth="0.6" />

      {/* NECK + JAW MUSCLES — held up a 2 m frilled skull. The
          temporalis (chewing) was huge for grinding tough plants. */}
      {/* trapezius / neck mass */}
      <path d="M 252 156 Q 286 150 304 168 Q 290 184 264 180 Q 248 170 252 156 Z"
        fill={MUSCLE} opacity="0.6" />
      <path d="M 260 162 Q 282 158 296 170 Q 286 178 268 176 Q 256 170 260 162 Z" fill={MUSCLE_DARK} opacity="0.45" />
      <g stroke={MUSCLE_DARK} strokeWidth="0.8" opacity="0.85" strokeLinecap="round" fill="none">
        <path d="M 256 160 L 292 172" />
        <path d="M 256 168 L 296 174" />
        <path d="M 258 176 L 294 178" />
      </g>
      {/* temporalis at jaw hinge */}
      <path d="M 296 162 Q 318 162 318 178 Q 310 188 298 184 Q 290 174 296 162 Z"
        fill={MUSCLE} opacity="0.6" />
      <g stroke={MUSCLE_DARK} strokeWidth="0.7" opacity="0.85" fill="none">
        <path d="M 300 164 L 312 180" />
        <path d="M 304 164 L 314 182" />
        <path d="M 308 164 L 314 180" />
      </g>
      <path d="M 314 184 L 318 188" stroke={TENDON} strokeWidth="1.5" strokeLinecap="round" />

      {/* massive ribcage */}
      <g stroke={BONE} strokeWidth="1.3" fill="none" opacity="0.85">
        {[-0.4, -0.25, -0.1, 0.05, 0.2].map((off) => {
          const x = 190 + 220 * off;
          return <path key={off} d={`M ${x} 148 Q ${x + 6} 195 ${x - 4} 218`} />;
        })}
      </g>

      {/* columnar leg bones */}
      {[120, 165, 220, 265].map((x) => (
        <rect key={x} x={x - 5} y={215} width="10" height="42" rx="3" fill="none" stroke={BONE} strokeWidth="1.6" opacity="0.9" />
      ))}

      {/* small tail */}
      <path d="M 100 145 Q 70 158 50 175" stroke={BONE} strokeWidth="1.5" fill="none" />

      {/* small brain inside enormous skull */}
      <ellipse cx="304" cy="160" rx={7 * bs} ry={5 * bs} fill={BRAIN} opacity="0.9" />

      {/* heart */}
      <ellipse cx="170" cy="175" rx="13" ry="10" fill={HEART} opacity="0.92"
        style={{ animation: `heartbeat ${beat}s ease-in-out infinite`, transformOrigin: 'center', transformBox: 'fill-box' }} />

      <HeartLabel x={170} y={205} bpm={heartRate(massKg)} />
      <Caption text="Three horns · 2 m bony frill · parrot beak · 6-ton browser" />
    </g>
  );
}

// ─── Stegosaurus ─────────────────────────────────────────────────────────
// Plates along the back, spiked tail (thagomizer), walnut-sized brain.
export function StegosaurusXray({ creature, massKg }: XrayProps) {
  const beat = beatPeriodFor(massKg, 0.7);
  const bs = brainScaleFor(creature.brainTier);
  return (
    <g>
      {/* body — hump-backed */}
      <path d="M 90 200 Q 200 130 320 200 Q 320 218 240 218 Q 200 218 90 218 Z"
        fill="rgba(160,180,220,0.22)" stroke="rgba(180,200,240,0.45)" strokeWidth="1" />

      {/* spine arching over hump */}
      <path d="M 100 195 Q 200 140 320 195" stroke={BONE} strokeWidth="2.2" fill="none" />

      {/* PLATES along the back — staggered double row */}
      <g fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round">
        {[0.15, 0.3, 0.45, 0.6, 0.75].map((t, i) => {
          const x = 100 + t * 220;
          const baseY = 195 - 55 * Math.sin(t * Math.PI);
          const height = 18 + (i === 2 ? 6 : 0); // middle plate biggest
          return (
            <g key={t}>
              <path d={`M ${x - 8} ${baseY} L ${x} ${baseY - height} L ${x + 8} ${baseY} Z`} fill={BONE} opacity="0.7" />
            </g>
          );
        })}
      </g>

      {/* CAUDOFEMORALIS — tail-base drive muscle that swung the
          thagomizer like a club. Fibers run along the tail. */}
      <path d="M 296 198
               Q 326 200 350 214
               Q 354 220 350 224
               Q 326 220 296 214 Z"
        fill={MUSCLE} opacity="0.6" />
      <path d="M 306 204 Q 326 206 344 218" stroke={MUSCLE_DARK} strokeWidth="1.6" fill="none" opacity="0.55" />
      <g stroke={MUSCLE_DARK} strokeWidth="0.7" opacity="0.85" fill="none" strokeLinecap="round">
        <path d="M 302 200 L 320 218" />
        <path d="M 314 200 L 332 220" />
        <path d="M 326 204 L 344 222" />
      </g>
      {/* tendon out toward the thagomizer */}
      <path d="M 350 222 L 360 228" stroke={TENDON} strokeWidth="1.5" strokeLinecap="round" />

      {/* tail with THAGOMIZER — 4 spikes */}
      <path d="M 320 200 Q 355 215 380 230" stroke={BONE} strokeWidth="1.8" fill="none" />
      <g fill={BONE} stroke="#888" strokeWidth="0.6">
        <polygon points="375 232 388 220 386 234" />
        <polygon points="380 238 394 230 392 244" />
        <polygon points="370 238 380 252 376 242" />
        <polygon points="375 245 386 256 378 250" />
      </g>
      <text x="378" y="270" textAnchor="middle" fontSize="6" fill="white" opacity="0.85" fontWeight="600">thagomizer</text>

      {/* skull — tiny */}
      <ellipse cx="92" cy="200" rx="14" ry="9" fill="none" stroke={BONE} strokeWidth="1.5" />
      {/* beak */}
      <path d="M 78 202 L 70 205 L 78 208 Z" fill="none" stroke={BONE} strokeWidth="1" />

      {/* ribs */}
      <g stroke={BONE} strokeWidth="1.2" fill="none" opacity="0.8">
        {[0.1, 0.25, 0.4, 0.55, 0.7].map((t) => {
          const x = 100 + t * 220;
          return <path key={t} d={`M ${x} ${165 - 30 * Math.sin(t * Math.PI)} Q ${x + 4} 205 ${x - 2} 220`} />;
        })}
      </g>

      {/* legs — back legs longer than front (hump posture) */}
      <g stroke={BONE} strokeWidth="1.8" fill="none">
        <line x1="135" y1="218" x2="135" y2="252" />
        <line x1="160" y1="218" x2="160" y2="252" />
        <line x1="250" y1="218" x2="252" y2="262" />
        <line x1="280" y1="218" x2="282" y2="262" />
      </g>

      {/* heart */}
      <ellipse cx="175" cy="195" rx="13" ry="10" fill={HEART} opacity="0.92"
        style={{ animation: `heartbeat ${beat}s ease-in-out infinite`, transformOrigin: 'center', transformBox: 'fill-box' }} />

      {/* WALNUT BRAIN — emphasized small */}
      <ellipse cx="92" cy="198" rx={2.5 * bs} ry={2 * bs} fill={BRAIN} opacity="0.95" />
      <text x="92" y="178" fontSize="6" textAnchor="middle" fill="white" opacity="0.85">🌰 walnut-brain</text>

      <HeartLabel x={175} y={228} bpm={heartRate(massKg)} />
      <Caption text="17 back plates · spiked thagomizer tail · brain ≈ a walnut" />
    </g>
  );
}

// ─── Tiger ───────────────────────────────────────────────────────────────
// Big-cat anatomy: flexible spine, retractile claws, huge temporalis jaw
// muscles, binocular predator eyes.
export function TigerXray({ creature, massKg }: XrayProps) {
  const beat = beatPeriodFor(massKg);
  const bs = brainScaleFor(creature.brainTier);
  return (
    <g>
      <ellipse cx="195" cy="175" rx="118" ry="44" fill="rgba(160,180,220,0.2)" stroke="rgba(180,200,240,0.48)" strokeWidth="1" />
      <path d="M 88 170 Q 148 142 220 150 Q 270 155 308 170" stroke={BONE} strokeWidth="2.2" fill="none" />
      <path d="M 90 174 Q 55 160 28 142" stroke={BONE} strokeWidth="1.5" fill="none" />

      <g stroke={BONE} strokeWidth="1.1" fill="none" opacity="0.82">
        {[110, 132, 154, 176, 198, 220, 242, 264].map((x) => (
          <path key={x} d={`M ${x} 154 Q ${x + 8} 184 ${x - 2} 208`} />
        ))}
      </g>

      {[125, 165, 238, 280].map((x, i) => (
        <g key={x}>
          <line x1={x} y1="207" x2={x + (i % 2 === 0 ? -6 : 5)} y2="246" stroke={BONE} strokeWidth="1.8" />
          <line x1={x + (i % 2 === 0 ? -6 : 5)} y1="246" x2={x + (i % 2 === 0 ? -16 : 16)} y2="263" stroke={BONE} strokeWidth="1.4" />
          <path d={`M ${x + (i % 2 === 0 ? -20 : 20)} 263 q 10 4 22 0`} stroke="#fff5d8" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </g>
      ))}

      <circle cx="315" cy="158" r="32" fill="rgba(160,180,220,0.18)" stroke={BONE} strokeWidth="1.6" />
      <path d="M 296 170 Q 314 185 338 174" stroke={BONE} strokeWidth="1.3" fill="none" />
      <g fill="#fff5d8" stroke="#888" strokeWidth="0.4">
        <polygon points="304 174 307 187 310 174" />
        <polygon points="324 174 327 187 330 174" />
      </g>
      <ellipse cx="306" cy="151" rx={7 * bs} ry={5 * bs} fill={BRAIN} opacity="0.9" />
      <circle cx="302" cy="154" r="3" fill="#ffe48a" opacity="0.85" />
      <circle cx="326" cy="154" r="3" fill="#ffe48a" opacity="0.85" />

      <ellipse cx="178" cy="175" rx="14" ry="10" fill={HEART} opacity="0.92"
        style={{ animation: `heartbeat ${beat}s ease-in-out infinite`, transformOrigin: 'center', transformBox: 'fill-box' }} />
      <ellipse cx="210" cy="166" rx="22" ry="12" fill={LUNG} opacity="0.48" />
      <ellipse cx="242" cy="166" rx="22" ry="12" fill={LUNG} opacity="0.48" />
      <ellipse cx="248" cy="190" rx="18" ry="10" fill={STOMACH} opacity="0.72" />

      <HeartLabel x={178} y={206} bpm={heartRate(massKg)} />
      <Caption text="Flexible ambush spine · retractile claws · binocular hunter eyes" />
    </g>
  );
}

// ─── T-Rex ───────────────────────────────────────────────────────────────
// Massive skull and bite, air-sac lungs, huge balancing tail, and famously
// tiny forelimbs.
export function TRexXray({ creature, massKg }: XrayProps) {
  const beat = beatPeriodFor(massKg, 0.7);
  const bs = brainScaleFor(creature.brainTier);
  return (
    <g>
      <ellipse cx="198" cy="168" rx="66" ry="45" fill="rgba(160,180,220,0.2)" stroke="rgba(180,200,240,0.48)" strokeWidth="1" />
      <path d="M 132 140 Q 188 128 242 158 Q 292 190 366 208" stroke={BONE} strokeWidth="2.4" fill="none" />
      <g stroke={BONE} strokeWidth="1" fill="none" opacity="0.75">
        {[150, 166, 182, 198, 214, 230].map((x) => (
          <path key={x} d={`M ${x} 148 Q ${x + 14} 178 ${x + 2} 204`} />
        ))}
      </g>

      <ellipse cx="118" cy="116" rx="58" ry="27" fill="rgba(160,180,220,0.18)" stroke={BONE} strokeWidth="1.7" />
      <path d="M 66 127 Q 118 156 174 132" stroke={BONE} strokeWidth="1.5" fill="none" />
      <g fill="#fff5d8" stroke="#888" strokeWidth="0.35">
        {[74, 86, 98, 110, 122, 134, 146, 158].map((x) => (
          <polygon key={x} points={`${x - 2} 132 ${x} 145 ${x + 2} 132`} />
        ))}
      </g>
      <ellipse cx="132" cy="110" rx={8 * bs} ry={5 * bs} fill={BRAIN} opacity="0.9" />

      <g stroke={BONE} fill="none">
        <path d="M 178 205 Q 170 232 158 270" strokeWidth="2.4" />
        <path d="M 225 205 Q 245 232 262 270" strokeWidth="2.4" />
        <path d="M 158 270 q -18 2 -28 8" strokeWidth="1.5" />
        <path d="M 262 270 q 20 2 32 8" strokeWidth="1.5" />
        <path d="M 168 164 q -18 8 -22 24" strokeWidth="1.3" />
        <path d="M 218 164 q 18 8 22 24" strokeWidth="1.3" />
      </g>
      <text x="210" y="190" fontSize="7" textAnchor="middle" fill="white" opacity="0.85">tiny arms</text>

      <ellipse cx="182" cy="166" rx="15" ry="11" fill={HEART} opacity="0.92"
        style={{ animation: `heartbeat ${beat}s ease-in-out infinite`, transformOrigin: 'center', transformBox: 'fill-box' }} />
      <ellipse cx="210" cy="157" rx="20" ry="12" fill={LUNG} opacity="0.42" />
      <ellipse cx="235" cy="160" rx="18" ry="10" fill={LUNG} opacity="0.35" />
      <g stroke={LUNG} strokeWidth="1" fill="none" opacity="0.45">
        <circle cx="252" cy="146" r="7" />
        <circle cx="260" cy="164" r="6" />
        <circle cx="238" cy="142" r="5" />
      </g>

      <HeartLabel x={182} y={198} bpm={heartRate(massKg)} />
      <Caption text="Crushing skull · air-sac lungs · giant tail counterweight" />
    </g>
  );
}

// ─── Jellyfish ───────────────────────────────────────────────────────────
// No bones, no brain, no heart: a nerve net, gut cavity, and stinging cells.
export function JellyfishXray() {
  return (
    <g>
      <path d="M 108 170 Q 200 68 292 170 Z" fill="rgba(160,210,240,0.18)" stroke="rgba(190,230,255,0.55)" strokeWidth="1.5" />
      <ellipse cx="200" cy="170" rx="92" ry="7" fill="rgba(190,230,255,0.25)" stroke="rgba(190,230,255,0.45)" />

      <g stroke="#ffe48a" strokeWidth="1.2" fill="none" opacity="0.82" strokeDasharray="2 4">
        <path d="M 135 168 Q 155 125 185 92" />
        <path d="M 180 168 Q 188 118 196 82" />
        <path d="M 220 168 Q 212 118 204 82" />
        <path d="M 265 168 Q 245 125 215 92" />
        <ellipse cx="200" cy="145" rx="42" ry="20" />
      </g>

      <g stroke={MUSCLE} strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.78">
        {[140, 160, 180, 200, 220, 240, 260].map((x) => (
          <path key={x} d={`M ${x} 176 q -12 32 0 64 q 12 30 0 56`} />
        ))}
      </g>
      <g fill={STOMACH} opacity="0.68">
        <ellipse cx="182" cy="138" rx="10" ry="15" />
        <ellipse cx="218" cy="138" rx="10" ry="15" />
        <ellipse cx="200" cy="122" rx="10" ry="15" />
      </g>

      <text x="200" y="50" textAnchor="middle" fontSize="11" fill="white" opacity="0.9" fontWeight="700">no brain · no heart · no bones</text>
      <Caption text="Diffuse nerve net · stinging tentacles · 95% water" />
    </g>
  );
}

// ─── Registry ────────────────────────────────────────────────────────────
export const BESPOKE_XRAYS: Record<string, ComponentType<XrayProps>> = {
  crocodile: CrocodileXray,
  chameleon: ChameleonXray,
  raptor: RaptorXray,
  triceratops: TriceratopsXray,
  stegosaurus: StegosaurusXray,
  tiger: TigerXray,
  trex: TRexXray,
  jellyfish: JellyfishXray,
  octopus: OctopusXray,
  whale: WhaleXray,
  dolphin: DolphinXray,
  shark: SharkXray,
  snake: SnakeXray,
  tortoise: TortoiseXray,
  elephant: ElephantXray,
  bat: BatXray,
  mouse: MouseXray,
  hummingbird: HummingbirdXray,
  eagle: EagleXray,
  owl: EagleXray, // owls share the raptor flying skeleton, with bigger eye sockets
  pterodactyl: EagleXray,
  penguin: PenguinXray,
  ostrich: PenguinXray, // flightless bird — dense bones, heavy legs
  lion: QuadrupedXray,
  cheetah: QuadrupedXray,
  snowleopard: QuadrupedXray,
  wolf: QuadrupedXray,
  polarbear: QuadrupedXray,
  gorilla: QuadrupedXray,
  camel: QuadrupedXray,
};

export function getBespokeXray(name?: string): ComponentType<XrayProps> | null {
  if (!name || name === 'default') return null;
  return BESPOKE_XRAYS[name] ?? null;
}
