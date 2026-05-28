import { useState } from 'react';
import type { Creature } from '../types';
import { CreatureSVG } from './CreatureSVG';
import { sizeToMass, topSpeedKmh, lifespanYears, heartRate, brainMassGrams } from '../physics';

interface Props {
  creature: Creature;
  onClose: () => void;
}

type Stage = 'hatchling' | 'adult' | 'elder';

interface StageInfo {
  emoji: string;
  label: string;
  ageRange: (lifespan: number) => string;
  description: string;
  scale: number;
  filter?: string;
  // Multipliers applied to computed stats at this life stage.
  massMult: number;
  speedMult: number;
  brainMult: number;
  heartMult: number;
  vulnerableNote?: string;
}

const STAGES: Record<Stage, StageInfo> = {
  hatchling: {
    emoji: '🐣',
    label: 'Hatchling',
    ageRange: (l) => `Days 1 – ${Math.max(30, Math.round(l * 365 * 0.05))}`,
    description: 'Newborn / juvenile. Small, fast-growing, vulnerable to predators. Brain still wiring up.',
    scale: 0.55,
    filter: 'brightness(1.1) saturate(1.1)',
    massMult: 0.18,
    speedMult: 0.45,
    brainMult: 0.55,
    heartMult: 1.6,        // baby hearts beat fast
    vulnerableNote: 'No combat defenses yet — relies on parents/hiding.',
  },
  adult: {
    emoji: '🦁',
    label: 'Adult',
    ageRange: (l) => `Year 1 – ${Math.round(l * 0.85)}`,
    description: 'Prime years. Full size, peak speed, full hybrid traits expressed. Reproductive age.',
    scale: 1.0,
    massMult: 1.0,
    speedMult: 1.0,
    brainMult: 1.0,
    heartMult: 1.0,
  },
  elder: {
    emoji: '🦉',
    label: 'Elder',
    ageRange: (l) => `Year ${Math.round(l * 0.85)} – ${Math.round(l)}`,
    description: 'Past prime. Slower, frailer, but more experienced. Brain knowledge peaks; muscle weakens.',
    scale: 0.92,
    filter: 'saturate(0.7) sepia(0.15)',
    massMult: 0.88,
    speedMult: 0.55,
    brainMult: 1.15,       // wisdom +
    heartMult: 0.85,
    vulnerableNote: 'Cold tolerance + endurance drop. Vulnerable to harsh climates.',
  },
};

export function LifecycleModal({ creature, onClose }: Props) {
  const [babyName, setBabyName] = useState(() => suggestBabyName(creature.name));
  const lifespanY = lifespanYears(sizeToMass(creature.sizeUnit), creature.warmBlooded);

  return (
    <div className="insight-overlay" onClick={onClose}>
      <div className="about-modal lifecycle-modal" onClick={(e) => e.stopPropagation()}>
        <div className="about-head">
          <h2>🐣 Life Cycle</h2>
          <button className="about-close" type="button" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="about-content">
          <p style={{ marginBottom: 14 }}>
            See <strong>{creature.name}</strong> at every life stage. Animals don't stay the same size or strength
            forever — they hatch small, grow into their prime, then slow down. Their <strong>brain</strong> usually
            keeps gaining wisdom even as the body slows.
            <br />
            <small style={{ color: 'var(--fg-dim)' }}>
              Estimated lifespan: ~<strong>{lifespanY.toFixed(1)} years</strong>
            </small>
          </p>

          {/* Baby name input */}
          <div className="lifecycle-name-row">
            <label>
              <span>🐣 Name the hatchling:</span>
              <input
                type="text"
                value={babyName}
                onChange={(e) => setBabyName(e.target.value)}
                maxLength={32}
                className="lifecycle-name-input"
              />
            </label>
          </div>

          {/* 3-stage grid */}
          <div className="lifecycle-grid">
            {(['hatchling', 'adult', 'elder'] as Stage[]).map((stage) => {
              const info = STAGES[stage];
              const displayName = stage === 'hatchling' ? babyName : stage === 'elder' ? `Old ${creature.name}` : creature.name;
              return (
                <div key={stage} className="lifecycle-card">
                  <div className="lifecycle-stage-head">
                    <span className="lifecycle-stage-emoji">{info.emoji}</span>
                    <span className="lifecycle-stage-label">{info.label.toUpperCase()}</span>
                  </div>
                  <div
                    className="lifecycle-thumb"
                    style={{
                      transform: `scale(${info.scale})`,
                      filter: info.filter,
                    }}
                  >
                    <CreatureSVG creature={creature} />
                  </div>
                  <div className="lifecycle-name">{displayName}</div>
                  <div className="lifecycle-age">{info.ageRange(lifespanY)}</div>
                  <div className="lifecycle-stats">
                    <StatLine
                      icon="⚖️"
                      label="Mass"
                      value={fmtMass(sizeToMass(creature.sizeUnit) * info.massMult)}
                    />
                    <StatLine
                      icon="🏃"
                      label="Speed"
                      value={`${Math.round(topSpeedKmh(sizeToMass(creature.sizeUnit), creature.bodyPlan, creature.legTier) * info.speedMult)} km/h`}
                    />
                    <StatLine
                      icon="🧠"
                      label="Brain"
                      value={`${(brainMassGrams(creature) * info.brainMult).toFixed(brainMassGrams(creature) < 1 ? 2 : 1)} g`}
                    />
                    <StatLine
                      icon="❤️"
                      label="Heart"
                      value={`${Math.round(heartRate(sizeToMass(creature.sizeUnit)) * info.heartMult)} bpm`}
                    />
                  </div>
                  <p className="lifecycle-desc">{info.description}</p>
                  {info.vulnerableNote && <p className="lifecycle-note">⚠ {info.vulnerableNote}</p>}
                </div>
              );
            })}
          </div>

          {/* Educational footer */}
          <div className="lifecycle-fact">
            🔬 <strong>Did you know?</strong>{' '}
            {lifecycleFact(creature)}
          </div>

          <div className="battle-controls">
            <button className="btn btn-secondary" type="button" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatLine({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="lifecycle-stat">
      <span>{icon} {label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function fmtMass(kg: number): string {
  if (kg < 0.01) return `${Math.round(kg * 1000000)} mg`;
  if (kg < 0.1) return `${Math.round(kg * 1000)} g`;
  if (kg < 1) return `${(kg * 1000).toFixed(0)} g`;
  if (kg < 100) return `${kg.toFixed(1)} kg`;
  return `${Math.round(kg)} kg`;
}

function suggestBabyName(parentName: string): string {
  const cute = ['Pip', 'Tiny', 'Wee', 'Lil', 'Bitty'];
  const prefix = cute[Math.floor(Math.random() * cute.length)];
  // Strip articles like "The "
  const base = parentName.replace(/^(The|Old|Lord|Lady)\s+/i, '');
  return `${prefix} ${base}`;
}

function lifecycleFact(c: Creature): string {
  if (c.bodyPlan === 'mammal' && c.warmBlooded) {
    return 'Mammal babies are born helpless — most spend years with their parents learning to hunt or forage.';
  }
  if (c.bodyPlan === 'reptile') {
    return 'Most reptiles hatch ready-to-go but get NO parental care. The hatchlings are tiny copies of the adults.';
  }
  if (c.bodyPlan === 'bird') {
    return "Bird chicks grow from helpless fluff to full flight in WEEKS. Their brains develop faster than mammals'.";
  }
  if (c.bodyPlan === 'fish') {
    return 'Fish can produce thousands of eggs at once — most babies are eaten, but a few survive to adulthood.';
  }
  return 'Every animal has a unique life cycle shaped by its body plan and environment.';
}
