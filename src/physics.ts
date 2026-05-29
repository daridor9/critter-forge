import type { Creature, BodyPlan, Tier, BrainTier, Hybrid } from './types';

// Size slider 0..100 → mass 0.01 kg..100,000 kg (log scale)
export function sizeToMass(sizeUnit: number): number {
  const minLog = Math.log10(0.01);
  const maxLog = Math.log10(100000);
  const log = minLog + (sizeUnit / 100) * (maxLog - minLog);
  return Math.pow(10, log);
}

// Kleiber's law: basal metabolic rate ≈ 70 * M^0.75 kcal/day (mammals).
// Cold-blooded ~ 1/10 of warm-blooded baseline.
export function basalKcalPerDay(massKg: number, warmBlooded: boolean): number {
  const warm = 70 * Math.pow(massKg, 0.75);
  return warmBlooded ? warm : warm * 0.1;
}

// Brain energy cost: tier 0 ~ no overhead, tier 2 adds ~25%, tier 3 (genius) +50%.
// A real human brain (~2% of body mass) burns ~20% of total energy.
export function totalKcalPerDay(massKg: number, warmBlooded: boolean, brainTier: BrainTier): number {
  const base = basalKcalPerDay(massKg, warmBlooded);
  const brainMult = [1.0, 1.10, 1.25, 1.5][brainTier];
  return base * brainMult;
}

// Mammalian brain allometry: M_brain ≈ 0.01 · M_body^0.76 (kg).
// This is the "expected" brain mass for a generic mammal of that body size.
// 0.76 is the standard exponent across vertebrates.
function expectedBrainMassKg(massKg: number): number {
  return 0.01 * Math.pow(massKg, 0.76);
}

// Encephalization Quotient — actual brain mass ÷ expected for that body size.
// Anchors: cow ~0.5, dog ~1.2, chimp ~2.5, dolphin ~5, human ~7, octopus ~1.5.
// Each tier roughly doubles+ over the previous.
function eqForTier(tier: BrainTier): number {
  return [0.35, 1.0, 2.5, 6.0][tier];
}

export function encephalizationQuotient(c: Creature): number {
  return eqForTier(c.brainTier);
}

export function brainMassGrams(c: Creature): number {
  const m = sizeToMass(c.sizeUnit);
  return expectedBrainMassKg(m) * eqForTier(c.brainTier) * 1000;
}

function bodyPlanSpeedMult(bp: BodyPlan): number {
  switch (bp) {
    case 'mammal': return 1.0;
    case 'reptile': return 0.6;
    case 'bird': return 1.1;
    case 'fish': return 0.7;
  }
}

// Top sprint speed peaks ~50kg (cheetah, pronghorn, ostrich range).
export function topSpeedKmh(massKg: number, bodyPlan: BodyPlan, legTier: Tier): number {
  const log = Math.log10(massKg);
  const peak = Math.log10(50);
  const sigma = 1.2;
  const shape = Math.exp(-Math.pow((log - peak) / sigma, 2));
  const planMult = bodyPlanSpeedMult(bodyPlan);
  const legMult = [0.55, 1.0, 1.45][legTier];
  return Math.round(120 * shape * planMult * legMult);
}

// Endurance favored by warm-blooded mid-size (wolf/horse range).
export function enduranceKm(massKg: number, bodyPlan: BodyPlan, warmBlooded: boolean, legTier: Tier): number {
  const log = Math.log10(massKg);
  const peak = Math.log10(70);
  const sigma = 1.5;
  const shape = Math.exp(-Math.pow((log - peak) / sigma, 2));
  const aerobic = warmBlooded ? 1.0 : 0.15;
  const planMult = bodyPlan === 'fish' ? 0.5 : 1.0;
  const legMult = [0.7, 1.0, 1.25][legTier];
  return Math.round(80 * shape * aerobic * planMult * legMult);
}

// Surface/volume → heat loss per kg ∝ M^(-1/3). Larger = better cold tolerance.
export function coldTolerance(massKg: number, warmBlooded: boolean, defenseTier: Tier): number {
  const sizeScore = Math.min(100, Math.pow(massKg, 1 / 3) * 8);
  const warmScore = warmBlooded ? 30 : -20;
  const insulation = [0, 15, 30][defenseTier];
  return Math.max(0, Math.min(100, sizeScore + warmScore + insulation));
}

// Mammalian lifespan ≈ 11.8 * M^0.20. Cold-blooded a bit longer per kg.
export function lifespanYears(massKg: number, warmBlooded: boolean): number {
  const base = 11.8 * Math.pow(massKg, 0.20);
  return Math.max(1, Math.round(base * (warmBlooded ? 1.0 : 1.3)));
}

// Square-cube: required bone cross-section ∝ M, available ∝ M^(2/3).
// Risk grows with size; runner legs (thinner) add risk, stubby legs reduce it.
export function boneBreakRisk(massKg: number, legTier: Tier): number {
  const sizeRisk = Math.max(0, (Math.log10(massKg) + 1) * 18);
  const legRisk = [-15, 0, 15][legTier];
  return Math.max(0, Math.min(100, sizeRisk + legRisk));
}

// Heart rate ∝ M^(-1/4).
export function heartRate(massKg: number): number {
  return Math.max(4, Math.round(241 * Math.pow(massKg, -0.25)));
}

interface HybridEffect {
  bonusCold?: number;
  foodMult?: number;
  topSpeedMult?: number;
  enduranceMult?: number;
}

function hybridEffect(h: Hybrid): HybridEffect {
  switch (h) {
    case 'echolocation': return { foodMult: 1.10 };
    case 'wings':        return { foodMult: 1.15, enduranceMult: 1.10 };
    case 'venom':        return {};
    case 'electric':     return { foodMult: 1.15 };
    case 'camouflage':   return { foodMult: 1.05 };
    case 'antifreeze':   return { bonusCold: 30 };
    case 'thick-fur':    return { bonusCold: 25, topSpeedMult: 0.92 };
    case 'gills':        return {};
    case 'symbiosis':    return { foodMult: 0.92, bonusCold: 12 };
    // Mythic / unlockable
    case 'firebreath':   return { foodMult: 1.20, topSpeedMult: 1.04 };
    case 'stoneskin':    return { foodMult: 1.10 };            // armor without speed penalty
    case 'hypersonic':   return { foodMult: 1.25, topSpeedMult: 1.25, enduranceMult: 1.10 };
    case 'dragon':       return { foodMult: 1.5, topSpeedMult: 1.15, enduranceMult: 1.20, bonusCold: 25 };
    // Biology-inspired niche traits
    case 'photosynthesis': return { foodMult: 0.55 };           // half the food — sun-powered
    case 'regeneration':   return { foodMult: 1.10 };           // costs energy to heal
    case 'bioluminescence':return { foodMult: 1.08 };           // glowing costs ATP
    case 'mimicry':        return { foodMult: 1.05 };
    case 'hibernation':    return { foodMult: 0.85 };           // slow metabolism off-season
  }
}

export function isHybridValid(h: Hybrid, c: Creature): { valid: boolean; reason?: string } {
  if (h === 'electric' && c.bodyPlan !== 'fish') return { valid: false, reason: 'fish only' };
  if (h === 'antifreeze' && c.warmBlooded) return { valid: false, reason: 'cold-blooded only' };
  if (h === 'thick-fur' && !c.warmBlooded) return { valid: false, reason: 'warm-blooded only' };
  if (h === 'wings' && sizeToMass(c.sizeUnit) > 2) return { valid: false, reason: 'too heavy to fly (>2 kg)' };
  if (h === 'gills' && c.bodyPlan === 'fish') return { valid: false, reason: 'fish already have gills' };
  // New biology-inspired traits
  if (h === 'photosynthesis' && sizeToMass(c.sizeUnit) > 500) {
    return { valid: false, reason: 'too big to power on sunlight alone' };
  }
  if (h === 'hibernation' && c.bodyPlan === 'fish') {
    return { valid: false, reason: 'fish do not hibernate (they brumate)' };
  }
  // Mythic hybrids have no biology limits — only the points unlock gate
  // (enforced in the Builder UI + isHybridUnlocked in data/points.ts).
  return { valid: true };
}

export interface CreatureStats {
  massKg: number;
  foodKcalPerDay: number;
  foodKgPerDay: number;
  topSpeedKmh: number;
  enduranceKm: number;
  coldTolerance: number;
  lifespanYears: number;
  boneBreakRisk: number;
  heartRateBpm: number;
  brainMassGrams: number;
  eq: number;
}

export function vigilanceTaxFraction(c: Creature): number {
  let t = 0;
  t += c.sensorTier * 0.05;
  t += c.brainTier * 0.03;
  if (c.hybrids.includes('camouflage')) t -= 0.05;
  if (c.defenseTier === 2) t -= 0.03;
  return Math.max(-0.06, Math.min(0.3, t));
}

export interface StatExplanations {
  massKg: string;
  foodKcalPerDay: string;
  topSpeedKmh: string;
  enduranceKm: string;
  coldTolerance: string;
  lifespanYears: string;
  boneBreakRisk: string;
  heartRateBpm: string;
  vigilance: string;
  brain: string;
}

export function explainStats(c: Creature, s: CreatureStats): StatExplanations {
  const fmtMass = (m: number) => (m < 1 ? `${(m * 1000).toFixed(0)} g` : `${m.toFixed(m < 10 ? 1 : 0)} kg`);
  const vigTax = vigilanceTaxFraction(c);
  return {
    massKg: `Body mass on a log scale: tiny mouse (10 g) → blue whale (100 t). Your slider is at ${c.sizeUnit}/100.`,
    foodKcalPerDay:
      `Kleiber's law: BMR = 70 × mass^0.75 = ${Math.round(70 * Math.pow(s.massKg, 0.75))} kcal/day` +
      (c.warmBlooded ? '' : ' × 0.1 (cold-blooded eats 10× less per kg)') +
      (c.brainTier === 3 ? ' × 1.50 (genius brain costs 50%)' : c.brainTier === 2 ? ' × 1.25 (big brain costs 25%)' : c.brainTier === 1 ? ' × 1.10 (brain costs 10%)' : '') +
      (c.hybrids.length ? ' × hybrid costs' : '') +
      (vigTax !== 0 ? ` × (1 ${vigTax > 0 ? '+' : ''}${(vigTax * 100).toFixed(0)}% vigilance)` : '') +
      `. Result: ${Math.round(s.foodKcalPerDay)} kcal — ${fmtMass(s.foodKgPerDay)} of food per day.`,
    vigilance: `Vigilance tax: being alert costs energy. Big brains and sharp senses watch for threats (more cost). ` +
      `Camouflage and armor relax you (less cost). Yours: ${vigTax >= 0 ? '+' : ''}${(vigTax * 100).toFixed(0)}% on food bill.`,
    topSpeedKmh:
      `Top sprint speed peaks at ~50 kg of body mass (cheetah, pronghorn, ostrich). ` +
      `Your ${fmtMass(s.massKg)} ${c.bodyPlan} with ${['stubby', 'standard', 'runner'][c.legTier]} legs → ${s.topSpeedKmh} km/h.`,
    enduranceKm:
      `Endurance favours warm-blooded medium bodies (wolf, horse). Cold-blooded creatures fatigue ~7× faster (anaerobic). ` +
      `Your result: ${s.enduranceKm} km of sustained travel.`,
    coldTolerance:
      `Surface-to-volume ratio: small bodies lose heat fast (heat loss per kg ∝ mass^(−1/3)). ` +
      `Warm-blooded adds +30; thick fur/armor adds insulation; antifreeze blood adds +30. ` +
      `Your score: ${Math.round(s.coldTolerance)}/100.`,
    lifespanYears:
      `Lifespan ≈ 11.8 × mass^0.20 years. Bigger = longer-lived. Cold-blooded gets +30%. ` +
      `Your result: ${s.lifespanYears} years.`,
    boneBreakRisk:
      `Square-cube law: required bone strength ∝ mass, but available bone ∝ mass^(2/3). ` +
      `Risk grows with size. Runner-tier legs are thinner (more risk); stubby legs are thicker (less). ` +
      `Your risk: ${Math.round(s.boneBreakRisk)}/100.`,
    heartRateBpm:
      `Heart rate ∝ mass^(−1/4). All mammals share ~1.5 billion heartbeats per lifetime — ` +
      `small fast hearts burn through them in years; whale hearts last a century. ` +
      `Yours: ${s.heartRateBpm} bpm.`,
    brain:
      `Brain mass ≈ 0.01 × body_mass^0.76 (kg). For a ${fmtMass(s.massKg)} body, a "standard" mammal ` +
      `brain would weigh ~${Math.round(expectedBrainMassKg(s.massKg) * 1000)} g. Your tier ` +
      `(${['tiny','standard','big','genius'][c.brainTier]}) gives an EQ — encephalization quotient — of ${s.eq.toFixed(1)}×, ` +
      `so brain mass is ~${s.brainMassGrams < 1 ? `${(s.brainMassGrams * 1000).toFixed(0)} mg` : `${s.brainMassGrams < 10 ? s.brainMassGrams.toFixed(1) : Math.round(s.brainMassGrams)} g`}. ` +
      `For reference: cow EQ ~0.5, dog ~1.2, chimp ~2.5, dolphin ~5, human ~7.`,
  };
}

export function computeStats(c: Creature): CreatureStats {
  const m = sizeToMass(c.sizeUnit);

  let foodMult = 1.0;
  let speedMult = 1.0;
  let enduranceMult = 1.0;
  let coldBonus = 0;
  for (const h of c.hybrids) {
    if (!isHybridValid(h, c).valid) continue;
    let e = hybridEffect(h);
    // BIOLOGICAL REALISM modifiers — temper hybrid effects by body size.
    if (h === 'hypersonic') {
      // Drag scales with cross-section; truly massive creatures can't
      // realistically be hypersonic. Speed bonus tapers from full
      // benefit at <50kg to a third at >500kg.
      const speedFactor = m <= 50 ? 1.0 : Math.max(0.33, 1 - Math.log10(m / 50) * 0.35);
      e = { ...e, topSpeedMult: e.topSpeedMult ? 1 + (e.topSpeedMult - 1) * speedFactor : 1 };
    }
    if (h === 'hibernation') {
      // Small mammals achieve deep torpor; bears go shallow; whales
      // can't hibernate. Food-saving bonus shrinks with mass.
      const torporFactor = m <= 10 ? 1.0 : Math.max(0.1, 1 - Math.log10(m / 10) * 0.45);
      e = { ...e, foodMult: e.foodMult ? 1 - (1 - e.foodMult) * torporFactor : 1 };
    }
    if (h === 'thick-fur') {
      // Surface-area-to-volume favors small creatures — fur is critical
      // at <5kg, marginal at >500kg. (Mass scales as r^3, surface as r^2.)
      const insulFactor = m <= 5 ? 1.0 : Math.max(0.15, 1 - Math.log10(m / 5) * 0.30);
      e = { ...e, bonusCold: e.bonusCold ? Math.round(e.bonusCold * insulFactor) : 0 };
    }
    if (e.foodMult) foodMult *= e.foodMult;
    if (e.topSpeedMult) speedMult *= e.topSpeedMult;
    if (e.enduranceMult) enduranceMult *= e.enduranceMult;
    if (e.bonusCold) coldBonus += e.bonusCold;
  }

  const vigTax = vigilanceTaxFraction(c);
  const kcal = totalKcalPerDay(m, c.warmBlooded, c.brainTier) * foodMult * (1 + vigTax);
  const baseCold = coldTolerance(m, c.warmBlooded, c.defenseTier);
  return {
    massKg: m,
    foodKcalPerDay: kcal,
    foodKgPerDay: kcal / 1500,
    topSpeedKmh: Math.round(topSpeedKmh(m, c.bodyPlan, c.legTier) * speedMult),
    enduranceKm: Math.round(enduranceKm(m, c.bodyPlan, c.warmBlooded, c.legTier) * enduranceMult),
    coldTolerance: Math.max(0, Math.min(100, baseCold + coldBonus)),
    lifespanYears: lifespanYears(m, c.warmBlooded),
    boneBreakRisk: boneBreakRisk(m, c.legTier),
    heartRateBpm: heartRate(m),
    brainMassGrams: brainMassGrams(c),
    eq: eqForTier(c.brainTier),
  };
}
