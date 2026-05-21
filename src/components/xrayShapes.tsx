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

      {/* tentacles (no bones — just muscle outlines) */}
      {tentacles.map((t, i) => (
        <path key={i} d={`M ${t.sx} ${t.sy} C ${t.c1x} ${t.c1y}, ${t.c2x} ${t.c2y}, ${t.ex} ${t.ey}`}
          stroke="rgba(180,200,240,0.45)" strokeWidth="14" fill="none" strokeLinecap="round" />
      ))}
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

      {/* SO many ribs — draw 30 along the curve */}
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
  return (
    <g>
      {/* tiny body */}
      <ellipse cx="200" cy="170" rx="22" ry="32" fill="rgba(160,180,220,0.22)" stroke="rgba(180,200,240,0.5)" strokeWidth="1" />

      {/* wing membranes (faint) */}
      <path d="M 200 155 L 90 110 L 100 175 L 200 175 Z" fill="rgba(140,150,200,0.18)" stroke="rgba(180,200,240,0.4)" strokeWidth="0.8" />
      <path d="M 200 155 L 310 110 L 300 175 L 200 175 Z" fill="rgba(140,150,200,0.18)" stroke="rgba(180,200,240,0.4)" strokeWidth="0.8" />

      {/* arm bone */}
      <line x1="200" y1="160" x2="155" y2="135" stroke={BONE} strokeWidth="2" />
      <line x1="200" y1="160" x2="245" y2="135" stroke={BONE} strokeWidth="2" />

      {/* FINGERS — elongated digits supporting the wing membrane */}
      <g stroke={BONE} strokeWidth="1.4" fill="none" strokeLinecap="round">
        {/* left wing fingers */}
        <line x1="155" y1="135" x2="90" y2="110" />
        <line x1="155" y1="135" x2="98" y2="135" />
        <line x1="155" y1="135" x2="105" y2="160" />
        <line x1="155" y1="135" x2="115" y2="175" />
        {/* right wing fingers */}
        <line x1="245" y1="135" x2="310" y2="110" />
        <line x1="245" y1="135" x2="302" y2="135" />
        <line x1="245" y1="135" x2="295" y2="160" />
        <line x1="245" y1="135" x2="285" y2="175" />
      </g>

      {/* knuckle joints */}
      <g fill={BONE} opacity="0.9">
        <circle cx="155" cy="135" r="2" />
        <circle cx="245" cy="135" r="2" />
      </g>

      {/* spine */}
      <line x1="200" y1="140" x2="200" y2="200" stroke={BONE} strokeWidth="1.8" />

      {/* tiny skull */}
      <ellipse cx="200" cy="140" rx="9" ry="7" fill="none" stroke={BONE} strokeWidth="1.4" />

      {/* large brain (sonar processing) */}
      <ellipse cx="200" cy="138" rx={6 * bs} ry={5 * bs} fill={BRAIN} opacity="0.85" />

      {/* ears (huge, for echolocation) */}
      <path d="M 194 132 Q 188 118 190 130" stroke={BONE} strokeWidth="1.2" fill="none" />
      <path d="M 206 132 Q 212 118 210 130" stroke={BONE} strokeWidth="1.2" fill="none" />

      {/* tiny fast heart */}
      <ellipse cx="200" cy="170" rx="5" ry="4" fill={HEART} opacity="0.95"
        style={{ animation: `heartbeat ${beat}s ease-in-out infinite`, transformOrigin: 'center', transformBox: 'fill-box' }} />

      {/* echolocation pings from mouth */}
      <g stroke="#ffe48a" strokeWidth="0.9" fill="none" opacity="0.55" strokeDasharray="2 3">
        <path d="M 200 152 Q 200 160 195 165" />
        <path d="M 200 152 Q 200 165 188 172" />
      </g>

      <HeartLabel x={200} y={208} bpm={heartRate(massKg)} />
      <Caption text="Wings = elongated finger bones · echolocation brain" />
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

// ─── Registry ────────────────────────────────────────────────────────────
export const BESPOKE_XRAYS: Record<string, ComponentType<XrayProps>> = {
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
  // crocodile, chameleon, raptor, triceratops, stegosaurus fall back to the
  // generic x-ray for now — easy to add bespoke versions later.
};

export function getBespokeXray(name?: string): ComponentType<XrayProps> | null {
  if (!name || name === 'default') return null;
  return BESPOKE_XRAYS[name] ?? null;
}
