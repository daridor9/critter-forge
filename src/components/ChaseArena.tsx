import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { CreatureStats } from '../physics';
import type { Creature } from '../types';
import { CreatureBody } from './CreatureSVG';
import { BespokeInScene, hasBespokeShape } from './dexShapes';
import { comboEffects, getActiveCombo } from '../data/hybridCombos';

export type ChaseOutcome = {
  won: boolean;
  reason: 'caught' | 'lost-speed' | 'lost-stamina' | 'lost-distance';
  preyId?: 'rabbit' | 'gazelle' | 'kangaroo';
  reward?: number;
  biome?: ChaseBiomeId;
};

export type ChaseBiomeId = 'savanna' | 'forest' | 'tundra' | 'desert' | 'night';

// CHASE PACE — how the creature chases. Trades speed against stamina.
export type ChasePace = 'sprint' | 'pace' | 'burst';

interface Props {
  creature: Creature;
  stats: CreatureStats;
  generation?: number;
  onFinish: (o: ChaseOutcome) => void;
}

interface ChaseBiome {
  id: ChaseBiomeId;
  label: string;
  emoji: string;
  description: string;
  sky: [string, string, string];
  sun: string;
  sunHalo: string;
  ground: [string, string, string];
  hill: string;
  hill2: string;
  treeMain: string;
  treeMid: string;
  treeTop: string;
  stars: boolean;
  preyKmhBonus: number;       // makes prey faster — adds to difficulty
  rewardMult: number;         // scales kcal reward
  difficultyLabel: string;
  // Biome-specific scene props (snow drifts, cacti, pines) — opt-in flags
  snow?: boolean;
  cacti?: boolean;
  pines?: boolean;
}

// 5 biomes ordered easy → hard. Each rotates the entire scene + tweaks
// difficulty (prey speed) and reward (kcal multiplier).
const CHASE_BIOMES: ChaseBiome[] = [
  {
    id: 'savanna',
    label: 'Savanna',
    emoji: '🌾',
    description: 'Wide open plains. Easy sight lines.',
    sky: ['#7ec4e0', '#c8d8b8', '#f8d68a'],
    sun: '#ffd66a', sunHalo: '#ffe9a0',
    ground: ['#f3d27d', '#dfb066', '#a07a40'],
    hill: '#d4b56a', hill2: '#c89a55',
    treeMain: '#3f5a30', treeMid: '#557d3e', treeTop: '#6b9450',
    stars: false,
    preyKmhBonus: 0,
    rewardMult: 1.0,
    difficultyLabel: 'easy',
  },
  {
    id: 'forest',
    label: 'Forest',
    emoji: '🌳',
    description: 'Dense cover. Prey zigzags between trees.',
    sky: ['#5a8cb0', '#8ab48c', '#d4dca0'],
    sun: '#ffd66a', sunHalo: '#ffe9a0',
    ground: ['#7a8a4a', '#5a6a32', '#3a4a20'],
    hill: '#6a7a3a', hill2: '#4a5a28',
    treeMain: '#2a4218', treeMid: '#3a5828', treeTop: '#4a7038',
    stars: false,
    preyKmhBonus: 4,
    rewardMult: 1.4,
    difficultyLabel: 'medium',
    pines: true,
  },
  {
    id: 'tundra',
    label: 'Tundra',
    emoji: '🏔',
    description: 'Snow drags every step. Cold-adapted prey.',
    sky: ['#9ac6e0', '#cfe0e8', '#e8efef'],
    sun: '#fff8d8', sunHalo: '#e8f0ff',
    ground: ['#f0f4f8', '#dde4e8', '#aab4c0'],
    hill: '#c8d2dc', hill2: '#a0aab6',
    treeMain: '#2a3a22', treeMid: '#3a4a30', treeTop: '#4a5a3e',
    stars: false,
    preyKmhBonus: 6,
    rewardMult: 1.6,
    difficultyLabel: 'hard',
    snow: true,
    pines: true,
  },
  {
    id: 'desert',
    label: 'Desert',
    emoji: '🏜',
    description: 'Heat fatigue. Mirage prey. Cacti and dunes.',
    sky: ['#ff9a55', '#ffba78', '#ffd590'],
    sun: '#ff6a30', sunHalo: '#ff9050',
    ground: ['#e6a868', '#c88840', '#8a5828'],
    hill: '#c8945a', hill2: '#a87838',
    treeMain: '#3f5a30', treeMid: '#557d3e', treeTop: '#6b9450',
    stars: false,
    preyKmhBonus: 8,
    rewardMult: 1.8,
    difficultyLabel: 'hard',
    cacti: true,
  },
  {
    id: 'night',
    label: 'Night',
    emoji: '🌃',
    description: 'Low visibility. Prey is faster in the dark.',
    sky: ['#0a1530', '#1f2d5a', '#3a4878'],
    sun: '#f0f0ff', sunHalo: '#a0b8e0',
    ground: ['#5a5878', '#3e3c58', '#1e1c30'],
    hill: '#48506a', hill2: '#363c54',
    treeMain: '#1a2418', treeMid: '#243024', treeTop: '#2e3a2c',
    stars: true,
    preyKmhBonus: 10,
    rewardMult: 2.2,
    difficultyLabel: 'very hard',
  },
];

const NIGHT_STARS = Array.from({ length: 28 }).map((_, i) => ({
  x: ((i * 73 + 19) % 800),
  y: ((i * 41) % 180) + 10,
  r: ((i * 7) % 5 === 0 ? 1.6 : 1),
}));

const TRACK_M = 600;
const START_GAP_M = 25;
const TICK_MS = 50;

const W = 800;
const H = 420;
const GROUND_Y = 300;

// Chase camera: player is pinned at PLAYER_X on screen; the prey position
// shows the REAL gap (px = metres × GAP_SCALE) clamped to stay visible;
// foreground scenery scrolls left at SCROLL_SCALE px/metre to sell motion.
const PLAYER_X = 220;
const GAP_SCALE = 5;
const SCROLL_SCALE = 8;

type PreyId = 'rabbit' | 'gazelle' | 'kangaroo';
interface PreyDef {
  id: PreyId;
  label: string;
  emoji: string;
  speedKmh: number;
  reward: number;
  Render: () => ReactNode;
}

function Rabbit() {
  return (
    <g transform="scale(1.6)">
      <ellipse cx="0" cy="2" rx="13" ry="3" fill="rgba(0,0,0,0.2)" />
      <g className="leg leg-a" style={{ transformOrigin: '-5px 0px' }}>
        <line x1="-4" y1="-2" x2="-5" y2="7" stroke="#7a5236" strokeWidth="2.6" strokeLinecap="round" />
        <ellipse cx="-5" cy="7" rx="2" ry="0.8" fill="#3a2118" />
      </g>
      <g className="leg leg-b" style={{ transformOrigin: '0px 0px' }}>
        <line x1="0" y1="-2" x2="-1" y2="7" stroke="#7a5236" strokeWidth="2.6" strokeLinecap="round" />
        <ellipse cx="-1" cy="7" rx="2" ry="0.8" fill="#3a2118" />
      </g>
      <g className="leg leg-b" style={{ transformOrigin: '6px 0px' }}>
        <line x1="6" y1="-2" x2="7" y2="7" stroke="#7a5236" strokeWidth="2.6" strokeLinecap="round" />
        <ellipse cx="7" cy="7" rx="2" ry="0.8" fill="#3a2118" />
      </g>
      <g className="leg leg-a" style={{ transformOrigin: '10px 0px' }}>
        <line x1="10" y1="-2" x2="11" y2="7" stroke="#7a5236" strokeWidth="2.6" strokeLinecap="round" />
        <ellipse cx="11" cy="7" rx="2" ry="0.8" fill="#3a2118" />
      </g>
      <ellipse cx="3" cy="-8" rx="12" ry="6" fill="#a48267" />
      <ellipse cx="3" cy="-6" rx="10" ry="2.4" fill="#c7a98a" opacity="0.55" />
      <ellipse cx="-6" cy="-9" rx="3" ry="2" fill="#9a7458" opacity="0.6" />
      <ellipse cx="2" cy="-10" rx="3" ry="2" fill="#9a7458" opacity="0.6" />
      <circle cx="12" cy="-13" r="4.5" fill="#a48267" />
      <ellipse cx="10" cy="-21" rx="1.8" ry="7" fill="#a48267" transform="rotate(-12 10 -21)" />
      <ellipse cx="14" cy="-21" rx="1.8" ry="7" fill="#a48267" transform="rotate(12 14 -21)" />
      <ellipse cx="10" cy="-21" rx="0.8" ry="4.5" fill="#e0b8a0" transform="rotate(-12 10 -21)" />
      <ellipse cx="14" cy="-21" rx="0.8" ry="4.5" fill="#e0b8a0" transform="rotate(12 14 -21)" />
      <g className="eye-blink" style={{ transformOrigin: '13.5px -13px' }}>
        <circle cx="13.5" cy="-13" r="1.5" fill="white" stroke="#222" strokeWidth="0.4" />
        <circle cx="13.8" cy="-13" r="1" fill="#222" />
        <circle cx="14.1" cy="-13.3" r="0.4" fill="white" />
      </g>
      <ellipse cx="15" cy="-11" rx="0.6" ry="0.4" fill="#3a2118" />
      <path d="M 11 -11 q 1 1 2.5 0.4" stroke="#3a2118" strokeWidth="0.5" fill="none" strokeLinecap="round" />
      <circle cx="-8" cy="-8" r="3.2" fill="#f0e2c8" />
      <circle cx="-9" cy="-8" r="1.4" fill="white" opacity="0.7" />
    </g>
  );
}

function Gazelle() {
  return (
    <g transform="scale(1.6)">
      <ellipse cx="0" cy="2" rx="14" ry="3" fill="rgba(0,0,0,0.2)" />
      <g className="leg leg-a" style={{ transformOrigin: '-7px -2px' }}>
        <line x1="-7" y1="-2" x2="-9" y2="12" stroke="#7a5236" strokeWidth="2.2" strokeLinecap="round" />
        <ellipse cx="-9" cy="12" rx="1.5" ry="0.6" fill="#3a2118" />
      </g>
      <g className="leg leg-b" style={{ transformOrigin: '-3px -2px' }}>
        <line x1="-3" y1="-2" x2="-5" y2="12" stroke="#7a5236" strokeWidth="2.2" strokeLinecap="round" />
        <ellipse cx="-5" cy="12" rx="1.5" ry="0.6" fill="#3a2118" />
      </g>
      <g className="leg leg-b" style={{ transformOrigin: '5px -2px' }}>
        <line x1="5" y1="-2" x2="7" y2="12" stroke="#7a5236" strokeWidth="2.2" strokeLinecap="round" />
        <ellipse cx="7" cy="12" rx="1.5" ry="0.6" fill="#3a2118" />
      </g>
      <g className="leg leg-a" style={{ transformOrigin: '9px -2px' }}>
        <line x1="9" y1="-2" x2="11" y2="12" stroke="#7a5236" strokeWidth="2.2" strokeLinecap="round" />
        <ellipse cx="11" cy="12" rx="1.5" ry="0.6" fill="#3a2118" />
      </g>
      <ellipse cx="1" cy="-9" rx="13" ry="6.5" fill="#c89366" />
      <ellipse cx="1" cy="-5" rx="11" ry="3" fill="#e1b489" opacity="0.6" />
      <ellipse cx="-5" cy="-10" rx="2.5" ry="1.5" fill="#a87649" opacity="0.55" />
      <ellipse cx="3" cy="-11" rx="2.5" ry="1.5" fill="#a87649" opacity="0.55" />
      <ellipse cx="-7" cy="-7" rx="2.5" ry="1.5" fill="#a87649" opacity="0.55" />
      <circle cx="13" cy="-15" r="4.5" fill="#c89366" />
      <line x1="12" y1="-17" x2="10" y2="-23" stroke="#3a2118" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="14" y1="-17" x2="15" y2="-24" stroke="#3a2118" strokeWidth="1.2" strokeLinecap="round" />
      <g className="eye-blink" style={{ transformOrigin: '14px -14px' }}>
        <circle cx="14" cy="-14" r="1.2" fill="white" stroke="#222" strokeWidth="0.4" />
        <circle cx="14.3" cy="-14" r="0.8" fill="#222" />
      </g>
      <ellipse cx="16" cy="-12" rx="0.6" ry="0.4" fill="#3a2118" />
      <path d="M -12 -9 q -5 -1 -7 -4" stroke="#7a5236" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <circle cx="-19" cy="-13" r="1.2" fill="white" />
    </g>
  );
}

function Kangaroo() {
  return (
    <g transform="scale(1.6)">
      <ellipse cx="0" cy="2" rx="11" ry="3" fill="rgba(0,0,0,0.2)" />
      <path d="M -4 -10 Q -16 -2 -20 10" stroke="#9a6c3a" strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <g className="leg leg-a" style={{ transformOrigin: '-2px -6px' }}>
        <path d="M -2 -7 Q -3 1 1 10" stroke="#9a6c3a" strokeWidth="3.8" fill="none" strokeLinecap="round" />
      </g>
      <g className="leg leg-b" style={{ transformOrigin: '3px -6px' }}>
        <path d="M 3 -7 Q 2 1 5 10" stroke="#9a6c3a" strokeWidth="3.8" fill="none" strokeLinecap="round" />
      </g>
      <ellipse cx="2" cy="-13" rx="6.5" ry="10" fill="#b58450" />
      <ellipse cx="2" cy="-10" rx="4.5" ry="6.5" fill="#d2a673" opacity="0.55" />
      <ellipse cx="0" cy="-7" rx="3" ry="4" fill="#a87649" opacity="0.4" />
      <line x1="6" y1="-11" x2="9" y2="-6" stroke="#9a6c3a" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="6" y1="-12" x2="9.5" y2="-9" stroke="#9a6c3a" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="8" cy="-22" rx="3.2" ry="4.8" fill="#b58450" />
      <ellipse cx="7" cy="-27" rx="1.1" ry="3.2" fill="#9a6c3a" />
      <ellipse cx="10" cy="-27" rx="1.1" ry="3.2" fill="#9a6c3a" />
      <g className="eye-blink" style={{ transformOrigin: '9.5px -22px' }}>
        <circle cx="9.5" cy="-22" r="1.2" fill="white" stroke="#222" strokeWidth="0.4" />
        <circle cx="9.8" cy="-22" r="0.8" fill="#222" />
      </g>
      <ellipse cx="11" cy="-20" rx="0.6" ry="0.4" fill="#3a2118" />
    </g>
  );
}

const PREYS: PreyDef[] = [
  { id: 'rabbit', label: 'Rabbit', emoji: '🐰', speedKmh: 40, reward: 600, Render: Rabbit },
  { id: 'gazelle', label: 'Gazelle', emoji: '🦌', speedKmh: 60, reward: 2200, Render: Gazelle },
  { id: 'kangaroo', label: 'Kangaroo', emoji: '🦘', speedKmh: 70, reward: 4800, Render: Kangaroo },
];

function Cloud({ x, y, scale, duration, delay }: { x: number; y: number; scale: number; duration: number; delay: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g className="cloud" style={{ animationDuration: `${duration}s`, animationDelay: `${delay}s` }}>
        <ellipse cx="0" cy="0" rx="38" ry="11" fill="white" opacity="0.95" />
        <ellipse cx="-18" cy="-5" rx="22" ry="9" fill="white" opacity="0.92" />
        <ellipse cx="16" cy="-3" rx="26" ry="10" fill="white" opacity="0.9" />
        <ellipse cx="-2" cy="-9" rx="14" ry="7" fill="white" opacity="0.88" />
      </g>
    </g>
  );
}

function Bird({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g className="bird-wing" style={{ transformOrigin: 'center' }}>
        <path d="M -8 0 Q -4 -4 0 0 Q 4 -4 8 0" stroke="#3a2a18" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
}

function Tree({ x, h, colors }: { x: number; h: number; colors: { main: string; mid: string; top: string } }) {
  const baseY = GROUND_Y - 2;
  const topY = baseY - h;
  return (
    <g>
      <rect x={x - 4} y={topY + 20} width="8" height={h - 20} fill="#3e2a18" />
      <rect x={x - 5} y={topY + 20} width="2" height={h - 20} fill="#2a1a0a" opacity="0.5" />
      <line x1={x} y1={topY + 30} x2={x - 14} y2={topY + 20} stroke="#3e2a18" strokeWidth="2.5" />
      <line x1={x} y1={topY + 32} x2={x + 14} y2={topY + 22} stroke="#3e2a18" strokeWidth="2.5" />
      <ellipse cx={x} cy={topY + 10} rx="42" ry="16" fill={colors.main} />
      <ellipse cx={x - 18} cy={topY + 6} rx="24" ry="11" fill={colors.mid} />
      <ellipse cx={x + 18} cy={topY + 14} rx="26" ry="12" fill={colors.mid} />
      <ellipse cx={x - 4} cy={topY - 2} rx="20" ry="9" fill={colors.top} />
      <ellipse cx={x + 8} cy={topY + 4} rx="14" ry="7" fill={colors.top} />
    </g>
  );
}

function PineTree({ x, h, colors }: { x: number; h: number; colors: { main: string; mid: string; top: string } }) {
  // Conifer — stacked triangular tiers narrowing toward the top.
  const baseY = GROUND_Y - 2;
  const topY = baseY - h;
  return (
    <g>
      <rect x={x - 4} y={baseY - 14} width="8" height="14" fill="#3e2a18" />
      {/* triangle tiers stacked */}
      <polygon points={`${x - 26},${baseY - 14} ${x},${baseY - 36} ${x + 26},${baseY - 14}`} fill={colors.main} />
      <polygon points={`${x - 22},${baseY - 30} ${x},${baseY - 54} ${x + 22},${baseY - 30}`} fill={colors.mid} />
      <polygon points={`${x - 18},${baseY - 48} ${x},${baseY - 72} ${x + 18},${baseY - 48}`} fill={colors.top} />
      {/* highest tip if tall enough */}
      {h > 100 && (
        <polygon points={`${x - 14},${baseY - 66} ${x},${topY - 2} ${x + 14},${baseY - 66}`} fill={colors.top} />
      )}
    </g>
  );
}

function Cactus({ x, groundY }: { x: number; groundY: number }) {
  return (
    <g>
      {/* main trunk */}
      <rect x={x - 6} y={groundY - 48} width="12" height="48" rx="4" fill="#3f5e22" />
      <rect x={x - 6} y={groundY - 48} width="3" height="48" fill="#557d2e" />
      {/* left arm */}
      <path d={`M ${x - 6} ${groundY - 30} q -12 -2 -12 -12 l 0 -16 l 6 0 l 0 14 q 4 4 4 14`} fill="#3f5e22" />
      {/* right arm */}
      <path d={`M ${x + 6} ${groundY - 36} q 12 -2 12 -12 l 0 -20 l 6 0 l 0 18 q -4 4 -4 14`} fill="#3f5e22" />
      {/* ridges */}
      <g stroke="#2a4218" strokeWidth="0.7" opacity="0.8">
        <line x1={x - 2} y1={groundY - 48} x2={x - 2} y2={groundY - 2} />
        <line x1={x + 2} y1={groundY - 48} x2={x + 2} y2={groundY - 2} />
      </g>
      {/* spines */}
      <g stroke="#fff8d8" strokeWidth="0.5" opacity="0.7">
        <line x1={x} y1={groundY - 40} x2={x} y2={groundY - 38} />
        <line x1={x} y1={groundY - 30} x2={x} y2={groundY - 28} />
        <line x1={x} y1={groundY - 18} x2={x} y2={groundY - 16} />
      </g>
      {/* top flower */}
      <circle cx={x} cy={groundY - 49} r="4" fill="#ffd140" />
      <circle cx={x} cy={groundY - 49} r="2" fill="#ff6890" />
    </g>
  );
}

function GrassTuft({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} className="grass-tuft" style={{ transformOrigin: 'bottom' }}>
      <line x1="0" y1="0" x2="-3" y2="-10" stroke="#5d7d2c" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="0" y1="0" x2="0" y2="-13" stroke="#5d7d2c" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="0" y1="0" x2="3" y2="-10" stroke="#6f8f3a" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="0" y1="0" x2="5" y2="-7" stroke="#6f8f3a" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="0" y1="0" x2="-5" y2="-7" stroke="#5d7d2c" strokeWidth="1.2" strokeLinecap="round" />
    </g>
  );
}

function DustPuffs({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle className="dust" cx="0" cy="0" r="4" fill="#d6c098" style={{ animationDelay: '0s' }} />
      <circle className="dust" cx="-5" cy="-2" r="3.5" fill="#d6c098" style={{ animationDelay: '0.18s' }} />
      <circle className="dust" cx="-10" cy="0" r="3" fill="#cbb585" style={{ animationDelay: '0.36s' }} />
      <circle className="dust" cx="-3" cy="2" r="2.5" fill="#d6c098" style={{ animationDelay: '0.54s' }} />
    </g>
  );
}

const TREES = [
  { x: 60, h: 110 },
  { x: 200, h: 95 },
  { x: 360, h: 115 },
  { x: 510, h: 100 },
  { x: 650, h: 105 },
  { x: 770, h: 88 },
];

const CLOUDS = [
  { x: 80, y: 70, scale: 1, duration: 55, delay: 0 },
  { x: 320, y: 50, scale: 0.7, duration: 70, delay: -15 },
  { x: 560, y: 85, scale: 0.85, duration: 60, delay: -30 },
  { x: -150, y: 105, scale: 1.1, duration: 75, delay: -50 },
];

const BIRDS = [
  { x: 180, y: 100, scale: 1.2 },
  { x: 220, y: 115, scale: 0.9 },
  { x: 250, y: 105, scale: 1.0 },
];

const GRASS_TUFTS: { x: number; y: number }[] = [];
for (let i = 0; i < 36; i++) {
  const x = 5 + i * 22 + (i % 3) * 3;
  const y = H - 6 + ((i * 7) % 4) - 2;
  GRASS_TUFTS.push({ x, y });
}

export function ChaseArena({ creature, stats, generation = 1, onFinish }: Props) {
  const E0 = Math.max(1, stats.enduranceKm * 1.5);

  // Biome — the user picks. Difficulty + reward both scale with the
  // biome. Generations layer additional difficulty on top (older
  // generations face slightly faster prey via genBonus).
  const [biomeId, setBiomeId] = useState<ChaseBiomeId>('savanna');
  const env = CHASE_BIOMES.find((b) => b.id === biomeId) ?? CHASE_BIOMES[0];
  const genBonus = (generation - 1) * 1.5;

  const [preyId, setPreyId] = useState<PreyId>('gazelle');
  const prey = PREYS.find((p) => p.id === preyId)!;
  const preySpeedKmh = Math.round(prey.speedKmh + env.preyKmhBonus + genBonus);
  const scaledReward = Math.round(prey.reward * env.rewardMult);

  const [playerDist, setPlayerDist] = useState(0);
  const [gazelleDist, setGazelleDist] = useState(START_GAP_M);
  const [energy, setEnergy] = useState(E0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [pace, setPace] = useState<ChasePace>('sprint');
  const paceRef = useRef<ChasePace>('sprint');
  const elapsedRef = useRef(0);

  const energyRef = useRef(E0);
  const playerRef = useRef(0);
  const gazelleRef = useRef(START_GAP_M);
  const timerRef = useRef<number | null>(null);

  function reset() {
    energyRef.current = E0;
    playerRef.current = 0;
    gazelleRef.current = START_GAP_M;
    elapsedRef.current = 0;
    paceRef.current = 'sprint';
    setEnergy(E0);
    setPlayerDist(0);
    setGazelleDist(START_GAP_M);
    setPace('sprint');
  }

  function pickPace(p: ChasePace) {
    paceRef.current = p;
    setPace(p);
  }

  function start() {
    reset();
    setDone(false);
    setRunning(true);
  }

  function stop(o: ChaseOutcome) {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRunning(false);
    setDone(true);
    onFinish(o);
  }

  useEffect(() => {
    if (!running) return;
    const dt = TICK_MS / 1000;
    const brainBonus = 1 + creature.brainTier * 0.04;
    const comboSpeedMult = comboEffects(creature).chaseSpeedMult ?? 1;
    const topMps = (stats.topSpeedKmh / 3.6) * brainBonus * comboSpeedMult;
    const preyMps = preySpeedKmh / 3.6;
    const drainPerSec = 1.0 * (creature.warmBlooded ? 1 : 1.5);

    timerRef.current = window.setInterval(() => {
      elapsedRef.current += dt;
      // PACE MODIFIERS
      // sprint: 1.0× speed, 1.0× drain (cheetah-style — quick burst)
      // pace:   0.85× speed, 0.55× drain (wolf endurance hunt)
      // burst:  1.3× speed for first 4s, then 0.7× — but drain stays at 1.6×
      //         throughout, like a cheetah blowing its ATP budget.
      let speedMult = 1.0;
      let drainMult = 1.0;
      const t = elapsedRef.current;
      switch (paceRef.current) {
        case 'sprint':
          speedMult = 1.0; drainMult = 1.0; break;
        case 'pace':
          speedMult = 0.85; drainMult = 0.55; break;
        case 'burst':
          speedMult = t < 4 ? 1.3 : 0.7;
          drainMult = 1.6;
          break;
      }

      const exhausted = energyRef.current <= 0;
      const playerV = exhausted ? topMps * 0.25 : topMps * speedMult;
      if (!exhausted) energyRef.current -= drainPerSec * drainMult * dt;

      playerRef.current += playerV * dt;
      gazelleRef.current += preyMps * dt;

      setEnergy(energyRef.current);
      setPlayerDist(playerRef.current);
      setGazelleDist(gazelleRef.current);

      if (playerRef.current >= gazelleRef.current) {
        stop({ won: true, reason: 'caught', preyId: prey.id, reward: scaledReward, biome: env.id });
        return;
      }
      if (gazelleRef.current >= TRACK_M + START_GAP_M) {
        const reason: ChaseOutcome['reason'] = exhausted
          ? 'lost-stamina'
          : topMps <= preyMps
            ? 'lost-speed'
            : 'lost-distance';
        stop({ won: false, reason, biome: env.id });
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
  }, [stats.enduranceKm, preyId]);

  // Camera: player pinned on screen, prey at visible gap, scenery scrolls.
  // Before the chase starts, both creatures rest closer to the left so the
  // pre-run scene reads as a starting line.
  const gapPx = Math.max(0, Math.min(W - PLAYER_X - 70, (gazelleDist - playerDist) * GAP_SCALE));
  const playerX = running ? PLAYER_X : 90;
  const gazelleX = running ? PLAYER_X + gapPx : 90 + START_GAP_M * GAP_SCALE;
  const scrollX = running ? (playerDist * SCROLL_SCALE) % W : 0;
  const energyShown = running || done ? energy : E0;

  return (
    <div className="arena">
      <h2>The Chase — {env.emoji} {env.label} <small className="arena-env">· {env.difficultyLabel} · ×{env.rewardMult.toFixed(1)} reward</small></h2>
      <p className="arena-help">{env.description} Catch the {prey.label.toLowerCase()} ({preySpeedKmh} km/h) before it covers {TRACK_M} m. <strong>Win: +{scaledReward.toLocaleString()} kcal.</strong></p>

      {(() => {
        const combo = getActiveCombo(creature);
        const mult = combo?.effects.chaseSpeedMult;
        if (!combo || mult == null) return null;
        return (
          <div className="combo-badge">
            <span className="combo-badge-emoji">{combo.emoji}</span>
            <span className="combo-badge-text"><strong>{combo.name}</strong> · ×{mult.toFixed(2)} speed</span>
          </div>
        );
      })()}

      <div className="prey-tabs">
        {CHASE_BIOMES.map((b) => (
          <button
            key={b.id}
            type="button"
            className={`prey-tab${biomeId === b.id ? ' active' : ''}`}
            onClick={() => !running && setBiomeId(b.id)}
            disabled={running}
            title={`${b.label} · ${b.difficultyLabel} · ×${b.rewardMult.toFixed(1)} reward`}
          >
            <span className="prey-emoji">{b.emoji}</span>
            <span className="prey-name">
              {b.label}
              <small> {b.difficultyLabel} · ×{b.rewardMult.toFixed(1)}</small>
            </span>
          </button>
        ))}
      </div>

      <div className="prey-tabs">
        {PREYS.map((p) => {
          const r = Math.round(p.reward * env.rewardMult);
          return (
            <button
              key={p.id}
              type="button"
              className={`prey-tab${preyId === p.id ? ' active' : ''}`}
              onClick={() => !running && setPreyId(p.id)}
              disabled={running}
              title={`${p.label} — ${p.speedKmh} km/h · ${r} kcal`}
            >
              <span className="prey-emoji">{p.emoji}</span>
              <span className="prey-name">
                {p.label}
                <small> {p.speedKmh + env.preyKmhBonus + genBonus} km/h · {r} kcal</small>
              </span>
            </button>
          );
        })}
      </div>

      {/* PACE PICKER — how the creature chases. */}
      <div className="drought-activity-label">
        <strong>How are you chasing?</strong> <small>(switch any time during the run)</small>
      </div>
      <div className="prey-tabs">
        {([
          { id: 'sprint' as const, emoji: '🏃', label: 'Full sprint',  sub: 'balanced',                title: 'Full speed at normal stamina cost. The default cheetah-style chase.' },
          { id: 'pace'   as const, emoji: '🐺', label: 'Pace yourself', sub: 'slow · saves stamina',    title: 'Endurance hunt like a wolf. 0.85× speed but only 0.55× stamina drain — you can chase forever.' },
          { id: 'burst'  as const, emoji: '🐆', label: 'Cheetah burst', sub: 'fast · then crash',       title: 'Big 4-second sprint at 1.3× speed, then you slow to 0.7×. Drain stays at 1.6× the whole time — only works if you can close fast.' },
        ]).map((p) => (
          <button
            key={p.id}
            type="button"
            className={`prey-tab${pace === p.id ? ' active' : ''}`}
            onClick={() => pickPace(p.id)}
            title={p.title}
          >
            <span className="prey-emoji">{p.emoji}</span>
            <span className="prey-name">
              {p.label}
              <small> {p.sub}</small>
            </span>
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="chase-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={env.sky[0]} />
            <stop offset="0.55" stopColor={env.sky[1]} />
            <stop offset="1" stopColor={env.sky[2]} />
          </linearGradient>
          <linearGradient id="chase-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={env.ground[0]} />
            <stop offset="0.5" stopColor={env.ground[1]} />
            <stop offset="1" stopColor={env.ground[2]} />
          </linearGradient>
          <linearGradient id="far-hill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={env.hill} />
            <stop offset="1" stopColor={env.hill2} />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width={W} height={GROUND_Y} fill="url(#chase-sky)" />

        {env.stars && (
          <g fill="white">
            {NIGHT_STARS.map((s, i) => (
              <circle key={i} cx={s.x} cy={s.y} r={s.r} opacity={0.7 + ((i * 17) % 30) / 100} />
            ))}
          </g>
        )}

        <g className="sun-rays" style={{ transformOrigin: `${W - 130}px 70px` }}>
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const r1 = 40;
            const r2 = 58 + (i % 2 === 0 ? 6 : 0);
            return (
              <line
                key={i}
                x1={W - 130 + Math.cos(angle) * r1}
                y1={70 + Math.sin(angle) * r1}
                x2={W - 130 + Math.cos(angle) * r2}
                y2={70 + Math.sin(angle) * r2}
                stroke={env.sun}
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.55"
              />
            );
          })}
        </g>
        <circle cx={W - 130} cy="70" r="40" fill={env.sunHalo} opacity="0.35" />
        <circle cx={W - 130} cy="70" r="32" fill={env.sunHalo} opacity="0.55" />
        <circle cx={W - 130} cy="70" r="26" fill={env.sun} />
        <ellipse cx={W - 134} cy="64" rx="9" ry="6" fill={env.sun} opacity="0.6" />
        <ellipse cx={W - 138} cy="60" rx="5" ry="3" fill="white" opacity="0.5" />

        {CLOUDS.map((c, i) => (
          <Cloud key={i} {...c} />
        ))}

        {BIRDS.map((b, i) => (
          <Bird key={i} {...b} />
        ))}

        <path
          d={`M 0 ${GROUND_Y - 40} Q ${W * 0.2} ${GROUND_Y - 75} ${W * 0.4} ${GROUND_Y - 50} T ${W * 0.8} ${GROUND_Y - 55} T ${W} ${GROUND_Y - 40} L ${W} ${GROUND_Y} L 0 ${GROUND_Y} Z`}
          fill="url(#far-hill)"
          opacity="0.85"
        />
        <path
          d={`M 0 ${GROUND_Y - 15} Q ${W * 0.25} ${GROUND_Y - 38} ${W * 0.5} ${GROUND_Y - 18} T ${W} ${GROUND_Y - 22} L ${W} ${GROUND_Y} L 0 ${GROUND_Y} Z`}
          fill="#c89a55"
        />

        <rect x="0" y={GROUND_Y} width={W} height={H - GROUND_Y} fill="url(#chase-ground)" />

        {/* FOREGROUND PARALLAX LAYER — scrolls left at the player's speed
            so the chase actually feels like motion. Each prop is rendered
            twice (offset 0 and +W) so the strip loops seamlessly as the
            transform wraps from 0..W back to 0. */}
        <g transform={`translate(${-scrollX} 0)`}>
          {[0, W].map((dx) => (
            <g key={dx} transform={`translate(${dx} 0)`}>
              {/* Biome-specific scene props */}
              {env.pines ? (
                TREES.map((t, i) => <PineTree key={i} {...t} colors={{ main: env.treeMain, mid: env.treeMid, top: env.treeTop }} />)
              ) : env.cacti ? (
                [{ x: 60 }, { x: 200 }, { x: 360 }, { x: 510 }, { x: 650 }, { x: 770 }].map((c, i) => (
                  <Cactus key={i} x={c.x} groundY={GROUND_Y} />
                ))
              ) : (
                TREES.map((t, i) => <Tree key={i} {...t} colors={{ main: env.treeMain, mid: env.treeMid, top: env.treeTop }} />)
              )}

              {/* SNOW DRIFTS for tundra */}
              {env.snow && (
                <g>
                  <ellipse cx="120" cy={GROUND_Y + 12} rx="80" ry="8" fill="white" opacity="0.75" />
                  <ellipse cx="400" cy={GROUND_Y + 14} rx="100" ry="10" fill="white" opacity="0.7" />
                  <ellipse cx="680" cy={GROUND_Y + 11} rx="90" ry="8" fill="white" opacity="0.75" />
                </g>
              )}

              {/* GROUND ROCKS */}
              {Array.from({ length: 14 }).map((_, i) => {
                const rx = 30 + i * 56;
                return (
                  <ellipse key={i} cx={rx} cy={GROUND_Y + 18 + (i % 3) * 4} rx={5 + (i % 3) * 2} ry="2" fill="#7a5a32" opacity="0.4" />
                );
              })}

              {/* GRASS TUFTS */}
              {GRASS_TUFTS.map((g, i) => (
                <GrassTuft key={i} {...g} />
              ))}
            </g>
          ))}
        </g>

        {/* Falling snowflakes — fixed to screen (atmospheric, not parallax) */}
        {env.snow && (
          <g fill="white" opacity="0.85">
            {Array.from({ length: 20 }).map((_, i) => (
              <circle
                key={i}
                cx={(i * 53 + 20) % W}
                cy={(i * 31) % GROUND_Y}
                r={1.5}
                className="snowflake"
                style={{ animationDuration: `${4 + (i % 4)}s`, animationDelay: `-${i * 0.4}s` }}
              />
            ))}
          </g>
        )}

        {/* HEAT SHIMMER for desert — also screen-fixed */}
        {env.id === 'desert' && (
          <g className="heat" stroke="#ffe9a0" strokeWidth="1" opacity="0.4" strokeDasharray="3 5">
            <line x1="40" y1={GROUND_Y - 8} x2="240" y2={GROUND_Y - 8} />
            <line x1="320" y1={GROUND_Y - 10} x2="600" y2={GROUND_Y - 10} />
            <line x1="640" y1={GROUND_Y - 6} x2="780" y2={GROUND_Y - 6} />
          </g>
        )}

        {/* SPEED STREAKS — short horizontal lines whooshing past at ground
            level during the run, sells the velocity. */}
        {running && (
          <g stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" strokeLinecap="round">
            {Array.from({ length: 7 }).map((_, i) => {
              const streakX = ((i * 137 - scrollX * 1.4) % W + W) % W;
              const streakY = GROUND_Y - 30 - (i % 3) * 18;
              return <line key={i} x1={streakX} y1={streakY} x2={streakX + 28} y2={streakY} />;
            })}
          </g>
        )}

        <rect x="10" y="10" width="280" height="28" fill="rgba(255,255,255,0.92)" rx="6" stroke="#bbb" />
        <text x="22" y="29" fontSize="13" fill="#333">stamina</text>
        <rect x="86" y="18" width="194" height="12" fill="#eee" stroke="#999" />
        <rect
          x="86"
          y="18"
          width={Math.max(0, 194 * (energyShown / E0))}
          height="12"
          fill={energyShown > 0 ? '#5cc46a' : '#c44'}
        />

        {running && <DustPuffs x={gazelleX - 18} y={GROUND_Y - 4} />}
        <g transform={`translate(${gazelleX} ${GROUND_Y})`}>
          <g className="bob-run">{prey.Render()}</g>
        </g>

        {running && <DustPuffs x={playerX - 22} y={GROUND_Y - 2} />}

        {/* HYPERSONIC BLUR — visible streaks trailing behind the
            creature when running with the hypersonic trait. Stacks
            with the existing speed-streak background. */}
        {running && creature.hybrids.includes('hypersonic') && (
          <g stroke="#aef0ff" strokeWidth="3" strokeLinecap="round" opacity="0.7">
            {[0, 8, 18, 30, 44].map((dx, i) => (
              <line key={i}
                x1={playerX - 50 - dx}
                y1={GROUND_Y - 30 + (i % 2) * 8}
                x2={playerX - 90 - dx}
                y2={GROUND_Y - 28 + (i % 2) * 8}
                strokeWidth={4 - i * 0.5}
                opacity={0.85 - i * 0.15}
              />
            ))}
            <text x={playerX - 70} y={GROUND_Y - 56} fontSize="14" fill="#3a85b8" fontWeight="700">⚡ hypersonic</text>
          </g>
        )}

        {/* WINGS GLIDE — if the creature has wings and is light enough,
            visible wing-flap arc + altitude bob. */}
        {running && creature.hybrids.includes('wings') && stats.massKg <= 5 && (
          <g opacity="0.8" className="bob-breathe" style={{ transformOrigin: `${playerX}px ${GROUND_Y - 70}px` }}>
            <text x={playerX - 30} y={GROUND_Y - 76} fontSize="22">🪽</text>
            <text x={playerX + 12} y={GROUND_Y - 76} fontSize="22" transform={`scale(-1 1) translate(${-2 * (playerX + 12)} 0)`}>🪽</text>
          </g>
        )}

        {hasBespokeShape(creature) ? (
          <BespokeInScene creature={creature} x={playerX - 65} y={GROUND_Y - 88} width={130} height={100} animate="run" />
        ) : (
          <g transform={`translate(${playerX} 0)`}>
            <CreatureBody creature={creature} cx={0} footY={GROUND_Y} scale={0.55} animate="run" />
          </g>
        )}
      </svg>
      <div className="arena-controls">
        {!running && !done && (
          <button className="btn" onClick={start} type="button">
            Start the chase
          </button>
        )}
        {running && (
          <button className="btn btn-secondary" onClick={() => stop({ won: false, reason: 'lost-distance' })} type="button">
            Give up
          </button>
        )}
        {done && (
          <button className="btn" onClick={start} type="button">
            Run again
          </button>
        )}
      </div>
    </div>
  );
}
