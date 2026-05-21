import { useEffect, useMemo, useRef, useState } from 'react';
import type { Creature } from '../types';
import { ANIMAL_DEX } from '../data/animalDex';
import { CreatureSVG } from './CreatureSVG';
import { simulateBattle, VENUE_META } from '../data/battle';
import type { Venue, BattleStep, BattleResult } from '../data/battle';
import { hybridCatalog } from '../data/hybrids';
import { recordBattle } from '../data/profile';
import { checkStatsAchievements } from '../data/achievements';

interface SavedCreature {
  id: string;
  name: string;
  creature: Creature;
}

const ALBUM_KEY = 'critter-forge:album';

function loadAlbum(): SavedCreature[] {
  try {
    return JSON.parse(localStorage.getItem(ALBUM_KEY) || '[]');
  } catch {
    return [];
  }
}

interface Source {
  label: string;
  group: 'current' | 'album' | 'dex';
  creature: Creature;
}

function gatherSources(currentCreature: Creature): Source[] {
  const out: Source[] = [{ label: `Current · ${currentCreature.name}`, group: 'current', creature: currentCreature }];
  for (const s of loadAlbum()) {
    out.push({ label: `Album · ${s.name}`, group: 'album', creature: s.creature });
  }
  for (const a of ANIMAL_DEX) {
    out.push({ label: `Dex · ${a.name}`, group: 'dex', creature: a.creature });
  }
  return out;
}

interface Props {
  current: Creature;
  onClose: () => void;
}

type Step = 'pick' | 'play' | 'done';

export function BattleModal({ current, onClose }: Props) {
  const sources = useMemo(() => gatherSources(current), [current]);
  const [aIdx, setAIdx] = useState(0);
  const [bIdx, setBIdx] = useState(Math.min(2, sources.length - 1));
  const [venue, setVenue] = useState<Venue>('brawl');
  const [step, setStep] = useState<Step>('pick');
  const [result, setResult] = useState<BattleResult | null>(null);
  const [logIdx, setLogIdx] = useState(0);
  const tickRef = useRef<number | null>(null);

  const cA = sources[aIdx].creature;
  const cB = sources[bIdx].creature;

  function startBattle() {
    const r = simulateBattle(cA, cB, venue);
    recordBattle(venue, r.winner);
    checkStatsAchievements();
    setResult(r);
    setLogIdx(0);
    setStep('play');
  }

  function rematch() {
    if (tickRef.current !== null) window.clearTimeout(tickRef.current);
    const r = simulateBattle(cA, cB, venue);
    recordBattle(venue, r.winner);
    checkStatsAchievements();
    setResult(r);
    setLogIdx(0);
    setStep('play');
  }

  function skipToEnd() {
    if (!result) return;
    if (tickRef.current !== null) window.clearTimeout(tickRef.current);
    setLogIdx(result.steps.length);
    setStep('done');
  }

  function backToPick() {
    if (tickRef.current !== null) window.clearTimeout(tickRef.current);
    setResult(null);
    setLogIdx(0);
    setStep('pick');
  }

  // Drive playback — fixed interval per step. Brawl=550ms, race=180ms, maze=900ms, dive=320ms.
  useEffect(() => {
    if (step !== 'play' || !result) return;
    if (logIdx >= result.steps.length) {
      setStep('done');
      return;
    }
    const interval = venue === 'brawl' ? 600 : venue === 'race' ? 200 : venue === 'maze' ? 850 : 320;
    tickRef.current = window.setTimeout(() => setLogIdx((i) => i + 1), interval);
    return () => {
      if (tickRef.current !== null) {
        window.clearTimeout(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [step, logIdx, result, venue]);

  const visible = result ? result.steps.slice(0, logIdx + 1) : [];
  const latest: BattleStep | undefined = visible[visible.length - 1];

  const hpA = latest?.hpA ?? 1;
  const hpB = latest?.hpB ?? 1;
  const posA = latest?.posA ?? 0;
  const posB = latest?.posB ?? 0;
  const flash = latest?.flash;

  return (
    <div className="insight-overlay" onClick={onClose}>
      <div className="about-modal battle-modal" onClick={(e) => e.stopPropagation()}>
        <div className="about-head">
          <h2>⚔️ Battle</h2>
          <button className="about-close" type="button" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="about-content">
          {step === 'pick' && (
            <div className="battle-pick">
              <div className="battle-side">
                <select value={aIdx} onChange={(e) => setAIdx(Number(e.target.value))} className="compare-picker">
                  {sources.map((s, i) => (<option key={i} value={i}>{s.label}</option>))}
                </select>
                <div className="battle-thumb"><CreatureSVG creature={cA} /></div>
                <div className="battle-name">{cA.name}</div>
                <CombatTags c={cA} />
              </div>
              <div className="battle-vs">
                <div className="battle-vs-word">VS</div>
              </div>
              <div className="battle-side">
                <select value={bIdx} onChange={(e) => setBIdx(Number(e.target.value))} className="compare-picker">
                  {sources.map((s, i) => (<option key={i} value={i}>{s.label}</option>))}
                </select>
                <div className="battle-thumb"><CreatureSVG creature={cB} /></div>
                <div className="battle-name">{cB.name}</div>
                <CombatTags c={cB} />
              </div>
            </div>
          )}

          {step === 'pick' && (
            <div className="battle-venue-row">
              {(Object.keys(VENUE_META) as Venue[]).map((v) => {
                const m = VENUE_META[v];
                return (
                  <button
                    key={v}
                    type="button"
                    className={`battle-venue${venue === v ? ' active' : ''}`}
                    onClick={() => setVenue(v)}
                    title={m.desc}
                  >
                    <div className="battle-venue-emoji">{m.emoji}</div>
                    <div className="battle-venue-label">{m.label}</div>
                    <div className="battle-venue-desc">{m.desc}</div>
                  </button>
                );
              })}
            </div>
          )}

          {step === 'pick' && (
            <div className="battle-controls">
              <button className="btn" type="button" onClick={startBattle}>
                {VENUE_META[venue].emoji} Fight!
              </button>
            </div>
          )}

          {(step === 'play' || step === 'done') && result && (
            <>
              <div className="battle-arena">
                <div className={`battle-arena-side${flash === 'A' ? ' flash' : ''}`}>
                  <div className="battle-thumb"><CreatureSVG creature={cA} /></div>
                  <div className="battle-name">{cA.name}</div>
                  {(venue === 'brawl') && (
                    <div className="battle-hp">
                      <div className="battle-hp-bar"><div className="battle-hp-fill" style={{ width: `${Math.max(0, hpA) * 100}%` }} /></div>
                      <small>HP {Math.round(hpA * 100)}%</small>
                    </div>
                  )}
                  {(venue === 'race' || venue === 'maze' || venue === 'dive') && (
                    <div className="battle-hp">
                      <div className="battle-hp-bar"><div className="battle-hp-fill battle-pos-fill" style={{ width: `${Math.max(0, posA) * 100}%` }} /></div>
                      <small>{venue === 'dive' ? 'depth' : 'progress'} {Math.round(posA * 100)}%</small>
                    </div>
                  )}
                </div>

                <div className="battle-arena-mid">
                  {venue === 'brawl' && <span className="battle-icon">{logIdx < result.steps.length ? '💥' : (result.winner === 'A' ? '🏆' : result.winner === 'B' ? '🏆' : '🤝')}</span>}
                  {venue === 'race' && <span className="battle-icon">🏁</span>}
                  {venue === 'maze' && <span className="battle-icon">🧩</span>}
                  {venue === 'dive' && <span className="battle-icon">🌊</span>}
                </div>

                <div className={`battle-arena-side${flash === 'B' ? ' flash' : ''}`}>
                  <div className="battle-thumb"><CreatureSVG creature={cB} /></div>
                  <div className="battle-name">{cB.name}</div>
                  {(venue === 'brawl') && (
                    <div className="battle-hp">
                      <div className="battle-hp-bar"><div className="battle-hp-fill" style={{ width: `${Math.max(0, hpB) * 100}%` }} /></div>
                      <small>HP {Math.round(hpB * 100)}%</small>
                    </div>
                  )}
                  {(venue === 'race' || venue === 'maze' || venue === 'dive') && (
                    <div className="battle-hp">
                      <div className="battle-hp-bar"><div className="battle-hp-fill battle-pos-fill" style={{ width: `${Math.max(0, posB) * 100}%` }} /></div>
                      <small>{venue === 'dive' ? 'depth' : 'progress'} {Math.round(posB * 100)}%</small>
                    </div>
                  )}
                </div>
              </div>

              <div className="battle-log">
                {visible.slice(-6).map((s, i) => (
                  <div key={`${logIdx}-${i}`} className="battle-log-line">{s.text}</div>
                ))}
              </div>

              {step === 'done' && (
                <div className="battle-result">
                  <div className="battle-result-title">
                    {result.winner === 'draw'
                      ? '🤝 Draw'
                      : result.winner === 'A'
                        ? `🏆 ${cA.name} wins!`
                        : `🏆 ${cB.name} wins!`}
                  </div>
                  <div className="battle-result-reason">{result.reason}</div>
                </div>
              )}

              <div className="battle-controls">
                {step === 'play' && (
                  <button className="btn btn-secondary" type="button" onClick={skipToEnd}>Skip to result</button>
                )}
                {step === 'done' && (
                  <>
                    <button className="btn" type="button" onClick={rematch}>🔁 Rematch</button>
                    <button className="btn btn-secondary" type="button" onClick={backToPick}>Switch creatures</button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CombatTags({ c }: { c: Creature }) {
  return (
    <div className="battle-tags">
      <span>{c.bodyPlan} · {c.warmBlooded ? 'warm' : 'cold'}</span>
      {c.hybrids.length > 0 && (
        <div className="battle-tag-hybrids">
          {c.hybrids.map((h) => {
            const info = hybridCatalog.find((x) => x.id === h);
            return <span key={h} className="battle-hybrid">{info?.emoji}</span>;
          })}
        </div>
      )}
    </div>
  );
}
