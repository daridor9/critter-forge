# 🦎 Critter Forge

**An interactive biophysics game where designing a creature means making real biological trade-offs.**

> Built by **Dan Aridor** with **Claude Opus 4.7** for **Adam Aridor** (age 9) — who already knows biology is the best subject and that the math of life is even cooler than the animals themselves.

🎮 **Play it:** https://daridor9.github.io/critter-forge/

---

## What is Critter Forge?

Critter Forge is a creature-design game where every choice — body size, warm or cold blooded, how long the legs are, whether to give it wings or armor or sonar — has a **real biological consequence**. Then you take your creature into one of six survival arenas and see whether it lives.

The numbers and rules aren't made up. They come from real biology — the same equations that govern why cheetahs are 50 kg and not 5000 kg, why hummingbirds eat their body weight in nectar every day, and why a T-rex built like a chihuahua would collapse under its own weight.

The game is inspired by **Geoffrey West's book *Scale*** (2017), which shows that biology is built on a small set of beautiful mathematical patterns. Most of those patterns are wired into Critter Forge.

---

## The principles behind the game

### 1. Kleiber's Law — the food bill

> Daily energy use ≈ 70 × (body mass)^¾

A 1-gram shrew burns much more food per gram than a 100-tonne whale. Bigger bodies are more efficient per kilogram. **Whales eat a lot in total, but mice eat much more for their size.**

In game: drag the size slider and watch the **Food / day** stat grow *less than proportionally* with mass — that's the ¾ exponent at work.

### 2. The square-cube law — why a giant mouse can't exist

Body weight scales with length³. Bone strength scales with length².
Double a creature in every direction → 8× heavier but only 4× stronger. The bones snap.

**Real example:** the largest land animal alive today is the African elephant (~6 t). The largest dinosaurs were ~70 t — and they had specially-evolved hollow bones to survive. Anything much bigger physically can't exist on land.

In game: drag the size slider up and watch the **Bone-break risk** meter go red.

### 3. Surface-to-volume ratio — why small things freeze and big things overheat

Surface area grows as length²; volume grows as length³. So small bodies have lots of surface for their volume → heat leaks out fast. Big bodies have little surface relative to their bulk → heat stays in.

**Real example:** musk-oxen thrive in the Arctic; tiny shrews can't (they'd burn through fuel faster than they could eat). Elephants would overheat in deep snow — but die in the desert for the *opposite* reason: they can't shed heat fast enough.

In game: this controls **Cold tolerance**. Tiny creatures freeze in The Climb arena.

### 4. The 1.5 billion heartbeats rule

Almost every mammal — mouse to whale — gets about 1.5 billion heartbeats over its lifetime.
- Small creatures have fast hearts and short lives.
- Big creatures have slow hearts and long lives.

**Real example:** mouse heart rate ~600 bpm, lifespan ~2 years. Blue whale heart rate ~6 bpm, lifespan ~100 years. About the same total beats.

In game: see **Heart rate** and **Lifespan** — they always tell the same story.

### 5. The speed peak — why ~50 kg is the magic size

Top sprint speed on land peaks around 50 kg of body mass. Both smaller (cat, mouse) and larger (elephant, rhino) animals are slower.

**Real examples:** cheetah (50 kg, 110 km/h), pronghorn (50 kg, 88 km/h), ostrich (90 kg, 70 km/h). The fastest land animals all live in a narrow size band.

In game: drag the size slider — **Top speed** peaks in the middle and drops off both ways.

### 6. Warm-blood vs cold-blood — paying the temperature tax

Warm-blooded animals (mammals, birds) maintain constant body temperature. It costs about **10× more food per kg** than being cold-blooded (reptiles, fish, insects).

**Real example:** a crocodile can fast for a year. A wolf the same size needs several kg of meat every day.

In game: toggle Blood = cold and watch food/day drop dramatically. Cold-blooded creatures dominate The Drought.

### 7. Brain energy cost — intelligence is expensive

A human brain is ~2% of body mass but burns ~20% of total energy. The same is true of dolphins, ravens, octopi — every brainy animal pays a huge metabolic tax for being smart.

**Real example:** big-brained animals always evolve in rich-food environments. You can't have a big brain on a starvation diet.

In game: the **Brain** tier adds +10–25% to food per day. Pays off in The Maze.

### 8. Flight has a hard weight limit

Wing loading (mass per unit wing area) caps powered flight at small body sizes. Above about 12 kg, sustained flapping flight is essentially impossible.

**Real example:** swans (~12 kg) are at the upper limit for living fliers. Pterosaurs got bigger only because they had hollow bones AND glided most of the time — no flapping-elephant in any era.

In game: the **Wings** hybrid trait is locked out above 2 kg. Try to wing an elephant — denied.

---

## The arenas — six places to test your design

| Arena | Wins when you have… | Real animals that thrive |
|---|---|---|
| 🦌 **Chase** | speed + stamina balance | wolves, pronghorns, cheetahs |
| 🌳 **Hunt** | stealth, armor, **or** escape speed | rabbits (hide), turtles (tank), pronghorns (flee) |
| 🏔 **Climb** | cold tolerance + manageable body mass | snow leopards, musk-oxen, yaks |
| ☀️ **Drought** | low metabolism + fat reserves | camels, crocodiles, tortoises |
| 🌊 **Deep** | gills, **or** huge lungs + pressure tolerance | fish, sperm whales (with blubber) |
| 🧩 **Maze** | brain power + sharp senses | apes, ravens, octopi, bats |

Every body-plan choice and every hybrid pays off **somewhere** — and is a liability **somewhere else**. That's the whole point of biology.

---

## The hybrid traits — borrowed from real animals

Each "hybrid" power is something a real animal evolved to solve a problem:

- 🦇 **Echolocation** *(bats, dolphins)* — pings the world with sound; works in darkness and underwater. Bonus in The Maze.
- 🦅 **Wings** *(bats, birds)* — flight. Hard 2 kg mass cap because of wing-loading limits.
- 🐍 **Venom** *(snakes, octopi, platypus)* — lets a small predator drop huge prey. A 50 g snake can kill a 100 kg deer.
- ⚡ **Electric organs** *(electric eels)* — 600 V shocks. Producing them costs ~⅓ of the eel's daily energy. Fish-only.
- 🦎 **Camouflage** *(octopi, chameleons)* — change skin colour in ~0.3 seconds using millions of pigment cells. Huge bonus in The Hunt.
- 🧊 **Antifreeze blood** *(arctic fish)* — sugar proteins that block ice-crystal formation. Survival at -2°C salt water. Cold-blooded only.
- 🦣 **Thick fur** *(musk-oxen, mammoths)* — ~8× warmer per gram than sheep wool. Heavy, drag-prone. Warm-blooded only.
- 🐟 **Gills** *(fish)* — pull oxygen from water. Lets a land creature handle The Deep — but water carries ~30× less O₂ than air, so gill flow must be very fast.

---

## How to play

1. **Build** a creature in the left panel — size, body plan, blood, legs, brain, defense, sensors, hybrids.
2. **Watch the live stats** update as you change things. Hover the ℹ icons to see *exactly* which formula produced each number.
3. **Pick an arena** in the right panel and hit ⛶ for fullscreen play.
4. **Win?** An "🥚 Next generation" button spawns three mutant offspring — pick one to continue the lineage.
5. **Save your favorites** to the Family album at the bottom of the page — they persist between visits in your browser.

Use the **🎲 Random** button up top for surprise starters, **✏️ Name** to auto-name a creature based on its traits, **↺ Reset** to start over, **🔊** to mute sound.

---

## Credits

Built in May 2026.

- 🧠 **Game design & direction:** Dan Aridor
- 🤖 **Pair-programmer:** Claude Opus 4.7 (1M context) by Anthropic
- 🎯 **Dedicated to:** Adam Aridor (age 9), who loves animals and the math of life
- 📚 **Inspired by:** Geoffrey West, *Scale* (2017) — the book showing that biology runs on a small set of beautiful equations

---

> *"Bigger isn't better. Faster isn't better. Smarter isn't better. Everything has a cost. The art of biology is choosing which costs to pay."*

---

## Running it yourself

```bash
git clone https://github.com/daridor9/critter-forge
cd critter-forge
npm install
npm run dev
```

Open http://localhost:5173/critter-forge/ in a browser.

To deploy a new version to the public site:

```bash
npm run build && npx gh-pages -d dist
```

Built with [Vite](https://vitejs.dev), [React](https://react.dev) + TypeScript, and plain SVG for the creature and arena art. All physics formulas live in [`src/physics.ts`](src/physics.ts) — change one line and every arena recomputes.
