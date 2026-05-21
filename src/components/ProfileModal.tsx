import { loadProfile } from '../data/profile';

interface Props {
  onClose: () => void;
}

const ARENA_LABELS: Record<string, { emoji: string; label: string }> = {
  chase: { emoji: '🦌', label: 'Chase' },
  hunt: { emoji: '🌳', label: 'Hunt' },
  climb: { emoji: '🏔', label: 'Climb' },
  drought: { emoji: '☀️', label: 'Drought' },
  deep: { emoji: '🌊', label: 'Deep' },
  maze: { emoji: '🧩', label: 'Maze' },
};

export function ProfileModal({ onClose }: Props) {
  const p = loadProfile();
  const winRate = p.testsRun > 0 ? Math.round((p.totalWins / p.testsRun) * 100) : 0;
  const arenas: string[] = ['chase', 'hunt', 'climb', 'drought', 'deep', 'maze'];

  return (
    <div className="insight-overlay" onClick={onClose}>
      <div className="about-modal" onClick={(e) => e.stopPropagation()}>
        <div className="about-head">
          <h2>👤 Your profile</h2>
          <button className="about-close" type="button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="about-content">
          <p className="dedication">
            Your lifetime stats. Everything tracked locally in this browser — clear localStorage to reset.
          </p>

          <div className="profile-grid">
            <ProfileBlock label="Tests run" value={p.testsRun} />
            <ProfileBlock label="Wins" value={p.totalWins} color="#5cc46a" />
            <ProfileBlock label="Losses" value={p.totalLosses} color="#d65a5a" />
            <ProfileBlock label="Win rate" value={`${winRate}%`} />
            <ProfileBlock label="Generations" value={p.generationsTotal} />
            <ProfileBlock label="Tournaments done" value={p.tournamentsCompleted} />
            <ProfileBlock label="Best tournament" value={`${p.bestTournamentPoints} pts`} color="#e07b5b" />
            <ProfileBlock label="Creatures saved" value={p.creaturesSaved} />
            <ProfileBlock label="Mutations adopted" value={p.creaturesEvolved} />
            <ProfileBlock label="Bred offspring" value={p.creaturesBred} />
            <ProfileBlock label="Shared imported" value={p.sharedImported} />
            <ProfileBlock label="Chase food won" value={`${(p.totalChaseKcal / 1000).toFixed(1)}k kcal`} color="#e89a3a" />
          </div>

          <h3>Per-arena record</h3>
          <table className="profile-table">
            <thead>
              <tr>
                <th></th>
                <th>Wins</th>
                <th>Losses</th>
                <th>Rate</th>
              </tr>
            </thead>
            <tbody>
              {arenas.map((a) => {
                const w = p.winsByArena[a] ?? 0;
                const l = p.lossesByArena[a] ?? 0;
                const t = w + l;
                const rate = t > 0 ? Math.round((w / t) * 100) : 0;
                return (
                  <tr key={a}>
                    <td>{ARENA_LABELS[a].emoji} {ARENA_LABELS[a].label}</td>
                    <td className="won-text">{w}</td>
                    <td className="lost-text">{l}</td>
                    <td>{t > 0 ? `${rate}%` : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <h3>Prey caught</h3>
          <div className="profile-prey">
            {['rabbit', 'gazelle', 'kangaroo'].map((id) => {
              const count = p.preysCaught[id] ?? 0;
              const emoji = id === 'rabbit' ? '🐰' : id === 'gazelle' ? '🦌' : '🦘';
              return (
                <div key={id} className="profile-prey-item">
                  <span className="profile-prey-emoji">{emoji}</span>
                  <span className="profile-prey-count">{count}</span>
                  <small>caught</small>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileBlock({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="profile-block">
      <div className="profile-num" style={color ? { color } : undefined}>{value}</div>
      <div className="profile-lbl">{label}</div>
    </div>
  );
}
