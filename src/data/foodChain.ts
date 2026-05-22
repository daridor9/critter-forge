export interface FoodChainEntry {
  eats: string[];
  eatenBy: string[];
}

export const FOOD_CHAIN: Record<string, FoodChainEntry> = {
  'Mouse':           { eats: ['seeds', 'insects', 'grain'], eatenBy: ['🦉 Owl', '🦊 Fox', '🐍 Snake', '🐈 Cat'] },
  'Hummingbird':     { eats: ['nectar', 'tiny insects'], eatenBy: ['🐍 Snake', '🐱 Cat', 'mantis'] },
  'Bat':             { eats: ['mosquitoes', 'moths', 'fruit (some)'], eatenBy: ['🦅 Eagle', '🦉 Owl', 'snakes'] },
  'Cheetah':         { eats: ['🦌 Gazelle', '🐰 Hare', 'impala'], eatenBy: ['🦁 Lion (cubs)', '🐺 Hyena'] },
  'Wolf':            { eats: ['🦌 Deer', 'elk', 'moose', '🐰 Rabbit'], eatenBy: ['🐻 Bear (cubs only)'] },
  'Lion':            { eats: ['🦌 Antelope', '🦓 Zebra', '🦬 Buffalo', '🐗 Warthog'], eatenBy: ['(apex predator)'] },
  'Polar bear':      { eats: ['🦭 Seals', '🐟 Fish', 'walrus'], eatenBy: ['(apex predator)'] },
  'Snow leopard':    { eats: ['🐐 Ibex', 'blue sheep', 'marmot'], eatenBy: ['(apex predator)'] },
  'Elephant':        { eats: ['grass', 'leaves', 'fruit', 'bark', '150kg/day'], eatenBy: ['🦁 Lion (calves only)'] },
  'Blue whale':      { eats: ['🦐 Krill (4 t/day!)', 'tiny plankton'], eatenBy: ['🦈 Orca (calves)'] },
  'Dolphin':         { eats: ['🐟 Fish', 'squid'], eatenBy: ['🦈 Great white shark', '🐋 Orca'] },
  'Sloth':           { eats: ['leaves (very slow digestion)'], eatenBy: ['🐆 Jaguar', '🦅 Harpy eagle'] },
  'Kangaroo':        { eats: ['grass', 'shrubs', 'leaves'], eatenBy: ['🐕 Dingo', '🦊 Wedge-tailed eagle'] },
  'Camel':           { eats: ['thorny plants', 'dry shrubs'], eatenBy: ['🐺 Wolf', '🦁 Lion (rare)'] },
  'Gorilla':         { eats: ['leaves', 'fruit', 'shoots', 'occasional insects'], eatenBy: ['🐆 Leopard (rare)'] },
  'Ostrich':         { eats: ['seeds', 'plants', 'insects', 'small reptiles'], eatenBy: ['🦁 Lion', '🐆 Cheetah', '🐺 Hyena'] },
  'Eagle':           { eats: ['🐭 Rodents', '🐟 Fish', 'rabbits', 'small birds'], eatenBy: ['(apex predator)'] },
  'Penguin':         { eats: ['🐟 Fish', 'krill', 'squid'], eatenBy: ['🦭 Seals', '🐋 Orca', '🦈 Sharks'] },
  'Owl':             { eats: ['🐭 Mice', 'voles', 'shrews', 'small birds'], eatenBy: ['🦅 Eagle (rare)'] },
  'Tortoise':        { eats: ['grasses', 'fruits', 'leaves', 'flowers'], eatenBy: ['🐊 Crocodile (young)', '🦅 Eagle (young)'] },
  'Crocodile':       { eats: ['🐟 Fish', '🦌 Antelope', 'birds', 'almost anything'], eatenBy: ['(apex predator)'] },
  'Chameleon':       { eats: ['🦗 Insects (caught with tongue)'], eatenBy: ['🐍 Snakes', '🦅 Birds of prey'] },
  'Anaconda':        { eats: ['🐟 Fish', '🐦 Birds', 'capybaras', '🐊 caimans (!)'], eatenBy: ['🐆 Jaguar (rare)'] },
  'Great white shark': { eats: ['🦭 Seals', '🐬 Dolphins', '🐟 Fish'], eatenBy: ['🐋 Orca (rare!)'] },
  'Octopus':         { eats: ['🦀 Crabs', '🦞 Lobsters', 'mussels', 'fish'], eatenBy: ['🦈 Sharks', '🐬 Dolphins', '🐳 Whales'] },
  'Velociraptor':    { eats: ['small dinos', 'lizards', 'mammals'], eatenBy: ['(big theropods)'] },
  'Triceratops':     { eats: ['plants', 'ferns', 'cycads'], eatenBy: ['🦖 T-rex'] },
  'Stegosaurus':     { eats: ['ferns', 'mosses', 'low plants'], eatenBy: ['Allosaurus'] },
  'Pterodactyl':     { eats: ['🐟 Fish', 'insects'], eatenBy: ['(big predators)'] },
  'Tiger':           { eats: ['deer', 'wild boar', 'buffalo calves'], eatenBy: ['(apex predator)'] },
  'T-Rex':           { eats: ['🦕 Triceratops', 'hadrosaurs', 'armored dinos'], eatenBy: ['(apex predator)'] },
  'Jellyfish':       { eats: ['plankton', 'fish eggs', 'tiny crustaceans'], eatenBy: ['sea turtles', '🐧 Penguins', 'sunfish'] },
};
