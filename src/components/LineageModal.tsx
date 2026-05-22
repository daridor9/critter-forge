import type { Creature, Hybrid } from '../types';
import { getLineage, getNode } from '../data/lineage';
import type { LineageNode } from '../data/lineage';
import { CreatureSVG } from './CreatureSVG';
import { sizeToMass } from '../physics';

interface Props {
  currentLineageId: string | null;
  onClose: () => void;
}

// ─────────────────────────────────────────────────────────────────────────
// Trait-diff helpers
// ─────────────────────────────────────────────────────────────────────────

type TraitStatus = 'same' | 'changed' | 'new' | 'lost';

interface TraitRow {
  key: string;
  label: string;
  status: TraitStatus;
  parentValue?: string;
  childValue?: string;
}

const LEG_NAMES = ['stubby', 'standard', 'runner'];
const BRAIN_NAMES = ['tiny', 'standard', 'big', 'genius'];
const DEFENSE_NAMES = ['none', 'fur/scales', 'armor'];
const SENSOR_NAMES = ['simple', 'sharp', 'sonar'];

function fmtMass(sizeUnit: number): string {
  const m = sizeToMass(sizeUnit);
  if (m < 0.1) return `${(m * 1000).toFixed(0)} g`;
  if (m < 10) return `${m.toFixed(1)} kg`;
  return `${Math.round(m)} kg`;
}

function statusFor(parentVal: unknown, childVal: unknown): TraitStatus {
  return parentVal === childVal ? 'same' : 'changed';
}

function traitDiff(parent: Creature, child: Creature): TraitRow[] {
  const rows: TraitRow[] = [];

  // Size: treat as "same" if the diff is small enough that it wouldn't show
  // visually (sizeUnit moves in fine increments).
  const sizeStatus: TraitStatus =
    Math.abs(parent.sizeUnit - child.sizeUnit) < 1 ? 'same' : 'changed';
  rows.push({
    key: 'size',
    label: 'Size',
    status: sizeStatus,
    parentValue: fmtMass(parent.sizeUnit),
    childValue: fmtMass(child.sizeUnit),
  });

  rows.push({
    key: 'bodyPlan',
    label: 'Body plan',
    status: statusFor(parent.bodyPlan, child.bodyPlan),
    parentValue: parent.bodyPlan,
    childValue: child.bodyPlan,
  });

  rows.push({
    key: 'blood',
    label: 'Blood',
    status: statusFor(parent.warmBlooded, child.warmBlooded),
    parentValue: parent.warmBlooded ? 'warm' : 'cold',
    childValue: child.warmBlooded ? 'warm' : 'cold',
  });

  rows.push({
    key: 'legs',
    label: 'Legs',
    status: statusFor(parent.legTier, child.legTier),
    parentValue: LEG_NAMES[parent.legTier],
    childValue: LEG_NAMES[child.legTier],
  });

  rows.push({
    key: 'brain',
    label: 'Brain',
    status: statusFor(parent.brainTier, child.brainTier),
    parentValue: BRAIN_NAMES[parent.brainTier],
    childValue: BRAIN_NAMES[child.brainTier],
  });

  rows.push({
    key: 'defense',
    label: 'Defense',
    status: statusFor(parent.defenseTier, child.defenseTier),
    parentValue: DEFENSE_NAMES[parent.defenseTier],
    childValue: DEFENSE_NAMES[child.defenseTier],
  });

  rows.push({
    key: 'sensors',
    label: 'Sensors',
    status: statusFor(parent.sensorTier, child.sensorTier),
    parentValue: SENSOR_NAMES[parent.sensorTier],
    childValue: SENSOR_NAMES[child.sensorTier],
  });

  // Hybrids: list each gained/lost on its own row so the user can see them
  // individually rather than just "hybrids: changed".
  const parentSet = new Set<Hybrid>(parent.hybrids);
  const childSet = new Set<Hybrid>(child.hybrids);
  const gained = child.hybrids.filter((h) => !parentSet.has(h));
  const lost = parent.hybrids.filter((h) => !childSet.has(h));
  const kept = child.hybrids.filter((h) => parentSet.has(h));
  for (const h of kept) {
    rows.push({ key: `hybrid-kept-${h}`, label: 'Hybrid', status: 'same', parentValue: h, childValue: h });
  }
  for (const h of gained) {
    rows.push({ key: `hybrid-new-${h}`, label: 'Hybrid', status: 'new', childValue: h });
  }
  for (const h of lost) {
    rows.push({ key: `hybrid-lost-${h}`, label: 'Hybrid', status: 'lost', parentValue: h });
  }

  return rows;
}

const STATUS_INFO: Record<TraitStatus, { emoji: string; word: string; cls: string }> = {
  same: { emoji: '🟢', word: 'inherited', cls: 'same' },
  changed: { emoji: '🟠', word: 'mutated', cls: 'changed' },
  new: { emoji: '🔵', word: 'gained', cls: 'new' },
  lost: { emoji: '🔴', word: 'lost', cls: 'lost' },
};

// ─────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────

function GenLabel({ n }: { n: number }) {
  return <span className="lineage-gen-pill">🧬 Gen {n}</span>;
}

function Portrait({ creature, gen, sublabel }: { creature: Creature; gen: number; sublabel?: string }) {
  return (
    <div className="lineage-portrait">
      <div className="lineage-portrait-thumb">
        <CreatureSVG creature={creature} />
      </div>
      <div className="lineage-portrait-name">{creature.name}</div>
      <GenLabel n={gen} />
      {sublabel && <div className="lineage-portrait-sub">{sublabel}</div>}
    </div>
  );
}

function ComparisonCard({ parent, child, parentGen, childGen }: { parent: LineageNode; child: LineageNode; parentGen: number; childGen: number }) {
  const rows = traitDiff(parent.creature, child.creature);
  const changedCount = rows.filter((r) => r.status !== 'same').length;
  const kindEmoji = child.kind === 'evolve' ? '🥚' : child.kind === 'breed' ? '👨‍👩‍👧' : '🌱';
  const kindLabel = child.kind === 'evolve' ? 'Evolved' : child.kind === 'breed' ? 'Bred' : 'Started';
  const breedNote = child.kind === 'breed' && child.parentIds.length === 2
    ? `from ${child.parentIds.map((pid) => getNode(pid)?.creature.name ?? '?').join(' + ')}`
    : null;
  return (
    <div className="lineage-gen-card">
      <div className="lineage-gen-header">
        <span className="lineage-gen-kind">{kindEmoji} {kindLabel}</span>
        {breedNote && <span className="lineage-gen-note">{breedNote}</span>}
        <span className="lineage-gen-stat">
          {changedCount === 0 ? 'identical' : `${changedCount} change${changedCount === 1 ? '' : 's'}`}
        </span>
      </div>
      <div className="lineage-compare">
        <Portrait creature={parent.creature} gen={parentGen} sublabel="parent" />
        <div className="lineage-arrow-mid">
          <div className="lineage-arrow-emoji">{kindEmoji}</div>
          <div className="lineage-arrow-line">→</div>
        </div>
        <Portrait creature={child.creature} gen={childGen} sublabel="child" />
      </div>
      <div className="lineage-trait-table">
        {rows.map((row) => {
          const info = STATUS_INFO[row.status];
          return (
            <div key={row.key} className={`lineage-trait-row trait-${info.cls}`}>
              <span className="trait-marker" title={info.word}>{info.emoji}</span>
              <span className="trait-label">{row.label}</span>
              <span className="trait-parent">
                {row.parentValue ?? <em className="trait-none">none</em>}
              </span>
              <span className="trait-mid">{row.status === 'same' ? '=' : '→'}</span>
              <span className="trait-child">
                {row.childValue ?? <em className="trait-none">removed</em>}
              </span>
            </div>
          );
        })}
      </div>
      {child.changes.length > 0 && (
        <div className="lineage-narration">
          <strong>What happened: </strong>
          {child.changes.join(' · ')}
        </div>
      )}
    </div>
  );
}

function RootCard({ node, gen }: { node: LineageNode; gen: number }) {
  return (
    <div className="lineage-gen-card lineage-gen-root">
      <div className="lineage-gen-header">
        <span className="lineage-gen-kind">🌱 Started here</span>
        <span className="lineage-gen-note">This is where the line begins.</span>
      </div>
      <div className="lineage-compare lineage-compare-single">
        <Portrait creature={node.creature} gen={gen} sublabel="founder" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Modal
// ─────────────────────────────────────────────────────────────────────────

export function LineageModal({ currentLineageId, onClose }: Props) {
  const chain = getLineage(currentLineageId);
  return (
    <div className="insight-overlay" onClick={onClose}>
      <div className="about-modal lineage-modal" onClick={(e) => e.stopPropagation()}>
        <div className="about-head">
          <h2>📈 Lineage — what was inherited</h2>
          <button className="about-close" type="button" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="about-content">
          {chain.length === 0 ? (
            <p className="dedication">
              No lineage yet. Evolve a winning creature or breed two from your album — every offspring is recorded here so you can trace what changed between parent and child.
            </p>
          ) : (
            <>
              <p className="dedication">
                <strong>{chain.length} generation{chain.length !== 1 ? 's' : ''}</strong> tracked.
                {chain.length > 1 ? (
                  <>
                    {' '}Each card below shows a parent → child step with what was inherited
                    (<span className="trait-marker">🟢</span>), mutated (<span className="trait-marker">🟠</span>),
                    gained (<span className="trait-marker">🔵</span>), or lost (<span className="trait-marker">🔴</span>).
                  </>
                ) : (
                  <> Evolve or breed your current critter to add a second generation.</>
                )}
              </p>
              <div className="lineage-cards">
                {chain.map((node, i) => {
                  if (i === 0) {
                    return <RootCard key={node.id} node={node} gen={1} />;
                  }
                  const parent = chain[i - 1];
                  return (
                    <ComparisonCard
                      key={node.id}
                      parent={parent}
                      child={node}
                      parentGen={i}
                      childGen={i + 1}
                    />
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
