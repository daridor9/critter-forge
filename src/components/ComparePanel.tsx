import { realAnimals } from '../data/realAnimals';
import { animalPresets, presetFor } from '../data/animalPresets';
import type { CreatureStats } from '../physics';
import type { Creature } from '../types';

interface Props {
  stats: CreatureStats;
  onLoadPreset?: (c: Creature) => void;
}

export function ComparePanel({ stats, onLoadPreset }: Props) {
  const presetNames = new Set(animalPresets.map((p) => p.name));

  function maybeLoad(animalName: string) {
    if (!onLoadPreset) return;
    const preset = presetFor(animalName);
    if (preset) onLoadPreset(preset.creature);
  }

  return (
    <div className="compare">
      <h2>vs. real animals</h2>
      <p className="compare-help-top">Load a preset or click any marked animal row.</p>
      <div className="preset-strip" aria-label="Creature presets">
        {animalPresets.map((preset) => (
          <button
            key={preset.name}
            type="button"
            className={preset.name === 'Foxkit' ? 'preset-chip preset-chip-featured' : 'preset-chip'}
            onClick={() => onLoadPreset?.(preset.creature)}
            disabled={!onLoadPreset}
            title={`Load ${preset.name}`}
          >
            <span>{preset.emoji}</span>
            {preset.name}
          </button>
        ))}
      </div>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Mass</th>
            <th>Speed</th>
            <th>Endurance</th>
            <th>Lifespan</th>
          </tr>
        </thead>
        <tbody>
          <tr className="me-row">
            <td><strong>Your critter</strong></td>
            <td>{fmt(stats.massKg)} kg</td>
            <td>{stats.topSpeedKmh} km/h</td>
            <td>{stats.enduranceKm} km</td>
            <td>{stats.lifespanYears} y</td>
          </tr>
          {realAnimals.map((a) => {
            const clickable = presetNames.has(a.name);
            return (
              <tr
                key={a.name}
                title={a.fact}
                className={clickable ? 'preset-row' : undefined}
                onClick={clickable ? () => maybeLoad(a.name) : undefined}
              >
                <td>
                  {a.emoji} {a.name}
                  {clickable && <span className="load-hint"> ↻</span>}
                </td>
                <td>{fmt(a.massKg)} kg</td>
                <td>{a.topSpeedKmh} km/h</td>
                <td>{a.enduranceKm} km</td>
                <td>{a.lifespanYears} y</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="compare-help">Hover any animal for a biology fact.</p>
    </div>
  );
}

function fmt(n: number): string {
  if (n < 0.1) return n.toFixed(3);
  if (n < 10) return n.toFixed(1);
  return Math.round(n).toString();
}
