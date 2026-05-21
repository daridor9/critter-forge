import { useState } from 'react';
import type { Creature } from '../types';
import { computeStats } from '../physics';
import { ANIMAL_DEX } from '../data/animalDex';
import { hybridCatalog } from '../data/hybrids';
import { CreatureSVG } from './CreatureSVG';

interface SavedCreature {
  id: string;
  name: string;
  creature: Creature;
}

const KEY = 'critter-forge:album';

function loadAlbum(): SavedCreature[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

interface Source {
  label: string;
  creature: Creature;
}

function gatherSources(currentCreature: Creature): Source[] {
  const out: Source[] = [{ label: `Current · ${currentCreature.name}`, creature: currentCreature }];
  for (const s of loadAlbum()) {
    out.push({ label: `Album · ${s.name}`, creature: s.creature });
  }
  for (const a of ANIMAL_DEX) {
    out.push({ label: `Dex · ${a.name}`, creature: a.creature });
  }
  return out;
}

interface Props {
  current: Creature;
  onClose: () => void;
}

export function CompareModal({ current, onClose }: Props) {
  const sources = gatherSources(current);
  const [a, setA] = useState<number>(0);
  const [b, setB] = useState<number>(Math.min(2, sources.length - 1));

  const cA = sources[a].creature;
  const cB = sources[b].creature;
  const sA = computeStats(cA);
  const sB = computeStats(cB);

  const rows: { label: string; a: string; b: string; aVal: number; bVal: number; higherIsBetter?: boolean }[] = [
    { label: 'Body mass', a: fmtMass(sA.massKg), b: fmtMass(sB.massKg), aVal: sA.massKg, bVal: sB.massKg },
    { label: 'Food / day', a: `${Math.round(sA.foodKcalPerDay)} kcal`, b: `${Math.round(sB.foodKcalPerDay)} kcal`, aVal: sA.foodKcalPerDay, bVal: sB.foodKcalPerDay },
    { label: 'Top speed', a: `${sA.topSpeedKmh} km/h`, b: `${sB.topSpeedKmh} km/h`, aVal: sA.topSpeedKmh, bVal: sB.topSpeedKmh, higherIsBetter: true },
    { label: 'Endurance', a: `${sA.enduranceKm} km`, b: `${sB.enduranceKm} km`, aVal: sA.enduranceKm, bVal: sB.enduranceKm, higherIsBetter: true },
    { label: 'Cold tolerance', a: `${Math.round(sA.coldTolerance)}`, b: `${Math.round(sB.coldTolerance)}`, aVal: sA.coldTolerance, bVal: sB.coldTolerance, higherIsBetter: true },
    { label: 'Lifespan', a: `${sA.lifespanYears} y`, b: `${sB.lifespanYears} y`, aVal: sA.lifespanYears, bVal: sB.lifespanYears, higherIsBetter: true },
    { label: 'Bone-break risk', a: `${Math.round(sA.boneBreakRisk)}`, b: `${Math.round(sB.boneBreakRisk)}`, aVal: sA.boneBreakRisk, bVal: sB.boneBreakRisk, higherIsBetter: false },
    { label: 'Heart rate', a: `${sA.heartRateBpm} bpm`, b: `${sB.heartRateBpm} bpm`, aVal: sA.heartRateBpm, bVal: sB.heartRateBpm },
  ];

  return (
    <div className="insight-overlay" onClick={onClose}>
      <div className="about-modal" onClick={(e) => e.stopPropagation()}>
        <div className="about-head">
          <h2>⚖️ Compare creatures</h2>
          <button className="about-close" type="button" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="about-content">
          <div className="compare-grid">
            <div className="compare-side">
              <select value={a} onChange={(e) => setA(Number(e.target.value))} className="compare-picker">
                {sources.map((s, i) => (
                  <option key={i} value={i}>{s.label}</option>
                ))}
              </select>
              <div className="compare-thumb"><CreatureSVG creature={cA} /></div>
              <div className="compare-name">{cA.name}</div>
              <div className="compare-tags">
                {cA.bodyPlan} · {cA.warmBlooded ? 'warm' : 'cold'}
                {cA.hybrids.length > 0 && (
                  <div className="compare-hybrids">
                    {cA.hybrids.map((h) => {
                      const info = hybridCatalog.find((x) => x.id === h);
                      return <span key={h} className="compare-hybrid">{info?.emoji} {info?.name}</span>;
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className="compare-side">
              <select value={b} onChange={(e) => setB(Number(e.target.value))} className="compare-picker">
                {sources.map((s, i) => (
                  <option key={i} value={i}>{s.label}</option>
                ))}
              </select>
              <div className="compare-thumb"><CreatureSVG creature={cB} /></div>
              <div className="compare-name">{cB.name}</div>
              <div className="compare-tags">
                {cB.bodyPlan} · {cB.warmBlooded ? 'warm' : 'cold'}
                {cB.hybrids.length > 0 && (
                  <div className="compare-hybrids">
                    {cB.hybrids.map((h) => {
                      const info = hybridCatalog.find((x) => x.id === h);
                      return <span key={h} className="compare-hybrid">{info?.emoji} {info?.name}</span>;
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <table className="compare-table-detail">
            <thead>
              <tr>
                <th>Stat</th>
                <th>{cA.name}</th>
                <th>{cB.name}</th>
                <th>Δ</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const aWins = r.higherIsBetter === true
                  ? r.aVal > r.bVal
                  : r.higherIsBetter === false
                    ? r.aVal < r.bVal
                    : false;
                const bWins = r.higherIsBetter === true
                  ? r.bVal > r.aVal
                  : r.higherIsBetter === false
                    ? r.bVal < r.aVal
                    : false;
                const diff = r.aVal - r.bVal;
                return (
                  <tr key={r.label}>
                    <td><strong>{r.label}</strong></td>
                    <td className={aWins ? 'won-text' : ''}>{r.a}{aWins ? ' ✓' : ''}</td>
                    <td className={bWins ? 'won-text' : ''}>{r.b}{bWins ? ' ✓' : ''}</td>
                    <td className="compare-delta">
                      {diff > 0 ? `+${formatDiff(diff)}` : diff < 0 ? formatDiff(diff) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
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

function formatDiff(n: number): string {
  const a = Math.abs(n);
  if (a >= 1000) return `${(n / 1000).toFixed(1)}k`;
  if (a >= 10) return `${Math.round(n)}`;
  return n.toFixed(1);
}
