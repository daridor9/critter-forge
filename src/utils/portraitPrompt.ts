import type { Creature, Hybrid } from '../types';
import { sizeToMass } from '../physics';

// ─────────────────────────────────────────────────────────────────────────
// Portrait prompt generator
//
// Turns a Creature config into a rich, descriptive prompt suitable for
// pasting into DALL·E, FLUX, Midjourney, Stable Diffusion, or a chat model
// like Claude/ChatGPT that can generate images. The prompt is opinionated:
// it asks for kawaii Pokémon-style watercolor character art so portraits
// across creatures end up with a consistent look.
// ─────────────────────────────────────────────────────────────────────────

function sizeBand(massKg: number): { label: string; descriptor: string } {
  if (massKg < 0.1) return { label: 'tiny', descriptor: 'a tiny palm-sized' };
  if (massKg < 2) return { label: 'small', descriptor: 'a small house-cat-sized' };
  if (massKg < 30) return { label: 'medium', descriptor: 'a mid-sized' };
  if (massKg < 500) return { label: 'large', descriptor: 'a large powerful' };
  return { label: 'huge', descriptor: 'a huge majestic' };
}

const COLOR_HINTS = {
  warm: ['warm salmon-pink', 'soft coral and amber', 'rust-orange', 'peach and rose'],
  cold: ['cool sky-blue and slate', 'cerulean and teal', 'sapphire and aqua', 'pale mint and ice'],
};

function colorPhrase(warm: boolean, seed: number): string {
  const list = warm ? COLOR_HINTS.warm : COLOR_HINTS.cold;
  return list[seed % list.length];
}

const LEG_PHRASES = ['stubby short legs tucked under', 'sturdy balanced legs', 'long graceful runner legs poised mid-stride'] as const;
const BRAIN_PHRASES = ['a small dome head', 'a rounded friendly head', 'a large clever head with a high forehead', 'an oversized magnificent brain dome'] as const;
const SENSOR_PHRASES_MAMMAL = ['small button ears', 'alert pointed triangle ears', 'huge satellite-dish radar ears'] as const;
const SENSOR_PHRASES_OTHER = ['small curious eyes', 'sharp keen alert eyes', 'wide super-sensitive sensory eyes'] as const;

function defensePhrase(creature: Creature): string {
  if (creature.defenseTier === 2) return 'tough armored plates along the back';
  if (creature.defenseTier === 1) {
    if (creature.bodyPlan === 'mammal') return 'soft fluffy fur';
    if (creature.bodyPlan === 'bird') return 'soft layered feathers';
    return 'gently patterned scales';
  }
  if (creature.bodyPlan === 'mammal') return 'short smooth fur';
  if (creature.bodyPlan === 'bird') return 'sleek feathers';
  return 'smooth skin';
}

const HYBRID_PHRASES: Record<Hybrid, string> = {
  echolocation: 'extra-large bat-like sonar ears',
  wings: 'feathered fold-out wings tucked at the sides',
  venom: 'subtly iridescent venomous markings on the body',
  electric: 'small glowing electric-blue dots along the flanks',
  camouflage: 'a soft shimmering camouflage pattern that blends with its surroundings',
  antifreeze: 'a faint frosty sheen across its coat',
  'thick-fur': 'a thick fluffy winter coat that puffs around the neck',
  gills: 'delicate gill ruffles behind the head',
  symbiosis: 'a tiny adorable symbiotic partner creature riding on its back',
};

function bodyPlanNoun(creature: Creature): string {
  switch (creature.bodyPlan) {
    case 'mammal':
      return creature.warmBlooded ? 'mammal' : 'cold-blooded mammal-like creature';
    case 'reptile':
      return creature.warmBlooded ? 'warm-blooded reptile' : 'reptile';
    case 'bird':
      return creature.warmBlooded ? 'bird' : 'cold-blooded bird-like creature';
    case 'fish':
      return creature.warmBlooded ? 'warm-blooded fish' : 'fish';
  }
}

/** A simple deterministic hash for selecting color variants — same critter
 *  config always picks the same color band so re-opening the modal is stable. */
function colorSeed(creature: Creature): number {
  const s = `${creature.bodyPlan}-${creature.legTier}-${creature.brainTier}-${creature.defenseTier}-${creature.sensorTier}-${creature.warmBlooded ? 'w' : 'c'}-${creature.name}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function generatePortraitPrompt(creature: Creature): string {
  const m = sizeToMass(creature.sizeUnit);
  const size = sizeBand(m);
  const noun = bodyPlanNoun(creature);
  const color = colorPhrase(creature.warmBlooded, colorSeed(creature));
  const legs = LEG_PHRASES[creature.legTier];
  const head = BRAIN_PHRASES[creature.brainTier];
  const sensors = creature.bodyPlan === 'mammal'
    ? SENSOR_PHRASES_MAMMAL[creature.sensorTier]
    : SENSOR_PHRASES_OTHER[creature.sensorTier];
  const defense = defensePhrase(creature);
  const hybridList = creature.hybrids.map((h) => HYBRID_PHRASES[h]).filter(Boolean);

  // Body composition: legs only make sense for non-fish.
  const limbDetail = creature.bodyPlan === 'fish'
    ? 'streamlined fins and a long flowing tail'
    : creature.bodyPlan === 'bird'
      ? `two ${legs.replace('legs', 'bird legs')}`
      : legs;

  const massText = m < 0.1
    ? `${Math.round(m * 1000)} grams`
    : m < 10
      ? `${m.toFixed(1)} kilograms`
      : `${Math.round(m)} kilograms`;

  const subjectLine = `${size.descriptor} ${noun} named "${creature.name}", roughly ${massText}`;

  const featureLines = [
    `${color} coloring with ${defense}`,
    head + ' with ' + sensors,
    'big expressive shiny eyes, a tiny nose, gentle smile',
    limbDetail,
  ];

  if (hybridList.length > 0) {
    featureLines.push(`special features: ${hybridList.join(', and ')}`);
  }

  const style = [
    'Kawaii Pokémon-style character art.',
    'Soft watercolor outlines, gentle pastel palette, cell-shaded with bold dark outlines.',
    'Full-body portrait, centered, three-quarter angle pose, clean off-white background, soft drop shadow underneath.',
    'Children\'s book illustration style. Friendly, expressive, and high in detail.',
    'No text, no logos, no watermarks.',
  ].join(' ');

  return [
    `Subject: ${subjectLine}.`,
    `Features:`,
    ...featureLines.map((line) => `  • ${line}.`),
    ``,
    `Style: ${style}`,
  ].join('\n');
}

/** Stable hash of the visual parts of a creature config — used as the key
 *  for storing portraits. Name is included because users may want different
 *  portraits for differently-named critters even with the same body. */
export function portraitKey(creature: Creature): string {
  const parts = [
    creature.bodyPlan,
    creature.warmBlooded ? 'w' : 'c',
    creature.legTier,
    creature.brainTier,
    creature.defenseTier,
    creature.sensorTier,
    Math.round(creature.sizeUnit / 5) * 5, // bucket size so micro tweaks share a portrait
    [...creature.hybrids].sort().join('+'),
    creature.name,
  ];
  return parts.join('|');
}
