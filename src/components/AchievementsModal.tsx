import { ACHIEVEMENTS, loadUnlocked } from '../data/achievements';

interface Props {
  onClose: () => void;
}

export function AchievementsModal({ onClose }: Props) {
  const unlocked = loadUnlocked();
  const wonCount = ACHIEVEMENTS.filter((a) => unlocked.has(a.id)).length;
  return (
    <div className="insight-overlay" onClick={onClose}>
      <div className="about-modal" onClick={(e) => e.stopPropagation()}>
        <div className="about-head">
          <h2>🏅 Achievements</h2>
          <button className="about-close" type="button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="about-content">
          <p className="dedication">
            <strong>{wonCount} / {ACHIEVEMENTS.length}</strong> unlocked. Keep designing.
          </p>
          <div className="ach-grid">
            {ACHIEVEMENTS.map((a) => {
              const got = unlocked.has(a.id);
              return (
                <div key={a.id} className={`ach-card${got ? ' got' : ' locked'}`}>
                  <div className="ach-emoji">{got ? a.emoji : '🔒'}</div>
                  <div className="ach-name">{a.name}</div>
                  <div className="ach-desc">{a.description}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
