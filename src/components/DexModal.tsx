import { ANIMAL_DEX, closestAnimal } from '../data/animalDex';
import type { DexAnimal } from '../data/animalDex';
import { FOOD_CHAIN } from '../data/foodChain';
import type { Creature } from '../types';
import { CreatureSVG } from './CreatureSVG';
import { getBespokeShape } from './dexShapes';

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
          {ANIMAL_DEX.map((a) => {
            const food = FOOD_CHAIN[a.name];
            return (
              <div key={a.name} className="dex-card">
                <div className="dex-thumb">
                  <DexThumb animal={a} />
                </div>
                <div className="dex-card-name">{a.emoji} {a.name}</div>
                <div className="dex-card-fact">{a.fact}</div>
                {food && (
                  <div className="dex-food">
                    <div><strong>🍴 Eats:</strong> {food.eats.join(', ')}</div>
                    <div><strong>🎯 Eaten by:</strong> {food.eatenBy.join(', ')}</div>
                  </div>
                )}
                <button className="btn dex-load" type="button" onClick={() => onLoad(a.creature)}>
                  Load this animal
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DexThumb({ animal }: { animal: DexAnimal }) {
  const Bespoke = getBespokeShape(animal.shape);
  if (Bespoke && animal.colors) return <Bespoke colors={animal.colors} />;
  return <CreatureSVG creature={animal.creature} colorOverride={animal.colors} />;
}
