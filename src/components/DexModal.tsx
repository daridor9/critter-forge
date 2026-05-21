import { ANIMAL_DEX, closestAnimal } from '../data/animalDex';
import type { DexAnimal } from '../data/animalDex';
import type { Creature } from '../types';
import { CreatureSVG } from './CreatureSVG';
import { SnakeShape } from './SnakeShape';
import { OctopusShape, WhaleShape, DolphinShape, PenguinShape, LionShape, MouseShape, HummingbirdShape, BatShape, RaptorShape, TriceratopsShape, StegosaurusShape, PterodactylShape } from './dexShapes';

interface Props {
  current: Creature;
  onLoad: (c: Creature) => void;
  onClose: () => void;
}

export function DexModal({ current, onLoad, onClose }: Props) {
  const match = closestAnimal(current);
  return (
    <div className="insight-overlay" onClick={onClose}>
      <div className="dex-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dex-head">
          <h2>📖 Animal Dex</h2>
          <button className="about-close" type="button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="dex-match">
          <span className="dex-match-label">Your creature is most like</span>
          <strong>{match.emoji} {match.name}</strong>
        </div>
        <div className="dex-grid">
          {ANIMAL_DEX.map((a) => (
            <div key={a.name} className="dex-card">
              <div className="dex-thumb">
                <DexThumb animal={a} />
              </div>
              <div className="dex-card-name">{a.emoji} {a.name}</div>
              <div className="dex-card-fact">{a.fact}</div>
              <button className="btn dex-load" type="button" onClick={() => onLoad(a.creature)}>
                Load this animal
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DexThumb({ animal }: { animal: DexAnimal }) {
  if (animal.colors) {
    if (animal.shape === 'snake') return <SnakeShape colors={animal.colors} />;
    if (animal.shape === 'octopus') return <OctopusShape colors={animal.colors} />;
    if (animal.shape === 'whale') return <WhaleShape colors={animal.colors} />;
    if (animal.shape === 'dolphin') return <DolphinShape colors={animal.colors} />;
    if (animal.shape === 'penguin') return <PenguinShape colors={animal.colors} />;
    if (animal.shape === 'lion') return <LionShape colors={animal.colors} />;
    if (animal.shape === 'mouse') return <MouseShape colors={animal.colors} />;
    if (animal.shape === 'hummingbird') return <HummingbirdShape colors={animal.colors} />;
    if (animal.shape === 'bat') return <BatShape colors={animal.colors} />;
    if (animal.shape === 'raptor') return <RaptorShape colors={animal.colors} />;
    if (animal.shape === 'triceratops') return <TriceratopsShape colors={animal.colors} />;
    if (animal.shape === 'stegosaurus') return <StegosaurusShape colors={animal.colors} />;
    if (animal.shape === 'pterodactyl') return <PterodactylShape colors={animal.colors} />;
  }
  return <CreatureSVG creature={animal.creature} colorOverride={animal.colors} />;
}
