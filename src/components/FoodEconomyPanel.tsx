import type { Creature } from '../types';
import type { CreatureStats } from '../physics';
import { allBalances } from '../data/foodEconomy';

interface Props {
  creature: Creature;
  stats: CreatureStats;
}

export function FoodEconomyPanel({ creature, stats }: Props) {
  const balances = allBalances(creature, stats);
  const maxScale = Math.max(stats.foodKcalPerDay, ...balances.map((b) => b.intake));
  const scale = Math.max(1, maxScale);

  return (
    <div className="food-economy">
      <h2>Food economy</h2>
      <p className="food-help">How much food your creature gets vs needs in each biome.</p>
      <div className="food-list">
        {balances.map((b) => {
          const intakePct = (b.intake / scale) * 100;
          const needPct = (b.need / scale) * 100;
          return (
            <div key={b.env.id} className={`food-env food-env-${b.status}`} title={b.env.note}>
              <div className="food-env-head">
                <span className="food-env-name">
                  <span className="food-env-emoji">{b.env.emoji}</span>
                  {b.env.name}
                </span>
                <span className={`food-env-net food-env-net-${b.status}`}>
                  {statusIcon(b.status)} {b.net >= 0 ? '+' : ''}
                  {Math.round(b.net)} kcal
                </span>
              </div>
              <div className="food-env-bars">
                <div className="food-bar-row" title={`Intake ${Math.round(b.intake)} kcal`}>
                  <span className="food-bar-label">in</span>
                  <div className="food-bar-track">
                    <div className="food-bar-fill food-bar-intake" style={{ width: `${intakePct}%` }} />
                  </div>
                  <span className="food-bar-num">{Math.round(b.intake)}</span>
                </div>
                <div className="food-bar-row" title={`Need ${Math.round(b.need)} kcal`}>
                  <span className="food-bar-label">out</span>
                  <div className="food-bar-track">
                    <div className="food-bar-fill food-bar-need" style={{ width: `${needPct}%` }} />
                  </div>
                  <span className="food-bar-num">{Math.round(b.need)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="food-footnote">
        Hover for what each biome offers. Negative balance = starvation; positive = your creature thrives there.
      </p>
    </div>
  );
}

function statusIcon(s: 'thriving' | 'tight' | 'starving'): string {
  return s === 'thriving' ? '🌿' : s === 'tight' ? '⚠️' : '💀';
}
