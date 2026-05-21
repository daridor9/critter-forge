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

const HUNT_BIOMES: { id: string; label: string; emoji: string; predator: string }[] = [
  { id: 'savanna',  label: 'Savanna',  emoji: '🌾', predator: '🦁 Lion' },
  { id: 'forest',   label: 'Forest',   emoji: '🌳', predator: '🐺 Wolf' },
  { id: 'mountain', label: 'Mountain', emoji: '🏔', predator: '🐆 Snow Leopard' },
  { id: 'desert',   label: 'Desert',   emoji: '🏜', predator: '🐺 Hyena' },
  { id: 'ocean',    label: 'Ocean',    emoji: '🌊', predator: '🦈 Shark' },
];

const BATTLE_VENUES: { id: string; label: string; emoji: string }[] = [
  { id: 'brawl', label: 'Brawl',       emoji: '🥊' },
  { id: 'race',  label: 'Race',        emoji: '🏁' },
  { id: 'maze',  label: 'Puzzle race', emoji: '🧩' },
  { id: 'dive',  label: 'Deep dive',   emoji: '🌊' },
];

function fmtRel(ts: number): string {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

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
                <th>Best</th>
              </tr>
            </thead>
            <tbody>
              {arenas.map((a) => {
                const w = p.winsByArena[a] ?? 0;
                const l = p.lossesByArena[a] ?? 0;
                const t = w + l;
                const rate = t > 0 ? Math.round((w / t) * 100) : 0;
                const best =
                  a === 'deep'    ? (p.bestDeepDepth ? `${p.bestDeepDepth} m` : '—') :
                  a === 'drought' ? (p.bestDroughtDays ? `${p.bestDroughtDays} days` : '—') :
                  a === 'maze'    ? (p.fastestMazeSteps ? `${p.fastestMazeSteps} steps` : '—') :
                  a === 'chase'   ? (p.bestChaseKcal ? `${p.bestChaseKcal.toLocaleString()} kcal` : '—') :
                  a === 'hunt'    ? (p.longestHuntStreak ? `${p.longestHuntStreak}-win streak` : '—') :
                  '—';
                return (
                  <tr key={a}>
                    <td>{ARENA_LABELS[a].emoji} {ARENA_LABELS[a].label}</td>
                    <td className="won-text">{w}</td>
                    <td className="lost-text">{l}</td>
                    <td>{t > 0 ? `${rate}%` : '—'}</td>
                    <td className="profile-best">{best}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <h3>🌳 Hunt — by biome and strategy</h3>
          {Object.keys(p.huntByBiome).length === 0 ? (
            <p className="profile-empty">No hunts yet. Try the Hunt arena to start tracking.</p>
          ) : (
            <table className="profile-table profile-table-hunt">
              <thead>
                <tr>
                  <th>Biome</th>
                  <th>Predator</th>
                  <th>W/L</th>
                  <th>🙈 Hide</th>
                  <th>🏃 Run</th>
                  <th>⚔️ Fight</th>
                </tr>
              </thead>
              <tbody>
                {HUNT_BIOMES.map((b) => {
                  const s = p.huntByBiome[b.id];
                  if (!s) return null;
                  const cell = (st: { wins: number; losses: number }) => {
                    const t = st.wins + st.losses;
                    if (t === 0) return <span className="profile-dim">—</span>;
                    const rate = Math.round((st.wins / t) * 100);
                    return <><strong>{st.wins}</strong>/{st.losses} <small>({rate}%)</small></>;
                  };
                  return (
                    <tr key={b.id}>
                      <td>{b.emoji} {b.label}</td>
                      <td className="profile-dim">{b.predator}</td>
                      <td><span className="won-text">{s.wins}</span>/<span className="lost-text">{s.losses}</span></td>
                      <td>{cell(s.byStrategy.hide)}</td>
                      <td>{cell(s.byStrategy.run)}</td>
                      <td>{cell(s.byStrategy.fight)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          <h3>🦌 Chase — prey caught</h3>
          <div className="profile-prey">
            {['rabbit', 'gazelle', 'kangaroo'].map((id) => {
              const count = p.preysCaught[id] ?? 0;
              const emoji = id === 'rabbit' ? '🐰' : id === 'gazelle' ? '🦌' : '🦘';
              const kcal = id === 'rabbit' ? 600 : id === 'gazelle' ? 2200 : 4800;
              return (
                <div key={id} className="profile-prey-item">
                  <span className="profile-prey-emoji">{emoji}</span>
                  <span className="profile-prey-count">{count}</span>
                  <small>caught · {(count * kcal).toLocaleString()} kcal</small>
                </div>
              );
            })}
          </div>

          <h3>⚔️ Battle record</h3>
          {p.totalBattles === 0 ? (
            <p className="profile-empty">No battles yet. Pit two creatures with the ⚔️ button.</p>
          ) : (
            <table className="profile-table">
              <thead>
                <tr>
                  <th>Venue</th>
                  <th>Wins (Player A)</th>
                  <th>Losses</th>
                  <th>Draws</th>
                  <th>Rate</th>
                </tr>
              </thead>
              <tbody>
                {BATTLE_VENUES.map((v) => {
                  const s = p.battleByVenue[v.id];
                  if (!s) return null;
                  const total = s.wins + s.losses + s.draws;
                  const rate = total > 0 ? Math.round((s.wins / total) * 100) : 0;
                  return (
                    <tr key={v.id}>
                      <td>{v.emoji} {v.label}</td>
                      <td className="won-text">{s.wins}</td>
                      <td className="lost-text">{s.losses}</td>
                      <td>{s.draws}</td>
                      <td>{rate}%</td>
                    </tr>
                  );
                })}
                <tr className="profile-total-row">
                  <td><strong>Total</strong></td>
                  <td colSpan={3}><strong>{p.totalBattles}</strong> battle{p.totalBattles !== 1 ? 's' : ''} fought</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          )}

          <p className="profile-foot">
            <small>
              First play: {fmtRel(p.firstPlayedAt)} · Last play: {fmtRel(p.lastPlayedAt)}
            </small>
          </p>
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
