import { useEffect, useState } from 'react';
import type { Creature } from '../types';
import { CreatureSVG } from './CreatureSVG';

interface Props {
  current: Creature;
  onLoad: (c: Creature) => void;
  onSlotChange?: () => void;
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
  } catch {
    return null;
  }
}

function saveSlot(id: SlotId, c: Creature): void {
  try {
    localStorage.setItem(slotKey(id), JSON.stringify({ creature: c, savedAt: Date.now() }));
  } catch {
    /* ignore */
  }
}

function clearSlot(id: SlotId): void {
  try {
    localStorage.removeItem(slotKey(id));
  } catch {
    /* ignore */
  }
}

export function BuildSlots({ current, onLoad, onSlotChange }: Props) {
  const [slots, setSlots] = useState<Record<SlotId, SlotState | null>>({
    A: loadSlot('A'),
    B: loadSlot('B'),
    C: loadSlot('C'),
  });
  // Preview-on-hover state — shows a tooltip for the slot's creature.
  const [hoveredSlot, setHoveredSlot] = useState<SlotId | null>(null);

  function refresh() {
    setSlots({
      A: loadSlot('A'),
      B: loadSlot('B'),
      C: loadSlot('C'),
    });
    onSlotChange?.();
  }

  // Sync if storage changes from elsewhere (other tab, etc.)
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('critter-forge:slot-')) refresh();
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClick(id: SlotId) {
    const slot = slots[id];
    if (!slot) {
      // empty → save current
      saveSlot(id, current);
      refresh();
    } else {
      // filled → load with confirm
      const ok = window.confirm(
        `Load slot ${id} (${slot.creature.name})? Your current creature will be replaced.\n\n(Tip: save current to another slot first if you want to keep it.)`,
      );
      if (ok) onLoad(slot.creature);
    }
  }

  function handleContextMenu(e: React.MouseEvent, id: SlotId) {
    e.preventDefault();
    const slot = slots[id];
    if (!slot) return;
    const ok = window.confirm(`Clear slot ${id} (${slot.creature.name})?`);
    if (ok) {
      clearSlot(id);
      refresh();
    }
  }

  return (
    <div className="build-slots" title="Quick build slots: click empty to save, click filled to load. Right-click to clear.">
      <span className="build-slots-label">Slots</span>
      {SLOT_IDS.map((id) => {
        const slot = slots[id];
        const filled = slot !== null;
        return (
          <button
            key={id}
            type="button"
            className={`build-slot${filled ? ' filled' : ''}${hoveredSlot === id ? ' hovered' : ''}`}
            onClick={() => handleClick(id)}
            onContextMenu={(e) => handleContextMenu(e, id)}
            onMouseEnter={() => setHoveredSlot(id)}
            onMouseLeave={() => setHoveredSlot(null)}
            title={filled
              ? `Slot ${id}: ${slot!.creature.name}\nClick to LOAD this creature.\nRight-click to clear.`
              : `Slot ${id}: empty\nClick to SAVE current creature here.`}
          >
            <span className="build-slot-letter">{id}</span>
            {filled ? (
              <span className="build-slot-thumb">
                <CreatureSVG creature={slot!.creature} />
              </span>
            ) : (
              <span className="build-slot-empty">·</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
