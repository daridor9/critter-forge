import { useMemo, useState } from 'react';
import type { Creature } from '../types';
import { suggestEvolutions, type Goal, type EvolutionStep } from '../utils/evolutionSuggest';
import { HYBRID_COMBOS, getActiveCombo } from '../data/hybridCombos';

interface Props {
  creature: Creature;
  onClose: () => void;
}

const ARENA_GOALS: Array<{ id: Goal; emoji: string; label: string }> = [
  { id: 'auto',    emoji: '🎯', label: 'Auto — fix weakest areas' },
  { id: 'chase',   emoji: '🐆', label: 'Win Chase' },
  { id: 'hunt',    emoji: '🌳', label: 'Win Hunt' },
  { id: 'climb',   emoji: '🏔', label: 'Win Climb' },
  { id: 'drought', emoji: '☀️', label: 'Win Drought' },
  { id: 'deep',    emoji: '🌊', label: 'Win Deep' },
  { id: 'maze',    emoji: '🧩', label: 'Win Maze' },
];

export function EvolutionRoadmapModal({ creature, onClose }: Props) {
  const [goal, setGoal] = useState<Goal>('auto');

  const activeCombo = getActiveCombo(creature);
  // Combos the creature could still unlock (i.e. doesn't already have).
  const combosAvailable = HYBRID_COMBOS.filter((c) => !c.hybrids.every((h) => creature.hybrids.includes(h)));

  const suggestions = useMemo(() => suggestEvolutions(creature, goal, 5), [creature, goal]);

  return (
    <div className="insight-overlay" onClick={onClose}>
      <div className="about-modal evolution-roadmap" onClick={(e) => e.stopPropagation()}>
        <div className="about-head">
          <h2>🗺️ Evolution Roadmap</h2>
          <button className="about-close" type="button" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="about-content">
          <p style={{ marginBottom: 12 }}>
            Pick a goal. The roadmap suggests the most impactful mutations to your current build.
            <br />
            <small style={{ color: 'var(--fg-dim)' }}>
              Current creature: <strong>{creature.name}</strong>
              {activeCombo && ` · active combo: ${activeCombo.emoji} ${activeCombo.name}`}
            </small>
          </p>

          {/* GOAL PICKER */}
          <div className="evo-goal-section">
            <div className="evo-goal-label">By arena:</div>
            <div className="evo-goal-chips">
              {ARENA_GOALS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className={`evo-goal-chip${goal === g.id ? ' active' : ''}`}
                  onClick={() => setGoal(g.id)}
                >
                  {g.emoji} {g.label}
                </button>
              ))}
            </div>

            {combosAvailable.length > 0 && (
              <>
                <div className="evo-goal-label" style={{ marginTop: 10 }}>By combo unlock:</div>
                <div className="evo-goal-chips">
                  {combosAvailable.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`evo-goal-chip${goal === `combo:${c.id}` ? ' active' : ''}`}
                      onClick={() => setGoal(`combo:${c.id}` as Goal)}
                      title={c.description}
                    >
                      {c.emoji} {c.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* SUGGESTIONS */}
          <div className="evo-suggestions">
            {suggestions.length === 0 ? (
              <div className="evo-empty">
                <p>✨ This creature is already optimized for that goal.</p>
                <p style={{ fontSize: 13, color: 'var(--fg-dim)' }}>
                  Try a different goal, or evolve through the arenas to compound traits.
                </p>
              </div>
            ) : (
              suggestions.map((s, i) => <RoadmapCard key={i} step={s} rank={i + 1} />)
            )}
          </div>

          <div className="battle-controls">
            <button className="btn btn-secondary" type="button" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RoadmapCard({ step, rank }: { step: EvolutionStep; rank: number }) {
  return (
    <div className="evo-card">
      <div className="evo-card-rank">#{rank}</div>
      <div className="evo-card-emoji">{step.emoji}</div>
      <div className="evo-card-body">
        <div className="evo-card-head">
          <strong>{step.trait}</strong>
          <span className="evo-card-change">
            <span className="evo-from">{step.from}</span>
            <span className="evo-arrow">→</span>
            <span className="evo-to">{step.to}</span>
          </span>
        </div>
        <div className="evo-card-why">{step.why}</div>
        {step.unlocksCombo && (
          <div className="evo-card-combo">⚡ Unlocks combo: <strong>{step.unlocksCombo}</strong></div>
        )}
      </div>
      <div className="evo-card-impact" title={`Impact score: ${step.impact.toFixed(2)}`}>
        {'⭐'.repeat(Math.max(1, Math.min(5, Math.round(step.impact * 2))))}
      </div>
    </div>
  );
}
