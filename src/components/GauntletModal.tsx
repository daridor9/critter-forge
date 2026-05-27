import { useState, lazy, Suspense, useMemo } from 'react';
import type { Creature } from '../types';
import { computeStats, type CreatureStats } from '../physics';
import type { ArenaResult } from '../data/insights';
import { CreatureSVG } from './CreatureSVG';
import { mutate, type Mutation } from './EvolveModal';

// Lazy-load the arenas we wrap.
const ChaseArena   = lazy(() => import('./ChaseArena').then((m) => ({ default: m.ChaseArena })));
const HuntArena    = lazy(() => import('./HuntArena').then((m) => ({ default: m.HuntArena })));
const ClimbArena   = lazy(() => import('./ClimbArena').then((m) => ({ default: m.ClimbArena })));
const DroughtArena = lazy(() => import('./DroughtArena').then((m) => ({ default: m.DroughtArena })));
const DeepArena    = lazy(() => import('./DeepArena').then((m) => ({ default: m.DeepArena })));
const MazeArena    = lazy(() => import('./MazeArena').then((m) => ({ default: m.MazeArena })));

// ─── 6-arena decathlon ──────────────────────────────────────────────────
// One creature runs every arena in order. Between arenas the creature can
// mutate (small bumps to traits) — like a fast-forward evolution under
// gauntlet pressure. Each arena result is recorded.

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
  mutated?: string;  // human-readable label of the new form, if it mutated before this round
}

export function GauntletModal({ creature: initialCreature, stats: initialStats, onClose, onArenaResult }: Props) {
  const [step, setStep] = useState<'intro' | 'running' | 'evolving' | 'done'>('intro');
  const [arenaIdx, setArenaIdx] = useState(0);
  const [results, setResults] = useState<GauntletStep[]>([]);
  const [totalKcal, setTotalKcal] = useState(0);
  const [currentCreature, setCurrentCreature] = useState<Creature>(initialCreature);
  const [currentStats, setCurrentStats] = useState<CreatureStats>(initialStats);
  const [evolveVariants, setEvolveVariants] = useState<Mutation[]>([]);
  const [pendingNextIdx, setPendingNextIdx] = useState(0);
  const [pendingMutation, setPendingMutation] = useState<string | null>(null);

  const arena = ORDER[arenaIdx];

  function start() {
    setStep('running');
    setArenaIdx(0);
    setResults([]);
    setTotalKcal(0);
    setCurrentCreature(initialCreature);
    setCurrentStats(initialStats);
    setPendingMutation(null);
  }

  function handleArenaFinish(r: ArenaResult) {
    // Bubble up to App so all the existing recording / points / achievements
    // flow runs (recordArena, checkArenaWin, checkStatsAchievements,
    // pointsForArenaResult, etc.).
    onArenaResult?.(r);

    const reward = 'reward' in r && typeof r.reward === 'number' ? r.reward : 0;
    const next: GauntletStep[] = [...results, {
      id: r.arena as ArenaId,
      won: r.won,
      reward,
      mutated: pendingMutation ?? undefined,
    }];
    setResults(next);
    setTotalKcal(totalKcal + reward);
    setPendingMutation(null);

    if (arenaIdx + 1 >= ORDER.length) {
      setStep('done');
    } else {
      // Mutation pause between rounds. Generate 3 variants of the current form
      // (not the original) so traits compound across the gauntlet.
      setEvolveVariants([mutate(currentCreature), mutate(currentCreature), mutate(currentCreature)]);
      setPendingNextIdx(arenaIdx + 1);
      window.setTimeout(() => setStep('evolving'), 500);
    }
  }

  function pickMutation(m: Mutation) {
    setCurrentCreature(m.creature);
    setCurrentStats(computeStats(m.creature));
    setPendingMutation(m.creature.name + (m.changes.length > 0 ? ' — ' + m.changes.join(', ') : ''));
    setArenaIdx(pendingNextIdx);
    setStep('running');
  }

  function stayAsIs() {
    setPendingMutation(null);
    setArenaIdx(pendingNextIdx);
    setStep('running');
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
  const mutationCount = useMemo(() => results.filter((r) => r.mutated).length, [results]);
  const nextArenaPreview = ORDER[pendingNextIdx];

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
              const isCurrent = (step === 'running' || step === 'evolving') && i === arenaIdx && step === 'running';
              const isEvolvingNext = step === 'evolving' && i === pendingNextIdx;
              const upcoming = i > arenaIdx || step === 'intro';
              return (
                <div key={a.id} className={`gauntlet-pip${isCurrent ? ' current' : ''}${isEvolvingNext ? ' current' : ''}${result ? (result.won ? ' won' : ' lost') : ''}${upcoming && step !== 'intro' ? ' upcoming' : ''}`}>
                  <div className="gauntlet-pip-emoji">{a.emoji}</div>
                  <div className="gauntlet-pip-label">{a.label}</div>
                  {result && <div className="gauntlet-pip-mark">{result.won ? '✓' : '✗'}</div>}
                  {result?.mutated && <div className="gauntlet-pip-mark" title={result.mutated}>🧬</div>}
                  {isCurrent && step === 'running' && <div className="gauntlet-pip-mark">▶</div>}
                  {isEvolvingNext && <div className="gauntlet-pip-mark">🧬</div>}
                </div>
              );
            })}
          </div>

          {step === 'intro' && (
            <div className="gauntlet-intro">
              <div className="gauntlet-creature">
                <div className="gauntlet-thumb"><CreatureSVG creature={initialCreature} /></div>
                <strong>{initialCreature.name}</strong> will run all 6 arenas.
              </div>
              <p>
                One lineage, one continuous gauntlet. Between each arena your creature gets a chance to
                <strong> mutate</strong> — tiny adaptations that compound over six rounds. Win as many as you can —
                kcal totals add up and every win earns its normal points. A perfect 6/6 crowns you Decathlon Champion.
              </p>
              <div className="battle-controls">
                <button className="btn" type="button" onClick={start}>🏟 Start the gauntlet</button>
              </div>
            </div>
          )}

          {step === 'running' && (
            <div className="gauntlet-arena-wrap">
              <h3 className="gauntlet-arena-head">
                {arena.emoji} {arena.label} — round {arenaIdx + 1} / 6
                {pendingMutation && <span className="gauntlet-mutation-tag" title={pendingMutation}> · 🧬 mutated</span>}
              </h3>
              <Suspense fallback={<div className="profile-empty">Loading…</div>}>
                {arena.id === 'chase'   && <ChaseArena   creature={currentCreature} stats={currentStats} onFinish={(o) => handleArenaFinish({ arena: 'chase',   ...o })} />}
                {arena.id === 'hunt'    && <HuntArena    creature={currentCreature} stats={currentStats} onFinish={(o) => handleArenaFinish({ arena: 'hunt',    ...o })} />}
                {arena.id === 'climb'   && <ClimbArena   creature={currentCreature} stats={currentStats} onFinish={(o) => handleArenaFinish({ arena: 'climb',   ...o })} />}
                {arena.id === 'drought' && <DroughtArena creature={currentCreature} stats={currentStats} onFinish={(o) => handleArenaFinish({ arena: 'drought', ...o })} />}
                {arena.id === 'deep'    && <DeepArena    creature={currentCreature} stats={currentStats} onFinish={(o) => handleArenaFinish({ arena: 'deep',    ...o })} />}
                {arena.id === 'maze'    && <MazeArena    creature={currentCreature} stats={currentStats} onFinish={(o) => handleArenaFinish({ arena: 'maze',    ...o })} />}
              </Suspense>
            </div>
          )}

          {step === 'evolving' && (
            <div className="gauntlet-evolve">
              <h3 className="gauntlet-arena-head">🧬 Mutate before {nextArenaPreview?.emoji} {nextArenaPreview?.label}?</h3>
              <p className="gauntlet-evolve-sub">
                Pressure from the {ORDER[arenaIdx]?.label.toLowerCase()} just shaped your lineage.
                Pick a mutation to face the next arena with — or stay as <strong>{currentCreature.name}</strong>.
              </p>
              <div className="evolve-variants">
                {evolveVariants.map((v, i) => (
                  <button key={i} className="evolve-card" type="button" onClick={() => pickMutation(v)}>
                    <div className="evolve-thumb">
                      <CreatureSVG creature={v.creature} />
                    </div>
                    <div className="evolve-name">{v.creature.name}</div>
                    <ul className="evolve-changes">
                      {v.changes.length > 0
                        ? v.changes.map((c, j) => <li key={j}>{c}</li>)
                        : <li className="evolve-change-none">(no visible change — same form)</li>}
                    </ul>
                  </button>
                ))}
              </div>
              <div className="battle-controls">
                <button className="btn btn-secondary" type="button" onClick={stayAsIs}>
                  Stay as {currentCreature.name}
                </button>
              </div>
            </div>
          )}

          {step === 'done' && (() => {
            const rank = rankOf(wins, ORDER.length);
            return (
              <div className="gauntlet-result">
                <div className="bracket-champion">
                  <div className="bracket-champion-icon">{rank.emoji}</div>
                  <div className="bracket-champion-name">{rank.title}</div>
                  <div className="bracket-champion-sub">
                    {wins} of {ORDER.length} arenas won
                    {mutationCount > 0 && <> · 🧬 {mutationCount} mutation{mutationCount === 1 ? '' : 's'}</>}
                  </div>
                  <div className="bracket-champion-thumb"><CreatureSVG creature={currentCreature} /></div>
                  {currentCreature.name !== initialCreature.name && (
                    <div className="bracket-champion-sub">
                      Final form: <strong>{currentCreature.name}</strong> (started as {initialCreature.name})
                    </div>
                  )}
                </div>

                <table className="profile-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Arena</th>
                      <th>Result</th>
                      <th>kcal</th>
                      <th>🧬</th>
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
                          <td title={r?.mutated ?? ''}>{r?.mutated ? '🧬' : ''}</td>
                        </tr>
                      );
                    })}
                    <tr className="profile-total-row">
                      <td colSpan={3}><strong>Total kcal earned</strong></td>
                      <td><strong>{totalKcal.toLocaleString()}</strong></td>
                      <td></td>
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
