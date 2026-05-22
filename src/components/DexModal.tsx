import { useMemo, useState } from 'react';
import { ANIMAL_DEX, closestAnimal } from '../data/animalDex';
import type { DexAnimal } from '../data/animalDex';
import { arenaFitFor } from '../data/arenaFit';
import type { ArenaId } from '../data/arenaFit';
import { FOOD_CHAIN } from '../data/foodChain';
import type { BodyPlan, Creature } from '../types';
import { sizeToMass } from '../physics';
import { CreatureSVG } from './CreatureSVG';
import { getBespokeShape } from './dexShapes';

interface Props {
  current: Creature;
  onLoad: (c: Creature) => void;
  onClose: () => void;
}

type BodyFilter = 'all' | BodyPlan;
type SizeFilter = 'all' | 'tiny' | 'small' | 'medium' | 'huge';
type ArenaFilter = 'all' | ArenaId;

const BODY_FILTERS: { id: BodyFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'mammal', label: 'Mammals' },
  { id: 'reptile', label: 'Reptiles' },
  { id: 'bird', label: 'Birds' },
  { id: 'fish', label: 'Water' },
];

const SIZE_FILTERS: { id: SizeFilter; label: string }[] = [
  { id: 'all', label: 'Any size' },
  { id: 'tiny', label: 'Tiny' },
  { id: 'small', label: 'Small' },
  { id: 'medium', label: 'Medium' },
  { id: 'huge', label: 'Huge' },
];

const ARENA_FILTERS: { id: ArenaFilter; label: string }[] = [
  { id: 'all', label: 'Any arena' },
  { id: 'chase', label: 'Chase' },
  { id: 'hunt', label: 'Hunt' },
  { id: 'climb', label: 'Climb' },
  { id: 'drought', label: 'Drought' },
  { id: 'deep', label: 'Deep' },
  { id: 'maze', label: 'Maze' },
];

export function DexModal({ current, onLoad, onClose }: Props) {
  const [bodyFilter, setBodyFilter] = useState<BodyFilter>('all');
  const [sizeFilter, setSizeFilter] = useState<SizeFilter>('all');
  const [arenaFilter, setArenaFilter] = useState<ArenaFilter>('all');
  const [search, setSearch] = useState('');
  const match = closestAnimal(current);
  const visibleAnimals = useMemo(
    () => ANIMAL_DEX.filter((a) => matchesFilters(a, { bodyFilter, sizeFilter, arenaFilter, search })),
    [arenaFilter, bodyFilter, search, sizeFilter],
  );

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
        <div className="dex-tools">
          <label className="dex-search">
            <span>Search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="animal, trait, fact"
            />
          </label>
          <FilterGroup
            label="Body"
            items={BODY_FILTERS}
            value={bodyFilter}
            onChange={setBodyFilter}
          />
          <FilterGroup
            label="Size"
            items={SIZE_FILTERS}
            value={sizeFilter}
            onChange={setSizeFilter}
          />
          <FilterGroup
            label="Arena"
            items={ARENA_FILTERS}
            value={arenaFilter}
            onChange={setArenaFilter}
          />
          <div className="dex-count">{visibleAnimals.length} / {ANIMAL_DEX.length}</div>
        </div>
        <div className="dex-grid">
          {visibleAnimals.map((a) => {
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
          {visibleAnimals.length === 0 && (
            <div className="dex-empty">No animals match.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup<T extends string>({
  label,
  items,
  value,
  onChange,
}: {
  label: string;
  items: { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="dex-filter-group" aria-label={label}>
      <span>{label}</span>
      <div className="dex-filter-pills">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={value === item.id ? 'dex-filter active' : 'dex-filter'}
            onClick={() => onChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function DexThumb({ animal }: { animal: DexAnimal }) {
  const Bespoke = getBespokeShape(animal.shape);
  if (Bespoke && animal.colors) return <Bespoke colors={animal.colors} />;
  return <CreatureSVG creature={animal.creature} colorOverride={animal.colors} />;
}

function matchesFilters(
  animal: DexAnimal,
  filters: {
    bodyFilter: BodyFilter;
    sizeFilter: SizeFilter;
    arenaFilter: ArenaFilter;
    search: string;
  },
): boolean {
  const c = animal.creature;
  if (filters.bodyFilter !== 'all' && c.bodyPlan !== filters.bodyFilter) return false;
  if (filters.sizeFilter !== 'all' && sizeBucket(sizeToMass(c.sizeUnit)) !== filters.sizeFilter) return false;
  if (filters.arenaFilter !== 'all' && arenaFitFor(filters.arenaFilter, c).fit !== 'great') return false;

  const q = filters.search.trim().toLowerCase();
  if (!q) return true;
  const food = FOOD_CHAIN[animal.name];
  const haystack = [
    animal.name,
    animal.fact,
    c.bodyPlan,
    ...c.hybrids,
    ...(food?.eats ?? []),
    ...(food?.eatenBy ?? []),
  ].join(' ').toLowerCase();
  return haystack.includes(q);
}

function sizeBucket(massKg: number): Exclude<SizeFilter, 'all'> {
  if (massKg < 1) return 'tiny';
  if (massKg < 30) return 'small';
  if (massKg < 500) return 'medium';
  return 'huge';
}
