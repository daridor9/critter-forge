import type { Insight } from '../data/insights';

interface Props {
  insight: Insight;
  onClose: () => void;
  onEvolve?: () => void;
}

export function InsightCard({ insight, onClose, onEvolve }: Props) {
  return (
    <div className="insight-overlay" onClick={onClose}>
      <div className="insight-card" onClick={(e) => e.stopPropagation()}>
        <h3>{insight.title}</h3>
        <p>{insight.text}</p>
        <div className="insight-actions">
          {insight.won && onEvolve && (
            <button className="btn" onClick={onEvolve} type="button">
              🥚 Next generation
            </button>
          )}
          <button
            className={insight.won && onEvolve ? 'btn btn-secondary' : 'btn'}
            onClick={onClose}
            type="button"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
