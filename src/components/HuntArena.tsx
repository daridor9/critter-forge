import { useState } from 'react';
import type { CreatureStats } from '../physics';
import { sizeToMass } from '../physics';
import type { Creature } from '../types';
import { CreatureBody } from './CreatureSVG';

export type HuntOutcome = {
  won: boolean;
  reason: 'hidden' | 'outran' | 'tanked' | 'fought' | 'caught';
};

interface Props {
  creature: Creature;
  stats: CreatureStats;
  onFinish: (o: HuntOutcome) => void;
}

type EnvId = 'savanna' | 'forest' | 'mountain' | 'desert' | 'ocean';
type Strategy = 'hide' | 'run' | 'fight';

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

const PREDATORS: Record<EnvId, Predator> = {
  savanna: {
    envName: 'Savanna', envEmoji: '🌾',
    name: 'Lion', emoji: '🦁', topKmh: 80, perception: 55, bite: 75,
    sky: ['#9fd4ee', '#f8d68a'], ground: ['#f3d27d', '#c9a05a'],
    envNote: 'Open grassland. Lions run in pride; long sightlines.',
  },
  forest: {
    envName: 'Forest', envEmoji: '🌳',
    name: 'Wolf', emoji: '🐺', topKmh: 65, perception: 70, bite: 55,
    sky: ['#7fa663', '#cfd7a0'], ground: ['#7a6a3a', '#54472a'],
    envNote: 'Dense trees + scent tracking. Wolves work in packs.',
  },
  mountain: {
    envName: 'Mountain', envEmoji: '🏔',
    name: 'Snow Leopard', emoji: '🐆', topKmh: 60, perception: 85, bite: 60,
    sky: ['#b8c8d4', '#e5eef3'], ground: ['#c0ccd3', '#8089a0'],
    envNote: 'Snow + cliffs. Ambush hunter, near-invisible against rock.',
  },
  desert: {
    envName: 'Desert', envEmoji: '🏜',
    name: 'Hyena', emoji: '🐺', topKmh: 60, perception: 50, bite: 90,
    sky: ['#ffd589', '#fbe9b0'], ground: ['#e3b06a', '#a07a45'],
    envNote: 'Bone-crushing bite force, but distracted in heat.',
  },
  ocean: {
    envName: 'Ocean', envEmoji: '🌊',
    name: 'Shark', emoji: '🦈', topKmh: 50, perception: 65, bite: 95,
    sky: ['#74c4dc', '#2a5a85'], ground: ['#2a5a85', '#0c2a45'],
    envNote: 'Electroreception + smell. Bite ignores most armor.',
  },
};

function stealthScore(c: Creature): number {
  const m = sizeToMass(c.sizeUnit);
  let s = 55 - Math.log10(Math.max(0.01, m) + 0.1) * 14;
  if (c.hybrids.includes('camouflage')) s += 30;
  if (c.defenseTier === 1) s += 5;
  if (c.defenseTier === 2) s -= 15;
  if (c.sensorTier === 2) s += 10;
  s += c.brainTier * 5;
  if (c.bodyPlan === 'fish') s -= 25;
  if (c.bodyPlan === 'bird') s += 8;
  return Math.max(0, Math.min(100, s));
}

function fightPower(c: Creature, s: CreatureStats): number {
  let p = 5;
  if (c.hybrids.includes('venom')) p += 60;
  if (c.hybrids.includes('electric')) p += 70;
  if (c.defenseTier === 2) p += 30;
  if (s.massKg > 100) p += 15;
  if (s.massKg > 1000) p += 25;
  if (c.brainTier === 2) p += 8;
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

function confidence(margin: number): { label: string; cls: string } {
  if (margin > 15) return { label: 'likely win', cls: 'good' };
  if (margin > 0) return { label: 'close', cls: 'ok' };
  if (margin > -15) return { label: 'risky', cls: 'risky' };
  return { label: 'doomed', cls: 'bad' };
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
  const [done, setDone] = useState(false);

  const p = PREDATORS[envId];
  const hide = predictHide(creature, p);
  const run = predictRun(stats, p);
  const fight = predictFight(creature, stats, p);

  function play(strategy: Strategy) {
    const result =
      strategy === 'hide' ? hide :
      strategy === 'run' ? run :
      fight;
    const won = result.margin > 0;
    setDone(true);
    onFinish({ won, reason: reasonFor(strategy, won, creature) });
  }

  function reset() { setDone(false); }

  return (
    <div className="arena">
      <h2>The Hunt — encounter <small className="arena-env">· {p.envName}</small></h2>
      <p className="arena-help">{p.envNote}</p>

      <div className="prey-tabs">
        {(Object.entries(PREDATORS) as [EnvId, Predator][]).map(([id, def]) => (
          <button
            key={id}
            type="button"
            className={`prey-tab${envId === id ? ' active' : ''}`}
            onClick={() => { setEnvId(id); setDone(false); }}
            disabled={done}
            title={`${def.envName} — ${def.name}`}
          >
            <span className="prey-emoji">{def.envEmoji}</span>
            <span className="prey-name">{def.envName}<small> {def.emoji}</small></span>
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet">
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

        <g transform={`translate(${W * 0.28} 0)`}>
          <CreatureBody creature={creature} cx={0} footY={GROUND_Y} scale={0.32} animate="breathe" />
        </g>

        <g transform={`translate(${W * 0.72} ${GROUND_Y - 10})`}>
          <ellipse cx="0" cy="6" rx="34" ry="4" fill="rgba(0,0,0,0.25)" />
          <text x="0" y="0" fontSize="56" textAnchor="middle">{p.emoji}</text>
          <text x="0" y="22" fontSize="11" textAnchor="middle" fill="#333" fontWeight="700">{p.name}</text>
        </g>
      </svg>

      <div className="strategy-row">
        <StrategyButton
          icon="🫥" name="Hide" onClick={() => play('hide')}
          score={hide.score} opp={hide.opp} oppLabel="perception" margin={hide.margin}
          disabled={done}
        />
        <StrategyButton
          icon="🏃" name="Run" onClick={() => play('run')}
          score={run.score} opp={run.opp} oppLabel="speed" scoreSuffix=" km/h" margin={run.margin}
          disabled={done}
        />
        <StrategyButton
          icon="⚔️" name="Fight" onClick={() => play('fight')}
          score={fight.score} opp={fight.opp} oppLabel="bite" margin={fight.margin}
          disabled={done}
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
