import { useMemo, useState } from 'react';
import { defaultCreature } from './types';
import type { Creature } from './types';
import { computeStats } from './physics';
import { Builder } from './components/Builder';
import { CreatureSVG } from './components/CreatureSVG';
import { StatsPanel } from './components/StatsPanel';
import { ComparePanel } from './components/ComparePanel';
import { ChaseArena } from './components/ChaseArena';
import { ClimbArena } from './components/ClimbArena';
import { DroughtArena } from './components/DroughtArena';
import { HuntArena } from './components/HuntArena';
import { DeepArena } from './components/DeepArena';
import { MazeArena } from './components/MazeArena';
import { InsightCard } from './components/InsightCard';
import { AlbumPanel } from './components/AlbumPanel';
import { EvolveModal } from './components/EvolveModal';
import { AboutModal } from './components/AboutModal';
import { TournamentHUD, BetweenRounds, TournamentResults } from './components/TournamentUI';
import { pickInsight } from './data/insights';
import type { Insight, ArenaResult } from './data/insights';
import { randomCreature, suggestName } from './data/randomCreature';
import type { TournamentState } from './data/tournament';
import { TOURNAMENT_ORDER, scoreArena, difficultyFor } from './data/tournament';
import { sounds, isMuted, setMuted } from './sounds';
import './App.css';

type ArenaId = 'chase' | 'climb' | 'drought' | 'hunt' | 'deep' | 'maze';

const arenaTabs: { id: ArenaId; label: string }[] = [
  { id: 'chase', label: '🦌 Chase' },
  { id: 'hunt', label: '🌳 Hunt' },
  { id: 'climb', label: '🏔 Climb' },
  { id: 'drought', label: '☀️ Drought' },
  { id: 'deep', label: '🌊 Deep' },
  { id: 'maze', label: '🧩 Maze' },
];

export default function App() {
  const [creature, setCreature] = useState<Creature>(defaultCreature);
  const stats = useMemo(() => computeStats(creature), [creature]);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [arenaId, setArenaId] = useState<ArenaId>('chase');
  const [showEvolve, setShowEvolve] = useState(false);
  const [muted, setMutedState] = useState<boolean>(() => isMuted());
  const [fullscreen, setFullscreen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [generation, setGeneration] = useState(1);
  const [tournament, setTournament] = useState<TournamentState | null>(null);

  const effectiveArenaId: ArenaId = tournament ? TOURNAMENT_ORDER[tournament.round - 1] : arenaId;
  const effectiveGeneration = tournament ? tournament.generation : generation;

  const finish = (r: ArenaResult) => {
    if (tournament) {
      const points = scoreArena(r, tournament.generation);
      const result = {
        arena: r.arena as ArenaId,
        won: r.won,
        points,
        difficulty: difficultyFor(r.arena as ArenaId, tournament.generation),
      };
      const newResults = [...tournament.results, result];
      const isLast = tournament.round >= TOURNAMENT_ORDER.length;
      setTournament({
        ...tournament,
        results: newResults,
        phase: isLast ? 'finished' : 'between-rounds',
      });
      if (r.won) sounds.win();
      else sounds.lose();
      return;
    }
    const i = pickInsight(r, stats.massKg);
    if (i.won) sounds.win();
    else sounds.lose();
    setInsight(i);
  };

  function startTournament() {
    setTournament({ round: 1, results: [], phase: 'playing', generation: 1 });
    setGeneration(1);
    sounds.start();
  }

  function continueTournament() {
    if (!tournament) return;
    if (tournament.phase === 'finished') return;
    setTournament({ ...tournament, round: tournament.round + 1, phase: 'playing' });
    sounds.click();
  }

  function tournamentMutate() {
    if (!tournament) return;
    setShowEvolve(true);
  }

  function exitTournament() {
    setTournament(null);
    sounds.click();
  }

  function openEvolveFromInsight() {
    setInsight(null);
    setShowEvolve(true);
    sounds.click();
  }

  function pickArena(id: ArenaId) {
    setArenaId(id);
    sounds.click();
  }

  function doRandom() {
    setCreature(randomCreature());
    sounds.click();
  }

  function doReset() {
    setCreature(defaultCreature);
    setGeneration(1);
    sounds.click();
  }

  function doSuggestName() {
    setCreature({ ...creature, name: suggestName(creature) });
    sounds.click();
  }

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) sounds.click();
  }

  function renderArena() {
    const id = effectiveArenaId;
    const gen = effectiveGeneration;
    if (id === 'chase') return <ChaseArena creature={creature} stats={stats} generation={gen} onFinish={(o) => finish({ arena: 'chase', ...o })} />;
    if (id === 'hunt') return <HuntArena creature={creature} stats={stats} onFinish={(o) => finish({ arena: 'hunt', ...o })} />;
    if (id === 'climb') return <ClimbArena creature={creature} stats={stats} generation={gen} onFinish={(o) => finish({ arena: 'climb', ...o })} />;
    if (id === 'drought') return <DroughtArena creature={creature} stats={stats} generation={gen} onFinish={(o) => finish({ arena: 'drought', ...o })} />;
    if (id === 'deep') return <DeepArena creature={creature} stats={stats} onFinish={(o) => finish({ arena: 'deep', ...o })} />;
    if (id === 'maze') return <MazeArena creature={creature} stats={stats} onFinish={(o) => finish({ arena: 'maze', ...o })} />;
    return null;
  }

  if (fullscreen) {
    return (
      <div className="fullscreen">
        <header className="fs-header">
          <button className="header-btn" type="button" onClick={() => { setFullscreen(false); sounds.click(); }}>
            ← Back to builder
          </button>
          <div className="fs-creature">
            <strong>🦎 {creature.name} <span className="gen-badge">🧬 Gen {generation}</span></strong>
            <span>{stats.massKg < 1 ? `${Math.round(stats.massKg * 1000)} g` : `${stats.massKg < 10 ? stats.massKg.toFixed(1) : Math.round(stats.massKg)} kg`} · {stats.topSpeedKmh} km/h · {stats.enduranceKm} km · cold {Math.round(stats.coldTolerance)}</span>
          </div>
          <div className="fs-arena-tabs">
            {arenaTabs.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`arena-tab${arenaId === t.id ? ' active' : ''}`}
                onClick={() => pickArena(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </header>
        <div className="fs-stage">{renderArena()}</div>
        {insight && (
          <InsightCard
            insight={insight}
            onClose={() => setInsight(null)}
            onEvolve={insight.won ? openEvolveFromInsight : undefined}
          />
        )}
        {showEvolve && (
          <EvolveModal
            parent={creature}
            onPick={(c) => { setCreature(c); setShowEvolve(false); sounds.click(); }}
            onClose={() => setShowEvolve(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <div className="header-title">
          <h1>🦎 Critter Forge</h1>
          <span className="sub">design a creature — real biology decides if it survives</span>
        </div>
        <div className="header-actions">
          <button className="header-btn" type="button" onClick={doRandom} title="Random creature">🎲 Random</button>
          <button className="header-btn" type="button" onClick={doSuggestName} title="Suggest a name based on traits">✏️ Name</button>
          <button className="header-btn" type="button" onClick={doReset} title="Reset to default">↺ Reset</button>
          <button className="header-btn" type="button" onClick={toggleMute} title={muted ? 'Unmute' : 'Mute'}>
            {muted ? '🔇' : '🔊'}
          </button>
          {!tournament ? (
            <button className="header-btn header-btn-primary" type="button" onClick={startTournament} title="Run a full tournament">🏆 Tournament</button>
          ) : (
            <button className="header-btn header-btn-primary" type="button" onClick={exitTournament} title="Leave tournament">🚪 Exit</button>
          )}
          <button className="header-btn" type="button" onClick={() => { setShowAbout(true); sounds.click(); }} title="About this game">ℹ About</button>
        </div>
      </header>
      <main>
        <section className="col col-build">
          <Builder creature={creature} onChange={setCreature} />
        </section>

        <section className="col col-creature">
          <div className="creature-stage">
            <CreatureSVG creature={creature} />
          </div>
          <div className="creature-name">
            <span className="gen-badge">🧬 Gen {generation}</span>
            {creature.name}
          </div>
          <StatsPanel creature={creature} stats={stats} />
        </section>

        <section className="col col-game">
          {tournament ? (
            <TournamentHUD t={tournament} />
          ) : (
            <div className="arena-tabs">
              {arenaTabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`arena-tab${arenaId === t.id ? ' active' : ''}`}
                  onClick={() => pickArena(t.id)}
                >
                  {t.label}
                </button>
              ))}
              <button
                type="button"
                className="arena-expand"
                onClick={() => { setFullscreen(true); sounds.click(); }}
                title="Play in fullscreen"
              >
                ⛶
              </button>
            </div>
          )}

          {renderArena()}

          {!tournament && <ComparePanel stats={stats} onLoadPreset={(c) => { setCreature(c); sounds.click(); }} />}
        </section>
      </main>

      <AlbumPanel current={creature} onLoad={(c) => { setCreature(c); sounds.click(); }} onSaved={() => sounds.save()} />

      {insight && (
        <InsightCard
          insight={insight}
          onClose={() => setInsight(null)}
          onEvolve={insight.won ? openEvolveFromInsight : undefined}
        />
      )}
      {showEvolve && (
        <EvolveModal
          parent={creature}
          onPick={(c) => {
            setCreature(c);
            if (tournament) {
              setTournament({
                ...tournament,
                generation: tournament.generation + 1,
                round: tournament.round + 1,
                phase: 'playing',
              });
            } else {
              setGeneration((g) => g + 1);
            }
            setShowEvolve(false);
            sounds.click();
          }}
          onClose={() => setShowEvolve(false)}
        />
      )}

      {tournament?.phase === 'between-rounds' && (
        <BetweenRounds
          t={tournament}
          creature={creature}
          onMutate={tournamentMutate}
          onContinue={continueTournament}
        />
      )}
      {tournament?.phase === 'finished' && (
        <TournamentResults
          t={tournament}
          creature={creature}
          onRestart={startTournament}
          onExit={exitTournament}
        />
      )}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </div>
  );
}
