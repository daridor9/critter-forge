import { useMemo, useState } from 'react';
import type { Creature } from '../types';
import { ANIMAL_DEX } from '../data/animalDex';
import { CreatureSVG } from './CreatureSVG';
import {
  buildBracket,
  playMatch,
  nextPlayableMatch,
  isBracketDone,
  bracketChampion,
} from '../data/bracket';
import type { Bracket, BracketEntrant } from '../data/bracket';
import type { Venue } from '../data/battle';
import { VENUE_META } from '../data/battle';
import { recordBattle } from '../data/profile';
import { tryUnlock, checkStatsAchievements } from '../data/achievements';
import { awardPoints, pointsForBattleWin, bracketRules, getCreatureTotal, creatureHash } from '../data/points';

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

type Step = 'setup' | 'running' | 'done';

export function BracketModal({ current, onClose }: Props) {
  const sources = useMemo(() => gatherSources(current), [current]);
  const [size, setSize] = useState<4 | 8>(4);
  // Picked-source indices for each bracket slot.
  const [picks, setPicks] = useState<number[]>(() => Array.from({ length: 4 }, (_, i) => Math.min(i, sources.length - 1)));
  const [venuePolicy, setVenuePolicy] = useState<Bracket['venuePolicy']>('mixed');
  const [bracket, setBracket] = useState<Bracket | null>(null);
  const [step, setStep] = useState<Step>('setup');

  function changeSize(n: 4 | 8) {
    setSize(n);
    setPicks(Array.from({ length: n }, (_, i) => Math.min(i, sources.length - 1)));
  }

  // Bracket entry rules — per-creature minimum and a champion bonus.
  const rules = useMemo(() => bracketRules(size), [size]);

  // Auto-seed: each pick is shown with its point total; the bracket
  // sorts entrants by total descending so the top scorer is #1 seed.
  const seededEntries = useMemo(() => {
    return picks
      .map((idx) => {
        const c = sources[idx].creature;
        return { idx, creature: c, label: sources[idx].label, total: getCreatureTotal(c) };
      })
      .sort((a, b) => b.total - a.total);
  }, [picks, sources]);

  const allEligible = seededEntries.every((e) => e.total >= rules.minPointsPerEntrant);
  // Same creature can't be entered twice — would deadlock the points dedup.
  const uniqueHashes = new Set(seededEntries.map((e) => creatureHash(e.creature)));
  const allUnique = uniqueHashes.size === seededEntries.length;

  function start() {
    if (!allEligible || !allUnique) return;
    const entrants: BracketEntrant[] = seededEntries.map((e, seed) => ({
      seed,
      label: e.label,
      creature: e.creature,
    }));
    setBracket(buildBracket(entrants, venuePolicy));
    setStep('running');
  }

  function awardForMatch(b: Bracket, matchId: string) {
    const m = b.matches.find((x) => x.id === matchId);
    if (!m || !m.result || m.aSeed == null || m.bSeed == null) return;
    const cA = b.entrants[m.aSeed].creature;
    const cB = b.entrants[m.bSeed].creature;
    if (m.result.winner === 'A') {
      const spec = pointsForBattleWin(cA, cB, m.venue);
      awardPoints(cA, spec.challengeKey, spec.points, spec.difficulty, spec.description);
    } else if (m.result.winner === 'B') {
      const spec = pointsForBattleWin(cB, cA, m.venue);
      awardPoints(cB, spec.challengeKey, spec.points, spec.difficulty, spec.description);
    }
  }

  function playNext() {
    if (!bracket) return;
    const m = nextPlayableMatch(bracket);
    if (!m) {
      if (isBracketDone(bracket)) finishBracket(bracket);
      return;
    }
    const updated = playMatch(bracket, m.id);
    // Record the match in lifetime battle stats + award points.
    const justPlayed = updated.matches.find((x) => x.id === m.id);
    if (justPlayed?.result) recordBattle(m.venue, justPlayed.result.winner);
    awardForMatch(updated, m.id);
    setBracket(updated);
    if (isBracketDone(updated)) finishBracket(updated);
  }

  function playAll() {
    if (!bracket) return;
    let cur = bracket;
    let safety = 100;
    while (!isBracketDone(cur) && safety-- > 0) {
      const m = nextPlayableMatch(cur);
      if (!m) break;
      cur = playMatch(cur, m.id);
      const justPlayed = cur.matches.find((x) => x.id === m.id);
      if (justPlayed?.result) recordBattle(m.venue, justPlayed.result.winner);
      awardForMatch(cur, m.id);
    }
    setBracket(cur);
    finishBracket(cur);
  }

  function finishBracket(b: Bracket) {
    setStep('done');
    // Unlock bracket-champion badge + any stats-driven badges that this
    // burst of battles just crossed.
    tryUnlock('bracket-champ');
    checkStatsAchievements();
    // Champion bonus — fat one-time award keyed by the full bracket lineup
    // hash so the same matchup can't be re-run for the same payout.
    const champ = bracketChampion(b);
    if (champ) {
      const lineupKey = b.entrants
        .map((e) => creatureHash(e.creature))
        .sort()
        .join('|');
      awardPoints(
        champ.creature,
        `bracket-champ-${b.size}-${lineupKey}`,
        bracketRules(b.size).championBonus,
        bracketRules(b.size).championBonus,
        `${b.size}-creature bracket champion`,
      );
    }
  }

  function reset() {
    setBracket(null);
    setStep('setup');
  }

  return (
    <div className="insight-overlay" onClick={onClose}>
      <div className="about-modal bracket-modal" onClick={(e) => e.stopPropagation()}>
        <div className="about-head">
          <h2>🏆 Battle Bracket</h2>
          <button className="about-close" type="button" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="about-content">
          {step === 'setup' && (
            <>
              <div className="bracket-config">
                <div className="bracket-config-row">
                  <span><strong>Size:</strong></span>
                  <button type="button" className={`pill${size === 4 ? ' active' : ''}`} onClick={() => changeSize(4)}>4 entrants</button>
                  <button type="button" className={`pill${size === 8 ? ' active' : ''}`} onClick={() => changeSize(8)}>8 entrants</button>
                </div>
                <div className="bracket-config-row">
                  <span><strong>Venue:</strong></span>
                  <button type="button" className={`pill${venuePolicy === 'mixed' ? ' active' : ''}`} onClick={() => setVenuePolicy('mixed')}>🎲 Mixed</button>
                  {(['brawl', 'race', 'maze', 'dive'] as Venue[]).map((v) => (
                    <button key={v} type="button" className={`pill${venuePolicy === v ? ' active' : ''}`} onClick={() => setVenuePolicy(v)}>
                      {VENUE_META[v].emoji} {VENUE_META[v].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bracket-rules">
                <span>🏅 <strong>Entry fee:</strong> each entrant needs ≥ <strong>{rules.minPointsPerEntrant} pts</strong> to compete.</span>
                <span>🏆 <strong>Champion bonus:</strong> winner takes <strong>+{rules.championBonus} pts</strong>.</span>
                <span>📊 Entrants auto-seed by their point total — top scorer is #1.</span>
              </div>

              <h3>Pick the entrants</h3>
              <div className="bracket-pick-grid">
                {picks.map((idx, slot) => {
                  const c = sources[idx].creature;
                  const total = getCreatureTotal(c);
                  const eligible = total >= rules.minPointsPerEntrant;
                  return (
                    <div key={slot} className={`bracket-pick-cell${eligible ? '' : ' ineligible'}`}>
                      <select
                        value={idx}
                        onChange={(e) => {
                          const next = [...picks];
                          next[slot] = Number(e.target.value);
                          setPicks(next);
                        }}
                        className="compare-picker"
                      >
                        {sources.map((s, i) => {
                          const t = getCreatureTotal(s.creature);
                          return <option key={i} value={i}>{s.label} · {t} pts</option>;
                        })}
                      </select>
                      <div className="bracket-pick-thumb"><CreatureSVG creature={c} /></div>
                      <div className={`bracket-pick-points${eligible ? '' : ' short'}`}>
                        🏅 {total} pts
                        {!eligible && <small> · need {rules.minPointsPerEntrant}</small>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {!allUnique && (
                <p className="bracket-warn">⚠ Two entrants share the same exact configuration — please pick distinct creatures.</p>
              )}
              {!allEligible && (
                <p className="bracket-warn">⚠ Some entrants are below the {rules.minPointsPerEntrant}-pt entry fee. Win arenas or 1-v-1 battles to qualify them.</p>
              )}

              <div className="battle-controls">
                <button className="btn" type="button" onClick={start} disabled={!allEligible || !allUnique}>
                  🏆 Start tournament
                </button>
              </div>
            </>
          )}

          {(step === 'running' || step === 'done') && bracket && (
            <>
              <BracketView bracket={bracket} />

              {step === 'done' && (
                <ChampionBanner bracket={bracket} />
              )}

              <div className="battle-controls">
                {step === 'running' && (
                  <>
                    <button className="btn" type="button" onClick={playNext}>▶ Play next match</button>
                    <button className="btn btn-secondary" type="button" onClick={playAll}>⏭ Auto-play to champion</button>
                  </>
                )}
                {step === 'done' && (
                  <button className="btn" type="button" onClick={reset}>↺ New tournament</button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function BracketView({ bracket }: { bracket: Bracket }) {
  const rounds = Math.log2(bracket.size);
  const roundsArr = Array.from({ length: rounds }, (_, r) => bracket.matches.filter((m) => m.round === r));
  const roundLabel = (r: number, total: number) =>
    r === total - 1 ? 'Final' : r === total - 2 ? 'Semifinals' : r === total - 3 ? 'Quarterfinals' : `Round ${r + 1}`;

  return (
    <div className="bracket-view">
      {roundsArr.map((round, r) => (
        <div key={r} className="bracket-round">
          <div className="bracket-round-label">{roundLabel(r, rounds)}</div>
          {round.map((m) => {
            const a = m.aSeed != null ? bracket.entrants[m.aSeed] : null;
            const b = m.bSeed != null ? bracket.entrants[m.bSeed] : null;
            const winA = m.winner === 'A';
            const winB = m.winner === 'B';
            const venue = VENUE_META[m.venue];
            return (
              <div key={m.id} className={`bracket-match${m.result ? ' resolved' : ''}`}>
                <div className="bracket-venue">{venue.emoji} {venue.label}</div>
                <BracketSlot entrant={a} won={winA} />
                <BracketSlot entrant={b} won={winB} />
                {m.result && (
                  <div className="bracket-reason"><small>{m.result.reason}</small></div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function BracketSlot({ entrant, won }: { entrant: { seed: number; label: string; creature: Creature } | null; won: boolean }) {
  if (!entrant) {
    return (
      <div className="bracket-slot bracket-slot-tbd">
        <span className="bracket-slot-name">TBD</span>
      </div>
    );
  }
  return (
    <div className={`bracket-slot${won ? ' won' : ''}`}>
      <div className="bracket-slot-thumb"><CreatureSVG creature={entrant.creature} /></div>
      <span className="bracket-slot-name">{won ? '🏆 ' : ''}{entrant.creature.name}</span>
      <small className="bracket-slot-seed">#{entrant.seed + 1}</small>
    </div>
  );
}

function ChampionBanner({ bracket }: { bracket: Bracket }) {
  const c = bracketChampion(bracket);
  if (!c) return null;
  return (
    <div className="bracket-champion">
      <div className="bracket-champion-icon">👑</div>
      <div className="bracket-champion-name">{c.creature.name}</div>
      <div className="bracket-champion-sub">{bracket.size}-creature champion — beat {Math.log2(bracket.size)} opponents</div>
      <div className="bracket-champion-thumb"><CreatureSVG creature={c.creature} /></div>
    </div>
  );
}
