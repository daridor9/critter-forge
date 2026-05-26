import { useEffect, useState } from 'react';
import type { Creature } from '../types';
import { CreatureSVG } from './CreatureSVG';
import { BreedModal } from './BreedModal';
import type { BreedResult } from '../data/breeding';
import { activeStamp } from '../data/family';
import type { MakerStamp } from '../data/family';

interface SavedCreature {
  id: string;
  name: string;
  creature: Creature;
  savedAt: number;
  lineageId?: string | null;
  notes?: string;
  maker?: MakerStamp | null;
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
  currentLineageId: string | null;
  onLoad: (c: Creature, meta?: { kind?: 'album' | 'breed'; lineageId?: string | null; parentLineageIds?: [string | null, string | null]; changes?: string[] }) => void;
  onSaved?: (count: number) => void;
}

export function AlbumPanel({ current, currentLineageId, onLoad, onSaved }: Props) {
  const [items, setItems] = useState<SavedCreature[]>(() => loadAlbum());
  const [justSavedId, setJustSavedId] = useState<string | null>(null);
  const [breedMode, setBreedMode] = useState(false);
  const [pickedIds, setPickedIds] = useState<string[]>([]);
  const [breedPair, setBreedPair] = useState<[Creature, Creature] | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');

  useEffect(() => {
    if (!justSavedId) return;
    const t = setTimeout(() => setJustSavedId(null), 900);
    return () => clearTimeout(t);
  }, [justSavedId]);

  function save() {
    const id = genId();
    const next: SavedCreature[] = [
      ...items,
      {
        id,
        name: current.name || `Critter #${items.length + 1}`,
        creature: current,
        savedAt: Date.now(),
        lineageId: currentLineageId,
        maker: activeStamp(),
      },
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
      onLoad(item.creature, { kind: 'album', lineageId: item.lineageId ?? null });
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

  function onPickOffspring(result: BreedResult) {
    const p1 = items.find((i) => i.id === pickedIds[0]);
    const p2 = items.find((i) => i.id === pickedIds[1]);
    onLoad(result.creature, {
      kind: 'breed',
      parentLineageIds: [p1?.lineageId ?? null, p2?.lineageId ?? null],
      changes: result.notes,
    });
    setBreedPair(null);
    setBreedMode(false);
    setPickedIds([]);
  }

  function startEditNotes(item: SavedCreature) {
    setEditingNotesId(item.id);
    setNotesDraft(item.notes ?? '');
  }

  function saveNotes() {
    if (!editingNotesId) return;
    const next = items.map((i) => (i.id === editingNotesId ? { ...i, notes: notesDraft } : i));
    setItems(next);
    writeAlbum(next);
    setEditingNotesId(null);
    setNotesDraft('');
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
            const isEditing = editingNotesId === item.id;
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
                {item.maker && (
                  <div className="album-maker" style={{ background: item.maker.color, borderColor: item.maker.color }}>
                    <span className="album-maker-emoji">{item.maker.emoji}</span>
                    <span className="album-maker-name">by {item.maker.name}</span>
                  </div>
                )}
                {!breedMode && (
                  <>
                    {isEditing ? (
                      <div className="album-notes-editor">
                        <textarea
                          value={notesDraft}
                          onChange={(e) => setNotesDraft(e.target.value)}
                          placeholder="Add a note (e.g. 'best for Drought')…"
                          rows={2}
                          maxLength={120}
                        />
                        <div className="album-notes-actions">
                          <button type="button" className="album-note-btn" onClick={saveNotes}>Save</button>
                          <button type="button" className="album-note-btn" onClick={() => setEditingNotesId(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : item.notes ? (
                      <div className="album-notes" onClick={() => startEditNotes(item)} title="Click to edit">
                        📝 {item.notes}
                      </div>
                    ) : (
                      <button type="button" className="album-add-note" onClick={() => startEditNotes(item)}>
                        + add note
                      </button>
                    )}
                    <button className="album-del" type="button" onClick={() => remove(item.id)} title="Delete">
                      ✕
                    </button>
                  </>
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
