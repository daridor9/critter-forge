import { useState } from 'react';
import { CHAPTERS, loadProgress, resetCampaign, type Chapter } from '../data/campaign';

interface Props {
  onClose: () => void;
  onStartArena?: (arena: 'chase' | 'hunt' | 'climb' | 'drought' | 'deep' | 'maze') => void;
  onStartGauntlet?: () => void;
}

export function CampaignModal({ onClose, onStartArena, onStartGauntlet }: Props) {
  const [progress, setProgress] = useState(() => loadProgress());
  const [openChapter, setOpenChapter] = useState<Chapter | null>(() => {
    // Default-open the current chapter
    const cur = CHAPTERS.find((c) => !progress.completed.includes(c.id));
    return cur ?? null;
  });

  function refresh() { setProgress(loadProgress()); }

  function doReset() {
    if (window.confirm('Reset all campaign progress? You will start over from Chapter 1.')) {
      resetCampaign();
      refresh();
      setOpenChapter(CHAPTERS[0]);
    }
  }

  const totalDone = progress.completed.length;
  const total = CHAPTERS.length;

  return (
    <div className="insight-overlay" onClick={onClose}>
      <div className="about-modal campaign-modal" onClick={(e) => e.stopPropagation()}>
        <div className="about-head">
          <h2>🌍 The Adapting · Campaign</h2>
          <button className="about-close" type="button" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="about-content">
          <p style={{ marginBottom: 12 }}>
            Ten chapters of evolutionary pressure. Each one demands a different design — there is no single creature
            that wins every chapter. <strong>Progress: {totalDone} / {total} chapters complete.</strong>
          </p>

          {/* Progress bar */}
          <div className="campaign-progress">
            <div className="campaign-progress-bar">
              <div className="campaign-progress-fill" style={{ width: `${(totalDone / total) * 100}%` }} />
            </div>
            <small>{totalDone} of {total} cleared</small>
          </div>

          {/* Chapter list */}
          <div className="campaign-chapter-list">
            {CHAPTERS.map((ch) => {
              const isDone = progress.completed.includes(ch.id);
              const idx = CHAPTERS.findIndex((c) => c.id === ch.id);
              const prevDone = idx === 0 || progress.completed.includes(CHAPTERS[idx - 1].id);
              const isLocked = !isDone && !prevDone;
              const isOpen = openChapter?.id === ch.id;

              return (
                <div key={ch.id} className={`campaign-chapter${isDone ? ' done' : ''}${isLocked ? ' locked' : ''}${isOpen ? ' open' : ''}`}>
                  <button
                    type="button"
                    className="campaign-chapter-head"
                    onClick={() => !isLocked && setOpenChapter(isOpen ? null : ch)}
                    disabled={isLocked}
                  >
                    <span className="campaign-chapter-num">Ch. {ch.num}</span>
                    <span className="campaign-chapter-emoji">{ch.emoji}</span>
                    <span className="campaign-chapter-title">
                      <strong>{ch.title}</strong>
                      <small>{ch.era}</small>
                    </span>
                    <span className="campaign-chapter-status">
                      {isDone ? '✅' : isLocked ? '🔒' : '▶'}
                    </span>
                  </button>

                  {isOpen && !isLocked && (
                    <div className="campaign-chapter-body" style={{ borderLeftColor: ch.color }}>
                      <p className="campaign-premise">{ch.premise}</p>
                      <div className="campaign-detail-row">
                        <strong>🎯 Challenge:</strong> {ch.challenge.task}
                      </div>
                      <div className="campaign-detail-row">
                        <strong>💡 Build hint:</strong> {ch.buildHint}
                      </div>
                      <div className="campaign-bio-fact">
                        <strong>🔬 Did you know?</strong> {ch.bioFact}
                      </div>
                      {!isDone && (
                        <div className="campaign-actions">
                          {ch.id === 'apex-final' ? (
                            <button className="btn" type="button" onClick={() => { onStartGauntlet?.(); onClose(); }}>
                              🏟 Start Gauntlet (need 6/6 wins)
                            </button>
                          ) : (
                            <button className="btn" type="button" onClick={() => { onStartArena?.(ch.challenge.arena); onClose(); }}>
                              ▶ Play {arenaLabel(ch.challenge.arena)}
                            </button>
                          )}
                        </div>
                      )}
                      {isDone && <p className="campaign-done-msg">✅ Chapter complete!</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {totalDone === total && (
            <div className="campaign-victory">
              👑 You completed The Adapting. You have proved that real ecosystems are not won by a single perfect
              creature, but by adaptable lineages. Bravo.
            </div>
          )}

          <div className="battle-controls">
            <button className="btn btn-secondary" type="button" onClick={onClose}>Close</button>
            <button className="btn btn-secondary" type="button" onClick={doReset} style={{ background: '#a83030' }}>
              🔁 Reset progress
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function arenaLabel(a: string): string {
  switch (a) {
    case 'chase': return 'Chase';
    case 'hunt': return 'Hunt';
    case 'climb': return 'Climb';
    case 'drought': return 'Drought';
    case 'deep': return 'Deep';
    case 'maze': return 'Maze';
    default: return a;
  }
}
