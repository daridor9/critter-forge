import type { Creature } from '../types';

export interface Insight {
  id: string;
  title: string;
  text: string;
  won: boolean;
}

export type ArenaResult =
  | { arena: 'chase'; won: boolean; reason: 'caught' | 'lost-speed' | 'lost-stamina' | 'lost-distance'; preyId?: 'rabbit' | 'gazelle' | 'kangaroo'; reward?: number }
  | { arena: 'climb'; won: boolean; reason: 'reached-top' | 'froze' | 'exhausted' }
  | { arena: 'drought'; won: boolean; reason: 'survived' | 'starved'; daysSurvived: number }
  | { arena: 'hunt'; won: boolean; reason: 'hidden' | 'outran' | 'tanked' | 'fought' | 'caught' }
  | { arena: 'deep'; won: boolean; reason: 'foraged' | 'drowned' | 'crushed'; maxDepth: number }
  | { arena: 'maze'; won: boolean; reason: 'escaped' | 'exhausted'; stepsTaken: number; stepsNeeded: number };

export function pickInsight(r: ArenaResult, massKg: number, creature?: Creature): Insight {
  switch (r.arena) {
    case 'chase':   return pickChase(r);
    case 'climb':   return pickClimb(r);
    case 'drought': return pickDrought(r);
    case 'hunt':    return pickHunt(r);
    case 'deep':    return pickDeep(r, massKg, creature);
    case 'maze':    return pickMaze(r);
  }
}

function pickChase(r: Extract<ArenaResult, { arena: 'chase' }>): Insight {
  if (r.won) {
    const reward = r.reward ?? 0;
    const preyText =
      r.preyId === 'rabbit' ? 'Easy catch — but rabbits are small (~600 kcal). To eat well, hunt bigger.'
      : r.preyId === 'gazelle' ? 'Medium prey, medium reward (~2,200 kcal). The wolf-cheetah zone.'
      : r.preyId === 'kangaroo' ? 'Big haul (~4,800 kcal)! Kangaroos hit 70 km/h — your design earned a feast.'
      : '';
    return { id: 'chase-won', won: true, title: `You caught the prey! +${reward.toLocaleString()} kcal`, text:
      `${preyText} Real wolves win by stamina, not pure speed. Cheetahs are faster but can only sprint ~30 seconds — ` +
      `if the prey jukes once, the cheetah loses.` };
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
  if (r.reason === 'fought') {
    return { id: 'hunt-fought', won: true, title: 'You fought back!', text:
      'Chemistry beats brawn. A 50 g snake takes down a 100 kg deer with venom; an electric eel drops a horse ' +
      'with 600 V; a platypus has venomous spurs. Small predators win by being scary, not big.' };
  }
  return { id: 'hunt-caught', won: false, title: 'Injured — but you escaped', text:
    'The predator caught you, you took a hit, and limped away. Bruised but alive. ' +
    'Next time pick a strategy that matches your build: tiny + camouflaged → Hide. Fast (> predator speed) → Run. ' +
    'Big or venomous or armored → Fight. The bigger your body or armor, the more brutal a fight you survive.' };
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

function pickDeep(r: Extract<ArenaResult, { arena: 'deep' }>, massKg: number, c?: Creature): Insight {
  if (r.won) {
    // Pick the closest real-animal analogue so the win blurb matches the creature
    // you actually built, instead of always citing sperm whales.
    let text: string;
    const camo = c?.hybrids.includes('camouflage') ?? false;
    const venom = c?.hybrids.includes('venom') ?? false;
    const gills = c?.hybrids.includes('gills') ?? false;
    const echo = c?.hybrids.includes('echolocation') ?? false;
    const isFish = c?.bodyPlan === 'fish';

    if (isFish && massKg < 50 && (camo || venom)) {
      // Octopus / cuttlefish profile
      text = 'You won the cephalopod way. Octopi have copper-based blue blood that carries oxygen well in cold water, ' +
        'three hearts, and a soft squishy body that handles pressure with no air pockets to collapse. ' +
        'They solve mazes, open jars, and edit their own RNA. A brain in each arm helps.';
    } else if (isFish && massKg > 800) {
      // Great white / large fish
      text = 'You\'re built for the deep. Big fish equalize pressure through their tissues (no air-filled lungs to collapse), ' +
        'extract dissolved O₂ through gills, and detect heartbeats with electro-sense. ' +
        'The great white\'s ampullae of Lorenzini read tiny voltage changes from prey.';
    } else if (isFish || gills) {
      // Generic fish/water-breather
      text = 'Gills extract O₂ from the water — no surface trips needed. Water carries ~30× less oxygen than air, ' +
        'so the gill surface must be huge and water must flow over it constantly. Your body equalizes ' +
        'pressure through its tissues, so depth is no enemy.';
    } else if (echo && c?.bodyPlan === 'mammal' && massKg > 50) {
      // Dolphin profile
      text = 'You dive like a dolphin. Flexible ribs that collapse under pressure (no air pockets to crush), ' +
        'oxygen stored in muscle (myoglobin, ~10× a human\'s), and echolocation to hunt in the dark — ' +
        'clicks that travel four times faster underwater than in air.';
    } else if (c?.bodyPlan === 'mammal' && massKg > 1000) {
      // Sperm whale / large diving mammal
      text = 'You handled the pressure and the breath demand. Sperm whales dive to 2000 m holding a single ' +
        'breath for 90 minutes — gigantic lungs + collapsible ribs let them survive crushing pressure. ' +
        'Your design used the same principles.';
    } else {
      // Generic warm-blooded diver (seal/penguin profile)
      text = 'You dove like a seal or a penguin. Big oxygen-storing muscles, a slow dive-heartbeat, ' +
        'and tissues that handle pressure without collapsing. Mammals and birds that dive evolved these ' +
        'tricks independently — a beautiful example of convergent evolution.';
    }
    return { id: 'deep-won', won: true, title: `Foraged at ${r.maxDepth}m!`, text };
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
