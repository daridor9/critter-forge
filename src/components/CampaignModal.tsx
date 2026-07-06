import { useState } from 'react';
import { CHAPTERS, loadProgress, resetCampaign, type Chapter } from '../data/campaign';

interface Props {
  onClose: () => void;
  onStartArena?: (arena: 'chase' | 'hunt' | 'climb' | 'drought' | 'deep' | 'maze') => void;
  onStartGauntlet?: () => void;
}

// Node positions along a gentle S-curve trail. 10 nodes, alternating
// left/right so the path winds down the map like a board game.
const NODE_LAYOUT = CHAPTERS.map((_, i) => {
  const row = i;
  // zig-zag x between 22% and 78%, sine-eased for organic feel
  const t = i / (CHAPTERS.length - 1);
  const x = 50 + Math.sin(t * Math.PI * 3.2) * 28;
  const y = 60 + row * 92;
  return { x, y };
});
const MAP_HEIGHT = 60 + (CHAPTERS.length - 1) * 92 + 70;

export function CampaignModal({ onClose, onStartArena, onStartGauntlet }: Props) {
  const [progress, setProgress] = useState(() => loadProgress());
  const [selected, setSelected] = useState<Chapter | null>(() => {
    const cur = CHAPTERS.find((c) => !progress.completed.includes(c.id));
    return cur ?? null;
  });

  function refresh() { setProgress(loadProgress()); }

  function doReset() {
    if (window.confirm('Reset all campaign progress? You will start over from Chapter 1.')) {
      resetCampaign();
      refresh();
      setSelected(CHAPTERS[0]);
    }
  }

  const totalDone = progress.completed.length;
  const total = CHAPTERS.length;

  function statusOf(ch: Chapter, idx: number): 'done' | 'current' | 'locked' {
    if (progress.completed.includes(ch.id)) return 'done';
    const prevDone = idx === 0 || progress.completed.includes(CHAPTERS[idx - 1].id);
    return prevDone ? 'current' : 'locked';
  }

  const selIdx = selected ? CHAPTERS.findIndex((c) => c.id === selected.id) : -1;
  const selStatus = selected ? statusOf(selected, selIdx) : null;

  return (
    <div className="insight-overlay" onClick={onClose}>
      <div className="about-modal campaign-modal" onClick={(e) => e.stopPropagation()}>
        <div className="about-head">
          <h2>🌍 The Adapting · Journey</h2>
          <button className="about-close" type="button" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="campaign-layout">
          {/* ─── LEFT: the winding journey map ─── */}
          <div className="campaign-map-wrap">
            <div className="campaign-progress">
              <div className="campaign-progress-bar">
                <div className="campaign-progress-fill" style={{ width: `${(totalDone / total) * 100}%` }} />
              </div>
              <small>{totalDone} of {total} eras survived</small>
            </div>

            <div className="campaign-map" style={{ height: MAP_HEIGHT }}>
              {/* the trail path connecting all nodes */}
              <svg className="campaign-trail" viewBox={`0 0 100 ${MAP_HEIGHT}`} preserveAspectRatio="none">
                <path
                  d={NODE_LAYOUT.map((n, i) => `${i === 0 ? 'M' : 'L'} ${n.x} ${n.y}`).join(' ')}
                  fill="none"
                  stroke="var(--line)"
                  strokeWidth="1.4"
                  strokeDasharray="2 2.4"
                  vectorEffect="non-scaling-stroke"
                />
                {/* completed portion of the trail highlighted */}
                {totalDone > 0 && (
                  <path
                    d={NODE_LAYOUT.slice(0, Math.min(totalDone + 1, CHAPTERS.length))
                      .map((n, i) => `${i === 0 ? 'M' : 'L'} ${n.x} ${n.y}`).join(' ')}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                )}
              </svg>

              {/* the chapter nodes */}
              {CHAPTERS.map((ch, i) => {
                const pos = NODE_LAYOUT[i];
                const status = statusOf(ch, i);
                const isSel = selected?.id === ch.id;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    className={`campaign-node ${status}${isSel ? ' selected' : ''}`}
                    style={{
                      left: `${pos.x}%`,
                      top: pos.y,
                      // era color as the node's glow when active/current
                      '--node-color': ch.color,
                    } as React.CSSProperties}
                    onClick={() => status !== 'locked' && setSelected(ch)}
                    disabled={status === 'locked'}
                    title={status === 'locked' ? 'Clear the previous era first' : ch.title}
                  >
                    <span className="campaign-node-emoji">
                      {status === 'locked' ? '🔒' : ch.emoji}
                    </span>
                    <span className="campaign-node-num">{ch.num}</span>
                    {status === 'done' && <span className="campaign-node-check">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─── RIGHT: selected chapter detail ─── */}
          <div className="campaign-detail">
            {selected ? (
              <>
                <div
                  className="campaign-detail-banner"
                  style={{ background: `linear-gradient(135deg, ${selected.color}, transparent)` }}
                >
                  <span className="campaign-detail-emoji">{selected.emoji}</span>
                  <div>
                    <div className="campaign-detail-num">Era {selected.num} / {total}</div>
                    <h3>{selected.title}</h3>
                    <div className="campaign-detail-era">{selected.era}</div>
                  </div>
                </div>

                <p className="campaign-premise">{selected.premise}</p>

                <div className="campaign-detail-row">
                  <strong>🎯 Challenge</strong>
                  <span>{selected.challenge.task}</span>
                </div>
                <div className="campaign-detail-row">
                  <strong>💡 Build hint</strong>
                  <span>{selected.buildHint}</span>
                </div>
                <div className="campaign-bio-fact">
                  <strong>🔬 Did you know?</strong> {selected.bioFact}
                </div>

                {selStatus === 'done' ? (
                  <p className="campaign-done-msg">✅ Era survived!</p>
                ) : (
                  <div className="campaign-actions">
                    {selected.id === 'apex-final' ? (
                      <button className="btn" type="button" onClick={() => { onStartGauntlet?.(); onClose(); }}>
                        🏟 Start Gauntlet (need 6/6 wins)
                      </button>
                    ) : (
                      <button className="btn" type="button" onClick={() => { onStartArena?.(selected.challenge.arena); onClose(); }}>
                        ▶ Play {arenaLabel(selected.challenge.arena)}
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : (
              <p className="campaign-detail-empty">Pick an era on the trail to see its challenge.</p>
            )}

            {totalDone === total && (
              <div className="campaign-victory">
                👑 You completed The Adapting. Real ecosystems aren't won by one perfect creature — but by
                adaptable lineages. Bravo.
              </div>
            )}
          </div>
        </div>

        <div className="battle-controls" style={{ padding: '10px 20px' }}>
          <button className="btn btn-secondary" type="button" onClick={onClose}>Close</button>
          <button className="btn btn-secondary campaign-reset-btn" type="button" onClick={doReset}>
            🔁 Reset progress
          </button>
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
