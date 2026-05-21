import type { CSSProperties } from 'react';
import type { CreatureStats } from '../physics';
import { explainStats, vigilanceTaxFraction } from '../physics';
import type { Creature } from '../types';
import type { StatKey } from '../data/statAdjusters';

interface Props {
  creature: Creature;
  stats: CreatureStats;
  onAdjust?: (stat: StatKey, dir: 1 | -1) => void;
}

interface StatConfig {
  icon: string;
  label: string;
  color: string;
  riskColor?: string;
  reverse?: boolean;
}

const CONFIG = {
  mass:      { icon: '🏋️', label: 'Body mass',        color: '#e07b5b' },
  food:      { icon: '🍔', label: 'Food / day',       color: '#e89a3a' },
  vigil:     { icon: '👁',  label: 'Vigilance tax',    color: '#a880e8' },
  speed:     { icon: '💨', label: 'Top speed',        color: '#d65a5a' },
  endurance: { icon: '🏃', label: 'Endurance',        color: '#5cc46a' },
  cold:      { icon: '🥶', label: 'Cold tolerance',   color: '#5b9fe0' },
  lifespan:  { icon: '⏳', label: 'Lifespan',          color: '#8a6bbe' },
  bone:      { icon: '🦴', label: 'Bone-break risk', color: '#d65a5a', riskColor: '#5cc46a', reverse: true },
  heart:     { icon: '💗', label: 'Heart rate',       color: '#e88a96' },
  brain:     { icon: '🧠', label: 'Brain size',       color: '#a880e8' },
} as const satisfies Record<string, StatConfig>;

const MAX = {
  speed: 200,
  endurance: 100,
  cold: 100,
  lifespan: 80,
  bone: 100,
  heartLogMax: Math.log10(800),
  heartLogMin: Math.log10(4),
};

function logFrac(value: number, min: number, max: number): number {
  const v = Math.max(min, Math.min(max, value));
  const lo = Math.log10(min);
  const hi = Math.log10(max);
  return (Math.log10(v) - lo) / (hi - lo);
}

export function StatsPanel({ creature, stats, onAdjust }: Props) {
  const ex = explainStats(creature, stats);

  const massFrac = logFrac(stats.massKg, 0.01, 100000);
  const foodFrac = logFrac(Math.max(0.001, stats.foodKgPerDay), 0.001, 200);
  const speedFrac = stats.topSpeedKmh / MAX.speed;
  const enduranceFrac = stats.enduranceKm / MAX.endurance;
  const coldFrac = stats.coldTolerance / MAX.cold;
  const lifeFrac = Math.min(1, stats.lifespanYears / MAX.lifespan);
  const boneFrac = stats.boneBreakRisk / MAX.bone;
  const heartFrac =
    (Math.log10(Math.max(4, stats.heartRateBpm)) - MAX.heartLogMin) /
    (MAX.heartLogMax - MAX.heartLogMin);

  const heartPeriod = Math.max(0.25, 60 / Math.max(1, stats.heartRateBpm));

  return (
    <div className="stats">
      <h2>Live stats</h2>

      <div className="stats-group">
        <StatRow stat="mass" cfg={CONFIG.mass} value={fmtMass(stats.massKg)} bar={massFrac} info={ex.massKg} onAdjust={onAdjust} />
        <StatRow stat="food" cfg={CONFIG.food} value={`${fmtMass(stats.foodKgPerDay)}`} sub={`${Math.round(stats.foodKcalPerDay)} kcal`} bar={foodFrac} info={ex.foodKcalPerDay} onAdjust={onAdjust} />
        <StatRow
          stat="vigil"
          cfg={CONFIG.vigil}
          value={`${vigilanceTaxFraction(creature) >= 0 ? '+' : ''}${(vigilanceTaxFraction(creature) * 100).toFixed(0)}%`}
          bar={Math.abs(vigilanceTaxFraction(creature)) / 0.3}
          info={ex.vigilance}
          onAdjust={onAdjust}
        />
      </div>

      <div className="stats-group-label">Movement</div>
      <div className="stats-group">
        <StatRow stat="speed" cfg={CONFIG.speed} value={`${stats.topSpeedKmh} km/h`} bar={speedFrac} info={ex.topSpeedKmh} onAdjust={onAdjust} />
        <StatRow stat="endurance" cfg={CONFIG.endurance} value={`${stats.enduranceKm} km`} bar={enduranceFrac} info={ex.enduranceKm} onAdjust={onAdjust} />
      </div>

      <div className="stats-group-label">Survival</div>
      <div className="stats-group">
        <StatRow stat="cold" cfg={CONFIG.cold} value={`${Math.round(stats.coldTolerance)}`} bar={coldFrac} info={ex.coldTolerance} onAdjust={onAdjust} />
        <StatRow stat="lifespan" cfg={CONFIG.lifespan} value={`${stats.lifespanYears} yrs`} bar={lifeFrac} info={ex.lifespanYears} onAdjust={onAdjust} />
        <StatRow stat="bone" cfg={CONFIG.bone} value={`${Math.round(stats.boneBreakRisk)}`} bar={boneFrac} info={ex.boneBreakRisk} risk onAdjust={onAdjust} />
        <StatRow
          stat="heart"
          cfg={CONFIG.heart}
          value={`${stats.heartRateBpm} bpm`}
          bar={heartFrac}
          info={ex.heartRateBpm}
          beatPeriod={heartPeriod}
          onAdjust={onAdjust}
        />
        <StatRow
          stat="brain"
          cfg={CONFIG.brain}
          value={fmtBrain(stats.brainMassGrams)}
          sub={`EQ ${stats.eq.toFixed(1)}×`}
          bar={Math.min(1, stats.eq / 7)}
          info={ex.brain}
          onAdjust={onAdjust}
        />
      </div>
    </div>
  );
}

function fmtBrain(grams: number): string {
  if (grams < 0.1) return `${(grams * 1000).toFixed(0)} mg`;
  if (grams < 1) return `${grams.toFixed(2)} g`;
  if (grams < 10) return `${grams.toFixed(1)} g`;
  if (grams < 1000) return `${Math.round(grams)} g`;
  return `${(grams / 1000).toFixed(2)} kg`;
}

function StatRow({
  stat,
  cfg,
  value,
  sub,
  bar,
  info,
  risk = false,
  beatPeriod,
  onAdjust,
}: {
  stat: StatKey;
  cfg: StatConfig;
  value: string;
  sub?: string;
  bar: number;
  info?: string;
  risk?: boolean;
  beatPeriod?: number;
  onAdjust?: (stat: StatKey, dir: 1 | -1) => void;
}) {
  const pct = Math.max(0, Math.min(1, bar)) * 100;
  const barColor = risk ? riskGradient(bar) : cfg.color;
  const iconStyle: CSSProperties | undefined = beatPeriod
    ? ({ animationDuration: `${beatPeriod}s` } as CSSProperties)
    : undefined;
  return (
    <div className="stat-card">
      <div className="stat-card-head">
        <span
          className={`stat-icon${beatPeriod ? ' stat-icon-beat' : ''}`}
          style={iconStyle}
        >
          {cfg.icon}
        </span>
        <span className="stat-card-label">
          {cfg.label}
          {info && (
            <span className="stat-info" tabIndex={0}>
              ℹ
              <span className="stat-tooltip">{info}</span>
            </span>
          )}
        </span>
        {onAdjust && (
          <span className="stat-adjust">
            <button type="button" className="stat-adjust-btn" onClick={() => onAdjust(stat, -1)} aria-label={`Decrease ${cfg.label}`}>
              −
            </button>
            <button type="button" className="stat-adjust-btn" onClick={() => onAdjust(stat, 1)} aria-label={`Increase ${cfg.label}`}>
              +
            </button>
          </span>
        )}
        <span className="stat-card-value">
          {value}
          {sub && <small> · {sub}</small>}
        </span>
      </div>
      <div className="stat-card-bar">
        <div className="stat-card-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
      </div>
    </div>
  );
}

function riskGradient(frac: number): string {
  if (frac < 0.33) return '#5cc46a';
  if (frac < 0.66) return '#e89a3a';
  return '#d65a5a';
}

function fmtMass(kg: number): string {
  if (kg < 0.001) return `${Math.round(kg * 1_000_000)} mg`;
  if (kg < 1) return `${(kg * 1000).toFixed(0)} g`;
  if (kg < 10) return `${kg.toFixed(1)} kg`;
  if (kg < 1000) return `${Math.round(kg)} kg`;
  return `${(kg / 1000).toFixed(1)} t`;
}
