import type { Creature, BodyPlan, Tier, Hybrid } from '../types';
import { isHybridValid } from '../physics';
import { hybridCatalog, MAX_HYBRIDS } from '../data/hybrids';

interface Props {
  creature: Creature;
  onChange: (c: Creature) => void;
}

export function Builder({ creature, onChange }: Props) {
  const set = <K extends keyof Creature>(k: K, v: Creature[K]) =>
    onChange({ ...creature, [k]: v });

  return (
    <div className="builder">
      <h2>Build your creature</h2>

      <label className="row">
        <span>Name</span>
        <input value={creature.name} onChange={(e) => set('name', e.target.value)} />
      </label>

      <label className="row">
        <span>Size</span>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={creature.sizeUnit}
          onChange={(e) => set('sizeUnit', Number(e.target.value))}
        />
      </label>
      <div className="row-sub">mouse → wolf → elephant → whale</div>

      <div className="row">
        <span>Body plan</span>
        <div className="pills">
          {(['mammal', 'reptile', 'bird', 'fish'] as BodyPlan[]).map((bp) => (
            <button
              key={bp}
              className={creature.bodyPlan === bp ? 'pill active' : 'pill'}
              onClick={() => set('bodyPlan', bp)}
              type="button"
            >
              {bp}
            </button>
          ))}
        </div>
      </div>

      <div className="row">
        <span>Blood</span>
        <div className="pills">
          <button
            type="button"
            className={creature.warmBlooded ? 'pill active' : 'pill'}
            onClick={() => set('warmBlooded', true)}
          >
            warm
          </button>
          <button
            type="button"
            className={!creature.warmBlooded ? 'pill active' : 'pill'}
            onClick={() => set('warmBlooded', false)}
          >
            cold
          </button>
        </div>
      </div>

      <TierRow label="Legs" options={['stubby', 'standard', 'runner']} value={creature.legTier} onChange={(v) => set('legTier', v)} />
      <TierRow label="Brain" options={['tiny', 'standard', 'big']} value={creature.brainTier} onChange={(v) => set('brainTier', v)} />
      <TierRow label="Defense" options={['none', 'fur/scales', 'armor']} value={creature.defenseTier} onChange={(v) => set('defenseTier', v)} />
      <TierRow label="Sensors" options={['simple', 'sharp', 'sonar']} value={creature.sensorTier} onChange={(v) => set('sensorTier', v)} />

      <HybridSection creature={creature} onChange={(hybrids) => set('hybrids', hybrids)} />
    </div>
  );
}

function HybridSection({ creature, onChange }: { creature: Creature; onChange: (h: Hybrid[]) => void }) {
  const picked = creature.hybrids;
  const atMax = picked.length >= MAX_HYBRIDS;

  function toggle(h: Hybrid) {
    if (picked.includes(h)) {
      onChange(picked.filter((x) => x !== h));
    } else if (!atMax) {
      onChange([...picked, h]);
    }
  }

  return (
    <div className="hybrids">
      <div className="hybrids-head">
        <h3>Hybrid traits</h3>
        <span className="hybrids-count">{picked.length}/{MAX_HYBRIDS}</span>
      </div>
      <p className="hybrids-help">Pick up to {MAX_HYBRIDS} special powers borrowed from real animals. Each has a cost.</p>
      <div className="hybrid-grid">
        {hybridCatalog.map((h) => {
          const selected = picked.includes(h.id);
          const validity = isHybridValid(h.id, creature);
          const disabled = !validity.valid || (!selected && atMax);
          const title = selected
            ? h.fact
            : !validity.valid
              ? `${h.fact}\n\n⚠ ${validity.reason}`
              : atMax
                ? `${h.fact}\n\n(already at ${MAX_HYBRIDS}/2 — deselect one first)`
                : h.fact;
          return (
            <button
              key={h.id}
              type="button"
              className={`hybrid-chip${selected ? ' selected' : ''}${disabled ? ' disabled' : ''}`}
              onClick={() => !disabled && toggle(h.id)}
              title={title}
              aria-disabled={disabled}
            >
              <span className="hybrid-emoji">{h.emoji}</span>
              <span className="hybrid-name">{h.name}</span>
              {!validity.valid && <span className="hybrid-warn">{validity.reason}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TierRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: [string, string, string];
  value: Tier;
  onChange: (v: Tier) => void;
}) {
  return (
    <div className="row">
      <span>{label}</span>
      <div className="pills">
        {options.map((opt, i) => (
          <button
            key={i}
            type="button"
            className={value === i ? 'pill active' : 'pill'}
            onClick={() => onChange(i as Tier)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
