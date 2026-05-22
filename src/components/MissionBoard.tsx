import type { Creature } from '../types';
import { QUESTS, getTodayQuest, loadCompletedQuests } from '../data/quests';
import { loadProfile } from '../data/profile';
import { arenaFitFor, fitEmoji } from '../data/arenaFit';
import type { ArenaId } from '../data/arenaFit';

const ARENAS: { id: ArenaId; label: string }[] = [
  { id: 'chase', label: 'Chase' },
  { id: 'hunt', label: 'Hunt' },
  { id: 'climb', label: 'Climb' },
  { id: 'drought', label: 'Drought' },
  { id: 'deep', label: 'Deep' },
  { id: 'maze', label: 'Maze' },
];

interface Props {
  creature: Creature;
  generation: number;
  onOpenQuests: () => void;
  onStartTournament: () => void;
}

export function MissionBoard({ creature, generation, onOpenQuests, onStartTournament }: Props) {
  const profile = loadProfile();
  const completed = loadCompletedQuests();
  const today = getTodayQuest();
  const wonArenas = ARENAS.filter((a) => (profile.winsByArena[a.id] ?? 0) > 0);
  const nextQuests = QUESTS
    .filter((q) => !completed.has(q.id) && q.id !== today.quest.id)
    .slice(0, 3);
  const goodFits = ARENAS
    .map((arena) => ({ ...arena, fit: arenaFitFor(arena.id, creature) }))
    .filter((arena) => arena.fit.fit === 'great')
    .slice(0, 3);

  return (
    <section className="mission-board">
      <div className="mission-head">
        <div>
          <h2>Mission board</h2>
          <p>Build, test, evolve, collect.</p>
        </div>
        <div className="mission-rank">
          <span>{wonArenas.length}/6</span>
          arenas
        </div>
      </div>

      <div className="mission-apex">
        <div className="mission-apex-title">Apex Designer path</div>
        <div className="mission-arena-track" aria-label="Arena wins">
          {ARENAS.map((arena) => {
            const won = (profile.winsByArena[arena.id] ?? 0) > 0;
            return (
              <span key={arena.id} className={won ? 'won' : ''}>
                {won ? '✓' : '○'} {arena.label}
              </span>
            );
          })}
        </div>
      </div>

      <div className="mission-current">
        <div>
          <strong>Best tests for {creature.name}</strong>
          <span>
            {goodFits.length > 0
              ? goodFits.map((a) => `${fitEmoji(a.fit.fit)} ${a.label}`).join(' · ')
              : 'Try an arena with a yellow dot and learn what breaks.'}
          </span>
        </div>
        <div>
          <strong>Generation</strong>
          <span>Gen {generation} · wins unlock evolution choices</span>
        </div>
      </div>

      <div className="mission-next">
        <div className="mission-next-title">Next challenges</div>
        <div className="mission-list">
          <button type="button" onClick={onOpenQuests}>
            <span>{today.completed ? '✓' : '📅'}</span>
            <span>{today.quest.title}</span>
          </button>
          {nextQuests.map((q) => (
            <button key={q.id} type="button" onClick={onOpenQuests}>
              <span>{q.emoji}</span>
              <span>{q.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mission-actions">
        <button type="button" className="btn btn-secondary" onClick={onOpenQuests}>
          🎯 Quests
        </button>
        <button type="button" className="btn" onClick={onStartTournament}>
          🏆 Tournament
        </button>
      </div>
    </section>
  );
}
