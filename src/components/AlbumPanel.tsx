import { useEffect, useState } from 'react';
import type { Creature } from '../types';
import { CreatureSVG } from './CreatureSVG';

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
  onSaved?: () => void;
}

export function AlbumPanel({ current, onLoad, onSaved }: Props) {
  const [items, setItems] = useState<SavedCreature[]>(() => loadAlbum());
  const [justSavedId, setJustSavedId] = useState<string | null>(null);

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
    onSaved?.();
  }

  function remove(id: string) {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    writeAlbum(next);
  }

  return (
    <section className="album">
      <div className="album-head">
        <h2>Family album</h2>
        <button className="btn" onClick={save} type="button">
          💾 Save current
        </button>
      </div>
      {items.length === 0 ? (
        <p className="album-empty">No saved creatures yet. Click "Save current" to start your roster.</p>
      ) : (
        <div className="album-grid">
          {items.map((item) => (
            <div key={item.id} className={`album-card${justSavedId === item.id ? ' just-saved' : ''}`}>
              <button
                type="button"
                className="album-thumb"
                onClick={() => onLoad(item.creature)}
                title={`Load ${item.name}`}
              >
                <CreatureSVG creature={item.creature} />
              </button>
              <div className="album-name" title={item.name}>{item.name}</div>
              <button className="album-del" type="button" onClick={() => remove(item.id)} title="Delete">
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
