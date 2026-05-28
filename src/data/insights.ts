import type { Creature } from '../types';

export interface Insight {
  id: string;
  title: string;
  text: string;
  won: boolean;
}

export type ArenaResult =
  | { arena: 'chase'; won: boolean; reason: 'caught' | 'lost-speed' | 'lost-stamina' | 'lost-distance'; preyId?: 'rabbit' | 'gazelle' | 'kangaroo'; reward?: number; biome?: 'savanna' | 'forest' | 'tundra' | 'desert' | 'night' }
  | { arena: 'climb'; won: boolean; reason: 'reached-top' | 'froze' | 'exhausted'; terrain?: 'alpine' | 'volcanic' | 'glacial' | 'aurora' }
  | { arena: 'drought'; won: boolean; reason: 'survived' | 'starved' | 'dehydrated'; daysSurvived: number; severity?: 'dry' | 'drought' | 'megadrought' | 'apocalypse' }
  | { arena: 'hunt'; won: boolean; reason: 'hidden' | 'outran' | 'tanked' | 'fought' | 'caught'; env?: 'savanna' | 'forest' | 'mountain' | 'desert' | 'ocean'; strategy?: 'hide' | 'run' | 'fight'; difficulty?: 'normal' | 'tough' | 'apex' }
  | { arena: 'deep'; won: boolean; reason: 'foraged' | 'drowned' | 'crushed' | 'crossed' | 'exhausted' | 'caught' | 'landed' | 'stalled' | 'no-wings'; maxDepth: number }
  | { arena: 'maze'; won: boolean; reason: 'escaped' | 'exhausted'; stepsTaken: number; stepsNeeded: number }
  | { arena: 'storm'; won: boolean; reason: 'survived' | 'blown-away' | 'struck-by-debris'; secondsHeld: number; severity?: 'gust' | 'storm' | 'tornado' }
  | { arena: 'nest'; won: boolean; reason: 'defended' | 'eggs-stolen'; eggsLost: number; wavesSurvived: number }
  | { arena: 'migrate'; won: boolean; reason: 'arrived' | 'lost' | 'starved'; kmTravelled: number; goalKm: number }
  | { arena: 'plague'; won: boolean; reason: 'recovered' | 'succumbed'; daysSurvived: number; goalDays: number };

export function pickInsight(r: ArenaResult, massKg: number, creature?: Creature): Insight {
  switch (r.arena) {
    case 'chase':   return pickChase(r);
    case 'climb':   return pickClimb(r);
    case 'drought': return pickDrought(r);
    case 'hunt':    return pickHunt(r);
    case 'deep':    return pickDeep(r, massKg, creature);
    case 'maze':    return pickMaze(r, creature);
    case 'storm':   return pickStorm(r);
    case 'nest':    return pickNest(r);
    case 'migrate': return pickMigrate(r);
    case 'plague':  return pickPlague(r);
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
  if (r.reason === 'dehydrated') {
    return { id: 'dehydrated', won: false, title: `Dehydrated on day ${r.daysSurvived}`, text:
      'No water means death faster than no food. Warm-blooded animals lose 1-3% of their body weight in water ' +
      'each day just from breathing and panting. Camels store water in their bloodstream and tolerate 25% loss; ' +
      'kangaroo rats never drink — they make water from food. Try Find Water more often, or pick a cold-blooded ' +
      'creature, or add thick fur (the camel-wool trick — insulates against heat loss).' };
  }
  return { id: 'starved', won: false, title: `Starved on day ${r.daysSurvived}`, text:
    'Your metabolism burned reserves faster than the drought lasted. Warm-blooded brain-heavy creatures ' +
    'cost a lot per day. Try cold-blooded, or a much bigger body — total kcal scales as mass^0.75, so ' +
    'per-kg cost drops as bodies get larger. Or split your time to Forage more.' };
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

function pickMaze(r: Extract<ArenaResult, { arena: 'maze' }>, c?: Creature): Insight {
  if (r.won) {
    return { id: 'maze-won', won: true, title: `Escaped in ${r.stepsTaken} steps!`, text:
      'Brain pays its food bill. Apes, dolphins, ravens and octopi solve novel puzzles in seconds — but ' +
      'their brains burn ~20% of total energy. Echolocation (bats, dolphins) reads the maze without eyes ' +
      'and is even more efficient.' };
  }
  // Loss — pick the explanation that actually fits the creature, not a
  // hardcoded "tiny brain" lecture.
  const brain = c?.brainTier ?? 0;
  const overshoot = r.stepsNeeded - r.stepsTaken;
  let text: string;
  let title = `Lost — couldn't finish the ${r.stepsNeeded}-step path`;
  if (brain >= 3) {
    text = 'Bad luck. Your genius brain almost always finds the shortcut, but this run rolled the unlucky ' +
      'long route. Real octopi and ravens still mis-step sometimes. If overall odds are low, the body might ' +
      'not have enough stamina for the longer paths — try bigger size or longer legs to extend stamina.';
  } else if (brain === 2) {
    text = 'Big brains get the shortcut about half the time. Upgrade to Genius (humans, dolphins, octopi) ' +
      'to nearly guarantee picking the shortest path — or add echolocation/sharp senses to spot it.';
  } else if (overshoot < 8) {
    text = `So close — ran out of stamina just ${overshoot} steps from the exit. Smarter brains take ` +
      'fewer, more confident steps; a bigger body or longer legs would give you more stamina to spare.';
  } else {
    text = 'Trial-and-error costs steps, and tiny brains do a lot of it. Upgrade to Standard or Big brain ' +
      '(more food cost), or add echolocation, or sharpen the senses. Sometimes intelligence is worth the ' +
      'metabolic price.';
  }
  return { id: 'maze-exhausted', won: false, title, text };
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
    // Win text variants for swim / glide modes.
    if (r.reason === 'crossed') {
      return { id: 'deep-crossed', won: true, title: `Crossed ${r.maxDepth}m of open water!`, text:
        'Surface swimmers win by streamlining and stamina. Aquatic body plans (fish, cetaceans) move tirelessly through water; ' +
        'land animals tire fast — even strong swimmers like horses fade within a few hundred metres. ' +
        'Migratory marlin cross thousands of km on the same trick: low drag + huge muscles.' };
    }
    if (r.reason === 'landed') {
      return { id: 'deep-landed', won: true, title: `Glided ${r.maxDepth}m to landing!`, text:
        'Albatrosses can glide for HOURS without flapping by reading wind layers over the ocean. ' +
        'Frigatebirds stay airborne for two months. Light bones, long narrow wings, and a sharp eye for ' +
        'updrafts let large birds cover huge distances for almost no energy cost. You used the same physics.' };
    }
    return { id: 'deep-won', won: true, title: `Foraged at ${r.maxDepth}m!`, text };
  }
  if (r.reason === 'drowned') {
    return { id: 'deep-drowned', won: false, title: 'Out of breath', text:
      'Lung capacity scales roughly with body size. A mouse can\'t dive — too little oxygen storage. Either ' +
      'go bigger (whale-style), or add gills, or switch to a fish body plan to extract O₂ from water.' };
  }
  if (r.reason === 'crushed') {
    return { id: 'deep-crushed', won: false, title: 'Crushed by pressure', text:
      'Pressure doubles every 10m of depth. Soft tissues collapse. Armor (or whale-style blubber) is needed ' +
      'past 100m — or use a fish body plan, which equalizes pressure naturally.' };
  }
  if (r.reason === 'exhausted') {
    return { id: 'deep-exhausted', won: false, title: 'Tired in the water', text:
      'Land animals burn through stamina fast in water — drag is ~800× greater than in air. ' +
      'A fish body plan, gills, or simply more muscle mass (bigger size) lets you keep going. ' +
      'Otters and beavers do it with thick fat reserves and a wide tail for propulsion.' };
  }
  if (r.reason === 'caught') {
    return { id: 'deep-caught', won: false, title: 'A shark caught you mid-swim', text:
      'Open water is patrolled by predators. Speed and agility matter — schooling fish stay safe through ' +
      'sheer numbers; lone swimmers need to be faster than the shark (most aren\'t). Aquatic body plans ' +
      'and longer legs would have helped.' };
  }
  if (r.reason === 'stalled') {
    return { id: 'deep-stalled', won: false, title: 'Stalled and fell into the sea', text:
      'Gliding needs lift — long thin wings, low body weight, or strong tailwinds. Heavy creatures with ' +
      'short stubby wings (chickens, turkeys) glide only seconds before plunging. Try the wings hybrid ' +
      'with a smaller body, or pick a calmer route with steady thermals.' };
  }
  if (r.reason === 'no-wings') {
    return { id: 'deep-no-wings', won: false, title: 'No wings to glide with', text:
      'Gliding requires either a bird body plan or the wings hybrid. Without lift surfaces you just fall — ' +
      'flying squirrels and sugar gliders use skin flaps (patagia) between their limbs, which is what the ' +
      'wings hybrid simulates. Add it and try again.' };
  }
  return { id: 'deep-generic', won: false, title: 'The ocean is unforgiving', text:
    'Different routes demand different builds. Dive needs lungs and pressure resistance. Swim needs streamlining ' +
    'and stamina. Glide needs wings and tailwind. Match the body to the challenge.' };
}

function pickStorm(r: Extract<ArenaResult, { arena: 'storm' }>): Insight {
  if (r.won) {
    return { id: 'storm-won', won: true, title: `Survived the ${r.severity ?? 'storm'}! (${r.secondsHeld}s held)`, text:
      'Heavy bodies and low profiles win against wind. Elephants and rhinos barely flinch in hurricanes; ' +
      'birds and insects get blown miles. Real-world record: a wildebeest survived a Category 5 hurricane by ' +
      'lying flat in a depression and weighting itself with a tree limb across the back. Mass + grip + ' +
      'insulation = storm survivor.' };
  }
  if (r.reason === 'blown-away') {
    return { id: 'storm-blown', won: false, title: `Blown away after ${r.secondsHeld}s`, text:
      'Wind force scales with surface area — and small light creatures take most of it. A 5 kg cat in 200 km/h ' +
      'winds catches the same force as a 50 kg human (lower mass means lower friction holding you down). ' +
      'Try a bigger body, runner-tier legs for grip, or shelter under thick fur to reduce profile.' };
  }
  return { id: 'storm-debris', won: false, title: `Struck by debris at ${r.secondsHeld}s`, text:
    'Flying debris is the real killer in tornadoes. A 100 mph 2x4 hits like a bullet. Armor (defense tier 2) or ' +
    'the stoneskin hybrid would have absorbed the impact. Bigger bodies also have more mass to spread the hit.' };
}

function pickNest(r: Extract<ArenaResult, { arena: 'nest' }>): Insight {
  if (r.won) {
    return { id: 'nest-won', won: true, title: `Eggs defended! (${r.wavesSurvived} waves)`, text:
      'Parental defense is one of the strongest forces in nature. Geese hiss and bite humans. Killdeer fake a ' +
      'broken wing to lure predators away. Cassowaries kill leopards. Defending eggs is what evolved venom, ' +
      'spurs, claws, and aggressive displays in countless species.' };
  }
  return { id: 'nest-lost', won: false, title: `${r.eggsLost} eggs lost`, text:
    'Speed + size + defense are what protect nests. Without one, predators slip past. ' +
    'A tiny unarmored creature has to outrun, hide, or pick a high inaccessible nest site. Try a bigger build ' +
    'or add stoneskin / venom for active defense.' };
}

function pickMigrate(r: Extract<ArenaResult, { arena: 'migrate' }>): Insight {
  if (r.won) {
    return { id: 'migrate-won', won: true, title: `Migrated ${r.goalKm} km!`, text:
      'Arctic terns migrate 70,000 km per year. Wildebeest cross 800 km of crocodile-filled rivers. Monarch butterflies ' +
      'travel 4,800 km to Mexico. Long-distance travel demands big aerobic muscles, fat reserves, and a brain ' +
      'that can navigate by sun, stars, magnetic fields, or memorized landmarks.' };
  }
  if (r.reason === 'starved') {
    return { id: 'migrate-starved', won: false, title: `Starved at ${r.kmTravelled} km`, text:
      'You burned through your fat reserves. Real migrators fatten up beforehand — geese double their weight ' +
      'before flying south. Bigger body + cold-blood + endurance hybrid would help.' };
  }
  return { id: 'migrate-lost', won: false, title: `Lost the trail at ${r.kmTravelled} km`, text:
    'A smarter brain reads landscape features and avoids hazards. Bird brains use star patterns and Earth\'s ' +
    'magnetic field as a compass. Boost brain tier + sensors to navigate better.' };
}

function pickPlague(r: Extract<ArenaResult, { arena: 'plague' }>): Insight {
  if (r.won) {
    return { id: 'plague-won', won: true, title: `Survived the plague (${r.daysSurvived} days)`, text:
      'Big warm-blooded animals have the strongest immune systems — antibodies need protein, fever needs ' +
      'metabolic power. Bats carry dozens of viruses without symptoms because their high body temperature ' +
      'from flying suppresses them. Mass + warm blood + rest = immunity.' };
  }
  return { id: 'plague-lost', won: false, title: `Succumbed at day ${r.daysSurvived}`, text:
    'Smaller bodies have less reserve to fight infection. Cold-blooded creatures can\'t mount a fever ' +
    '(their body temperature matches their environment). For epidemic resistance: bigger warm-blooded body, ' +
    'thicker armor (skin barrier), and the regeneration hybrid which heals damage as it occurs.' };
}
