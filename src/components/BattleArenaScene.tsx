import type { Creature } from '../types';
import type { Venue } from '../data/battle';
import { CreatureBody } from './CreatureSVG';
import { BespokeInScene, hasBespokeShape } from './dexShapes';

interface Props {
  creatureA: Creature;
  creatureB: Creature;
  venue: Venue;
  posA: number;       // 0..1
  posB: number;       // 0..1
  hpA: number;        // 0..1
  hpB: number;        // 0..1
  flash?: 'A' | 'B';  // someone just took a hit
  winner: 'A' | 'B' | 'draw' | null;
  finished: boolean;
}

const W = 600;
const H = 220;

// Render the player's creature into the battle scene at a target position.
// Uses the bespoke shape when available, fallback to the procedural body.
function CreatureInBattle({
  creature, x, y, width = 100, height = 80, facingRight = true, dimmed = false,
}: {
  creature: Creature;
  x: number; y: number;
  width?: number; height?: number;
  facingRight?: boolean;
  dimmed?: boolean;
}) {
  const opacity = dimmed ? 0.4 : 1;
  return (
    <g opacity={opacity}>
      {hasBespokeShape(creature) ? (
        <BespokeInScene
          creature={creature}
          x={x - width / 2}
          y={y - height}
          width={width}
          height={height}
          animate="breathe"
          facingRight={facingRight}
        />
      ) : (
        <g transform={`translate(${x} ${y}) ${facingRight ? '' : 'scale(-1,1)'}`}>
          <CreatureBody creature={creature} cx={0} footY={0} scale={0.32} animate="breathe" />
        </g>
      )}
    </g>
  );
}

export function BattleArenaScene({
  creatureA, creatureB, venue, posA, posB, hpA, hpB, flash, winner, finished,
}: Props) {
  if (venue === 'brawl') return <BrawlScene
    creatureA={creatureA} creatureB={creatureB}
    hpA={hpA} hpB={hpB} flash={flash} winner={winner} finished={finished}
  />;
  if (venue === 'race') return <RaceScene
    creatureA={creatureA} creatureB={creatureB}
    posA={posA} posB={posB} winner={winner} finished={finished}
  />;
  if (venue === 'maze') return <MazeScene
    creatureA={creatureA} creatureB={creatureB}
    posA={posA} posB={posB} winner={winner} finished={finished}
  />;
  return <DiveScene
    creatureA={creatureA} creatureB={creatureB}
    posA={posA} posB={posB} winner={winner} finished={finished}
  />;
}

// ─── BRAWL — Hunt-style face-off in a coliseum arena ───────────────────
function BrawlScene({
  creatureA, creatureB, hpA, hpB, flash, winner, finished,
}: {
  creatureA: Creature; creatureB: Creature;
  hpA: number; hpB: number; flash?: 'A' | 'B';
  winner: 'A' | 'B' | 'draw' | null; finished: boolean;
}) {
  const GROUND_Y = 160;
  // When flash='A' it means creature A just hit creature B (B recoils).
  // Positions tilt to suggest the hit:
  //   A leans forward, B reels back
  const lunge = 14;
  const aX = 180 + (flash === 'A' ? lunge : 0);
  const bX = 420 - (flash === 'A' ? -2 : flash === 'B' ? -lunge : 0);
  const aOpacity = finished && winner === 'B' ? 0.35 : 1;
  const bOpacity = finished && winner === 'A' ? 0.35 : 1;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet" className="battle-scene-svg">
      <defs>
        <linearGradient id="bs-brawl-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbd690" />
          <stop offset="1" stopColor="#ffd8a8" />
        </linearGradient>
      </defs>
      {/* sky */}
      <rect width={W} height={GROUND_Y} fill="url(#bs-brawl-sky)" />
      {/* coliseum stands */}
      <rect x="0" y="0" width={W} height="30" fill="#c89870" opacity="0.6" />
      {/* crowd dots */}
      <g fill="#5a3a18" opacity="0.7">
        {Array.from({ length: 30 }).map((_, i) => (
          <circle key={i} cx={20 + i * 19} cy={14 + (i % 3) * 5} r="2" />
        ))}
      </g>
      {/* arena floor */}
      <rect x="0" y={GROUND_Y} width={W} height={H - GROUND_Y} fill="#d8a872" />
      <ellipse cx={W / 2} cy={GROUND_Y} rx={W * 0.55} ry="10" fill="#a87838" opacity="0.6" />
      {/* dust */}
      {flash && (
        <g fill="white" opacity="0.45">
          <circle cx={W / 2} cy={GROUND_Y - 8} r="6" />
          <circle cx={W / 2 - 10} cy={GROUND_Y - 14} r="4" />
          <circle cx={W / 2 + 10} cy={GROUND_Y - 14} r="4" />
        </g>
      )}
      {/* impact flash icon */}
      {flash && (
        <g transform={`translate(${W / 2} ${GROUND_Y - 28})`}>
          <text textAnchor="middle" fontSize="28" fontWeight="700">💥</text>
        </g>
      )}

      {/* creature A on the left, facing right */}
      <g style={{ transition: 'transform 0.18s ease', transform: `translateX(${aX - 180}px)` }}>
        <CreatureInBattle creature={creatureA} x={180} y={GROUND_Y - 4} facingRight={true} dimmed={aOpacity < 1} />
      </g>
      {/* creature B on the right, facing left (mirrored) */}
      <g style={{ transition: 'transform 0.18s ease', transform: `translateX(${bX - 420}px)` }}>
        <CreatureInBattle creature={creatureB} x={420} y={GROUND_Y - 4} facingRight={false} dimmed={bOpacity < 1} />
      </g>

      {/* HP bars overhead */}
      <g>
        <rect x="20" y="40" width="160" height="10" rx="2" fill="#eee" stroke="#888" />
        <rect x="20" y="40" width={Math.max(0, 160 * hpA)} height="10" rx="2" fill={hpA > 0.5 ? '#5cc46a' : hpA > 0.2 ? '#e0a040' : '#c44'} />
        <text x="100" y="38" textAnchor="middle" fontSize="10" fontWeight="700" fill="#3a2010">
          {creatureA.name} · HP {Math.round(hpA * 100)}%
        </text>
      </g>
      <g>
        <rect x={W - 180} y="40" width="160" height="10" rx="2" fill="#eee" stroke="#888" />
        <rect x={W - 180} y="40" width={Math.max(0, 160 * hpB)} height="10" rx="2" fill={hpB > 0.5 ? '#5cc46a' : hpB > 0.2 ? '#e0a040' : '#c44'} />
        <text x={W - 100} y="38" textAnchor="middle" fontSize="10" fontWeight="700" fill="#3a2010">
          {creatureB.name} · HP {Math.round(hpB * 100)}%
        </text>
      </g>

      {/* winner crown on top of the winner when finished */}
      {finished && winner === 'A' && <text x="180" y={GROUND_Y - 88} textAnchor="middle" fontSize="30">👑</text>}
      {finished && winner === 'B' && <text x="420" y={GROUND_Y - 88} textAnchor="middle" fontSize="30">👑</text>}
    </svg>
  );
}

// ─── RACE — horizontal track, creatures running left to right ──────────
function RaceScene({
  creatureA, creatureB, posA, posB, winner, finished,
}: {
  creatureA: Creature; creatureB: Creature;
  posA: number; posB: number;
  winner: 'A' | 'B' | 'draw' | null; finished: boolean;
}) {
  const startX = 40;
  const finishX = W - 50;
  const trackW = finishX - startX;
  const aX = startX + posA * trackW;
  const bX = startX + posB * trackW;
  const trackA_Y = 110;     // top lane
  const trackB_Y = 160;     // bottom lane
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet" className="battle-scene-svg">
      <defs>
        <linearGradient id="bs-race-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a8e0f0" />
          <stop offset="1" stopColor="#cfeef8" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#bs-race-sky)" />
      {/* sun */}
      <circle cx="60" cy="40" r="18" fill="#ffd34a" opacity="0.8" />

      {/* savanna ground */}
      <rect x="0" y={H - 40} width={W} height="40" fill="#d8b870" />
      {/* trees in the distance */}
      <g opacity="0.6">
        {[80, 200, 320, 460, 540].map((tx, i) => (
          <g key={i} transform={`translate(${tx} ${H - 60})`}>
            <rect x="-2" y="0" width="4" height="14" fill="#5a3a18" />
            <ellipse cx="0" cy="0" rx="10" ry="6" fill="#3a7a3a" />
          </g>
        ))}
      </g>

      {/* track lanes — dashed lines */}
      <line x1={startX} y1={trackA_Y} x2={finishX} y2={trackA_Y} stroke="#fff" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.7" />
      <line x1={startX} y1={trackB_Y} x2={finishX} y2={trackB_Y} stroke="#fff" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.7" />

      {/* start + finish posts */}
      <g>
        {/* start flag */}
        <line x1={startX} y1="50" x2={startX} y2={H - 40} stroke="#3a2118" strokeWidth="2" />
        <polygon points={`${startX},50 ${startX + 18},58 ${startX},66`} fill="#5cc46a" />
        <text x={startX + 8} y="76" fontSize="9" fill="#3a2118" fontWeight="700">START</text>
        {/* checkered finish flag */}
        <line x1={finishX} y1="50" x2={finishX} y2={H - 40} stroke="#3a2118" strokeWidth="2" />
        <g transform={`translate(${finishX} 50)`}>
          {Array.from({ length: 4 }).map((_, i) => (
            <g key={i}>
              <rect x="0" y={i * 4} width="4" height="4" fill={i % 2 === 0 ? 'black' : 'white'} />
              <rect x="4" y={i * 4} width="4" height="4" fill={i % 2 === 0 ? 'white' : 'black'} />
              <rect x="8" y={i * 4} width="4" height="4" fill={i % 2 === 0 ? 'black' : 'white'} />
              <rect x="12" y={i * 4} width="4" height="4" fill={i % 2 === 0 ? 'white' : 'black'} />
            </g>
          ))}
        </g>
        <text x={finishX - 8} y="76" fontSize="9" fill="#3a2118" textAnchor="end" fontWeight="700">FINISH</text>
      </g>

      {/* dust trails behind each runner */}
      <g fill="white" opacity="0.7">
        <circle cx={aX - 28} cy={trackA_Y + 2} r="3" />
        <circle cx={aX - 38} cy={trackA_Y + 4} r="2" />
        <circle cx={aX - 46} cy={trackA_Y + 2} r="1.5" />
      </g>
      <g fill="white" opacity="0.7">
        <circle cx={bX - 28} cy={trackB_Y + 2} r="3" />
        <circle cx={bX - 38} cy={trackB_Y + 4} r="2" />
        <circle cx={bX - 46} cy={trackB_Y + 2} r="1.5" />
      </g>

      {/* runner A on the top lane */}
      <g style={{ transition: 'transform 0.18s linear' }}>
        <CreatureInBattle creature={creatureA} x={aX} y={trackA_Y + 5} width={70} height={56} facingRight={true} />
      </g>
      {/* runner B on the bottom lane */}
      <g style={{ transition: 'transform 0.18s linear' }}>
        <CreatureInBattle creature={creatureB} x={bX} y={trackB_Y + 5} width={70} height={56} facingRight={true} />
      </g>

      {/* lane labels at the start */}
      <text x="12" y={trackA_Y + 4} fontSize="10" fontWeight="700" fill="#3a2118">A</text>
      <text x="12" y={trackB_Y + 4} fontSize="10" fontWeight="700" fill="#3a2118">B</text>

      {/* progress percent over each runner */}
      <text x={aX} y={trackA_Y - 50} textAnchor="middle" fontSize="10" fontWeight="700" fill="#3a2118">{Math.round(posA * 100)}%</text>
      <text x={bX} y={trackB_Y - 50} textAnchor="middle" fontSize="10" fontWeight="700" fill="#3a2118">{Math.round(posB * 100)}%</text>

      {/* crown for the finisher */}
      {finished && winner === 'A' && <text x={finishX - 14} y={trackA_Y - 36} textAnchor="middle" fontSize="22">🏆</text>}
      {finished && winner === 'B' && <text x={finishX - 14} y={trackB_Y - 36} textAnchor="middle" fontSize="22">🏆</text>}
    </svg>
  );
}

// ─── MAZE — top-down schematic, two parallel paths ─────────────────────
function MazeScene({
  creatureA, creatureB, posA, posB, winner, finished,
}: {
  creatureA: Creature; creatureB: Creature;
  posA: number; posB: number;
  winner: 'A' | 'B' | 'draw' | null; finished: boolean;
}) {
  // A simple zig-zag path on top, a different zig-zag on bottom.
  // We pre-compute path point arrays and interpolate positions along them.
  const startX = 60, endX = W - 50;
  const pathA_Y = [60, 80, 60, 90, 60, 80, 60];
  const pathB_Y = [180, 160, 180, 150, 180, 160, 180];

  function pointAt(path: number[], t: number): { x: number; y: number } {
    const segs = path.length - 1;
    const s = t * segs;
    const i = Math.min(segs - 1, Math.floor(s));
    const f = s - i;
    const x0 = startX + (i / segs) * (endX - startX);
    const x1 = startX + ((i + 1) / segs) * (endX - startX);
    return { x: x0 + f * (x1 - x0), y: path[i] + f * (path[i + 1] - path[i]) };
  }
  const aPos = pointAt(pathA_Y, posA);
  const bPos = pointAt(pathB_Y, posB);

  function pathStr(path: number[]): string {
    return path.map((y, i) => `${i === 0 ? 'M' : 'L'} ${startX + (i / (path.length - 1)) * (endX - startX)} ${y}`).join(' ');
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet" className="battle-scene-svg">
      <rect width={W} height={H} fill="#2a3a3a" />
      {/* hedge maze walls — top + bottom border */}
      <rect x="0" y="0" width={W} height="14" fill="#3a5a2a" />
      <rect x="0" y={H - 14} width={W} height="14" fill="#3a5a2a" />
      {/* middle divider */}
      <rect x="0" y={H / 2 - 4} width={W} height="8" fill="#3a5a2a" />

      {/* path A — dashed line */}
      <path d={pathStr(pathA_Y)} stroke="#aef0c0" strokeWidth="2" strokeDasharray="6 6" fill="none" opacity="0.7" />
      {/* path B */}
      <path d={pathStr(pathB_Y)} stroke="#aef0c0" strokeWidth="2" strokeDasharray="6 6" fill="none" opacity="0.7" />

      {/* start + exit markers */}
      <text x={startX - 30} y="60" fontSize="11" fill="#fff" fontWeight="700">START</text>
      <text x={endX + 5} y="60" fontSize="11" fill="#fff" fontWeight="700">EXIT</text>
      <text x={startX - 30} y="184" fontSize="11" fill="#fff" fontWeight="700">START</text>
      <text x={endX + 5} y="184" fontSize="11" fill="#fff" fontWeight="700">EXIT</text>

      {/* creatures along their paths */}
      <g>
        <CreatureInBattle creature={creatureA} x={aPos.x} y={aPos.y + 25} width={50} height={40} />
      </g>
      <g>
        <CreatureInBattle creature={creatureB} x={bPos.x} y={bPos.y + 25} width={50} height={40} />
      </g>

      {/* progress badges */}
      <text x={aPos.x} y={aPos.y - 18} textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">
        {creatureA.name.slice(0, 12)} · {Math.round(posA * 100)}%
      </text>
      <text x={bPos.x} y={bPos.y + 38} textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">
        {creatureB.name.slice(0, 12)} · {Math.round(posB * 100)}%
      </text>

      {finished && winner === 'A' && <text x={endX} y={pathA_Y[pathA_Y.length - 1] - 16} textAnchor="middle" fontSize="20">🏆</text>}
      {finished && winner === 'B' && <text x={endX} y={pathB_Y[pathB_Y.length - 1] - 16} textAnchor="middle" fontSize="20">🏆</text>}
    </svg>
  );
}

// ─── DIVE — vertical water column, creatures descend ────────────────────
function DiveScene({
  creatureA, creatureB, posA, posB, winner, finished,
}: {
  creatureA: Creature; creatureB: Creature;
  posA: number; posB: number;
  winner: 'A' | 'B' | 'draw' | null; finished: boolean;
}) {
  const surfaceY = 30;
  const floorY = H - 20;
  const colA_X = W * 0.30;
  const colB_X = W * 0.70;
  const aY = surfaceY + posA * (floorY - surfaceY);
  const bY = surfaceY + posB * (floorY - surfaceY);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet" className="battle-scene-svg">
      <defs>
        <linearGradient id="bs-dive" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a85b8" />
          <stop offset="0.5" stopColor="#1f4a78" />
          <stop offset="1" stopColor="#0a2548" />
        </linearGradient>
      </defs>
      {/* sky strip + water */}
      <rect x="0" y="0" width={W} height={surfaceY} fill="#cfe8f1" />
      <rect x="0" y={surfaceY} width={W} height={H - surfaceY} fill="url(#bs-dive)" />
      {/* surface waves */}
      {Array.from({ length: 7 }).map((_, i) => (
        <line key={i} x1={i * 90} y1={surfaceY - 4} x2={i * 90 + 30} y2={surfaceY - 1} stroke="white" strokeWidth="1.5" opacity="0.6" />
      ))}
      {/* depth marks */}
      <g stroke="white" strokeWidth="0.6" opacity="0.35" fill="none">
        {[60, 100, 140, 180].map((y) => (
          <g key={y}>
            <line x1="0" y1={y} x2={W} y2={y} strokeDasharray="2 6" />
            <text x="6" y={y - 2} fontSize="8" fill="white" opacity="0.7">
              {Math.round(((y - surfaceY) / (floorY - surfaceY)) * 1000)}m
            </text>
          </g>
        ))}
      </g>
      {/* seabed */}
      <rect x="0" y={floorY} width={W} height={H - floorY} fill="#3a2a18" />

      {/* bubble trails behind each diver */}
      <g fill="white" opacity="0.5">
        <circle cx={colA_X + 14} cy={aY - 14} r="2" />
        <circle cx={colA_X + 18} cy={aY - 24} r="1.6" />
        <circle cx={colA_X + 14} cy={aY - 32} r="1.4" />
      </g>
      <g fill="white" opacity="0.5">
        <circle cx={colB_X + 14} cy={bY - 14} r="2" />
        <circle cx={colB_X + 18} cy={bY - 24} r="1.6" />
        <circle cx={colB_X + 14} cy={bY - 32} r="1.4" />
      </g>

      {/* divers — note y is the position, the creature renders feet-down */}
      <g style={{ transition: 'transform 0.18s linear' }}>
        <CreatureInBattle creature={creatureA} x={colA_X} y={aY + 30} width={70} height={60} />
      </g>
      <g style={{ transition: 'transform 0.18s linear' }}>
        <CreatureInBattle creature={creatureB} x={colB_X} y={bY + 30} width={70} height={60} />
      </g>

      {/* depth percent badges */}
      <text x={colA_X} y={aY - 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="white">
        {creatureA.name.slice(0, 10)} · {Math.round(posA * 100)}%
      </text>
      <text x={colB_X} y={bY - 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="white">
        {creatureB.name.slice(0, 10)} · {Math.round(posB * 100)}%
      </text>

      {/* deep-sea floor trophy on whoever reaches the bottom */}
      {finished && winner === 'A' && <text x={colA_X} y={floorY - 36} textAnchor="middle" fontSize="20">🏆</text>}
      {finished && winner === 'B' && <text x={colB_X} y={floorY - 36} textAnchor="middle" fontSize="20">🏆</text>}
    </svg>
  );
}
