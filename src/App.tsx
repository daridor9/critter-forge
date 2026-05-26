import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
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
import { AchievementToast } from './components/AchievementToast';
import { checkQuests, getTodayQuest, markDailyComplete } from './data/quests';
import { exportCreatureCard } from './utils/exportCreature';
import { recordRoot, recordEvolve, recordBreed } from './data/lineage';
import { arenaFitFor, fitEmoji } from './data/arenaFit';
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
import { MissionBoard } from './components/MissionBoard';
import { TournamentHUD, BetweenRounds, TournamentResults } from './components/TournamentUI';
import { pickInsight } from './data/insights';
import type { Insight, ArenaResult } from './data/insights';
import { randomCreature, suggestName } from './data/randomCreature';import { adjustCreatureForStat } from './data/statAdjusters';
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
  checkStatsAchievements,
} from './data/achievements';
import { buildShareLink, readCreatureFromHash, clearCreatureHash } from './utils/shareLink';
import { sizeToMass } from './physics';
import { sounds, isMuted, setMuted, stopAmbient } from './sounds';
import './App.css';

const AboutModal = lazy(() => import('./components/AboutModal').then((m) => ({ default: m.AboutModal })));
const AchievementsModal = lazy(() => import('./components/AchievementsModal').then((m) => ({ default: m.AchievementsModal })));
const BattleModal = lazy(() => import('./components/BattleModal').then((m) => ({ default: m.BattleModal })));
const BracketModal = lazy(() => import('./components/BracketModal').then((m) => ({ default: m.BracketModal })));
const CompareModal = lazy(() => import('./components/CompareModal').then((m) => ({ default: m.CompareModal })));
const DailyChallengeModal = lazy(() => import('./components/DailyChallenge').then((m) => ({ default: m.DailyChallengeModal })));
const DexModal = lazy(() => import('./components/DexModal').then((m) => ({ default: m.DexModal })));
const EvolveModal = lazy(() => import('./components/EvolveModal').then((m) => ({ default: m.EvolveModal })));
const LineageModal = lazy(() => import('./components/LineageModal').then((m) => ({ default: m.LineageModal })));
const PortraitModal = lazy(() => import('./components/PortraitModal').then((m) => ({ default: m.PortraitModal })));
const ProfileModal = lazy(() => import('./components/ProfileModal').then((m) => ({ default: m.ProfileModal })));
const QuestsModal = lazy(() => import('./components/QuestsModal').then((m) => ({ default: m.QuestsModal })));

type ArenaId = 'chase' | 'climb' | 'drought' | 'hunt' | 'deep' | 'maze';
type StageView = 'creature' | ArenaId;

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
    setCreatureRaw((prev) => {
      let resolved = typeof next === 'function' ? (next as (p: Creature) => Creature)(prev) : next;
      if (resolved === prev) return prev;
      setUndoStack((s) => [...s.slice(-19), prev]);
      if (resolved.shape && resolved.shape === prev.shape) {
        const traitsChanged =
          resolved.sizeUnit !== prev.sizeUnit ||
          resolved.bodyPlan !== prev.bodyPlan ||
          resolved.warmBlooded !== prev.warmBlooded ||
          resolved.legTier !== prev.legTier ||
          resolved.brainTier !== prev.brainTier ||
          resolved.defenseTier !== prev.defenseTier ||
          resolved.sensorTier !== prev.sensorTier ||
          resolved.hybrids.length !== prev.hybrids.length ||
          resolved.hybrids.some((h, i) => h !== prev.hybrids[i]);
        if (traitsChanged) {
          resolved = { ...resolved, shape: undefined, colors: undefined, adaptations: undefined };
        }
      }
      return resolved;
    });
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
  const [view, setView] = useState<StageView>('creature');
  const [stageMax, setStageMax] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const [showEvolve, setShowEvolve] = useState(false);
  const [muted, setMutedState] = useState<boolean>(() => isMuted());
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
  const [showPortrait, setShowPortrait] = useState(false);
  const [showBattle, setShowBattle] = useState(false);
  const [showBracket, setShowBracket] = useState(false);
  // Anatomy layer for the creature view: skin (default), muscles, or anatomy
  // (skeleton + organs, biology-textbook style).
  const [anatomyLayer, setAnatomyLayer] = useState<'skin' | 'muscles' | 'anatomy'>('skin');
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
    stopAmbient();
  }, []);

  useEffect(() => {
    const got = checkGenAchievements(generation);
    if (got.length > 0) pushToasts(got);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generation]);

  // Close the More menu when clicking outside it.
  useEffect(() => {
    if (!showMore) return;
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setShowMore(false);
      }
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [showMore]);
  const effectiveArenaId: ArenaId = tournament ? TOURNAMENT_ORDER[tournament.round - 1] : arenaId;
  const effectiveGeneration = tournament ? tournament.generation : generation;
  // In a tournament the stage is forced to the current arena; otherwise honour the view tab.
  const showCreatureView = !tournament && view === 'creature';

  const finish = (r: ArenaResult) => {
    recordArena(r);
    const arenaGot = checkArenaWin(r);
    if (arenaGot.length > 0) pushToasts(arenaGot);
    const statsGot = checkStatsAchievements();
    if (statsGot.length > 0) pushToasts(statsGot);
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
    const i = pickInsight(r, stats.massKg, creature);
    if (i.won) sounds.win();
    else sounds.lose();
    setInsight(i);
  };
  function startTournament() {
    setTournament({ round: 1, results: [], phase: 'playing', generation: 1 });
    setGeneration(1);
    setView('chase');
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
    setView(id);
    sounds.click();
  }

  function pickCreature() {
    setView('creature');
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

  function closeMore() {
    setShowMore(false);
  }

  function moreItem(label: string, onClick: () => void) {
    return (
      <button
        key={label}
        type="button"
        className="more-item"
        onClick={() => { onClick(); closeMore(); sounds.click(); }}
      >
        {label}
      </button>
    );
  }
  return (
    <div className={`app${stageMax ? ' app-max' : ''}`}>
      <header>
        <div className="header-title">
          <h1>🦎 Critter Forge</h1>
          <span className="sub">design a creature — real biology decides if it survives</span>
        </div>
        <div className="header-actions">
          <div className="header-group" role="group" aria-label="Quick actions">
            <button
              className="header-icon"
              type="button"
              onClick={doRandom}
              title="Random creature"
              aria-label="Random creature"
            >🎲</button>
            <button
              className="header-icon"
              type="button"
              onClick={undo}
              disabled={undoStack.length === 0}
              title={`Undo last change (${undoStack.length})`}
              aria-label="Undo"
            >↶</button>
            <button
              className="header-icon"
              type="button"
              onClick={doReset}
              title="Reset to default"
              aria-label="Reset"
            >↺</button>
            <button
              className="header-icon"
              type="button"
              onClick={toggleMute}
              title={muted ? 'Unmute' : 'Mute'}
              aria-label={muted ? 'Unmute' : 'Mute'}
            >{muted ? '🔇' : '🔊'}</button>
          </div>
          {!tournament ? (
            <button
              className="header-btn header-btn-primary"
              type="button"
              onClick={startTournament}
              title="Run a full tournament"
            >🏆 Tournament</button>
          ) : (
            <button
              className="header-btn header-btn-primary"
              type="button"
              onClick={exitTournament}
              title="Leave tournament"
            >🚪 Exit</button>
          )}
          <button
            className="header-btn"
            type="button"
            onClick={shareLink}
            title="Copy a shareable link to your creature"
          >🔗 Share</button>
          <div className="header-more-wrap" ref={moreRef}>
            <button
              className="header-btn header-more-trigger"
              type="button"
              onClick={() => setShowMore(!showMore)}
              aria-expanded={showMore}
              aria-haspopup="menu"
              title="More"
            >⋯ More</button>
            {showMore && (
              <div className="header-more-menu" role="menu">
                {moreItem('📖 Dex', () => setShowDex(true))}
                {moreItem('⚖️ Compare', () => setShowCompare(true))}
                {moreItem('⚔️ Battle', () => setShowBattle(true))}
                {moreItem('🥇 Bracket', () => setShowBracket(true))}
                {moreItem('📈 Lineage', () => setShowLineage(true))}
                {moreItem('🎯 Quests', () => setShowQuests(true))}
                {moreItem('📅 Daily', () => setShowDaily(true))}
                {moreItem('👤 Profile', () => setShowProfile(true))}
                {moreItem('🏅 Achievements', () => setShowAchievements(true))}
                <div className="more-divider" />
                {moreItem('✏️ Suggest name', doSuggestName)}
                {moreItem('📸 Export PNG', () => exportCreatureCard(creature, stats))}
                <div className="more-divider" />
                {moreItem('ℹ About', () => setShowAbout(true))}
              </div>
            )}
          </div>
        </div>
      </header>
      <main>
        <aside className="rail">
          <Builder creature={creature} onChange={setCreature} />
        </aside>

        <section className="stage">
          {tournament ? (
            <TournamentHUD t={tournament} />
          ) : (
            <div className="stage-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={view === 'creature'}
                className={`stage-tab stage-tab-creature${view === 'creature' ? ' active' : ''}`}
                onClick={pickCreature}
              >
                🦎 Creature
              </button>
              {arenaTabs.map((t) => {
                const fit = arenaFitFor(t.id, creature);
                const isActive = view === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`stage-tab arena-fit-${fit.fit}${isActive ? ' active' : ''}`}
                    onClick={() => pickArena(t.id)}
                    title={`${fit.fit === 'great' ? 'Great fit' : fit.fit === 'ok' ? 'Workable' : 'Tough match'} — ${fit.reason}`}
                  >
                    <span className="arena-fit-dot">{fitEmoji(fit.fit)}</span> {t.label}
                  </button>
                );
              })}
              <span className="stage-tabs-spacer" />
              <button
                type="button"
                className="stage-tab stage-max-toggle"
                onClick={() => { setStageMax(!stageMax); sounds.click(); }}
                title={stageMax ? 'Restore layout' : 'Maximize stage'}
                aria-label={stageMax ? 'Restore layout' : 'Maximize stage'}
              >
                {stageMax ? '⤡' : '⛶'}
              </button>
            </div>
          )}

          <div className="stage-content">
            {showCreatureView ? (
              <div className="stage-creature">
                <div className="creature-stage creature-stage-habitat">
                  <CreatureStage creature={creature} layer={anatomyLayer} />
                  <button
                    type="button"
                    className="portrait-launch-btn"
                    onClick={() => { setShowPortrait(true); sounds.click(); }}
                    title="Upload or view a portrait of this critter"
                  >
                    🖼 <span className="portrait-launch-label">Upload portrait</span>
                  </button>
                  <div className="anatomy-toggle" role="tablist" aria-label="Anatomy layer">
                    {(['skin', 'muscles', 'anatomy'] as const).map((id) => (
                      <button
                        key={id}
                        type="button"
                        role="tab"
                        aria-selected={anatomyLayer === id}
                        className={anatomyLayer === id ? 'anatomy-toggle-btn active' : 'anatomy-toggle-btn'}
                        onClick={() => { setAnatomyLayer(id); sounds.click(); }}
                        title={id === 'skin' ? 'Normal view' : id === 'muscles' ? 'Show muscles' : 'Show skeleton + organs'}
                      >
                        {id === 'skin' ? '🐾' : id === 'muscles' ? '💪' : '🦴'} <span className="anatomy-toggle-label">{id === 'skin' ? 'Skin' : id === 'muscles' ? 'Muscles' : 'Anatomy'}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="creature-name">
                  <span className="gen-badge">🧬 Gen {generation}</span>
                  {creature.name}
                </div>
                <div className="creature-info">
                  <div className="creature-info-stats">
                    <StatsPanel creature={creature} stats={stats} onAdjust={adjustStat} />
                  </div>
                  <div className="creature-info-food">
                    <MissionBoard
                      creature={creature}
                      generation={generation}
                      onOpenQuests={() => { setShowQuests(true); sounds.click(); }}
                      onStartTournament={startTournament}
                    />
                    <FoodEconomyPanel creature={creature} stats={stats} />
                    <ComparePanel stats={stats} onLoadPreset={(c) => { setCreature(c); setView('creature'); setAnatomyLayer('skin'); sounds.click(); }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="stage-arena">
                {renderArena()}
              </div>
            )}
          </div>
        </section>
      </main>
      <div className="album-dock">
        <AlbumPanel
          current={creature}
          currentLineageId={lineageId}
          onLoad={(c, meta) => {
            setCreature(c);
            setView('creature');
            setAnatomyLayer('skin');
            sounds.click();
            if (meta?.kind === 'breed') {
              recordBred();
              recordGeneration();
              const [p1Id, p2Id] = meta.parentLineageIds ?? [null, null];
              const changes = meta.changes && meta.changes.length > 0 ? meta.changes : [`Bred offspring`];
              const newId = p1Id && p2Id ? recordBreed(p1Id, p2Id, c, changes) : lineageId ? recordEvolve(lineageId, c, changes) : recordRoot(c);
              setLineageId(newId);
              setGeneration((g) => g + 1);
            } else {
              setLineageId(meta?.lineageId ?? recordRoot(c));
            }
          }}
          onSaved={(count) => {
            sounds.save();
            recordSaved(count);
            const got = checkSaveAchievements(count);
            if (got.length > 0) pushToasts(got);
          }}
        />
      </div>

      {insight && (
        <InsightCard
          insight={insight}
          onClose={() => setInsight(null)}
          onEvolve={insight.won ? openEvolveFromInsight : undefined}
        />
      )}
      <Suspense fallback={null}>
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
      </Suspense>
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
      <Suspense fallback={null}>
        {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
        {showDex && (
          <DexModal
            current={creature}
            onLoad={(c) => { setCreature(c); setView('creature'); setAnatomyLayer('skin'); setShowDex(false); sounds.click(); }}
            onClose={() => setShowDex(false)}
          />
        )}
        {showAchievements && <AchievementsModal onClose={() => setShowAchievements(false)} />}
        {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
        {showQuests && <QuestsModal onClose={() => setShowQuests(false)} />}
        {showDaily && <DailyChallengeModal onClose={() => setShowDaily(false)} />}
        {showCompare && <CompareModal current={creature} onClose={() => setShowCompare(false)} />}
        {showLineage && <LineageModal currentLineageId={lineageId} onClose={() => setShowLineage(false)} />}
        {showPortrait && <PortraitModal creature={creature} onClose={() => setShowPortrait(false)} />}
        {showBattle && <BattleModal current={creature} onClose={() => setShowBattle(false)} />}
        {showBracket && <BracketModal current={creature} onClose={() => setShowBracket(false)} />}
      </Suspense>

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
