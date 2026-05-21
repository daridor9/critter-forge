import { useEffect, useMemo, useRef, useState } from 'react';
import { defaultCreature } from './types';
import type { Creature } from './types';
import { computeStats } from './physics';
import { Builder } from './components/Builder';
import { CreatureStage } from './components/CreatureStage';
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
import { DexModal } from './components/DexModal';
import { AchievementsModal, AchievementToast } from './components/AchievementsModal';
import { ProfileModal } from './components/ProfileModal';
import { QuestsModal } from './components/QuestsModal';
import { DailyChallengeModal } from './components/DailyChallenge';
import { CompareModal } from './components/CompareModal';
import { LineageModal } from './components/LineageModal';
import { checkQuests, getTodayQuest, markDailyComplete } from './data/quests';
import { exportCreatureCard } from './utils/exportCreature';
import { recordRoot, recordEvolve } from './data/lineage';
import {
  recordArena,
  recordChaseCatch,
  recordGeneration,
  recordEvolved,
  recordBred,
  recordTournament,
  recordSaved,
  recordSharedImport,
} from './data/profile';
import { FoodEconomyPanel } from './components/FoodEconomyPanel';
import { TournamentHUD, BetweenRounds, TournamentResults } from './components/TournamentUI';
import { pickInsight } from './data/insights';
import type { Insight, ArenaResult } from './data/insights';
import { randomCreature, suggestName } from './data/randomCreature';
import { adjustCreatureForStat } from './data/statAdjusters';
import type { StatKey } from './data/statAdjusters';
import type { TournamentState } from './data/tournament';
import { TOURNAMENT_ORDER, scoreArena, difficultyFor } from './data/tournament';
import type { Achievement } from './data/achievements';
import {
  tryUnlock,
  checkArenaWin,
  checkCreatureAchievements,
  checkSaveAchievements,
  checkGenAchievements,
} from './data/achievements';
import { buildShareLink, readCreatureFromHash, clearCreatureHash } from './utils/shareLink';
import { sizeToMass } from './physics';
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
  const [creature, setCreatureRaw] = useState<Creature>(defaultCreature);
  const [undoStack, setUndoStack] = useState<Creature[]>([]);

  function setCreature(next: Creature | ((prev: Creature) => Creature)) {
    const resolved = typeof next === 'function' ? (next as (p: Creature) => Creature)(creature) : next;
    if (resolved !== creature) {
      setUndoStack((s) => [...s.slice(-19), creature]);
    }
    setCreatureRaw(resolved);
  }

  function undo() {
    setUndoStack((s) => {
      if (s.length === 0) return s;
      const prev = s[s.length - 1];
      setCreatureRaw(prev);
      sounds.click();
      return s.slice(0, -1);
    });
  }
  const stats = useMemo(() => computeStats(creature), [creature]);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [arenaId, setArenaId] = useState<ArenaId>('chase');
  const [showEvolve, setShowEvolve] = useState(false);
  const [muted, setMutedState] = useState<boolean>(() => isMuted());
  const [fullscreen, setFullscreen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [generation, setGeneration] = useState(1);
  const [tournament, setTournament] = useState<TournamentState | null>(null);
  const [showDex, setShowDex] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showQuests, setShowQuests] = useState(false);
  const [showDaily, setShowDaily] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [showLineage, setShowLineage] = useState(false);
  const [xray, setXray] = useState(false);
  const [lineageId, setLineageId] = useState<string | null>(() => recordRoot(defaultCreature));
  const [toasts, setToasts] = useState<Achievement[]>([]);
  const toastTimers = useRef<number[]>([]);

  function pushToasts(items: Achievement[]) {
    if (items.length === 0) return;
    setToasts((prev) => [...prev, ...items]);
    for (const item of items) {
      const id = window.setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== item.id));
      }, 4500);
      toastTimers.current.push(id);
    }
    sounds.save();
  }

  useEffect(() => {
    const fromHash = readCreatureFromHash();
    if (fromHash) {
      setCreature(fromHash);
      clearCreatureHash();
      recordSharedImport();
      const t: Achievement = { id: '_imp', emoji: '🌐', name: 'Imported a shared creature', description: 'It\'s saved to your album as community.' };
      pushToasts([t]);
      autoSaveShared(fromHash);
    }
    const first = tryUnlock('first-creature');
    if (first) pushToasts([first]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function autoSaveShared(c: Creature): void {
    try {
      const key = 'critter-forge:album';
      const items = JSON.parse(localStorage.getItem(key) || '[]');
      const id = (typeof crypto !== 'undefined' && 'randomUUID' in crypto) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      items.push({
        id,
        name: `🌐 ${c.name}`,
        creature: c,
        savedAt: Date.now(),
      });
      localStorage.setItem(key, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    const got = checkCreatureAchievements(creature, sizeToMass(creature.sizeUnit));
    if (got.length > 0) pushToasts(got);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creature]);

  useEffect(() => {
    const got = checkGenAchievements(generation);
    if (got.length > 0) pushToasts(got);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generation]);

  const effectiveArenaId: ArenaId = tournament ? TOURNAMENT_ORDER[tournament.round - 1] : arenaId;
  const effectiveGeneration = tournament ? tournament.generation : generation;

  const finish = (r: ArenaResult) => {
    recordArena(r);
    const arenaGot = checkArenaWin(r);
    if (arenaGot.length > 0) pushToasts(arenaGot);
    if (r.arena === 'chase' && r.won) {
      if ('preyId' in r && r.preyId && 'reward' in r && typeof r.reward === 'number') {
        recordChaseCatch(r.preyId, r.reward);
      }
      const k = tryUnlock('beat-kangaroo');
      if (k) pushToasts([k]);
    }
    if (r.arena === 'hunt' && r.won && r.reason !== 'caught') {
      const s = tryUnlock('beat-shark');
      if (s) pushToasts([s]);
    }
    const newQuests = checkQuests({ creature, result: r });
    for (const q of newQuests) {
      const a = { id: `quest-${q.id}`, emoji: q.emoji, name: `Quest: ${q.title}`, description: q.description };
      pushToasts([a]);
    }
    const today = getTodayQuest();
    if (!today.completed && today.quest.check({ creature, result: r })) {
      markDailyComplete();
      const a = { id: '_daily', emoji: '📅', name: 'Daily challenge complete!', description: today.quest.title };
      pushToasts([a]);
    }
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
      if (isLast) {
        const wins = newResults.filter((x) => x.won).length;
        const totalPoints = newResults.reduce((acc, x) => acc + x.points, 0);
        recordTournament(totalPoints);
        if (wins === TOURNAMENT_ORDER.length) {
          const a = tryUnlock('tournament-apex');
          if (a) pushToasts([a]);
        }
        if (wins >= 5) {
          const a = tryUnlock('tournament-champ');
          if (a) pushToasts([a]);
        }
      }
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
    const a = tryUnlock('tournament-run');
    if (a) pushToasts([a]);
  }

  async function shareLink() {
    const url = buildShareLink(creature);
    try {
      await navigator.clipboard.writeText(url);
      sounds.save();
      const t: Achievement = { id: '_', emoji: '🔗', name: 'Link copied to clipboard', description: 'Share with a friend!' };
      pushToasts([t]);
    } catch {
      window.prompt('Copy this link:', url);
    }
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

  function adjustStat(stat: StatKey, dir: 1 | -1) {
    const r = adjustCreatureForStat(creature, stat, dir);
    if (r.changed) {
      setCreature(r.creature);
      sounds.click();
    }
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
          <button className="header-btn" type="button" onClick={undo} disabled={undoStack.length === 0} title={`Undo last change (${undoStack.length})`}>↶ Undo</button>
          <button className="header-btn" type="button" onClick={doReset} title="Reset to default">↺ Reset</button>
          <button className="header-btn" type="button" onClick={toggleMute} title={muted ? 'Unmute' : 'Mute'}>
            {muted ? '🔇' : '🔊'}
          </button>
          {!tournament ? (
            <button className="header-btn header-btn-primary" type="button" onClick={startTournament} title="Run a full tournament">🏆 Tournament</button>
          ) : (
            <button className="header-btn header-btn-primary" type="button" onClick={exitTournament} title="Leave tournament">🚪 Exit</button>
          )}
          <button className="header-btn" type="button" onClick={() => { setShowDex(true); sounds.click(); }} title="Real-animal dex">📖 Dex</button>
          <button className="header-btn" type="button" onClick={() => { setShowCompare(true); sounds.click(); }} title="Compare two creatures side by side">⚖️</button>
          <button className="header-btn" type="button" onClick={() => { setShowLineage(true); sounds.click(); }} title="Lineage timeline">📈</button>
          <button className="header-btn" type="button" onClick={() => { setShowQuests(true); sounds.click(); }} title="Design quests">🎯</button>
          <button className="header-btn" type="button" onClick={() => { setShowDaily(true); sounds.click(); }} title="Today's challenge">📅</button>
          <button className="header-btn" type="button" onClick={() => { setShowProfile(true); sounds.click(); }} title="Your profile">👤</button>
          <button className="header-btn" type="button" onClick={() => { setShowAchievements(true); sounds.click(); }} title="Achievements">🏅</button>
          <button className="header-btn" type="button" onClick={shareLink} title="Copy a shareable link to your creature">🔗 Share</button>
          <button className="header-btn" type="button" onClick={() => { exportCreatureCard(creature, stats); sounds.click(); }} title="Export creature as a PNG image">📸</button>
          <button className="header-btn" type="button" onClick={() => { setShowAbout(true); sounds.click(); }} title="About this game">ℹ About</button>
        </div>
      </header>
      <main>
        <section className="col col-build">
          <Builder creature={creature} onChange={setCreature} />
        </section>

        <section className="col col-creature">
          <div className="creature-stage creature-stage-habitat">
            <CreatureStage creature={creature} xray={xray} />
            <button
              className="xray-toggle"
              type="button"
              onClick={() => { setXray(!xray); sounds.click(); }}
              title={xray ? 'Hide x-ray' : 'Show x-ray (bones + organs)'}
            >
              {xray ? '🐾 Skin' : '🦴 X-ray'}
            </button>
          </div>
          <div className="creature-name">
            <span className="gen-badge">🧬 Gen {generation}</span>
            {creature.name}
          </div>
          <StatsPanel creature={creature} stats={stats} onAdjust={adjustStat} />
          <FoodEconomyPanel creature={creature} stats={stats} />
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

      <AlbumPanel
        current={creature}
        onLoad={(c, fromBreed) => {
          setCreature(c);
          sounds.click();
          if (fromBreed) {
            recordBred();
            const newId = lineageId ? recordEvolve(lineageId, c, [`Bred offspring`]) : recordRoot(c);
            setLineageId(newId);
          } else {
            const newId = recordRoot(c);
            setLineageId(newId);
          }
        }}
        onSaved={(count) => {
          sounds.save();
          recordSaved(count);
          const got = checkSaveAchievements(count);
          if (got.length > 0) pushToasts(got);
        }}
      />

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
            const newId = lineageId ? recordEvolve(lineageId, c, [`Evolved from ${creature.name}`]) : recordRoot(c);
            setLineageId(newId);
            recordEvolved();
            recordGeneration();
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
      {showDex && (
        <DexModal
          current={creature}
          onLoad={(c) => { setCreature(c); setShowDex(false); sounds.click(); }}
          onClose={() => setShowDex(false)}
        />
      )}
      {showAchievements && <AchievementsModal onClose={() => setShowAchievements(false)} />}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
      {showQuests && <QuestsModal onClose={() => setShowQuests(false)} />}
      {showDaily && <DailyChallengeModal onClose={() => setShowDaily(false)} />}
      {showCompare && <CompareModal current={creature} onClose={() => setShowCompare(false)} />}
      {showLineage && <LineageModal currentLineageId={lineageId} onClose={() => setShowLineage(false)} />}

      {toasts.length > 0 && (
        <div className="toast-stack">
          {toasts.map((a, i) => (
            <AchievementToast key={`${a.id}-${i}`} name={a.name} emoji={a.emoji} />
          ))}
        </div>
      )}
    </div>
  );
}
