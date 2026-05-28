import type { Creature, AnatomyLayer } from '../types';
import { CreatureBody } from './CreatureSVG';
import { getBespokeShape } from './dexShapes';
import { hybridCatalog } from '../data/hybrids';
import { sizeToMass } from '../physics';
import { ArenaFitView } from './ArenaFitView';
import { LabView } from './LabView';
import { GeneMapView } from './GeneMapView';

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
  const effLayer: AnatomyLayer = layer ?? (xray ? 'lab' : 'skin');
  const isXray = effLayer !== 'skin';
  const footY = FOOT_Y[creature.bodyPlan];
  const skinScale = stageBodyScale(creature);

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
      {effLayer === 'skin' && (
        <>
          {creature.bodyPlan === 'mammal' && <MeadowHabitat />}
          {creature.bodyPlan === 'reptile' && <RockyHabitat />}
          {creature.bodyPlan === 'bird' && <SkyHabitat />}
          {creature.bodyPlan === 'fish' && <UnderwaterHabitat />}
        </>
      )}

      {creature.hybrids.length > 0 && effLayer === 'skin' && (
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

      {effLayer === 'lab' ? (
        <LabView creature={creature} W={W} H={H} />
      ) : effLayer === 'fit' ? (
        <ArenaFitView creature={creature} W={W} H={H} />
      ) : effLayer === 'genes' ? (
        <GeneMapView creature={creature} W={W} H={H} />
      ) : (
        <CreatureBody creature={creature} cx={W / 2} footY={footY} scale={skinScale} animate="breathe" />
      )}
    </svg>
  );
}

function stageBodyScale(creature: Creature): number {
  const m = sizeToMass(creature.sizeUnit);
  const logM = Math.log10(Math.max(0.01, m));
  const sizeT = Math.max(0, Math.min(1, (logM + 2) / 7));
  if (creature.bodyPlan === 'fish') return 1.18 + (1 - sizeT) * 0.28;
  return 1.08 + (1 - sizeT) * 0.38;
}


function MeadowHabitat() {
  const groundY = 256;
  return (
    <>
      <defs>
        <linearGradient id="meadow-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7cc1e8" />
          <stop offset="0.45" stopColor="#bee2f0" />
          <stop offset="0.8" stopColor="#dceec6" />
          <stop offset="1" stopColor="#f8d68a" />
        </linearGradient>
        <linearGradient id="meadow-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a8c46a" />
          <stop offset="1" stopColor="#6a8a3c" />
        </linearGradient>
        <linearGradient id="meadow-sunray" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff3a8" stopOpacity="0.45" />
          <stop offset="1" stopColor="#fff3a8" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width={W} height={groundY} fill="url(#meadow-sky)" />

      {/* DISTANT HILLS — soft lavender, deepest layer */}
      <path d={`M 0 ${groundY - 18} Q 80 ${groundY - 56} 160 ${groundY - 30} Q 240 ${groundY - 60} 320 ${groundY - 24} Q 380 ${groundY - 44} ${W} ${groundY - 22} L ${W} ${groundY} L 0 ${groundY} Z`}
        fill="#b8b0d8" opacity="0.55" />

      {/* MID HILLS — pale teal */}
      <path d={`M 0 ${groundY - 8} Q 60 ${groundY - 36} 140 ${groundY - 16} Q 220 ${groundY - 38} 300 ${groundY - 14} Q 360 ${groundY - 28} ${W} ${groundY - 12} L ${W} ${groundY} L 0 ${groundY} Z`}
        fill="#94c8a8" opacity="0.75" />

      <rect x="0" y={groundY} width={W} height={H - groundY} fill="url(#meadow-ground)" />

      {/* SUN with halo + animated rays */}
      <circle cx="340" cy="50" r="32" fill="#fff3a8" opacity="0.35" />
      <g className="sun-rays" style={{ transformOrigin: '340px 50px' }}>
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <line key={i} x1={340 + Math.cos(a) * 24} y1={50 + Math.sin(a) * 24} x2={340 + Math.cos(a) * 34} y2={50 + Math.sin(a) * 34} stroke="#ffd66a" strokeWidth="1.5" opacity="0.7" strokeLinecap="round" />;
        })}
      </g>
      <circle cx="340" cy="50" r="22" fill="#ffe9a0" opacity="0.6" />
      <circle cx="340" cy="50" r="16" fill="#ffd66a" />
      <ellipse cx="335" cy="46" rx="6" ry="4" fill="#fff0a0" opacity="0.7" />

      {/* SUNBEAMS — broad faint cones from the sun */}
      <g className="ray">
        <polygon points="340,68 280,300 400,300" fill="url(#meadow-sunray)" />
        <polygon points="340,68 220,300 360,300" fill="url(#meadow-sunray)" />
      </g>

      {/* CLOUDS — 3 layers at different depths */}
      <g transform="translate(70 40)">
        <g className="cloud" style={{ animationDuration: '60s' }}>
          <ellipse cx="0" cy="0" rx="26" ry="8" fill="white" opacity="0.95" />
          <ellipse cx="-14" cy="-4" rx="16" ry="6" fill="white" opacity="0.95" />
          <ellipse cx="12" cy="-3" rx="16" ry="6" fill="white" opacity="0.95" />
          <ellipse cx="0" cy="3" rx="22" ry="4" fill="#e8eef4" opacity="0.4" />
        </g>
      </g>
      <g transform="translate(200 75)">
        <g className="cloud" style={{ animationDuration: '80s', animationDelay: '-30s' }}>
          <ellipse cx="0" cy="0" rx="20" ry="6" fill="white" opacity="0.9" />
          <ellipse cx="-10" cy="-3" rx="12" ry="5" fill="white" opacity="0.85" />
        </g>
      </g>
      <g transform="translate(120 110)">
        <g className="cloud" style={{ animationDuration: '95s', animationDelay: '-60s' }}>
          <ellipse cx="0" cy="0" rx="14" ry="4" fill="white" opacity="0.7" />
        </g>
      </g>

      {/* DISTANT BIRD-V flock — tiny */}
      <g fill="none" stroke="#3a2a18" strokeWidth="0.9" opacity="0.7" strokeLinecap="round" transform="translate(150 70)">
        <path d="M 0 0 q 3 -3 6 0 q 3 -3 6 0" />
        <path d="M 8 4 q 3 -3 6 0 q 3 -3 6 0" />
        <path d="M -8 4 q 3 -3 6 0 q 3 -3 6 0" />
      </g>

      {/* TREES — varied sizes + colors */}
      {[
        { x: 20, scale: 0.9 },
        { x: 65, scale: 1.1 },
        { x: 110, scale: 0.7 },
        { x: 290, scale: 0.85 },
        { x: 330, scale: 1.05 },
        { x: 375, scale: 0.95 },
      ].map((t, i) => (
        <g key={i}>
          <rect x={t.x - 1.5} y={groundY - 22 * t.scale} width="3" height={22 * t.scale} fill="#3e2a18" />
          <ellipse cx={t.x} cy={groundY - 28 * t.scale} rx={13 * t.scale} ry={7 * t.scale} fill="#3f6b34" />
          <ellipse cx={t.x - 4} cy={groundY - 25 * t.scale} rx={8 * t.scale} ry={4.5 * t.scale} fill="#5d8a44" />
          <ellipse cx={t.x + 3} cy={groundY - 30 * t.scale} rx={6 * t.scale} ry={4 * t.scale} fill="#6fa052" />
        </g>
      ))}

      {/* WILDFLOWERS — small color dots in the meadow */}
      {[
        { x: 50, c: '#ff6688' },
        { x: 90, c: '#ffd040' },
        { x: 145, c: '#ffffff' },
        { x: 200, c: '#ff6688' },
        { x: 250, c: '#9a60d0' },
        { x: 305, c: '#ffd040' },
        { x: 355, c: '#ffffff' },
      ].map((f, i) => (
        <g key={`fl-${i}`}>
          <circle cx={f.x} cy={groundY + 12} r="2.5" fill={f.c} />
          <circle cx={f.x - 2.5} cy={groundY + 14} r="1.8" fill={f.c} opacity="0.85" />
          <circle cx={f.x + 2.5} cy={groundY + 14} r="1.8" fill={f.c} opacity="0.85" />
          <circle cx={f.x} cy={groundY + 13} r="1" fill="#ffe040" />
          <line x1={f.x} y1={groundY + 16} x2={f.x} y2={groundY + 22} stroke="#3f6b34" strokeWidth="0.8" />
        </g>
      ))}

      {/* BUTTERFLIES + BEE — drifting petals animation */}
      <g className="bob-breathe" style={{ transformOrigin: '290px 100px' }}>
        <text x="290" y="100" fontSize="14">🦋</text>
      </g>
      <g className="petal" style={{ transformOrigin: '170px 140px', animationDelay: '-3s' }}>
        <text x="170" y="140" fontSize="11">🦋</text>
      </g>
      <g className="petal" style={{ transformOrigin: '60px 170px', animationDelay: '-6s', animationDuration: '11s' }}>
        <text x="60" y="170" fontSize="10">🐝</text>
      </g>

      {/* DRIFTING PETALS — small pink dots floating */}
      <g fill="#ff9bb8" opacity="0.7">
        <g className="petal" style={{ transformOrigin: '100px 180px', animationDuration: '12s' }}>
          <ellipse cx="100" cy="180" rx="2.5" ry="1.5" transform="rotate(20 100 180)" />
        </g>
        <g className="petal" style={{ transformOrigin: '240px 200px', animationDelay: '-5s', animationDuration: '10s' }}>
          <ellipse cx="240" cy="200" rx="2.5" ry="1.5" transform="rotate(-15 240 200)" />
        </g>
      </g>

      {/* GRASS TUFTS at the very bottom */}
      {Array.from({ length: 14 }).map((_, i) => {
        const tx = 8 + i * 28;
        return (
          <g key={i} className="grass-tuft" style={{ transformOrigin: `${tx}px ${H - 4}px`, animationDelay: `${(i % 5) * 0.2}s` }}>
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
          <stop offset="0" stopColor="#ff9a55" />
          <stop offset="0.5" stopColor="#ffba78" />
          <stop offset="1" stopColor="#ffd590" />
        </linearGradient>
        <linearGradient id="rock-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d99850" />
          <stop offset="0.5" stopColor="#b87838" />
          <stop offset="1" stopColor="#7a4818" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width={W} height={groundY} fill="url(#rock-sky)" />
      <rect x="0" y={groundY} width={W} height={H - groundY} fill="url(#rock-ground)" />

      {/* DISTANT MESA silhouettes */}
      <polygon points={`0,${groundY - 20} 35,${groundY - 60} 80,${groundY - 55} 120,${groundY - 75} 160,${groundY - 50} 200,${groundY - 70} 240,${groundY - 45} 290,${groundY - 65} 340,${groundY - 50} ${W},${groundY - 35} ${W},${groundY} 0,${groundY}`}
        fill="#a8553a" opacity="0.55" />
      {/* mid-distance ridge */}
      <polygon points={`0,${groundY} 90,${groundY - 36} 170,${groundY - 16} ${W},${groundY - 24} ${W},${groundY}`}
        fill="#a06030" opacity="0.75" />

      {/* SUN — large hot orange disk with halo */}
      <circle cx="340" cy="55" r="36" fill="#ff9050" opacity="0.3" />
      <circle cx="340" cy="55" r="24" fill="#ff8a40" opacity="0.6" />
      <circle cx="340" cy="55" r="17" fill="#ff6a30" />
      <g className="sun-rays" style={{ transformOrigin: '340px 55px' }}>
        {Array.from({ length: 10 }).map((_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return <line key={i} x1={340 + Math.cos(a) * 26} y1={55 + Math.sin(a) * 26} x2={340 + Math.cos(a) * 36} y2={55 + Math.sin(a) * 36} stroke="#ff8a40" strokeWidth="2" opacity="0.7" strokeLinecap="round" />;
        })}
      </g>

      {/* CIRCLING VULTURE — slow orbit around a point */}
      <g style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
        <g className="circle-slow" style={{ transformOrigin: '120px 110px' }}>
          <text x="120" y="110" fontSize="14" opacity="0.7">🦅</text>
        </g>
      </g>

      {/* BOULDERS — multiple sizes in mid + foreground */}
      <g fill="#6e4628">
        <ellipse cx="55" cy={groundY + 4} rx="34" ry="14" />
        <ellipse cx="35" cy={groundY - 4} rx="22" ry="10" />
        <ellipse cx="345" cy={groundY + 8} rx="38" ry="14" />
        <ellipse cx="370" cy={groundY - 2} rx="22" ry="12" />
        <ellipse cx="220" cy={groundY + 12} rx="18" ry="6" />
      </g>
      <g fill="#8a5a32">
        <ellipse cx="55" cy={groundY + 2} rx="32" ry="11" />
        <ellipse cx="345" cy={groundY + 5} rx="36" ry="11" />
        <ellipse cx="220" cy={groundY + 10} rx="16" ry="5" />
      </g>
      {/* small loose rocks on the ground */}
      <g fill="#6a4220">
        <circle cx="110" cy={groundY + 18} r="3" />
        <circle cx="150" cy={groundY + 24} r="2.2" />
        <circle cx="280" cy={groundY + 20} r="2.5" />
        <circle cx="180" cy={groundY + 26} r="2" />
      </g>

      {/* GROUND CRACKS — heat-shimmering */}
      <g className="heat">
        <g stroke="#6a4828" strokeWidth="1.5" fill="none" strokeLinecap="round">
          <path d={`M 130 ${H - 12} L 165 ${H - 22} L 200 ${H - 14} L 240 ${H - 24}`} />
          <path d={`M 110 ${H - 4} L 150 ${H - 14}`} />
          <path d={`M 60 ${H - 6} L 90 ${H - 4}`} />
        </g>
      </g>

      {/* BIG SAGUARO CACTUS — multi-arm */}
      <g>
        {/* main trunk */}
        <rect x="100" y={groundY - 48} width="10" height="48" rx="3" fill="#3f5e22" />
        <rect x="100" y={groundY - 48} width="3" height="48" fill="#557d2e" />
        {/* left arm */}
        <path d={`M 100 ${groundY - 30} q -10 -2 -10 -10 l 0 -14 l 6 0 l 0 12 q 4 4 4 12`} fill="#3f5e22" />
        {/* right arm */}
        <path d={`M 110 ${groundY - 36} q 10 -2 10 -10 l 0 -18 l 6 0 l 0 16 q -4 4 -4 12`} fill="#3f5e22" />
        {/* ridges */}
        <g stroke="#2a4218" strokeWidth="0.7" opacity="0.8">
          <line x1="102" y1={groundY - 48} x2="102" y2={groundY - 2} />
          <line x1="106" y1={groundY - 48} x2="106" y2={groundY - 2} />
        </g>
        {/* spines (tiny crosshatches) */}
        <g stroke="#fff8d8" strokeWidth="0.5" opacity="0.7">
          <line x1="104" y1={groundY - 40} x2="104" y2={groundY - 38} />
          <line x1="104" y1={groundY - 32} x2="104" y2={groundY - 30} />
          <line x1="104" y1={groundY - 24} x2="104" y2={groundY - 22} />
        </g>
        {/* flower on top */}
        <circle cx="105" cy={groundY - 49} r="3" fill="#ffd140" />
        <circle cx="105" cy={groundY - 49} r="1.4" fill="#ff6890" />
      </g>

      {/* smaller cactus */}
      {[250].map((tx, i) => (
        <g key={i}>
          <rect x={tx - 3} y={groundY - 16} width="6" height="16" fill="#4a6228" />
          {[-4, 0, 4].map((dx, j) => (
            <ellipse key={j} cx={tx + dx} cy={groundY - 18 + Math.abs(dx)} rx="2.5" ry="4" fill="#6a8a30" transform={`rotate(${dx * 8} ${tx + dx} ${groundY - 18})`} />
          ))}
        </g>
      ))}

      {/* SCUTTLING LIZARD silhouette near a rock */}
      <g transform="translate(280 254)" fill="#5a3818" opacity="0.7">
        <ellipse cx="0" cy="0" rx="7" ry="2" />
        <ellipse cx="-9" cy="0" rx="3" ry="1.5" />
        <line x1="6" y1="0" x2="14" y2="-2" stroke="#5a3818" strokeWidth="1.5" strokeLinecap="round" />
        {/* tiny legs */}
        <line x1="-3" y1="2" x2="-5" y2="4" stroke="#5a3818" strokeWidth="0.8" />
        <line x1="3" y1="2" x2="5" y2="4" stroke="#5a3818" strokeWidth="0.8" />
      </g>

      {/* faint heat-shimmer over the horizon */}
      <g className="heat">
        <line x1="40" y1={groundY - 14} x2="120" y2={groundY - 14} stroke="#ffe9a0" strokeWidth="1" opacity="0.4" strokeDasharray="2 4" />
        <line x1="180" y1={groundY - 16} x2="320" y2={groundY - 16} stroke="#ffe9a0" strokeWidth="1" opacity="0.4" strokeDasharray="2 4" />
      </g>
    </>
  );
}

function SkyHabitat() {
  const branchY = 240;
  return (
    <>
      <defs>
        <linearGradient id="sky-up" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4ba8d8" />
          <stop offset="0.5" stopColor="#7fc2e4" />
          <stop offset="1" stopColor="#c8e4ee" />
        </linearGradient>
        <radialGradient id="sky-sun-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff3a8" stopOpacity="0.5" />
          <stop offset="1" stopColor="#fff3a8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width={W} height={H} fill="url(#sky-up)" />

      {/* DISTANT MOUNTAIN PEAK below the horizon */}
      <polygon points={`0,${branchY - 30} 80,${branchY - 90} 140,${branchY - 60} 200,${branchY - 110} 260,${branchY - 70} 340,${branchY - 95} ${W},${branchY - 50} ${W},${branchY} 0,${branchY}`}
        fill="#a8b8d4" opacity="0.6" />
      <polygon points={`0,${branchY - 10} 100,${branchY - 50} 180,${branchY - 30} 260,${branchY - 60} 340,${branchY - 30} ${W},${branchY - 20} ${W},${branchY} 0,${branchY}`}
        fill="#94a4c4" opacity="0.7" />

      {/* SUN with big halo */}
      <circle cx="340" cy="55" r="56" fill="url(#sky-sun-glow)" />
      <circle cx="340" cy="55" r="20" fill="#ffe9a0" opacity="0.7" />
      <circle cx="340" cy="55" r="14" fill="#ffd66a" />
      <g className="sun-rays" style={{ transformOrigin: '340px 55px' }}>
        {Array.from({ length: 10 }).map((_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return <line key={i} x1={340 + Math.cos(a) * 22} y1={55 + Math.sin(a) * 22} x2={340 + Math.cos(a) * 32} y2={55 + Math.sin(a) * 32} stroke="#ffd66a" strokeWidth="1.5" opacity="0.65" strokeLinecap="round" />;
        })}
      </g>

      {/* DISTANT CLOUDS — small whisps high up */}
      <g transform="translate(40 25)">
        <g className="cloud" style={{ animationDuration: '110s' }}>
          <ellipse cx="0" cy="0" rx="14" ry="3" fill="white" opacity="0.55" />
        </g>
      </g>
      <g transform="translate(180 30)">
        <g className="cloud" style={{ animationDuration: '130s', animationDelay: '-50s' }}>
          <ellipse cx="0" cy="0" rx="16" ry="3" fill="white" opacity="0.5" />
        </g>
      </g>

      {/* MID CLOUDS — fuller puffs */}
      <g transform="translate(80 70)">
        <g className="cloud" style={{ animationDuration: '50s' }}>
          <ellipse cx="0" cy="0" rx="30" ry="10" fill="white" opacity="0.95" />
          <ellipse cx="-15" cy="-5" rx="18" ry="8" fill="white" />
          <ellipse cx="15" cy="-4" rx="20" ry="8" fill="white" />
          <ellipse cx="-5" cy="4" rx="22" ry="5" fill="#e8eef4" opacity="0.6" />
        </g>
      </g>
      <g transform="translate(250 115)">
        <g className="cloud" style={{ animationDuration: '70s', animationDelay: '-20s' }}>
          <ellipse cx="0" cy="0" rx="24" ry="8" fill="white" opacity="0.9" />
          <ellipse cx="-12" cy="-4" rx="14" ry="6" fill="white" opacity="0.85" />
        </g>
      </g>

      {/* FOREGROUND CLOUD — big and close */}
      <g transform="translate(50 165)">
        <g className="cloud" style={{ animationDuration: '40s', animationDelay: '-15s' }}>
          <ellipse cx="0" cy="0" rx="36" ry="11" fill="white" opacity="0.92" />
          <ellipse cx="-18" cy="-5" rx="20" ry="9" fill="white" />
          <ellipse cx="18" cy="-4" rx="22" ry="9" fill="white" />
          <ellipse cx="0" cy="6" rx="28" ry="6" fill="#e0e8f0" opacity="0.5" />
        </g>
      </g>

      {/* V-FORMATION FLOCK */}
      <g transform="translate(120 80)" stroke="#3a2a18" strokeWidth="1.2" fill="none" strokeLinecap="round">
        <path d="M 0 0 q 4 -4 8 0 q 4 -4 8 0" />
        <path d="M 6 6 q 4 -4 8 0 q 4 -4 8 0" />
        <path d="M -6 6 q 4 -4 8 0 q 4 -4 8 0" />
        <path d="M 12 12 q 4 -4 8 0 q 4 -4 8 0" />
        <path d="M -12 12 q 4 -4 8 0 q 4 -4 8 0" />
      </g>

      {/* FLAPPING BIRDS — closer, animated wings */}
      {[180, 220, 250].map((bx, i) => (
        <g key={i} transform={`translate(${bx} ${100 + i * 8})`}>
          <g className="bird-wing" style={{ transformOrigin: 'center' }}>
            <path d="M -8 0 Q -3 -4 0 0 Q 3 -4 8 0" stroke="#3a2a18" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          </g>
        </g>
      ))}

      {/* HOT-AIR BALLOON drifting */}
      <g className="cloud" style={{ animationDuration: '160s', transformOrigin: 'center' }}>
        <g transform="translate(290 45)">
          {/* envelope */}
          <ellipse cx="0" cy="0" rx="14" ry="16" fill="#e54848" />
          <path d="M -14 0 a 14 16 0 0 1 28 0" fill="#ffd040" />
          <path d="M -10 0 a 10 14 0 0 1 20 0" fill="#3a8dde" opacity="0.55" />
          {/* basket */}
          <line x1="-8" y1="14" x2="-3" y2="22" stroke="#3a2a18" strokeWidth="0.8" />
          <line x1="8" y1="14" x2="3" y2="22" stroke="#3a2a18" strokeWidth="0.8" />
          <rect x="-4" y="22" width="8" height="6" rx="1" fill="#8a5828" />
        </g>
      </g>

      {/* BRANCH the creature perches on */}
      <line x1="0" y1={branchY + 6} x2={W} y2={branchY + 8} stroke="#5a3b22" strokeWidth="10" />
      <line x1="20" y1={branchY + 4} x2="160" y2={branchY + 8} stroke="#3e2a18" strokeWidth="2" opacity="0.4" />
      {/* knot detail */}
      <ellipse cx="240" cy={branchY + 8} rx="4" ry="2.5" fill="#3e2a18" />

      {/* leaves on the branch */}
      <g>
        {[60, 80, 100, 110, 300, 340, 360].map((lx, i) => (
          <g key={i}>
            <ellipse cx={lx} cy={branchY + 4 + (i % 2) * 2} rx="7" ry="3.5" fill="#3f6b34" />
            <ellipse cx={lx - 2} cy={branchY + 3 + (i % 2) * 2} rx="4" ry="2.5" fill="#5d8a44" />
          </g>
        ))}
      </g>

      {/* canopy hint at the bottom */}
      <rect x="0" y={H - 24} width={W} height="24" fill="#5a7d3a" opacity="0.4" />
    </>
  );
}

function UnderwaterHabitat() {
  return (
    <>
      <defs>
        <linearGradient id="under-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7cd0e4" />
          <stop offset="0.35" stopColor="#3a85b8" />
          <stop offset="0.75" stopColor="#1f4a78" />
          <stop offset="1" stopColor="#0c2548" />
        </linearGradient>
        <linearGradient id="under-godray" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cfe9f4" stopOpacity="0.55" />
          <stop offset="1" stopColor="#cfe9f4" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width={W} height={H} fill="url(#under-water)" />

      {/* SURFACE RIPPLES at the very top */}
      {Array.from({ length: 6 }).map((_, i) => (
        <line key={i} x1={i * 70} y1="6" x2={i * 70 + 24} y2="12" stroke="white" strokeWidth="2" opacity="0.6" />
      ))}
      {/* surface line + small wave silhouettes */}
      <path d="M 0 14 Q 40 8 80 14 T 160 14 T 240 14 T 320 14 T 400 14" stroke="white" strokeWidth="1" fill="none" opacity="0.4" />

      {/* GOD RAYS — broad triangular shafts of light from the surface */}
      <g className="ray">
        <polygon points="60,0 30,300 100,300" fill="url(#under-godray)" />
        <polygon points="180,0 140,300 230,300" fill="url(#under-godray)" />
        <polygon points="310,0 270,300 360,300" fill="url(#under-godray)" />
      </g>

      {/* DISTANT WHALE silhouette in the deep */}
      <g opacity="0.32" transform="translate(310 200)">
        <ellipse cx="0" cy="0" rx="42" ry="10" fill="#0a1c34" />
        <polygon points="38,0 56,-12 56,12" fill="#0a1c34" />
        <ellipse cx="-20" cy="-10" rx="6" ry="3" fill="#0a1c34" />
      </g>

      {/* SUNLIGHT SPOTLIGHT near the surface */}
      <g opacity="0.4">
        <g className="cloud" style={{ animationDuration: '40s' }}>
          <ellipse cx="0" cy="60" rx="120" ry="6" fill="white" />
        </g>
      </g>

      {/* DRIFTING PARTICLES (existing snowflake animation reused) */}
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

      {/* BUBBLE STREAMS — rising from the coral reef */}
      <g fill="white" opacity="0.85">
        {[
          { x: 40, dur: 6, delay: 0 },
          { x: 50, dur: 7, delay: -2 },
          { x: 360, dur: 8, delay: -1 },
          { x: 370, dur: 6, delay: -4 },
          { x: 200, dur: 9, delay: -3 },
        ].map((b, i) => (
          <circle key={`b-${i}`} cx={b.x} cy={H - 20} r={2.2 + (i % 2) * 0.8}
            className="bubble"
            style={{ animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }} />
        ))}
      </g>

      {/* CORAL REEF AT BOTTOM — multi-colored */}
      <g>
        {/* base sand mound */}
        <path d={`M 0 ${H - 14} Q 60 ${H - 26} 130 ${H - 18} Q 200 ${H - 32} 270 ${H - 16} Q 340 ${H - 26} 400 ${H - 14} L 400 ${H} L 0 ${H} Z`}
          fill="#3a6850" opacity="0.85" />
      </g>
      {/* coral clumps in different colors */}
      <g>
        {/* pink branching coral */}
        <g fill="#e6708a">
          <ellipse cx="32" cy={H - 26} rx="8" ry="5" />
          <ellipse cx="38" cy={H - 32} rx="5" ry="4" />
          <ellipse cx="26" cy={H - 30} rx="4" ry="3" />
        </g>
        {/* orange brain coral */}
        <g fill="#e69050">
          <ellipse cx="80" cy={H - 22} rx="12" ry="6" />
          <g stroke="#a85020" strokeWidth="0.8" fill="none" opacity="0.7">
            <path d="M 72 -28 q 4 2 8 0 q 4 2 8 0" transform={`translate(0 ${H})`} />
            <path d="M 72 -24 q 4 2 8 0 q 4 2 8 0" transform={`translate(0 ${H})`} />
          </g>
        </g>
        {/* purple fan coral */}
        <g fill="#9a60d0" opacity="0.85">
          <ellipse cx="350" cy={H - 30} rx="8" ry="14" />
          <ellipse cx="350" cy={H - 30} rx="5" ry="10" fill="#7a40b0" />
        </g>
        {/* yellow polyp clusters */}
        <g fill="#ffd040">
          <circle cx="160" cy={H - 22} r="2.5" />
          <circle cx="166" cy={H - 24} r="2" />
          <circle cx="156" cy={H - 24} r="1.8" />
          <circle cx="250" cy={H - 18} r="2.2" />
          <circle cx="256" cy={H - 20} r="1.8" />
        </g>
      </g>

      {/* SEAWEED — multiple greens, varied heights */}
      <g stroke="#3a8848" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.85">
        <path d={`M 22 ${H} q -3 -22 0 -44 q 3 -22 0 -44`} />
        <path d={`M 60 ${H} q -2 -18 0 -36 q 2 -18 0 -36`} />
        <path d={`M 110 ${H} q -2 -14 0 -28`} />
        <path d={`M 290 ${H} q 3 -20 0 -40`} />
        <path d={`M 370 ${H} q 3 -22 0 -44 q -3 -22 0 -44`} />
        <path d={`M 388 ${H} q 2 -18 0 -36`} />
      </g>
      <g stroke="#5aa868" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6">
        <path d={`M 22 ${H} q -3 -22 0 -44 q 3 -22 0 -44`} />
        <path d={`M 60 ${H} q -2 -18 0 -36 q 2 -18 0 -36`} />
        <path d={`M 370 ${H} q 3 -22 0 -44 q -3 -22 0 -44`} />
      </g>

      {/* SCHOOL OF FISH — small swimming silhouettes */}
      <g transform="translate(0 130)" opacity="0.6">
        <g className="swim" style={{ animationDuration: '28s' }}>
          <g fill="#1a2c4a">
            <ellipse cx="0" cy="0" rx="6" ry="3" />
            <polygon points="-6,0 -10,-3 -10,3" />
          </g>
        </g>
      </g>
      <g transform="translate(0 145)" opacity="0.5">
        <g className="swim" style={{ animationDuration: '32s', animationDelay: '-5s' }}>
          <g fill="#1a2c4a">
            <ellipse cx="0" cy="0" rx="5" ry="2.5" />
            <polygon points="-5,0 -9,-2 -9,2" />
          </g>
        </g>
      </g>
      <g transform="translate(400 170)" opacity="0.5" style={{ transform: 'translate(400px, 170px) scaleX(-1)' }}>
        <g className="swim" style={{ animationDuration: '30s', animationDelay: '-12s' }}>
          <g fill="#1a2c4a">
            <ellipse cx="0" cy="0" rx="5" ry="2.5" />
            <polygon points="-5,0 -9,-2 -9,2" />
          </g>
        </g>
      </g>

      {/* DRIFTING JELLYFISH — small, pulsing */}
      <g transform="translate(120 80)" opacity="0.7">
        <g className="jelly">
          <path d="M -12 0 Q 0 -14 12 0 Z" fill="#ffd0e8" opacity="0.6" />
          <path d="M -10 -2 Q 0 -12 10 -2 Z" fill="#ffb0d8" opacity="0.5" />
          <g stroke="#ffb0d8" strokeWidth="0.8" fill="none" opacity="0.7" strokeLinecap="round">
            <path d="M -8 1 q -1 8 1 16" />
            <path d="M -3 1 q -1 10 1 18" />
            <path d="M 3 1 q 1 10 -1 18" />
            <path d="M 8 1 q 1 8 -1 16" />
          </g>
        </g>
      </g>

      {/* horizon line for depth */}
      <line x1="0" y1={H * 0.78} x2={W} y2={H * 0.78} stroke="white" strokeWidth="0.5" strokeDasharray="3 4" opacity="0.15" />
    </>
  );
}
