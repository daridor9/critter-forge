import { useMemo, useState } from 'react';
import type { Creature } from '../types';
import { CreatureSVG } from './CreatureSVG';
import { sizeToMass, topSpeedKmh } from '../physics';
import { getActiveCombo } from '../data/hybridCombos';
import { suggestEvolutions } from '../utils/evolutionSuggest';

interface Props {
  current: Creature;
  onLoad: (c: Creature) => void;
  onClose: () => void;
  onGoToBuilder?: () => void;
}

type SlotId = 'A' | 'B' | 'C';
const SLOT_IDS: SlotId[] = ['A', 'B', 'C'];

interface SlotState {
  creature: Creature;
  savedAt: number;
}

function slotKey(id: SlotId): string {
  return `critter-forge:slot-${id}`;
}
function loadSlot(id: SlotId): SlotState | null {
  try {
    const raw = localStorage.getItem(slotKey(id));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}
function saveSlot(id: SlotId, c: Creature): void {
  try { localStorage.setItem(slotKey(id), JSON.stringify({ creature: c, savedAt: Date.now() })); } catch { /* ignore */ }
}
function clearSlot(id: SlotId): void {
  try { localStorage.removeItem(slotKey(id)); } catch { /* ignore */ }
}

// Mini stat preview for a creature card.
function quickStats(c: Creature): { mass: string; speed: string; brain: string; combo: string | null } {
  const m = sizeToMass(c.sizeUnit);
  const speed = topSpeedKmh(m, c.bodyPlan, c.legTier);
  const combo = getActiveCombo(c);
  return {
    mass: m < 1 ? `${(m * 1000).toFixed(0)} g` : m < 1000 ? `${m.toFixed(1)} kg` : `${(m / 1000).toFixed(1)} t`,
    speed: `${speed} km/h`,
    brain: ['Tiny', 'Standard', 'Big', 'Genius'][c.brainTier],
    combo: combo ? `${combo.emoji} ${combo.name}` : null,
  };
}

export function DesignLabModal({ current, onLoad, onClose, onGoToBuilder }: Props) {
  const [tick, setTick] = useState(0);
  const slots = useMemo<Record<SlotId, SlotState | null>>(() => ({
    A: loadSlot('A'),
    B: loadSlot('B'),
    C: loadSlot('C'),
  // re-evaluate whenever the user saves/clears
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [tick]);

  function refresh() { setTick((t) => t + 1); }

  function handleSaveToSlot(id: SlotId) {
    saveSlot(id, current);
    refresh();
  }
  function handleLoadSlot(id: SlotId) {
    const slot = slots[id];
    if (!slot) return;
    const ok = window.confirm(`Load slot ${id} (${slot.creature.name})?\nYour current creature will be replaced.`);
    if (ok) onLoad(slot.creature);
  }
  function handleClear(id: SlotId) {
    const slot = slots[id];
    if (!slot) return;
    const ok = window.confirm(`Clear slot ${id} (${slot.creature.name})?`);
    if (ok) { clearSlot(id); refresh(); }
  }
  function handleSwap(id: SlotId) {
    const slot = slots[id];
    if (!slot) return;
    const ok = window.confirm(`SWAP slot ${id} with current?\nThe creature in slot ${id} (${slot.creature.name}) becomes your current, and your current creature (${current.name}) goes into the slot.`);
    if (ok) {
      saveSlot(id, current);
      onLoad(slot.creature);
    }
  }

  const curStats = quickStats(current);

  // Top "auto" suggestions for the current creature — gives the player a
  // sense of what the engine thinks they should try next.
  const suggestions = useMemo(() => suggestEvolutions(current, 'auto', 3), [current]);

  return (
    <div className="insight-overlay" onClick={onClose}>
      <div className="about-modal design-lab" onClick={(e) => e.stopPropagation()}>
        <div className="about-head">
          <h2>🧪 Design Lab</h2>
          <button className="about-close" type="button" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="about-content">
          <p style={{ marginBottom: 16 }}>
            Your design workspace. <strong>Save</strong> different creature variants to slots, <strong>swap</strong> between
            them with one click, and see at a glance what each one is good at.
          </p>

          {/* CURRENT CREATURE — pinned at the top */}
          <div className="design-lab-current">
            <div className="design-lab-current-label">CURRENT</div>
            <div className="design-lab-card design-lab-card-current">
              <div className="design-lab-thumb-big">
                <CreatureSVG creature={current} />
              </div>
              <div className="design-lab-meta">
                <div className="design-lab-name">{current.name}</div>
                <div className="design-lab-stats">
                  <span>⚖️ {curStats.mass}</span>
                  <span>🏃 {curStats.speed}</span>
                  <span>🧠 {curStats.brain}</span>
                </div>
                {curStats.combo && <div className="design-lab-combo">⚡ {curStats.combo}</div>}
                <div className="design-lab-hybrids">
                  <small>Hybrids: {current.hybrids.length === 0 ? 'none' : current.hybrids.join(', ')}</small>
                </div>
              </div>
              <div className="design-lab-actions design-lab-actions-current">
                <button className="btn" type="button" onClick={onGoToBuilder} title="Switch to the main Builder view">
                  🎨 Edit in Builder
                </button>
              </div>
            </div>
          </div>

          {/* SLOTS A / B / C */}
          <div className="design-lab-slots-label">SAVED VARIANTS</div>
          <div className="design-lab-slot-grid">
            {SLOT_IDS.map((id) => {
              const slot = slots[id];
              const stats = slot ? quickStats(slot.creature) : null;
              return (
                <div key={id} className={`design-lab-card${slot ? '' : ' design-lab-card-empty'}`}>
                  <div className="design-lab-card-head">
                    <span className="design-lab-slot-letter">SLOT {id}</span>
                    {slot && <small className="design-lab-slot-age">{timeAgo(slot.savedAt)}</small>}
                  </div>

                  {slot ? (
                    <>
                      <div className="design-lab-thumb-big">
                        <CreatureSVG creature={slot.creature} />
                      </div>
                      <div className="design-lab-meta">
                        <div className="design-lab-name">{slot.creature.name}</div>
                        <div className="design-lab-stats">
                          <span>⚖️ {stats!.mass}</span>
                          <span>🏃 {stats!.speed}</span>
                          <span>🧠 {stats!.brain}</span>
                        </div>
                        {stats!.combo && <div className="design-lab-combo">⚡ {stats!.combo}</div>}
                      </div>
                      <div className="design-lab-actions">
                        <button className="btn" type="button" onClick={() => handleLoadSlot(id)}
                          title={`Replace your current creature with the one in slot ${id}`}>
                          📥 Load
                        </button>
                        <button className="btn btn-secondary" type="button" onClick={() => handleSwap(id)}
                          title={`Swap: current and slot ${id} trade places (current goes to slot, slot comes to current)`}>
                          🔁 Swap
                        </button>
                        <button className="btn btn-secondary" type="button" onClick={() => handleSaveToSlot(id)}
                          title={`Overwrite slot ${id} with your current creature`}>
                          💾 Save over
                        </button>
                        <button className="btn btn-secondary design-lab-clear" type="button" onClick={() => handleClear(id)}
                          title={`Clear slot ${id}`}>
                          🗑 Clear
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="design-lab-thumb-big design-lab-thumb-empty">
                        <span>·</span>
                      </div>
                      <div className="design-lab-meta">
                        <div className="design-lab-empty-text">Empty slot — click below to save your current creature here.</div>
                      </div>
                      <div className="design-lab-actions">
                        <button className="btn" type="button" onClick={() => handleSaveToSlot(id)}>
                          💾 Save current here
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* AUTO SUGGESTIONS — what the engine recommends */}
          {suggestions.length > 0 && (
            <div className="design-lab-suggest">
              <div className="design-lab-slots-label">💡 SUGGESTED MUTATIONS (auto)</div>
              <div className="design-lab-suggest-list">
                {suggestions.map((s, i) => (
                  <div key={i} className="design-lab-suggest-row">
                    <span className="design-lab-suggest-emoji">{s.emoji}</span>
                    <span className="design-lab-suggest-text">
                      <strong>{s.trait}</strong>: <em>{s.from}</em> → <strong>{s.to}</strong>
                      <small> — {s.why}</small>
                    </span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12, color: 'var(--fg-dim)', marginTop: 6 }}>
                Want detail for a specific goal? Open <strong>🗺️ Evolution Roadmap</strong> from the More menu.
              </p>
            </div>
          )}

          {/* HOW IT WORKS */}
          <details className="design-lab-help">
            <summary>How do the slots work?</summary>
            <div className="design-lab-help-body">
              <p><strong>Slots are like 3 save-files for your creature designs.</strong></p>
              <ul>
                <li><strong>💾 Save current here</strong> — copy your current creature into that slot. The slot box shows the thumbnail.</li>
                <li><strong>📥 Load</strong> — make the slot's creature your current. (Your current creature is overwritten — save it to another slot first if you want to keep it.)</li>
                <li><strong>🔁 Swap</strong> — current ↔ slot. The slot gets your current creature, you get the slot's creature. Nothing is lost.</li>
                <li><strong>💾 Save over</strong> — overwrite the slot with the current.</li>
                <li><strong>🗑 Clear</strong> — empty the slot. Asks for confirmation first.</li>
              </ul>
              <p>
                <strong>What for?</strong> Build a "fast" creature, save to A. Tweak into a "tough" one, save to B. Try a third
                build, save to C. Now you can click between A / B / C to instantly compare. Test each in the arenas, see who wins.
              </p>
              <p>
                <strong>Slots vs Family album:</strong> Slots are your scratch space for experiments (only 3, easy to overwrite).
                The Family album is your permanent collection (unlimited, named entries).
              </p>
            </div>
          </details>

          <div className="battle-controls">
            <button className="btn btn-secondary" type="button" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function timeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
