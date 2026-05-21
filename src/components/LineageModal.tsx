import { getLineage, getNode } from '../data/lineage';
import { CreatureSVG } from './CreatureSVG';

interface Props {
  currentLineageId: string | null;
  onClose: () => void;
}

export function LineageModal({ currentLineageId, onClose }: Props) {
  const chain = getLineage(currentLineageId);
  return (
    <div className="insight-overlay" onClick={onClose}>
      <div className="about-modal" onClick={(e) => e.stopPropagation()}>
        <div className="about-head">
          <h2>📈 Lineage timeline</h2>
          <button className="about-close" type="button" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="about-content">
          {chain.length === 0 ? (
            <p className="dedication">
              No lineage yet. Evolve a winning creature or breed two from your album — every offspring is recorded here so you can trace it back.
            </p>
          ) : (
            <>
              <p className="dedication">
                <strong>{chain.length} generation{chain.length !== 1 ? 's' : ''}</strong> tracked. Earliest ancestor on the left, current creature on the right.
              </p>
              <div className="lineage-chain">
                {chain.map((node, i) => (
                  <div key={node.id} className="lineage-step">
                    <div className="lineage-card">
                      <div className="lineage-thumb">
                        <CreatureSVG creature={node.creature} />
                      </div>
                      <div className="lineage-name">{node.creature.name}</div>
                      <div className="lineage-meta">
                        {node.kind === 'root' ? '🌱 Started here' : node.kind === 'evolve' ? '🥚 Evolved' : '👨‍👩‍👧 Bred'}
                      </div>
                      {node.parentIds.length === 2 && (
                        <div className="lineage-parents">
                          <small>
                            parents: {node.parentIds.map((pid) => getNode(pid)?.creature.name ?? '?').join(' + ')}
                          </small>
                        </div>
                      )}
                      {node.changes.length > 0 && (
                        <ul className="lineage-changes">
                          {node.changes.map((c, j) => <li key={j}>{c}</li>)}
                        </ul>
                      )}
                    </div>
                    {i < chain.length - 1 && <div className="lineage-arrow">→</div>}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
