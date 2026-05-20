import type { ReactNode } from 'react';
import type { CreatureStats } from '../physics';
import { explainStats } from '../physics';
import type { Creature } from '../types';

interface Props {
  creature: Creature;
  stats: CreatureStats;
}

export function StatsPanel({ creature, stats }: Props) {
  const ex = explainStats(creature, stats);
  return (
    <div className="stats">
      <h2>Live stats</h2>
      <StatRow label="Body mass" value={fmtMass(stats.massKg)} info={ex.massKg} />
      <StatRow label="Food / day" value={`${fmtMass(stats.foodKgPerDay)} (~${Math.round(stats.foodKcalPerDay)} kcal)`} info={ex.foodKcalPerDay} />
      <StatRow label="Top speed" value={`${stats.topSpeedKmh} km/h`} info={ex.topSpeedKmh} />
      <StatRow label="Endurance" value={`${stats.enduranceKm} km`} info={ex.enduranceKm} />
      <StatRow label="Cold tolerance" value={<Bar value={stats.coldTolerance} color="#5b9fe0" />} info={ex.coldTolerance} />
      <StatRow label="Lifespan" value={`${stats.lifespanYears} years`} info={ex.lifespanYears} />
      <StatRow label="Bone-break risk" value={<Bar value={stats.boneBreakRisk} color="#e0625b" />} info={ex.boneBreakRisk} />
      <StatRow label="Heart rate" value={`${stats.heartRateBpm} bpm`} info={ex.heartRateBpm} />
    </div>
  );
}

function StatRow({ label, value, info }: { label: string; value: ReactNode; info?: string }) {
  return (
    <div className="stat-row">
      <span className="stat-label">
        {label}
        {info && (
          <span className="stat-info" tabIndex={0}>
            ℹ
            <span className="stat-tooltip">{info}</span>
          </span>
        )}
      </span>
      <span className="stat-value">{value}</span>
    </div>
  );
}

function Bar({ value, color }: { value: number; color: string }) {
  return (
    <div className="bar-outer">
      <div className="bar-inner" style={{ width: `${value}%`, background: color }} />
      <span className="bar-text">{Math.round(value)}</span>
    </div>
  );
}

function fmtMass(kg: number): string {
  if (kg < 0.001) return `${Math.round(kg * 1_000_000)} mg`;
  if (kg < 1) return `${(kg * 1000).toFixed(0)} g`;
  if (kg < 10) return `${kg.toFixed(1)} kg`;
  if (kg < 1000) return `${Math.round(kg)} kg`;
  return `${(kg / 1000).toFixed(1)} t`;
}
