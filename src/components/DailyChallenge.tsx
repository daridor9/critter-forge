import { getTodayQuest } from '../data/quests';

interface Props {
  onClose: () => void;
}

export function DailyChallengeModal({ onClose }: Props) {
  const { quest, completed } = getTodayQuest();
  return (
    <div className="insight-overlay" onClick={onClose}>
      <div className="between-modal" onClick={(e) => e.stopPropagation()}>
        <h3>📅 Today's challenge</h3>
        <div className="daily-card">
          <div className="daily-emoji">{quest.emoji}</div>
          <div className="daily-title">{quest.title}</div>
          <div className="daily-desc">{quest.description}</div>
          {completed
            ? <div className="daily-done">✓ Completed today!</div>
            : <div className="daily-todo">Do this today to claim a streak.</div>}
        </div>
        <p style={{ fontSize: 12, color: '#888', margin: '12px 0 0' }}>
          A new challenge unlocks every day (same one for everyone, picked from the date).
        </p>
        <div className="between-actions">
          <button className="btn" type="button" onClick={onClose}>Got it</button>
        </div>
      </div>
    </div>
  );
}
