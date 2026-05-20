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
import { pickInsight } from './data/insights';
import type { Insight, ArenaResult } from './data/insights';
import { randomCreature, suggestName } from './data/randomCreature';
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

  const finish = (r: ArenaResult) => {
    const i = pickInsight(r, stats.massKg);
    if (i.won) sounds.win();
    else sounds.lose();
    setInsight(i);
  };

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
          <div className="creature-name">{creature.name}</div>
          <StatsPanel creature={creature} stats={stats} />
        </section>

        <section className="col col-game">
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
          </div>

          {arenaId === 'chase' && (
            <ChaseArena creature={creature} stats={stats} onFinish={(o) => finish({ arena: 'chase', ...o })} />
          )}
          {arenaId === 'hunt' && (
            <HuntArena creature={creature} stats={stats} onFinish={(o) => finish({ arena: 'hunt', ...o })} />
          )}
          {arenaId === 'climb' && (
            <ClimbArena creature={creature} stats={stats} onFinish={(o) => finish({ arena: 'climb', ...o })} />
          )}
          {arenaId === 'drought' && (
            <DroughtArena creature={creature} stats={stats} onFinish={(o) => finish({ arena: 'drought', ...o })} />
          )}
          {arenaId === 'deep' && (
            <DeepArena creature={creature} stats={stats} onFinish={(o) => finish({ arena: 'deep', ...o })} />
          )}
          {arenaId === 'maze' && (
            <MazeArena creature={creature} stats={stats} onFinish={(o) => finish({ arena: 'maze', ...o })} />
          )}

          <ComparePanel stats={stats} onLoadPreset={(c) => { setCreature(c); sounds.click(); }} />
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
            setShowEvolve(false);
            sounds.click();
          }}
          onClose={() => setShowEvolve(false)}
        />
      )}
    </div>
  );
}
