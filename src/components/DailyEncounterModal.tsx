import { useMemo, useState, useEffect } from 'react';
import type { Creature } from '../types';
import { CreatureSVG } from './CreatureSVG';
import { hybridCatalog } from '../data/hybrids';
import {
  dailyRival, getDailyStatus, getStreak, getBestStreak,
  todayKey,
} from '../data/dailyEncounter';
import { simulateBattle, VENUE_META } from '../data/battle';
import type { Venue } from '../data/battle';
import { BattleArenaScene } from './BattleArenaScene';

interface Props {
  player: Creature;
  onClose: () => void;
  onChallengeResolved: (won: boolean) => void;   // parent records win/loss + streak
}

const DIFFICULTY_META: Record<'easy' | 'medium' | 'hard', { label: string; color: string }> = {
  easy:   { label: 'EASY',   color: '#5a8a3a' },
  medium: { label: 'MEDIUM', color: '#c08030' },
  hard:   { label: 'HARD',   color: '#a83030' },
};

export function DailyEncounterModal({ player, onClose, onChallengeResolved }: Props) {
  const date = todayKey();
  const { creature: rival, difficulty } = useMemo(() => dailyRival(date), [date]);
  const initialStatus = getDailyStatus(date);
  const streak = getStreak();
  const best = getBestStreak();

  type Phase = 'briefing' | 'venue-pick' | 'playing' | 'done';
  const [phase, setPhase] = useState<Phase>(initialStatus === 'pending' ? 'briefing' : 'done');
  const [venue, setVenue] = useState<Venue>('brawl');
  const [result, setResult] = useState<ReturnType<typeof simulateBattle> | null>(null);
  const [logIdx, setLogIdx] = useState(0);
  const [finalWin, setFinalWin] = useState<boolean | null>(initialStatus === 'won' ? true : initialStatus === 'lost' ? false : null);

  function startBattle() {
    const r = simulateBattle(player, rival, venue);
    setResult(r);
    setLogIdx(0);
    setPhase('playing');
  }

  useEffect(() => {
    if (phase !== 'playing' || !result) return;
    if (logIdx >= result.steps.length) {
      const won = result.winner === 'A';
      setFinalWin(won);
      onChallengeResolved(won);
      setPhase('done');
      return;
    }
    const interval = venue === 'brawl' ? 600 : venue === 'race' ? 200 : venue === 'maze' ? 850 : 320;
    const t = window.setTimeout(() => setLogIdx((i) => i + 1), interval);
    return () => window.clearTimeout(t);
  }, [phase, logIdx, result, venue, onChallengeResolved]);

  const latest = result?.steps[Math.min(logIdx, (result?.steps.length ?? 1) - 1)];
  const hpA = latest?.hpA ?? 1;
  const hpB = latest?.hpB ?? 1;
  const posA = latest?.posA ?? 0;
  const posB = latest?.posB ?? 0;
  const flash = latest?.flash;

  return (
    <div className="insight-overlay" onClick={onClose}>
      <div className="about-modal daily-encounter" onClick={(e) => e.stopPropagation()}>
        <div className="about-head">
          <h2>📅 Today's Wild Encounter</h2>
          <button className="about-close" type="button" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="about-content">
          {/* Streak header */}
          <div className="daily-streak">
            <div className="daily-streak-current">
              <span className="daily-streak-emoji">🔥</span>
              <div>
                <div className="daily-streak-num">{streak}</div>
                <small>current streak</small>
              </div>
            </div>
            <div className="daily-streak-best">
              <small>Best: <strong>{best}</strong></small>
            </div>
          </div>

          {phase === 'briefing' && (
            <RivalBriefing
              rival={rival}
              difficulty={difficulty}
              onAccept={() => setPhase('venue-pick')}
            />
          )}

          {phase === 'venue-pick' && (
            <div className="daily-venue-pick">
              <p style={{ fontSize: 13, marginBottom: 10 }}>
                Pick a venue to face <strong>{rival.name}</strong>:
              </p>
              <div className="battle-venue-row">
                {(Object.keys(VENUE_META) as Venue[]).map((v) => (
                  <button
                    key={v}
                    type="button"
                    className={`battle-venue${venue === v ? ' active' : ''}`}
                    onClick={() => setVenue(v)}
                    title={VENUE_META[v].desc}
                  >
                    <div className="battle-venue-emoji">{VENUE_META[v].emoji}</div>
                    <div className="battle-venue-label">{VENUE_META[v].label}</div>
                  </button>
                ))}
              </div>
              <div className="battle-controls">
                <button className="btn" type="button" onClick={startBattle}>
                  {VENUE_META[venue].emoji} Fight!
                </button>
                <button className="btn btn-secondary" type="button" onClick={() => setPhase('briefing')}>
                  ← Back
                </button>
              </div>
            </div>
          )}

          {phase === 'playing' && result && (
            <div className="battle-scene">
              <BattleArenaScene
                creatureA={player}
                creatureB={rival}
                venue={venue}
                posA={posA}
                posB={posB}
                hpA={hpA}
                hpB={hpB}
                flash={flash}
                winner={null}
                finished={false}
              />
            </div>
          )}

          {phase === 'done' && finalWin !== null && (
            <DailyResult
              won={finalWin}
              rival={rival}
              newStreak={getStreak()}
              isReplay={initialStatus !== 'pending'}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function RivalBriefing({
  rival, difficulty, onAccept,
}: { rival: Creature; difficulty: 'easy' | 'medium' | 'hard'; onAccept: () => void }) {
  const diffMeta = DIFFICULTY_META[difficulty];
  return (
    <div className="daily-briefing">
      <div className="daily-briefing-card">
        <div className="daily-briefing-thumb">
          <CreatureSVG creature={rival} />
        </div>
        <div className="daily-briefing-info">
          <div className="daily-rival-name">{rival.name}</div>
          <div className="daily-difficulty" style={{ background: diffMeta.color }}>
            {diffMeta.label}
          </div>
          <div className="daily-rival-stats">
            <span>{rival.bodyPlan}</span>
            <span>{rival.warmBlooded ? 'warm' : 'cold'}-blooded</span>
            <span>Brain: {['Tiny', 'Standard', 'Big', 'Genius'][rival.brainTier]}</span>
            <span>Legs: {['Stubby', 'Standard', 'Runner'][rival.legTier]}</span>
            <span>Defense: {['None', 'Fur/scales', 'Armor'][rival.defenseTier]}</span>
            <span>Senses: {['Simple', 'Sharp', 'Sonar'][rival.sensorTier]}</span>
          </div>
          {rival.hybrids.length > 0 && (
            <div className="daily-rival-hybrids">
              <strong>Hybrid traits:</strong>{' '}
              {rival.hybrids.map((h) => {
                const info = hybridCatalog.find((x) => x.id === h);
                return <span key={h} className="daily-hybrid">{info?.emoji} {info?.name}</span>;
              })}
            </div>
          )}
        </div>
      </div>
      <p className="daily-briefing-flavour">
        A wild rival appears. Beat them today to extend your streak. Choose your fighter and venue carefully —
        you only get one shot per day.
      </p>
      <div className="battle-controls">
        <button className="btn" type="button" onClick={onAccept}>⚔️ Accept Challenge</button>
      </div>
    </div>
  );
}

function DailyResult({
  won, rival, newStreak, isReplay, onClose,
}: { won: boolean; rival: Creature; newStreak: number; isReplay: boolean; onClose: () => void }) {
  return (
    <div className="daily-result">
      <div className="daily-result-title">
        {isReplay && won && '✅ Already won today!'}
        {isReplay && !won && '❌ Already faced today'}
        {!isReplay && won && '🏆 Victory!'}
        {!isReplay && !won && '💔 Defeated'}
      </div>
      <div className="daily-result-thumb">
        <CreatureSVG creature={rival} />
      </div>
      <div className="daily-result-name">{rival.name}</div>
      {!isReplay && won && (
        <p style={{ marginTop: 10, fontSize: 14 }}>
          Streak: <strong style={{ color: '#c08030', fontSize: 16 }}>🔥 {newStreak}</strong>
        </p>
      )}
      {!isReplay && !won && (
        <p style={{ marginTop: 10, fontSize: 13, color: 'var(--fg-dim)' }}>
          Streak reset to 0. Come back tomorrow for a new challenger.
        </p>
      )}
      {isReplay && (
        <p style={{ marginTop: 10, fontSize: 13, color: 'var(--fg-dim)' }}>
          You already played today's encounter. Come back tomorrow at midnight for a new rival.
        </p>
      )}
      <div className="battle-controls" style={{ marginTop: 14 }}>
        <button className="btn" type="button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
