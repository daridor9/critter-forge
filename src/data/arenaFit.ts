import type { Creature } from '../types';
import { computeStats, sizeToMass } from '../physics';

export type ArenaId = 'chase' | 'hunt' | 'climb' | 'drought' | 'deep' | 'maze';
export type Fit = 'great' | 'ok' | 'tough';

export interface ArenaFit {
  fit: Fit;
  reason: string;
}

function hasAdaptation(c: Creature, text: string): boolean {
  return c.adaptations?.some((a) => a.includes(text)) ?? false;
}

// Quick biological sanity-check: does this creature actually belong in this
// arena? Used to draw a 🟢/🟡/⚪ dot on each arena tab so the kid can see at
// a glance that, e.g., loading the Octopus from the dex points at Deep + Maze
// rather than Chase or Drought.
export function arenaFitFor(arena: ArenaId, c: Creature): ArenaFit {
  const m = sizeToMass(c.sizeUnit);
  const s = computeStats(c);

  switch (arena) {
    case 'chase': {
      if (c.bodyPlan === 'fish') return { fit: 'tough', reason: 'Fish can\'t chase on land.' };
      if (c.legTier === 0) return { fit: 'tough', reason: 'Stubby legs lose ground.' };
      if (c.legTier === 2 && s.topSpeedKmh > 70) return { fit: 'great', reason: 'Runner legs + sprint speed.' };
      return { fit: 'ok', reason: 'Decent runner.' };
    }
    case 'hunt': {
      const stealth = c.hybrids.includes('camouflage') || c.hybrids.includes('venom');
      if (c.sensorTier === 2 && (c.brainTier >= 1 || stealth)) return { fit: 'great', reason: 'Sharp senses + smart or sneaky.' };
      if (c.brainTier === 0 && c.sensorTier === 0) return { fit: 'tough', reason: 'Dull senses, slow to read prey.' };
      return { fit: 'ok', reason: 'Workable predator.' };
    }
    case 'climb': {
      if (s.coldTolerance >= 70) return { fit: 'great', reason: 'Handles cold and altitude.' };
      if (s.coldTolerance < 30) return { fit: 'tough', reason: 'Freezes near the summit.' };
      return { fit: 'ok', reason: 'Survives but suffers.' };
    }
    case 'drought': {
      if (m > 100 && !c.warmBlooded) return { fit: 'great', reason: 'Big and cold-blooded — low water loss.' };
      if (!c.warmBlooded || m > 200) return { fit: 'great', reason: m > 200 ? 'Bulk holds water.' : 'Cold-blooded conserves water.' };
      if (m < 1 && c.warmBlooded) return { fit: 'tough', reason: 'Tiny warm bodies dry out fast.' };
      if (c.bodyPlan === 'fish') return { fit: 'tough', reason: 'Fish can\'t survive dry land.' };
      return { fit: 'ok', reason: 'Marginal in the heat.' };
    }
    case 'deep': {
      if (hasAdaptation(c, 'diver') || hasAdaptation(c, 'gills')) return { fit: 'great', reason: 'Real diving/aquatic adaptations.' };
      if (c.bodyPlan === 'fish' || c.hybrids.includes('gills')) return { fit: 'great', reason: 'Built for water.' };
      if (c.hybrids.includes('echolocation')) return { fit: 'ok', reason: 'Sound helps navigate the dark.' };
      return { fit: 'tough', reason: 'Will drown without gills.' };
    }
    case 'maze': {
      if (c.brainTier === 3) return { fit: 'great', reason: 'Genius brain — puzzles are no contest.' };
      if (c.brainTier === 2) return { fit: 'great', reason: 'Big brain solves puzzles.' };
      if (c.brainTier === 0) return { fit: 'tough', reason: 'Tiny brain gets lost.' };
      return { fit: 'ok', reason: 'Can muddle through.' };
    }
  }
}

export function fitEmoji(fit: Fit): string {
  return fit === 'great' ? '🟢' : fit === 'ok' ? '🟡' : '⚪';
}
