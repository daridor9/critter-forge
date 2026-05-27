import { useState, lazy, Suspense } from 'react';
import type { Creature } from '../types';
import type { CreatureStats } from '../physics';
import type { ArenaResult } from '../data/insights';
import { CreatureSVG } from './CreatureSVG';

// Lazy-load the arenas we wrap.
const ChaseArena   = lazy(() => import('./ChaseArena').then((m) => ({ default: m.ChaseArena })));
const HuntArena    = lazy(() => import('./HuntArena').then((m) => ({ default: m.HuntArena })));
const ClimbArena   = lazy(() => import('./ClimbArena').then((m) => ({ default: m.ClimbArena })));
const DroughtArena = lazy(() => import('./DroughtArena').then((m) => ({ default: m.DroughtArena })));
const DeepArena    = lazy(() => import('./DeepArena').then((m) => ({ default: m.DeepArena })));
const MazeArena    = lazy(() => import('./MazeArena').then((m) => ({ default: m.MazeArena })));

// ─── 6-arena decathlon ──────────────────────────────────────────────────
// One creature runs every arena in order. Each result is recorded.
// Final ceremony shows wins/losses + total kcal + points.

type ArenaId = 'chase' | 'hunt' | 'climb' | 'drought' | 'deep' | 'maze';

const ORDER: { id: ArenaId; label: string; emoji: string }[] = [
  { id: 'chase',   label: 'Chase',   emoji: '🦌' },
  { id: 'hunt',    label: 'Hunt',    emoji: '🌳' },
  { id: 'climb',   label: 'Climb',   emoji: '🏔' },
  { id: 'drought', label: 'Drought', emoji: '☀️' },
  { id: 'deep',    label: 'Deep',    emoji: '🌊' },
  { id: 'maze',    label: 'Maze',    emoji: '🧩' },
];

interface Props {
  creature: Creature;
  stats: CreatureStats;
  onClose: () => void;
  onArenaResult?: (r: ArenaResult) => void;
}

interface GauntletStep {
  id: ArenaId;
  won: boolean;
  reward?: number;
}

export function GauntletModal({ creature, stats, onClose, onArenaResult }: Props) {
  const [step, setStep] = useState<'intro' | 'running' | 'done'>('intro');
  const [arenaIdx, setArenaIdx] = useState(0);
  const [results, setResults] = useState<GauntletStep[]>([]);
  const [totalKcal, setTotalKcal] = useState(0);

  const arena = ORDER[arenaIdx];

  function start() {
    setStep('running');
    setArenaIdx(0);
    setResults([]);
    setTotalKcal(0);
  }

  function handleArenaFinish(r: ArenaResult) {
    // Bubble up to App so all the existing recording / points / achievements
    // flow runs (recordArena, checkArenaWin, checkStatsAchievements,
    // pointsForArenaResult, etc.).
    onArenaResult?.(r);

    const reward = 'reward' in r && typeof r.reward === 'number' ? r.reward : 0;
    const next: GauntletStep[] = [...results, { id: r.arena as ArenaId, won: r.won, reward }];
    setResults(next);
    setTotalKcal(totalKcal + reward);

    if (arenaIdx + 1 >= ORDER.length) {
      setStep('done');
    } else {
      // Brief intermission so the user can see what just happened.
      window.setTimeout(() => setArenaIdx(arenaIdx + 1), 500);
    }
  }

  function rankOf(wins: number, total: number): { title: string; emoji: string } {
    const r = wins / total;
    if (wins === total) return { title: 'Decathlon Champion', emoji: '👑' };
    if (r >= 0.83) return { title: 'Champion of Five', emoji: '🥇' };
    if (r >= 0.66) return { title: 'Versatile', emoji: '🥈' };
    if (r >= 0.5)  return { title: 'Mid-pack', emoji: '🥉' };
    if (r >= 0.33) return { title: 'Survivor', emoji: '🎖' };
    return { title: 'Brave entrant', emoji: '🌱' };
  }

  const wins = results.filter((r) => r.won).length;

  return (
    <div className="insight-overlay" onClick={onClose}>
      <div className="about-modal gauntlet-modal" onClick={(e) => e.stopPropagation()}>
        <div className="about-head">
          <h2>🏟 Decathlon — 6-arena gauntlet</h2>
          <button className="about-close" type="button" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="about-content">

          {/* Always-visible progress strip */}
          <div className="gauntlet-strip">
            {ORDER.map((a, i) => {
              const result = results[i];
              const isCurrent = step === 'running' && i === arenaIdx;
              const upcoming = i > arenaIdx || step === 'intro';
              return (
                <div key={a.id} className={`gauntlet-pip${isCurrent ? ' current' : ''}${result ? (result.won ? ' won' : ' lost') : ''}${upcoming && step !== 'intro' ? ' upcoming' : ''}`}>
                  <div className="gauntlet-pip-emoji">{a.emoji}</div>
                  <div className="gauntlet-pip-label">{a.label}</div>
                  {result && <div className="gauntlet-pip-mark">{result.won ? '✓' : '✗'}</div>}
                  {isCurrent && step === 'running' && <div className="gauntlet-pip-mark">▶</div>}
                </div>
              );
            })}
          </div>

          {step === 'intro' && (
            <div className="gauntlet-intro">
              <div className="gauntlet-creature">
                <div className="gauntlet-thumb"><CreatureSVG creature={creature} /></div>
                <strong>{creature.name}</strong> will run all 6 arenas.
              </div>
              <p>
                One creature, one continuous gauntlet. Win as many as you can — your kcal totals add up
                and every win earns its normal points. A perfect 6/6 crowns you Decathlon Champion.
              </p>
              <div className="battle-controls">
                <button className="btn" type="button" onClick={start}>🏟 Start the gauntlet</button>
              </div>
            </div>
          )}

          {step === 'running' && (
            <div className="gauntlet-arena-wrap">
              <h3 className="gauntlet-arena-head">{arena.emoji} {arena.label} — round {arenaIdx + 1} / 6</h3>
              <Suspense fallback={<div className="profile-empty">Loading…</div>}>
                {arena.id === 'chase'   && <ChaseArena   creature={creature} stats={stats} onFinish={(o) => handleArenaFinish({ arena: 'chase',   ...o })} />}
                {arena.id === 'hunt'    && <HuntArena    creature={creature} stats={stats} onFinish={(o) => handleArenaFinish({ arena: 'hunt',    ...o })} />}
                {arena.id === 'climb'   && <ClimbArena   creature={creature} stats={stats} onFinish={(o) => handleArenaFinish({ arena: 'climb',   ...o })} />}
                {arena.id === 'drought' && <DroughtArena creature={creature} stats={stats} onFinish={(o) => handleArenaFinish({ arena: 'drought', ...o })} />}
                {arena.id === 'deep'    && <DeepArena    creature={creature} stats={stats} onFinish={(o) => handleArenaFinish({ arena: 'deep',    ...o })} />}
                {arena.id === 'maze'    && <MazeArena    creature={creature} stats={stats} onFinish={(o) => handleArenaFinish({ arena: 'maze',    ...o })} />}
              </Suspense>
            </div>
          )}

          {step === 'done' && (() => {
            const rank = rankOf(wins, ORDER.length);
            return (
              <div className="gauntlet-result">
                <div className="bracket-champion">
                  <div className="bracket-champion-icon">{rank.emoji}</div>
                  <div className="bracket-champion-name">{rank.title}</div>
                  <div className="bracket-champion-sub">{wins} of {ORDER.length} arenas won</div>
                  <div className="bracket-champion-thumb"><CreatureSVG creature={creature} /></div>
                </div>

                <table className="profile-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Arena</th>
                      <th>Result</th>
                      <th>kcal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ORDER.map((a, i) => {
                      const r = results[i];
                      return (
                        <tr key={a.id}>
                          <td>{a.emoji}</td>
                          <td>{a.label}</td>
                          <td className={r?.won ? 'won-text' : 'lost-text'}>
                            {r?.won ? '✓ won' : '✗ lost'}
                          </td>
                          <td>{r?.reward ? r.reward.toLocaleString() : '—'}</td>
                        </tr>
                      );
                    })}
                    <tr className="profile-total-row">
                      <td colSpan={3}><strong>Total kcal earned</strong></td>
                      <td><strong>{totalKcal.toLocaleString()}</strong></td>
                    </tr>
                  </tbody>
                </table>

                <div className="battle-controls">
                  <button className="btn" type="button" onClick={start}>🔁 Run another gauntlet</button>
                  <button className="btn btn-secondary" type="button" onClick={onClose}>Close</button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
