import type { Creature } from '../types';
import { getActiveCombo } from '../data/hybridCombos';

interface Props {
  creature: Creature;
  /** Which arena context — picks the most relevant bonus to surface. */
  arena: 'nest' | 'plague' | 'drought' | 'climb' | 'storm' | 'deep' | 'maze' | 'migrate';
}

// Compact combo badge for arenas that don't yet show one. Mirrors the
// styling used by Hunt / Chase (inline .combo-badge) so the look is
// consistent across all arenas.
export function ArenaComboBadge({ creature, arena }: Props) {
  const combo = getActiveCombo(creature);
  if (!combo) return null;
  const e = combo.effects;
  let bonus = '';
  switch (arena) {
    case 'climb':
      if (e.climbBonus) bonus = `+${e.climbBonus} climb energy`;
      break;
    case 'drought':
      if (e.droughtFoodMult) bonus = `×${e.droughtFoodMult.toFixed(2)} food efficiency`;
      break;
    case 'deep':
      if (e.deepBreathBonus) bonus = `×${e.deepBreathBonus.toFixed(2)} breath`;
      break;
    case 'maze':
      if (e.mazeStaminaBonus) bonus = `+${e.mazeStaminaBonus} stamina`;
      break;
    case 'nest':
    case 'plague':
    case 'storm':
    case 'migrate':
      if (e.pointsMultiplier) bonus = `×${e.pointsMultiplier.toFixed(2)} pts`;
      else if (e.brawlPowerBonus) bonus = `+${e.brawlPowerBonus} power`;
      break;
  }
  return (
    <div className="combo-badge" title={combo.description}>
      <span className="combo-badge-emoji">{combo.emoji}</span>
      <span className="combo-badge-text">
        <strong>{combo.name}</strong>
        {bonus && <> · {bonus}</>}
      </span>
    </div>
  );
}
