import { useState } from 'react';
import { ACHIEVEMENTS, loadUnlocked } from '../data/achievements';
import { loadProfile } from '../data/profile';
import type { Achievement } from '../data/achievements';
import type { PlayerProfile } from '../data/profile';

interface Props {
  onClose: () => void;
}

type Category = 'all' | 'arena' | 'records' | 'battle' | 'collection' | 'mass' | 'play';

interface CategoryInfo {
  id: Category;
  label: string;
  emoji: string;
}

const CATEGORIES: CategoryInfo[] = [
  { id: 'all',        label: 'All',         emoji: '🏅' },
  { id: 'arena',      label: 'Arena wins',  emoji: '🦌' },
  { id: 'records',    label: 'Records',     emoji: '⭐' },
  { id: 'battle',     label: 'Battle',      emoji: '⚔️' },
  { id: 'collection', label: 'Collection',  emoji: '📚' },
  { id: 'mass',       label: 'Body',        emoji: '🏋️' },
  { id: 'play',       label: 'Play',        emoji: '🎯' },
];

function categoryFor(id: string): Category {
  if (id.startsWith('win-') || id === 'tournament-run' || id === 'tournament-champ' || id === 'tournament-apex' || id === 'beat-kangaroo' || id === 'beat-shark' || id === 'fought-back') return 'arena';
  if (id.startsWith('deep-') || id.startsWith('drought-') || id.startsWith('maze-') || id.startsWith('hunt-streak') || id === 'chase-big-haul' || id.startsWith('tests-')) return 'records';
  if (id.startsWith('battle-') || id === 'bracket-champ') return 'battle';
  if (id.startsWith('save-') || id === 'first-creature' || id === 'every-hybrid' || id.startsWith('gen-')) return 'collection';
  if (id.startsWith('mass-')) return 'mass';
  return 'play';
}

interface Progress {
  current: number;
  goal: number;
  unit?: string;
  /** lower-is-better tier (maze speed) — render the bar inverted */
  invert?: boolean;
}

function progressFor(id: string, p: PlayerProfile, hybridsUsedCount: number): Progress | null {
  switch (id) {
    case 'deep-100':         return { current: Math.min(p.bestDeepDepth, 100), goal: 100, unit: 'm' };
    case 'deep-500':         return { current: Math.min(p.bestDeepDepth, 500), goal: 500, unit: 'm' };
    case 'deep-1000':        return { current: Math.min(p.bestDeepDepth, 1000), goal: 1000, unit: 'm' };
    case 'drought-14':       return { current: Math.min(p.bestDroughtDays, 14), goal: 14, unit: ' days' };
    case 'drought-30':       return { current: Math.min(p.bestDroughtDays, 30), goal: 30, unit: ' days' };
    case 'maze-fast':        return { current: p.fastestMazeSteps || 999, goal: 25, unit: ' steps', invert: true };
    case 'maze-genius':      return { current: p.fastestMazeSteps || 999, goal: 20, unit: ' steps', invert: true };
    case 'hunt-streak-5':    return { current: Math.min(p.longestHuntStreak, 5), goal: 5, unit: '' };
    case 'hunt-streak-10':   return { current: Math.min(p.longestHuntStreak, 10), goal: 10, unit: '' };
    case 'chase-big-haul':   return { current: Math.min(p.bestChaseKcal, 4800), goal: 4800, unit: ' kcal' };
    case 'tests-50':         return { current: Math.min(p.testsRun, 50), goal: 50, unit: ' tests' };
    case 'tests-200':        return { current: Math.min(p.testsRun, 200), goal: 200, unit: ' tests' };
    case 'save-one':         return { current: Math.min(p.creaturesSaved, 1), goal: 1, unit: '' };
    case 'save-five':        return { current: Math.min(p.creaturesSaved, 5), goal: 5, unit: '' };
    case 'save-ten':         return { current: Math.min(p.creaturesSaved, 10), goal: 10, unit: '' };
    case 'gen-five':         return { current: Math.min(p.generationsTotal, 5), goal: 5, unit: ' gens' };
    case 'gen-ten':          return { current: Math.min(p.generationsTotal, 10), goal: 10, unit: ' gens' };
    case 'every-hybrid':     return { current: hybridsUsedCount, goal: 9, unit: '/9' };
    default:                 return null;
  }
}

function loadHybridsUsed(): number {
  try {
    const arr = JSON.parse(localStorage.getItem('critter-forge:hybrids-used') || '[]');
    return Array.isArray(arr) ? arr.length : 0;
  } catch {
    return 0;
  }
}

export function AchievementsModal({ onClose }: Props) {
  const unlocked = loadUnlocked();
  const profile = loadProfile();
  const hybridsUsedCount = loadHybridsUsed();
  const wonCount = ACHIEVEMENTS.filter((a) => unlocked.has(a.id)).length;
  const [category, setCategory] = useState<Category>('all');
  const [showLocked, setShowLocked] = useState(true);

  const visible = ACHIEVEMENTS.filter((a) => {
    if (category !== 'all' && categoryFor(a.id) !== category) return false;
    if (!showLocked && !unlocked.has(a.id)) return false;
    return true;
  });

  return (
    <div className="insight-overlay" onClick={onClose}>
      <div className="about-modal achievements-modal" onClick={(e) => e.stopPropagation()}>
        <div className="about-head">
          <h2>🏅 Achievements</h2>
          <button className="about-close" type="button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="about-content">
          <div className="ach-summary">
            <div className="ach-summary-count">
              <strong>{wonCount}</strong> <span>/ {ACHIEVEMENTS.length}</span>
            </div>
            <div className="ach-summary-bar">
              <div className="ach-summary-bar-fill" style={{ width: `${(wonCount / ACHIEVEMENTS.length) * 100}%` }} />
            </div>
            <label className="ach-summary-toggle">
              <input type="checkbox" checked={showLocked} onChange={(e) => setShowLocked(e.target.checked)} />
              <span>Show locked</span>
            </label>
          </div>

          <div className="ach-cats">
            {CATEGORIES.map((c) => {
              const total = c.id === 'all'
                ? ACHIEVEMENTS.length
                : ACHIEVEMENTS.filter((a) => categoryFor(a.id) === c.id).length;
              const got = c.id === 'all'
                ? wonCount
                : ACHIEVEMENTS.filter((a) => categoryFor(a.id) === c.id && unlocked.has(a.id)).length;
              return (
                <button
                  key={c.id}
                  type="button"
                  className={`ach-cat${category === c.id ? ' active' : ''}`}
                  onClick={() => setCategory(c.id)}
                >
                  <span className="ach-cat-emoji">{c.emoji}</span>
                  <span className="ach-cat-label">{c.label}</span>
                  <span className="ach-cat-count">{got}/{total}</span>
                </button>
              );
            })}
          </div>

          <div className="ach-grid">
            {visible.map((a) => {
              const got = unlocked.has(a.id);
              const progress = progressFor(a.id, profile, hybridsUsedCount);
              return <AchCard key={a.id} a={a} got={got} progress={progress} />;
            })}
          </div>
          {visible.length === 0 && (
            <p className="profile-empty">Nothing matches that filter yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function AchCard({ a, got, progress }: { a: Achievement; got: boolean; progress: Progress | null }) {
  // For inverted (lower-is-better) progress, fill is 1 - (current/goal),
  // clamped, and "0 steps" treated as no progress.
  let pct = 0;
  let label = '';
  if (progress) {
    if (progress.invert) {
      // current = best steps so far. goal = max allowed. closer to 0 = better.
      // Show fill as (goal/current) up to 1, or 0 if no run yet (current=999).
      if (progress.current >= 999) {
        pct = 0;
        label = `0${progress.unit}`;
      } else if (progress.current <= progress.goal) {
        pct = 100;
        label = `${progress.current}${progress.unit} ✓`;
      } else {
        pct = Math.max(0, Math.min(100, (progress.goal / progress.current) * 100));
        label = `${progress.current}${progress.unit} (goal ≤ ${progress.goal})`;
      }
    } else {
      pct = (progress.current / progress.goal) * 100;
      label = `${Math.floor(progress.current)}${progress.unit ?? ''} / ${progress.goal}${progress.unit ?? ''}`;
    }
  }
  return (
    <div className={`ach-card${got ? ' got' : ' locked'}`}>
      <div className="ach-emoji">{a.emoji}</div>
      <div className="ach-name">{a.name}</div>
      <div className="ach-desc">{a.description}</div>
      {progress && (
        <div className="ach-progress">
          <div className="ach-progress-bar">
            <div className="ach-progress-fill" style={{ width: `${Math.min(100, pct)}%` }} />
          </div>
          <div className="ach-progress-label">{label}</div>
        </div>
      )}
      {got && <div className="ach-got-badge">✓ Earned</div>}
    </div>
  );
}
