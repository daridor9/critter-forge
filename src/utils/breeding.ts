// ─── Genetic Breeding ──────────────────────────────────────────────────
// Crosses two creatures to produce 3 offspring variants. Each child:
//   - inherits each discrete trait from one randomly-chosen parent (50/50)
//   - has a sizeUnit drawn from a normal-ish distribution between the
//     parents' sizes (with small mutation)
//   - inherits 0-2 hybrids drawn from the union of both parents' hybrids,
//     filtered through isHybridValid() so the result is biology-legal
//   - has one small mutation (one tier ±1, or one trait swap)
//   - has a name that blends the parents' names
//
// This mimics real genetics: each trait coin-flips between parents, with a
// small chance of mutation per generation.

import type { Creature, BodyPlan, Tier, BrainTier, Hybrid } from '../types';
import { isHybridValid } from '../physics';
import { hybridCatalog } from '../data/hybrids';

function clampTier(t: number): Tier {
  return Math.max(0, Math.min(2, Math.round(t))) as Tier;
}
function clampBrain(t: number): BrainTier {
  return Math.max(0, Math.min(3, Math.round(t))) as BrainTier;
}

interface OffspringMeta {
  /** Which parent contributed each trait (for the UI legend). */
  inheritance: {
    bodyPlan: 'A' | 'B';
    warmBlooded: 'A' | 'B';
    sizeUnit: 'A' | 'B' | 'AVG';
    legTier: 'A' | 'B';
    brainTier: 'A' | 'B';
    defenseTier: 'A' | 'B';
    sensorTier: 'A' | 'B';
  };
  /** One-line description of any random mutation that fired. */
  mutationNote?: string;
}

export interface Offspring {
  creature: Creature;
  meta: OffspringMeta;
}

function blendName(a: string, b: string, rng: () => number): string {
  // Take first half of one name + second half of the other. Strip leading
  // articles to keep it short. Random pick which half from which parent.
  const cleanA = a.replace(/^(The|Old|Lord|Lady|Sir|Mr|Mrs|Lil|Pip|Tiny|Wee|Bitty)\s+/i, '');
  const cleanB = b.replace(/^(The|Old|Lord|Lady|Sir|Mr|Mrs|Lil|Pip|Tiny|Wee|Bitty)\s+/i, '');
  const halfA = cleanA.slice(0, Math.max(2, Math.floor(cleanA.length / 2)));
  const halfB = cleanB.slice(Math.floor(cleanB.length / 2));
  const blended = (rng() < 0.5 ? halfA + halfB : halfB.slice(0, Math.floor(halfB.length / 2)) + halfA.slice(Math.floor(halfA.length / 2)));
  // Capitalize, cap length
  const name = blended.charAt(0).toUpperCase() + blended.slice(1, 24).toLowerCase();
  return name || 'Hybrid';
}

function breedOne(a: Creature, b: Creature, rng: () => number): Offspring {
  // Each trait independently inherited from A or B.
  const bodyFrom = rng() < 0.5 ? 'A' : 'B';
  const bodyPlan: BodyPlan = bodyFrom === 'A' ? a.bodyPlan : b.bodyPlan;

  const warmFrom = rng() < 0.5 ? 'A' : 'B';
  const warmBlooded = warmFrom === 'A' ? a.warmBlooded : b.warmBlooded;

  // Size — favors the midpoint with some random walk
  let sizeFrom: 'A' | 'B' | 'AVG';
  let sizeUnit: number;
  const sizeRoll = rng();
  if (sizeRoll < 0.4) {
    sizeFrom = 'A';
    sizeUnit = a.sizeUnit;
  } else if (sizeRoll < 0.8) {
    sizeFrom = 'B';
    sizeUnit = b.sizeUnit;
  } else {
    sizeFrom = 'AVG';
    sizeUnit = Math.round((a.sizeUnit + b.sizeUnit) / 2);
  }
  // Small mutation in size (±5 units, 60% chance)
  if (rng() < 0.6) {
    sizeUnit += Math.round((rng() - 0.5) * 10);
    sizeUnit = Math.max(0, Math.min(100, sizeUnit));
  }

  const legFrom = rng() < 0.5 ? 'A' : 'B';
  let legTier: Tier = legFrom === 'A' ? a.legTier : b.legTier;

  const brainFrom = rng() < 0.5 ? 'A' : 'B';
  let brainTier: BrainTier = brainFrom === 'A' ? a.brainTier : b.brainTier;

  const defenseFrom = rng() < 0.5 ? 'A' : 'B';
  let defenseTier: Tier = defenseFrom === 'A' ? a.defenseTier : b.defenseTier;

  const sensorFrom = rng() < 0.5 ? 'A' : 'B';
  let sensorTier: Tier = sensorFrom === 'A' ? a.sensorTier : b.sensorTier;

  // Hybrid inheritance — pool both parents' hybrids
  const hybridPool: Hybrid[] = Array.from(new Set([...a.hybrids, ...b.hybrids]));
  // Each hybrid in the pool has a 60% chance to pass to the offspring
  let inheritedHybrids: Hybrid[] = hybridPool.filter(() => rng() < 0.6);
  // Cap at 2 (game limit), random subset if more
  if (inheritedHybrids.length > 2) {
    inheritedHybrids = inheritedHybrids.sort(() => rng() - 0.5).slice(0, 2);
  }

  // Build base child WITHOUT hybrids first so we can validate them against
  // the rest of the body
  let child: Creature = {
    name: blendName(a.name, b.name, rng),
    sizeUnit,
    bodyPlan,
    warmBlooded,
    legTier,
    brainTier,
    defenseTier,
    sensorTier,
    hybrids: [],
  };

  // Filter hybrids through validation (e.g. wings need <2kg, electric needs fish)
  inheritedHybrids = inheritedHybrids.filter((h) => isHybridValid(h, child).valid);
  child = { ...child, hybrids: inheritedHybrids };

  // ─── RANDOM MUTATION ─── 80% of offspring carry one extra mutation
  let mutationNote: string | undefined;
  if (rng() < 0.8) {
    const mutationType = Math.floor(rng() * 6);
    switch (mutationType) {
      case 0: {
        const dir = rng() < 0.5 ? -1 : 1;
        const next = clampTier(legTier + dir);
        if (next !== legTier) {
          legTier = next;
          child = { ...child, legTier };
          mutationNote = `Legs mutated ${dir > 0 ? '↑' : '↓'}`;
        }
        break;
      }
      case 1: {
        const dir = rng() < 0.5 ? -1 : 1;
        const next = clampBrain(brainTier + dir);
        if (next !== brainTier) {
          brainTier = next;
          child = { ...child, brainTier };
          mutationNote = `Brain mutated ${dir > 0 ? '↑' : '↓'}`;
        }
        break;
      }
      case 2: {
        const dir = rng() < 0.5 ? -1 : 1;
        const next = clampTier(defenseTier + dir);
        if (next !== defenseTier) {
          defenseTier = next;
          child = { ...child, defenseTier };
          mutationNote = `Defense mutated ${dir > 0 ? '↑' : '↓'}`;
        }
        break;
      }
      case 3: {
        const dir = rng() < 0.5 ? -1 : 1;
        const next = clampTier(sensorTier + dir);
        if (next !== sensorTier) {
          sensorTier = next;
          child = { ...child, sensorTier };
          mutationNote = `Senses mutated ${dir > 0 ? '↑' : '↓'}`;
        }
        break;
      }
      case 4: {
        // Add a NEW random valid hybrid (if room)
        if (child.hybrids.length < 2) {
          const candidates = hybridCatalog
            .filter((h) => !child.hybrids.includes(h.id))
            .filter((h) => isHybridValid(h.id, child).valid);
          if (candidates.length > 0) {
            const picked = candidates[Math.floor(rng() * candidates.length)];
            child = { ...child, hybrids: [...child.hybrids, picked.id] };
            mutationNote = `New hybrid: ${picked.name}`;
          }
        }
        break;
      }
      case 5: {
        // Flip blood
        child = { ...child, warmBlooded: !child.warmBlooded };
        mutationNote = child.warmBlooded ? 'Flipped to warm-blooded 🔥' : 'Flipped to cold-blooded ❄️';
        // Re-validate hybrids after blood flip
        child = { ...child, hybrids: child.hybrids.filter((h) => isHybridValid(h, child).valid) };
        break;
      }
    }
  }

  return {
    creature: child,
    meta: {
      inheritance: {
        bodyPlan: bodyFrom,
        warmBlooded: warmFrom,
        sizeUnit: sizeFrom,
        legTier: legFrom,
        brainTier: brainFrom,
        defenseTier: defenseFrom,
        sensorTier: sensorFrom,
      },
      mutationNote,
    },
  };
}

/**
 * Cross two parents and return 3 offspring variants.
 * Uses Math.random — for deterministic breeding tests, callers can seed.
 */
export function breed(parentA: Creature, parentB: Creature, count = 3): Offspring[] {
  const out: Offspring[] = [];
  for (let i = 0; i < count; i++) {
    out.push(breedOne(parentA, parentB, Math.random));
  }
  return out;
}
