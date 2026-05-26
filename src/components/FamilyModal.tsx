import { useState } from 'react';
import {
  loadRoster,
  addMember,
  removeMember,
  updateMember,
  setActiveMember,
  emojiOptions,
  colorOptions,
} from '../data/family';
import type { FamilyMember } from '../data/family';

interface Props {
  onClose: () => void;
  onChange?: () => void;  // notify App when roster / active changes so UI rerenders
}

export function FamilyModal({ onClose, onChange }: Props) {
  // Force a rerender by reading from localStorage every render.
  const [, bump] = useState(0);
  const rerender = () => {
    bump((n) => n + 1);
    onChange?.();
  };

  const { members, activeId } = loadRoster();
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState(emojiOptions()[0]);
  const [newColor, setNewColor] = useState(colorOptions()[0]);
  const [editingId, setEditingId] = useState<string | null>(null);

  function add() {
    const name = newName.trim();
    if (!name) return;
    addMember(name, newEmoji, newColor);
    setNewName('');
    rerender();
  }

  function activate(id: string) {
    setActiveMember(id);
    rerender();
  }

  function remove(id: string) {
    if (!confirm('Remove this family member? Their saved creatures stay in the album but will lose their maker tag.')) return;
    removeMember(id);
    rerender();
  }

  function saveEdit(m: FamilyMember, patch: Partial<FamilyMember>) {
    updateMember(m.id, patch);
    setEditingId(null);
    rerender();
  }

  return (
    <div className="insight-overlay" onClick={onClose}>
      <div className="about-modal family-modal" onClick={(e) => e.stopPropagation()}>
        <div className="about-head">
          <h2>👥 Family</h2>
          <button className="about-close" type="button" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="about-content">
          <p className="dedication">
            Pick who's playing. Every creature you save or share is tagged with the active player so the album reads like a real family scrapbook.
          </p>

          {members.length === 0 ? (
            <p className="profile-empty">No family members yet. Add the first one below.</p>
          ) : (
            <ul className="family-list">
              {members.map((m) => {
                const isActive = m.id === activeId;
                const editing = editingId === m.id;
                if (editing) {
                  return (
                    <li key={m.id} className="family-row editing">
                      <FamilyEditor
                        member={m}
                        onSave={(patch) => saveEdit(m, patch)}
                        onCancel={() => setEditingId(null)}
                      />
                    </li>
                  );
                }
                return (
                  <li key={m.id} className={`family-row${isActive ? ' active' : ''}`} style={{ borderColor: m.color }}>
                    <span className="family-emoji" style={{ background: m.color }}>{m.emoji}</span>
                    <span className="family-name">{m.name}</span>
                    {isActive && <span className="family-badge">playing now</span>}
                    <div className="family-row-actions">
                      {!isActive && (
                        <button type="button" className="btn-small" onClick={() => activate(m.id)}>
                          Switch to
                        </button>
                      )}
                      <button type="button" className="btn-small btn-secondary-small" onClick={() => setEditingId(m.id)}>
                        Edit
                      </button>
                      <button type="button" className="btn-small btn-danger-small" onClick={() => remove(m.id)}>
                        Remove
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <h3>Add a family member</h3>
          <div className="family-add">
            <label className="family-add-row">
              <span>Name</span>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Adam, Mom, Friend…"
                maxLength={20}
              />
            </label>
            <label className="family-add-row">
              <span>Avatar</span>
              <div className="family-emoji-picker">
                {emojiOptions().map((em) => (
                  <button
                    key={em}
                    type="button"
                    className={`family-emoji-opt${newEmoji === em ? ' selected' : ''}`}
                    onClick={() => setNewEmoji(em)}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </label>
            <label className="family-add-row">
              <span>Color</span>
              <div className="family-color-picker">
                {colorOptions().map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`family-color-opt${newColor === c ? ' selected' : ''}`}
                    style={{ background: c }}
                    onClick={() => setNewColor(c)}
                    aria-label={`Pick color ${c}`}
                  />
                ))}
              </div>
            </label>
            <div className="family-add-actions">
              <button className="btn" type="button" onClick={add} disabled={!newName.trim()}>
                ➕ Add member
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FamilyEditor({
  member,
  onSave,
  onCancel,
}: {
  member: FamilyMember;
  onSave: (patch: Partial<FamilyMember>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(member.name);
  const [emoji, setEmoji] = useState(member.emoji);
  const [color, setColor] = useState(member.color);
  return (
    <div className="family-editor">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={20}
        autoFocus
      />
      <div className="family-emoji-picker">
        {emojiOptions().map((em) => (
          <button
            key={em}
            type="button"
            className={`family-emoji-opt${emoji === em ? ' selected' : ''}`}
            onClick={() => setEmoji(em)}
          >
            {em}
          </button>
        ))}
      </div>
      <div className="family-color-picker">
        {colorOptions().map((c) => (
          <button
            key={c}
            type="button"
            className={`family-color-opt${color === c ? ' selected' : ''}`}
            style={{ background: c }}
            onClick={() => setColor(c)}
            aria-label={`Pick color ${c}`}
          />
        ))}
      </div>
      <div className="family-add-actions">
        <button className="btn-small" type="button" onClick={() => onSave({ name: name.trim() || member.name, emoji, color })}>
          Save
        </button>
        <button className="btn-small btn-secondary-small" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
