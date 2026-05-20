import type { Creature } from '../types';
import type { TournamentState } from '../data/tournament';
import { TOURNAMENT_ORDER, ARENA_LABELS, difficultyFor, MEDAL_NAMES, finalRank, creatureEpithet } from '../data/tournament';
import { CreatureSVG } from './CreatureSVG';

export function TournamentHUD({ t }: { t: TournamentState }) {
  const total = t.results.reduce((acc, r) => acc + r.points, 0);
  const won = t.results.filter((r) => r.won).length;
  const currentArena = TOURNAMENT_ORDER[t.round - 1];
  const cur = ARENA_LABELS[currentArena];
  const next = t.round < TOURNAMENT_ORDER.length ? ARENA_LABELS[TOURNAMENT_ORDER[t.round]] : null;
  return (
    <div className="tournament-hud">
      <div className="tournament-row">
        <span className="tournament-pill">🏆 Tournament</span>
        <span className="tournament-round">Round {t.round} / {TOURNAMENT_ORDER.length}</span>
        <span className="tournament-total">{total} pts · {won} win{won !== 1 ? 's' : ''}</span>
      </div>
      <div className="tournament-progress">
        {TOURNAMENT_ORDER.map((arena, i) => {
          const result = t.results[i];
          const isCurrent = i + 1 === t.round && t.phase !== 'finished';
          const cls = result ? (result.won ? ' won' : ' lost') : isCurrent ? ' current' : '';
          return (
            <div key={arena} className={`tournament-step${cls}`} title={ARENA_LABELS[arena].label}>
              <span>{ARENA_LABELS[arena].emoji}</span>
              {result && <small>{result.won ? `+${result.points}` : '0'}</small>}
            </div>
          );
        })}
      </div>
      {next && t.phase !== 'finished' && (
        <div className="tournament-now">
          Now: <strong>{cur.emoji} {cur.label}</strong> · Next: {next.emoji} {next.label}
        </div>
      )}
    </div>
  );
}

interface BetweenProps {
  t: TournamentState;
  creature: Creature;
  onMutate: () => void;
  onContinue: () => void;
}

export function BetweenRounds({ t, creature, onMutate, onContinue }: BetweenProps) {
  const last = t.results[t.results.length - 1];
  if (!last) return null;
  const arena = ARENA_LABELS[last.arena];
  const total = t.results.reduce((acc, r) => acc + r.points, 0);
  const remaining = TOURNAMENT_ORDER.length - t.round;
  const nextArena = remaining > 0 ? ARENA_LABELS[TOURNAMENT_ORDER[t.round]] : null;
  return (
    <div className="insight-overlay" onClick={onContinue}>
      <div className="between-modal" onClick={(e) => e.stopPropagation()}>
        <h3>
          {arena.emoji} Round {t.round} · {last.won ? 'Won!' : 'Lost'}
        </h3>
        <div className="between-score">
          {last.won ? (
            <p><strong>+{last.points} points</strong> (difficulty {last.difficulty})</p>
          ) : (
            <p><strong>0 points</strong> — try a different design for next time</p>
          )}
          <p className="between-total">Tournament total: <strong>{total} pts</strong></p>
        </div>
        {nextArena && (
          <p className="between-next">
            Next up: <strong>{nextArena.emoji} {nextArena.label}</strong>. Want to evolve before the next round?
          </p>
        )}
        <div className="between-actions">
          {nextArena && (
            <>
              <button className="btn" type="button" onClick={onMutate}>
                🥚 Mutate creature
              </button>
              <button className="btn btn-secondary" type="button" onClick={onContinue}>
                Keep & continue →
              </button>
            </>
          )}
          {!nextArena && (
            <button className="btn" type="button" onClick={onContinue}>
              See final results 🏆
            </button>
          )}
        </div>
        <CreatureMini creature={creature} />
      </div>
    </div>
  );
}

function CreatureMini({ creature }: { creature: Creature }) {
  return (
    <div className="between-creature">
      <div className="between-thumb">
        <CreatureSVG creature={creature} />
      </div>
      <small>{creature.name}</small>
    </div>
  );
}

interface ResultsProps {
  t: TournamentState;
  creature: Creature;
  onRestart: () => void;
  onExit: () => void;
}

export function TournamentResults({ t, creature, onRestart, onExit }: ResultsProps) {
  const total = t.results.reduce((acc, r) => acc + r.points, 0);
  const wonCount = t.results.filter((r) => r.won).length;
  const rank = finalRank(total, wonCount);
  const epithet = creatureEpithet(creature);
  const championName = `${creature.name} ${epithet}`;
  const medals = t.results.filter((r) => r.won).map((r) => ({
    arena: r.arena,
    medal: MEDAL_NAMES[r.arena],
    points: r.points,
  }));

  return (
    <div className="insight-overlay" onClick={onExit}>
      <div className="results-modal" onClick={(e) => e.stopPropagation()}>
        <div className="results-rank">
          <div className="results-emoji">{rank.emoji}</div>
          <h2>{rank.title}</h2>
          <p className="results-flavor">{rank.flavor}</p>
        </div>

        <div className="results-creature">
          <div className="results-thumb">
            <CreatureSVG creature={creature} />
          </div>
          <div className="results-name">
            {championName}
            <small>Tournament across {t.generation} generation{t.generation !== 1 ? 's' : ''}</small>
          </div>
        </div>

        <div className="results-grid">
          <div className="results-score">
            <span className="results-score-num">{total}</span>
            <span className="results-score-label">points</span>
          </div>
          <div className="results-score">
            <span className="results-score-num">{wonCount}/{TOURNAMENT_ORDER.length}</span>
            <span className="results-score-label">arenas won</span>
          </div>
        </div>

        {medals.length > 0 && (
          <>
            <h4 className="results-medals-title">Medals earned</h4>
            <ul className="results-medals">
              {medals.map((m) => (
                <li key={m.arena}>
                  <span className="medal-emoji">{ARENA_LABELS[m.arena].emoji}</span>
                  <strong>{m.medal}</strong>
                  <small>+{m.points}</small>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="results-perround">
          <h4>Round breakdown</h4>
          {t.results.map((r, i) => (
            <div key={i} className="results-round">
              <span>{ARENA_LABELS[r.arena].emoji} {ARENA_LABELS[r.arena].label}</span>
              <span className={r.won ? 'won-text' : 'lost-text'}>{r.won ? `+${r.points}` : '0'}</span>
              <small>(difficulty {r.difficulty})</small>
            </div>
          ))}
        </div>

        <div className="results-actions">
          <button className="btn" type="button" onClick={onRestart}>
            🏆 Run another tournament
          </button>
          <button className="btn btn-secondary" type="button" onClick={onExit}>
            Back to builder
          </button>
        </div>
      </div>
    </div>
  );
}

export function maxPossible(generation: number): number {
  return TOURNAMENT_ORDER.reduce((sum, a) => sum + difficultyFor(a, generation), 0);
}
