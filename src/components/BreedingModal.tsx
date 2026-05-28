import { useMemo, useState } from 'react';
import type { Creature } from '../types';
import { CreatureSVG } from './CreatureSVG';
import { hybridCatalog } from '../data/hybrids';
import { breed, type Offspring } from '../utils/breeding';
import { ANIMAL_DEX } from '../data/animalDex';

interface Props {
  current: Creature;
  onClose: () => void;
  onPickOffspring: (c: Creature) => void;
}

type ParentSlot = 'A' | 'B';

interface AlbumEntry { id: string; name: string; creature: Creature; }

function loadAlbum(): AlbumEntry[] {
  try { return JSON.parse(localStorage.getItem('critter-forge:album') || '[]'); } catch { return []; }
}
function loadSlot(id: 'A' | 'B' | 'C'): Creature | null {
  try {
    const raw = localStorage.getItem(`critter-forge:slot-${id}`);
    if (!raw) return null;
    return JSON.parse(raw).creature ?? null;
  } catch { return null; }
}

interface SourceOption {
  label: string;
  group: 'current' | 'slot' | 'album' | 'dex';
  creature: Creature;
}

function gatherSources(current: Creature): SourceOption[] {
  const out: SourceOption[] = [{ label: `Current · ${current.name}`, group: 'current', creature: current }];
  for (const sid of ['A', 'B', 'C'] as const) {
    const c = loadSlot(sid);
    if (c) out.push({ label: `Slot ${sid} · ${c.name}`, group: 'slot', creature: c });
  }
  for (const a of loadAlbum()) {
    out.push({ label: `Album · ${a.name}`, group: 'album', creature: a.creature });
  }
  for (const a of ANIMAL_DEX) {
    out.push({ label: `Dex · ${a.name}`, group: 'dex', creature: a.creature });
  }
  return out;
}

export function BreedingModal({ current, onClose, onPickOffspring }: Props) {
  const sources = useMemo(() => gatherSources(current), [current]);
  const [aIdx, setAIdx] = useState(0);
  const [bIdx, setBIdx] = useState(Math.min(2, sources.length - 1));
  const [offspring, setOffspring] = useState<Offspring[] | null>(null);

  const parentA = sources[aIdx].creature;
  const parentB = sources[bIdx].creature;

  function doBreed() {
    setOffspring(breed(parentA, parentB, 3));
  }

  function tryAgain() {
    setOffspring(breed(parentA, parentB, 3));
  }

  return (
    <div className="insight-overlay" onClick={onClose}>
      <div className="about-modal breeding-modal" onClick={(e) => e.stopPropagation()}>
        <div className="about-head">
          <h2>🧬 Breeding Lab</h2>
          <button className="about-close" type="button" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="about-content">
          <p style={{ marginBottom: 14 }}>
            Cross two creatures to get <strong>3 offspring</strong> that each inherit a random mix of traits from
            both parents — plus one small mutation. Same as real genetics: each trait coin-flips between mom and dad.
          </p>

          {/* PARENT PICKERS */}
          <div className="breeding-parents">
            <ParentCard
              label="Parent A"
              slot="A"
              sources={sources}
              idx={aIdx}
              onChange={setAIdx}
              creature={parentA}
            />
            <div className="breeding-cross">
              <span className="breeding-cross-x">✕</span>
            </div>
            <ParentCard
              label="Parent B"
              slot="B"
              sources={sources}
              idx={bIdx}
              onChange={setBIdx}
              creature={parentB}
            />
          </div>

          <div className="battle-controls" style={{ margin: '12px 0' }}>
            {!offspring ? (
              <button className="btn" type="button" onClick={doBreed}>
                🧬 Breed
              </button>
            ) : (
              <button className="btn btn-secondary" type="button" onClick={tryAgain}>
                🎲 Roll new offspring
              </button>
            )}
          </div>

          {/* OFFSPRING DISPLAY */}
          {offspring && (
            <>
              <div className="design-lab-slots-label">OFFSPRING</div>
              <div className="breeding-offspring-grid">
                {offspring.map((o, i) => (
                  <OffspringCard
                    key={i}
                    offspring={o}
                    onPick={() => { onPickOffspring(o.creature); onClose(); }}
                  />
                ))}
              </div>
              <p style={{ fontSize: 12, color: 'var(--fg-dim)', marginTop: 4 }}>
                💡 Pick one to load as your current creature. Save the others to slots first if you want to keep them.
              </p>
            </>
          )}

          {/* Bio fact */}
          <div className="breeding-fact">
            🔬 <strong>Did you know?</strong> In real animals, offspring get half their DNA from each parent — but
            which half is randomized each pregnancy. That's why siblings look different even from the same parents.
          </div>
        </div>
      </div>
    </div>
  );
}

function ParentCard({
  label, slot, sources, idx, onChange, creature,
}: {
  label: string;
  slot: ParentSlot;
  sources: SourceOption[];
  idx: number;
  onChange: (i: number) => void;
  creature: Creature;
}) {
  return (
    <div className="breeding-parent-card">
      <div className="breeding-parent-label">{label} {slot === 'A' ? '🅐' : '🅑'}</div>
      <select
        className="compare-picker"
        value={idx}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {sources.map((s, i) => (<option key={i} value={i}>{s.label}</option>))}
      </select>
      <div className="breeding-parent-thumb">
        <CreatureSVG creature={creature} />
      </div>
      <div className="breeding-parent-name">{creature.name}</div>
      <div className="breeding-parent-stats">
        <span>{creature.bodyPlan}</span>
        <span>{creature.warmBlooded ? 'warm' : 'cold'}</span>
        <span>L{creature.legTier} B{creature.brainTier}</span>
      </div>
      {creature.hybrids.length > 0 && (
        <div className="breeding-parent-hybrids">
          {creature.hybrids.map((h) => {
            const info = hybridCatalog.find((x) => x.id === h);
            return <span key={h} className="breeding-hybrid-chip" title={info?.name}>{info?.emoji}</span>;
          })}
        </div>
      )}
    </div>
  );
}

function OffspringCard({ offspring, onPick }: { offspring: Offspring; onPick: () => void }) {
  const { creature, meta } = offspring;
  return (
    <div className="breeding-offspring-card">
      <div className="breeding-offspring-thumb">
        <CreatureSVG creature={creature} />
      </div>
      <div className="breeding-offspring-name">{creature.name}</div>
      <div className="breeding-offspring-traits">
        <InheritedTag from={meta.inheritance.bodyPlan} label={creature.bodyPlan} icon="🧬" />
        <InheritedTag from={meta.inheritance.warmBlooded} label={creature.warmBlooded ? 'warm' : 'cold'} icon={creature.warmBlooded ? '🔥' : '❄️'} />
        <InheritedTag from={meta.inheritance.sizeUnit} label={`size ${creature.sizeUnit}`} icon="⚖️" />
        <InheritedTag from={meta.inheritance.legTier} label={`legs ${creature.legTier}`} icon="🦵" />
        <InheritedTag from={meta.inheritance.brainTier} label={`brain ${creature.brainTier}`} icon="🧠" />
        <InheritedTag from={meta.inheritance.defenseTier} label={`def ${creature.defenseTier}`} icon="🛡️" />
        <InheritedTag from={meta.inheritance.sensorTier} label={`sense ${creature.sensorTier}`} icon="👁️" />
      </div>
      {creature.hybrids.length > 0 && (
        <div className="breeding-offspring-hybrids">
          {creature.hybrids.map((h) => {
            const info = hybridCatalog.find((x) => x.id === h);
            return <span key={h} className="breeding-hybrid-chip">{info?.emoji} {info?.name}</span>;
          })}
        </div>
      )}
      {meta.mutationNote && (
        <div className="breeding-mutation-note">
          ✨ {meta.mutationNote}
        </div>
      )}
      <div className="breeding-offspring-action">
        <button className="btn" type="button" onClick={onPick}>
          📥 Adopt this one
        </button>
      </div>
    </div>
  );
}

function InheritedTag({ from, label, icon }: { from: 'A' | 'B' | 'AVG'; label: string; icon: string }) {
  const color = from === 'A' ? '#4a8ab8' : from === 'B' ? '#c08030' : '#9a60d0';
  return (
    <span className="breeding-trait" style={{ borderColor: color }} title={`Inherited from ${from === 'AVG' ? 'both parents (averaged)' : `Parent ${from}`}`}>
      <span className="breeding-trait-icon">{icon}</span>
      <span>{label}</span>
      <span className="breeding-trait-source" style={{ background: color }}>{from}</span>
    </span>
  );
}
