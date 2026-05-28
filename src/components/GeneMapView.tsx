import type { Creature } from '../types';
import { sizeToMass, topSpeedKmh, brainMassGrams } from '../physics';
import { hybridCatalog } from '../data/hybrids';
import { getActiveCombo } from '../data/hybridCombos';

interface Props {
  creature: Creature;
  W: number;
  H: number;
}

// ─── Gene Map ─────────────────────────────────────────────────────────────
// Chromosome-style view of all the creature's traits, grouped by category.
// Each row is a category, each chip is a trait with its value + a real-world
// animal reference. Click/hover (via title tooltip) shows the deeper meaning.

interface Gene {
  emoji: string;
  label: string;
  value: string;
  ref?: string;       // real-world reference animal
}

interface GeneCategory {
  emoji: string;
  name: string;
  color: string;
  genes: Gene[];
}

function bodyRef(bp: string, massKg: number): string {
  if (bp === 'fish') return massKg > 800 ? 'shark / tuna' : massKg > 50 ? 'salmon / barracuda' : 'guppy / sardine';
  if (bp === 'bird') return massKg > 6 ? 'eagle / ostrich' : massKg > 0.5 ? 'pigeon / parrot' : 'sparrow / hummingbird';
  if (bp === 'reptile') return massKg > 100 ? 'crocodile' : massKg > 10 ? 'iguana / monitor' : 'gecko / lizard';
  // mammal
  if (massKg > 4000) return 'elephant / hippo';
  if (massKg > 200) return 'horse / cow';
  if (massKg > 20) return 'dog / boar';
  if (massKg > 1) return 'cat / fox';
  return 'mouse / shrew';
}

function brainRef(tier: number): string {
  return ['instinct-driven mouse', 'average mammal', 'corvid / ape (smart)', 'dolphin / octopus (genius)'][tier];
}

function legRef(tier: number, bp: string): string {
  if (bp === 'fish') return 'fins';
  if (tier === 0) return 'penguin / sloth';
  if (tier === 1) return 'dog / wolf';
  return 'cheetah / gazelle';
}

function defenseRef(tier: number): string {
  return ['exposed skin', 'fur or scales', 'armadillo / pangolin'][tier];
}

function sensorRef(tier: number): string {
  return ['basic eyes', 'hawk-sharp eyes', 'bat-tier echolocation'][tier];
}

function buildGenes(c: Creature): GeneCategory[] {
  const massKg = sizeToMass(c.sizeUnit);
  const speed = topSpeedKmh(massKg, c.bodyPlan, c.legTier);
  const brain = brainMassGrams(c);

  const body: GeneCategory = {
    emoji: '🧬', name: 'Body Plan', color: '#5a7838',
    genes: [
      { emoji: c.bodyPlan === 'fish' ? '🐟' : c.bodyPlan === 'bird' ? '🐦' : c.bodyPlan === 'reptile' ? '🦎' : '🐾',
        label: 'Body', value: c.bodyPlan, ref: bodyRef(c.bodyPlan, massKg) },
      { emoji: c.warmBlooded ? '🔥' : '❄️', label: 'Metabolism', value: c.warmBlooded ? 'Warm-blooded' : 'Cold-blooded',
        ref: c.warmBlooded ? 'mammals + birds' : 'reptiles + fish' },
      { emoji: '⚖️', label: 'Mass', value: massKg < 1 ? `${(massKg * 1000).toFixed(0)} g` : massKg < 1000 ? `${massKg.toFixed(1)} kg` : `${(massKg / 1000).toFixed(1)} t`,
        ref: bodyRef(c.bodyPlan, massKg) },
    ],
  };

  const struct: GeneCategory = {
    emoji: '🦴', name: 'Structure', color: '#c08030',
    genes: [
      { emoji: '🦵', label: 'Legs', value: ['Stubby', 'Standard', 'Runner'][c.legTier], ref: legRef(c.legTier, c.bodyPlan) },
      { emoji: '🛡️', label: 'Defense', value: ['None', 'Fur/scales', 'Armor'][c.defenseTier], ref: defenseRef(c.defenseTier) },
      { emoji: '🏃', label: 'Top speed', value: `${speed} km/h`, ref: speed > 80 ? 'cheetah territory' : speed > 50 ? 'wolf / deer' : speed > 25 ? 'cycling pace' : 'walking pace' },
    ],
  };

  const neural: GeneCategory = {
    emoji: '🧠', name: 'Neural', color: '#9a60d0',
    genes: [
      { emoji: '🧠', label: 'Brain',
        value: `${['Tiny', 'Standard', 'Big', 'Genius'][c.brainTier]} (${brain.toFixed(brain < 1 ? 2 : 0)} g)`,
        ref: brainRef(c.brainTier) },
      { emoji: '👁️', label: 'Senses', value: ['Simple', 'Sharp', 'Sonar'][c.sensorTier], ref: sensorRef(c.sensorTier) },
    ],
  };

  const hybridGenes: Gene[] = c.hybrids.map((h) => {
    const info = hybridCatalog.find((x) => x.id === h);
    return {
      emoji: info?.emoji ?? '🧪',
      label: 'Hybrid',
      value: info?.name ?? h,
      ref: info?.fact?.split('.')[0],
    };
  });
  const hybrids: GeneCategory = {
    emoji: '🦠', name: 'Hybrid Genes', color: '#4a8ab8',
    genes: hybridGenes.length > 0 ? hybridGenes : [{ emoji: '➖', label: 'None', value: 'no hybrid traits yet', ref: 'add hybrids in the Builder' }],
  };

  return [body, struct, neural, hybrids];
}

export function GeneMapView({ creature, W, H }: Props) {
  const cats = buildGenes(creature);
  const combo = getActiveCombo(creature);

  // Layout: 4 horizontal category rows stacked, with extra combo callout
  // at the bottom if a combo is active. Bumped this whole view into the
  // 600×300 stage SVG via foreignObject so HTML/CSS does the heavy lifting.

  return (
    <>
      <rect width={W} height={H} fill="#fbf6e6" />
      {/* faint chromosome ladder bg */}
      <g opacity="0.12" stroke="#8a6238">
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1={50 + i * 45} y1={28} x2={50 + i * 45} y2={H - 28} strokeWidth="0.6" strokeDasharray="2 4" />
        ))}
      </g>

      <text x={W / 2} y={20} textAnchor="middle" fontSize="13" fontWeight="700" fill="#5a3b18" letterSpacing="0.05em">
        🧬 GENE MAP · {creature.name}
      </text>
      <line x1={W / 2 - 130} y1={26} x2={W / 2 + 130} y2={26} stroke="#5a3b18" strokeWidth="0.8" opacity="0.5" />

      <foreignObject x={6} y={30} width={W - 12} height={H - 36}>
        <div className="gene-map">
          {cats.map((cat) => (
            <div key={cat.name} className="gene-row">
              <div className="gene-cat" style={{ background: cat.color }}>
                <span className="gene-cat-emoji">{cat.emoji}</span>
                <span className="gene-cat-name">{cat.name}</span>
              </div>
              <div className="gene-chips">
                {cat.genes.map((g, i) => (
                  <div key={i} className="gene-chip" title={g.ref ? `${g.label}: ${g.value}\n→ ${g.ref}` : `${g.label}: ${g.value}`}>
                    <span className="gene-emoji">{g.emoji}</span>
                    <span className="gene-text">
                      <strong>{g.value}</strong>
                      {g.ref && <small> {g.ref}</small>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {combo && (
            <div className="gene-combo">
              <span className="gene-combo-emoji">{combo.emoji}</span>
              <span className="gene-combo-text">
                <strong>Active combo: {combo.name}</strong>
                <small>{combo.description}</small>
              </span>
            </div>
          )}
        </div>
      </foreignObject>
    </>
  );
}
