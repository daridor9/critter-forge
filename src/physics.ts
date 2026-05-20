import type { Creature, BodyPlan, Tier, Hybrid } from './types';

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

// Brain energy cost: tier 0 ~ no overhead, tier 2 adds ~25%.
export function totalKcalPerDay(massKg: number, warmBlooded: boolean, brainTier: Tier): number {
  const base = basalKcalPerDay(massKg, warmBlooded);
  const brainMult = [1.0, 1.10, 1.25][brainTier];
  return base * brainMult;
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
  }
}

export function isHybridValid(h: Hybrid, c: Creature): { valid: boolean; reason?: string } {
  if (h === 'electric' && c.bodyPlan !== 'fish') return { valid: false, reason: 'fish only' };
  if (h === 'antifreeze' && c.warmBlooded) return { valid: false, reason: 'cold-blooded only' };
  if (h === 'thick-fur' && !c.warmBlooded) return { valid: false, reason: 'warm-blooded only' };
  if (h === 'wings' && sizeToMass(c.sizeUnit) > 2) return { valid: false, reason: 'too heavy to fly (>2 kg)' };
  if (h === 'gills' && c.bodyPlan === 'fish') return { valid: false, reason: 'fish already have gills' };
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
}

export function explainStats(c: Creature, s: CreatureStats): StatExplanations {
  const fmtMass = (m: number) => (m < 1 ? `${(m * 1000).toFixed(0)} g` : `${m.toFixed(m < 10 ? 1 : 0)} kg`);
  return {
    massKg: `Body mass on a log scale: tiny mouse (10 g) → blue whale (100 t). Your slider is at ${c.sizeUnit}/100.`,
    foodKcalPerDay:
      `Kleiber's law: BMR = 70 × mass^0.75 = ${Math.round(70 * Math.pow(s.massKg, 0.75))} kcal/day` +
      (c.warmBlooded ? '' : ' × 0.1 (cold-blooded eats 10× less per kg)') +
      (c.brainTier === 2 ? ' × 1.25 (big brain costs 25%)' : c.brainTier === 1 ? ' × 1.10 (brain costs 10%)' : '') +
      (c.hybrids.length ? ' × hybrid costs' : '') +
      `. Result: ${Math.round(s.foodKcalPerDay)} kcal — ${fmtMass(s.foodKgPerDay)} of food per day.`,
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
    const e = hybridEffect(h);
    if (e.foodMult) foodMult *= e.foodMult;
    if (e.topSpeedMult) speedMult *= e.topSpeedMult;
    if (e.enduranceMult) enduranceMult *= e.enduranceMult;
    if (e.bonusCold) coldBonus += e.bonusCold;
  }

  const kcal = totalKcalPerDay(m, c.warmBlooded, c.brainTier) * foodMult;
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
  };
}
