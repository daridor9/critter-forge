export interface Insight {
  id: string;
  title: string;
  text: string;
  won: boolean;
}

export type ArenaResult =
  | { arena: 'chase'; won: boolean; reason: 'caught' | 'lost-speed' | 'lost-stamina' | 'lost-distance' }
  | { arena: 'climb'; won: boolean; reason: 'reached-top' | 'froze' | 'exhausted' }
  | { arena: 'drought'; won: boolean; reason: 'survived' | 'starved'; daysSurvived: number }
  | { arena: 'hunt'; won: boolean; reason: 'hidden' | 'outran' | 'tanked' | 'caught' }
  | { arena: 'deep'; won: boolean; reason: 'foraged' | 'drowned' | 'crushed'; maxDepth: number }
  | { arena: 'maze'; won: boolean; reason: 'escaped' | 'exhausted'; stepsTaken: number; stepsNeeded: number };

export function pickInsight(r: ArenaResult, _massKg: number): Insight {
  switch (r.arena) {
    case 'chase':   return pickChase(r);
    case 'climb':   return pickClimb(r);
    case 'drought': return pickDrought(r);
    case 'hunt':    return pickHunt(r);
    case 'deep':    return pickDeep(r);
    case 'maze':    return pickMaze(r);
  }
}

function pickChase(r: Extract<ArenaResult, { arena: 'chase' }>): Insight {
  if (r.won) {
    return { id: 'chase-won', won: true, title: 'You caught the prey!', text:
      'Your creature balanced speed and stamina. Real wolves hunt this way — they trot for hours and ' +
      'exhaust prey rather than out-sprinting them. Cheetahs are faster but can only sprint ~30 seconds.' };
  }
  if (r.reason === 'lost-stamina') {
    return { id: 'no-stamina', won: false, title: 'Out of breath', text:
      'Pure sprinters burn through oxygen fast. Cheetahs and house cats give up after a short dash. ' +
      'Try warm-blooded with longer legs and medium body mass — the wolf and horse zone.' };
  }
  if (r.reason === 'lost-speed') {
    return { id: 'too-slow', won: false, title: 'The prey outpaced you', text:
      'Try runner legs — but watch the bone-break meter if your creature is heavy. ' +
      'Speed peaks around 50 kg of body mass (cheetah, pronghorn, ostrich).' };
  }
  return { id: 'chase-general', won: false, title: 'Close, but no catch', text:
    'Every choice costs something. Predators that catch fast prey tend to be ~30–60 kg ' +
    'with long legs and aerobic stamina. Bigger isn\'t better — square-cube law makes huge bodies slow.' };
}

function pickClimb(r: Extract<ArenaResult, { arena: 'climb' }>): Insight {
  if (r.won) {
    return { id: 'climb-won', won: true, title: 'You reached the summit!', text:
      'Cold tolerance + manageable body mass = mountain survival. Musk-oxen, snow leopards and yaks ' +
      'all sit in this sweet spot: warm-blooded, medium-large, heavily insulated. Antifreeze blood ' +
      '(an arctic-fish trick) works for cold-blooded climbers too.' };
  }
  if (r.reason === 'froze') {
    return { id: 'froze', won: false, title: 'Frozen on the slope', text:
      'Heat loss scales with surface-to-volume ratio — small bodies lose heat faster than they can make it. ' +
      'Try a bigger body, thick fur, or warm blood. Cold-blooded? Add antifreeze blood.' };
  }
  return { id: 'exhausted-climb', won: false, title: 'Too heavy for the climb', text:
    'Body mass costs energy on every step. Above ~500 kg, climbing gets brutal — that\'s why ' +
    'elephants don\'t live above the tree line. Cut size or pick longer legs.' };
}

function pickDrought(r: Extract<ArenaResult, { arena: 'drought' }>): Insight {
  if (r.won) {
    return { id: 'drought-won', won: true, title: `Survived ${r.daysSurvived} days!`, text:
      'Slow metabolism + big fat reserves wins droughts. Camels go two weeks without water; ' +
      'crocodiles can fast for a YEAR. Cold-blooded creatures eat 1/10 the food per kg of warm-blooded ' +
      '— your gut wins the long game.' };
  }
  return { id: 'starved', won: false, title: `Starved on day ${r.daysSurvived}`, text:
    'Your metabolism burned reserves faster than the drought lasted. Warm-blooded brain-heavy creatures ' +
    'cost a lot per day. Try cold-blooded, or a much bigger body — total kcal scales as mass^0.75, so ' +
    'per-kg cost drops as bodies get larger.' };
}

function pickHunt(r: Extract<ArenaResult, { arena: 'hunt' }>): Insight {
  if (r.reason === 'hidden') {
    return { id: 'hunt-hidden', won: true, title: 'The predator never saw you', text:
      'Stealth wins. Small bodies, camouflage, sharp senses, and a brain to use them — that\'s how rabbits, ' +
      'octopi and snipers of the natural world survive. The 1mm-precise skin colour change of an octopus is ' +
      'an extreme of this strategy.' };
  }
  if (r.reason === 'outran') {
    return { id: 'hunt-outran', won: true, title: 'Spotted — but you outran it!', text:
      'Detection happened, but your top speed beat the predator (70 km/h). Pronghorns evolved to outrun ' +
      'extinct American cheetahs — they\'re still over-engineered for today\'s threats.' };
  }
  if (r.reason === 'tanked') {
    return { id: 'hunt-tanked', won: true, title: 'Armored survival', text:
      'You couldn\'t outrun it, but your armor absorbed the strike. This is the turtle/armadillo/pangolin ' +
      'strategy — heavy, slow, but bite-proof. Costs you mobility everywhere else.' };
  }
  return { id: 'hunt-caught', won: false, title: 'Caught', text:
    'Your creature was spotted and couldn\'t escape. To survive a hunt, pick ONE: be very small + camouflaged, ' +
    'be fast enough to outrun (>70 km/h), or be armored. Big + slow + unarmored = predator food.' };
}

function pickMaze(r: Extract<ArenaResult, { arena: 'maze' }>): Insight {
  if (r.won) {
    return { id: 'maze-won', won: true, title: `Escaped in ${r.stepsTaken} steps!`, text:
      'Brain pays its food bill. Apes, dolphins, ravens and octopi solve novel puzzles in seconds — but ' +
      'their brains burn ~20% of total energy. Echolocation (bats, dolphins) reads the maze without eyes ' +
      'and is even more efficient.' };
  }
  return { id: 'maze-exhausted', won: false, title: `Lost — needed ${r.stepsNeeded} steps`, text:
    'Tiny brains use trial-and-error and run out of stamina before finding the exit. Upgrade to standard ' +
    'or big brain (more food cost), or add echolocation, or sharpen the senses. Sometimes intelligence is ' +
    'worth the metabolic price.' };
}

function pickDeep(r: Extract<ArenaResult, { arena: 'deep' }>): Insight {
  if (r.won) {
    return { id: 'deep-won', won: true, title: `Foraged at ${r.maxDepth}m!`, text:
      'You handled the pressure and the breath demand. Sperm whales dive to 2000m holding a single breath ' +
      'for 90 minutes — gigantic lungs + collapsible ribs let them survive crushing pressure. Your design ' +
      'used the same principles.' };
  }
  if (r.reason === 'drowned') {
    return { id: 'deep-drowned', won: false, title: 'Out of breath', text:
      'Lung capacity scales roughly with body size. A mouse can\'t dive — too little oxygen storage. Either ' +
      'go bigger (whale-style), or add gills, or switch to a fish body plan to extract O₂ from water.' };
  }
  return { id: 'deep-crushed', won: false, title: 'Crushed by pressure', text:
    'Pressure doubles every 10m of depth. Soft tissues collapse. Armor (or whale-style blubber) is needed ' +
    'past 100m — or use a fish body plan, which equalizes pressure naturally.' };
}
