import type { Creature } from '../types';
import { getActiveCombo } from '../data/hybridCombos';

interface Props {
  creature: Creature;
}

// Shows an active hybrid combo as a glowing chip on the creature stage so
// players know their pair of hybrids is doing something. The chip's title
// (hover tooltip) spells out the actual bonuses.
export function ComboBadge({ creature }: Props) {
  const combo = getActiveCombo(creature);
  if (!combo) return null;

  // Summarize the bonuses into a tooltip line.
  const e = combo.effects;
  const bits: string[] = [];
  if (e.chaseSpeedMult) bits.push(`Chase ×${e.chaseSpeedMult}`);
  if (e.deepBreathBonus) bits.push(`Deep breath ×${e.deepBreathBonus}`);
  if (e.droughtFoodMult) bits.push(`Drought food ×${e.droughtFoodMult}`);
  if (e.climbBonus) bits.push(`Climb +${e.climbBonus}`);
  if (e.mazeStaminaBonus) bits.push(`Maze +${e.mazeStaminaBonus}`);
  if (e.brawlPowerBonus) bits.push(`Battle +${e.brawlPowerBonus}`);
  if (e.huntHideBonus) bits.push(`Hunt hide +${e.huntHideBonus}`);
  if (e.huntFightBonus) bits.push(`Hunt fight +${e.huntFightBonus}`);
  if (e.pointsMultiplier) bits.push(`All points ×${e.pointsMultiplier}`);
  const tooltip = `${combo.name} — ${combo.description}${bits.length ? `\n\nActive bonuses:\n• ${bits.join('\n• ')}` : ''}`;

  return (
    <div className="combo-badge-stage" title={tooltip}>
      <span className="combo-badge-stage-emoji">{combo.emoji}</span>
      <span className="combo-badge-stage-text">
        <strong>{combo.name}</strong>
        <small>combo active</small>
      </span>
    </div>
  );
}
