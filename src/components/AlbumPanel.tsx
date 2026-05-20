import { useEffect, useState } from 'react';
import type { Creature } from '../types';
import { CreatureSVG } from './CreatureSVG';
import { BreedModal } from './BreedModal';

interface SavedCreature {
  id: string;
  name: string;
  creature: Creature;
  savedAt: number;
}

const KEY = 'critter-forge:album';

function loadAlbum(): SavedCreature[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function writeAlbum(items: SavedCreature[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

function genId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

interface Props {
  current: Creature;
  onLoad: (c: Creature) => void;
  onSaved?: (count: number) => void;
}

export function AlbumPanel({ current, onLoad, onSaved }: Props) {
  const [items, setItems] = useState<SavedCreature[]>(() => loadAlbum());
  const [justSavedId, setJustSavedId] = useState<string | null>(null);
  const [breedMode, setBreedMode] = useState(false);
  const [pickedIds, setPickedIds] = useState<string[]>([]);
  const [breedPair, setBreedPair] = useState<[Creature, Creature] | null>(null);

  useEffect(() => {
    if (!justSavedId) return;
    const t = setTimeout(() => setJustSavedId(null), 900);
    return () => clearTimeout(t);
  }, [justSavedId]);

  function save() {
    const id = genId();
    const next: SavedCreature[] = [
      ...items,
      { id, name: current.name || `Critter #${items.length + 1}`, creature: current, savedAt: Date.now() },
    ];
    setItems(next);
    writeAlbum(next);
    setJustSavedId(id);
    onSaved?.(next.length);
  }

  function remove(id: string) {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    writeAlbum(next);
  }

  function toggleBreed() {
    setBreedMode(!breedMode);
    setPickedIds([]);
  }

  function handleCardClick(item: SavedCreature) {
    if (!breedMode) {
      onLoad(item.creature);
      return;
    }
    if (pickedIds.includes(item.id)) {
      setPickedIds(pickedIds.filter((i) => i !== item.id));
      return;
    }
    if (pickedIds.length >= 2) return;
    const next = [...pickedIds, item.id];
    setPickedIds(next);
    if (next.length === 2) {
      const p1 = items.find((i) => i.id === next[0])!.creature;
      const p2 = items.find((i) => i.id === next[1])!.creature;
      setBreedPair([p1, p2]);
    }
  }

  function onPickOffspring(c: Creature) {
    onLoad(c);
    setBreedPair(null);
    setBreedMode(false);
    setPickedIds([]);
  }

  return (
    <section className="album">
      <div className="album-head">
        <h2>Family album</h2>
        <div className="album-actions">
          {items.length >= 2 && (
            <button
              className={`btn ${breedMode ? '' : 'btn-secondary'}`}
              onClick={toggleBreed}
              type="button"
            >
              {breedMode ? `🧬 Pick 2 (${pickedIds.length}/2)` : '🧬 Breed'}
            </button>
          )}
          <button className="btn" onClick={save} type="button">
            💾 Save current
          </button>
        </div>
      </div>
      {items.length === 0 ? (
        <p className="album-empty">No saved creatures yet. Click "Save current" to start your roster.</p>
      ) : (
        <div className="album-grid">
          {items.map((item) => {
            const selected = breedMode && pickedIds.includes(item.id);
            return (
              <div
                key={item.id}
                className={`album-card${justSavedId === item.id ? ' just-saved' : ''}${selected ? ' selected' : ''}`}
              >
                <button
                  type="button"
                  className="album-thumb"
                  onClick={() => handleCardClick(item)}
                  title={breedMode ? `Select ${item.name}` : `Load ${item.name}`}
                >
                  <CreatureSVG creature={item.creature} />
                </button>
                <div className="album-name" title={item.name}>{item.name}</div>
                {!breedMode && (
                  <button className="album-del" type="button" onClick={() => remove(item.id)} title="Delete">
                    ✕
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
      {breedPair && (
        <BreedModal
          parent1={breedPair[0]}
          parent2={breedPair[1]}
          onPick={onPickOffspring}
          onClose={() => {
            setBreedPair(null);
            setPickedIds([]);
          }}
        />
      )}
    </section>
  );
}
