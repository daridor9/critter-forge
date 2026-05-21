import { QUESTS, loadCompletedQuests } from '../data/quests';

interface Props {
  onClose: () => void;
}

export function QuestsModal({ onClose }: Props) {
  const done = loadCompletedQuests();
  const completed = QUESTS.filter((q) => done.has(q.id)).length;
  return (
    <div className="insight-overlay" onClick={onClose}>
      <div className="about-modal" onClick={(e) => e.stopPropagation()}>
        <div className="about-head">
          <h2>🎯 Quests</h2>
          <button className="about-close" type="button" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="about-content">
          <p className="dedication">
            <strong>{completed} / {QUESTS.length}</strong> completed. Each quest is a design challenge — pick one, build a creature that solves it, win the right arena.
          </p>
          <div className="ach-grid">
            {QUESTS.map((q) => {
              const got = done.has(q.id);
              return (
                <div key={q.id} className={`ach-card${got ? ' got' : ' locked'}`}>
                  <div className="ach-emoji">{got ? q.emoji : '🔒'}</div>
                  <div className="ach-name">{q.title}</div>
                  <div className="ach-desc">{q.description}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
