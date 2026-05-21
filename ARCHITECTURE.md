# Critter Forge — Architecture & Recreation Guide

Companion to `DEVLOG.md`. The devlog is the chronological story of what was built; this file is the blueprint for rebuilding it from scratch.

> Built May 2026 by **Dan Aridor** + **Claude Opus 4.7 (1M context)** for **Adam Aridor (age 9)**.

---

## 1. Stack & ground rules

- **Vite + React 19 + TypeScript** (strict mode). No router, no state library, no CSS framework.
- **localStorage** for every persistent piece of state. No backend, no server, no auth.
- **SVG everything**. No PNG/JPG creature art — every creature, every dex animal, every scene is composed from `<rect>/<ellipse>/<path>/<circle>` primitives.
- **Web Audio API** for sounds — synthesized on the fly, no audio files in the bundle.
- **CSS keyframe animations** for motion (run cycle, breathing, snowfall, heartbeat). No animation library.
- **Deploy target:** GitHub Pages at `https://daridor9.github.io/critter-forge/` via `npx gh-pages -d dist`.

The whole point is that a 9-year-old can install this on an iPad and play offline. Keep dependencies minimal.

---

## 2. File layout

```
critter-forge/
├── DEVLOG.md                 — what was built, in order
├── ARCHITECTURE.md           — this file
├── README.md                 — short public README
├── index.html                — Vite entry
├── public/
│   ├── manifest.webmanifest  — PWA manifest
│   ├── apple-touch-icon.png  — iOS icon
│   └── favicon.svg
├── src/
│   ├── main.tsx              — React root
│   ├── App.tsx               — top-level layout + state wiring (~550 lines)
│   ├── App.css               — all styles (~2600 lines, single file by design)
│   ├── index.css             — resets only
│   ├── types.ts              — Creature, Hybrid, BodyPlan, Tier
│   ├── physics.ts            — Kleiber, square-cube, hybrid effects, computeStats
│   ├── sounds.ts             — Web Audio synth (click/win/lose/save/start)
│   ├── components/
│   │   ├── Builder.tsx       — size slider + tier rows + body plan + warm/cold
│   │   ├── CreatureSVG.tsx   — mass-aware silhouette (mouse→whale morph)
│   │   ├── CreatureStage.tsx — habitat scene with X-ray toggle
│   │   ├── StatsPanel.tsx    — friendly stats with icons + pulsing heart
│   │   ├── AlbumPanel.tsx    — save/load/breed/notes
│   │   ├── ChaseArena.tsx    — savanna prey-chase
│   │   ├── HuntArena.tsx     — Hide/Run/Fight encounter
│   │   ├── ClimbArena.tsx    — altitude/cold trial
│   │   ├── DroughtArena.tsx  — thermoregulation trial
│   │   ├── DeepArena.tsx     — pressure/oxygen trial
│   │   ├── MazeArena.tsx     — brain trial with grid + START/EXIT
│   │   ├── TournamentUI.tsx  — 6-arena campaign + ranking
│   │   ├── EvolveModal.tsx   — 🥚 3 mutated variants
│   │   ├── BreedModal.tsx    — 🧬 pick two parents
│   │   ├── CompareModal.tsx  — ⚖️ side-by-side
│   │   ├── LineageModal.tsx  — 📈 evolution timeline
│   │   ├── DexModal.tsx      — 29-animal index + food chain
│   │   ├── AchievementsModal.tsx
│   │   ├── QuestsModal.tsx
│   │   ├── DailyChallenge.tsx
│   │   ├── ProfileModal.tsx  — lifetime stats
│   │   ├── AboutModal.tsx    — living in-game manual
│   │   ├── FoodEconomyPanel.tsx
│   │   ├── InsightCard.tsx   — "did you know" facts
│   │   ├── ComparePanel.tsx  — preset table for the builder
│   │   ├── SnakeShape.tsx    — bespoke undulating snake
│   │   └── dexShapes.tsx     — 28 bespoke per-animal SVGs
│   ├── data/
│   │   ├── animalDex.ts      — 29 animals + closestAnimal()
│   │   ├── animalPresets.ts  — clickable presets in builder
│   │   ├── realAnimals.ts    — raw biology facts
│   │   ├── hybrids.ts        — 9 hybrid traits catalog
│   │   ├── achievements.ts   — 22 badges + hybrids-used set
│   │   ├── quests.ts         — 18 quests + daily challenge
│   │   ├── profile.ts        — lifetime stat counters
│   │   ├── lineage.ts        — evolution timeline storage
│   │   ├── breeding.ts       — 50/50 inheritance + 20% mutation
│   │   ├── tournament.ts     — 6-arena schedule + ranks
│   │   ├── foodEconomy.ts    — 5 biomes (intake vs need)
│   │   ├── foodChain.ts      — eats / eaten-by per dex animal
│   │   ├── statAdjusters.ts  — cascading +/− stat buttons
│   │   ├── insights.ts       — "did you know" pool
│   │   └── randomCreature.ts — Random button generator
│   ├── utils/                — small helpers
│   └── assets/               — small static svgs (logo etc.)
└── package.json
```

Single-purpose modules. Anything > ~600 lines is a smell — split it.

---

## 3. Data model

### Creature (the central type)

```ts
// src/types.ts
export type BodyPlan = 'mammal' | 'reptile' | 'bird' | 'fish';
export type Tier = 0 | 1 | 2;
export type Hybrid =
  | 'echolocation' | 'wings' | 'venom' | 'electric'
  | 'camouflage'   | 'antifreeze' | 'thick-fur' | 'gills' | 'symbiosis';

export interface Creature {
  sizeUnit: number;       // 0-100 log slider → 10g..100t
  bodyPlan: BodyPlan;
  warmBlooded: boolean;
  legTier: Tier;          // stubby / standard / runner
  brainTier: Tier;        // basic / clever / genius
  defenseTier: Tier;      // bare / armor / fortress
  sensorTier: Tier;       // dull / sharp / superhuman
  hybrids: Hybrid[];      // max 2 (data/hybrids.ts MAX_HYBRIDS)
  name: string;
}
```

Everything else (stats, scenes, fights, food economy) is **derived** from this. Never store derived state.

### Derived: `CreatureStats`

```ts
{ massKg, foodKcalPerDay, foodKgPerDay, topSpeedKmh, enduranceKm,
  coldTolerance, lifespanYears, boneBreakRisk, heartRateBpm }
```

Recomputed every render via `computeStats(creature)` in `physics.ts`. Cheap; don't memoize prematurely.

### Persistent saved types

- `SavedCreature` (`AlbumPanel.tsx`): `{ id, creature, savedAt, notes?, imported?, fromBreed? }`
- `LineageNode` (`data/lineage.ts`): `{ id, creature, parentIds[], changes[], kind: 'root'|'evolve'|'breed', timestamp }`
- `Profile` (`data/profile.ts`): lifetime counters
- `DexAnimal` (`data/animalDex.ts`): `{ id, emoji, name, fact, creature: Creature, shape: DexShape, color?: ColorOverride }`

---

## 4. Physics — the heart of the game

All in `src/physics.ts`. These are the actual scientific relationships from Geoffrey West's "Scale". A 9-year-old should encounter real biology, not made-up game numbers.

| Law | Formula | Where |
|---|---|---|
| Mass slider → mass | `10^(slider/100 * (log₁₀(100000) - log₁₀(0.01)) + log₁₀(0.01))` | `sizeToMass` |
| Kleiber's law | `BMR = 70 · M^0.75` kcal/day | `basalKcalPerDay` |
| Cold-blooded multiplier | × 0.1 of warm-blooded BMR | `basalKcalPerDay` |
| Top speed peak | Gaussian peak ~50 kg (cheetah zone) | `topSpeedKmh` |
| Endurance peak | Gaussian peak ~70 kg, ÷7 if cold-blooded | `enduranceKm` |
| Cold tolerance | `min(100, M^(1/3) · 8) + warm(30) + insulation` | `coldTolerance` |
| Lifespan | `11.8 · M^0.20`, × 1.3 if cold-blooded | `lifespanYears` |
| Bone risk (square-cube) | `(log₁₀(M) + 1) · 18 + leg-tier penalty` | `boneBreakRisk` |
| Heart rate | `241 · M^(-0.25)` bpm | `heartRate` |
| Vigilance tax | sensors + brain – camouflage – armor, clamped to [-6%, +30%] | `vigilanceTaxFraction` |

Every stat row in `StatsPanel.tsx` has an ℹ tooltip with the plain-English formula from `explainStats()`. The game **teaches by showing the math**.

### Hybrid validity rules (`isHybridValid`)

- `wings` → mass ≤ 2 kg (no flying elephants)
- `electric` → fish only (eels)
- `antifreeze` → cold-blooded only (arctic fish)
- `thick-fur` → warm-blooded only
- `gills` → not fish (fish already have them)

### Hybrid effects (`hybridEffect`)

Each hybrid is a small bag of multipliers (`foodMult`, `topSpeedMult`, `enduranceMult`, `bonusCold`). `computeStats` walks valid hybrids and applies them. Add a new trait by extending the enum, the catalog (`data/hybrids.ts`), and `hybridEffect()`.

---

## 5. Mass-aware creature proportions

`CreatureSVG.tsx` morphs the silhouette continuously from **mouse → whale** based on a normalized `sizeT` in [0, 1]:

| Feature | Mouse end (sizeT=0) | Whale end (sizeT=1) |
|---|---|---|
| Body aspect ratio | round | long |
| Head fraction | huge (40% of body) | tiny (15%) |
| Eye/ear size | oversized | small |
| Tail length | long | short/fluke |
| Whiskers | yes (small mammals) | no |
| Dewlap | no | yes (megafauna) |
| Leg thickness | thin | columnar |

Body plan branches (mammal/reptile/bird/fish) override silhouette decisions on top of the size morph.

X-ray toggle: a layer of skeleton + pulsing heart + brain + lungs + stomach renders on top with `opacity: 0.85` and the background goes dark blue.

### Bespoke dex shapes

29 dex animals each have a hand-coded SVG component in `components/dexShapes.tsx` (lion's mane, cheetah's tear stripes, octopus's 8 tentacles, owl's huge forward eyes, eagle's hooked beak, etc.). `DexShape` enum drives which component to render. **Never** use the generic CreatureSVG for the dex — kids spot lookalikes instantly.

---

## 6. State management

There is **no global store**. `App.tsx` holds:

```tsx
const [creature, setCreatureRaw] = useState<Creature>(defaultCreature);
const [undoStack, setUndoStack]   = useState<Creature[]>([]);
const [lineageId, setLineageId]   = useState<string | null>(null);
const [view, setView]             = useState<'builder' | 'tournament'>('builder');
const [arena, setArena]           = useState<ArenaId | null>(null);
const [showAbout, ...etc]                 // one boolean per modal
```

`setCreature(next)` wraps `setCreatureRaw` to push the previous value onto `undoStack` (cap 20). Random/Reset/+/−/Evolve/Breed all flow through the wrapped setter, so undo works everywhere automatically.

State is **drilled** through props two or three levels deep. With ~25 components and a single source of truth, that's clearer than Context for this game.

---

## 7. Persistence — localStorage keys

| Key | Owner | Shape |
|---|---|---|
| `critter-forge:album` | `AlbumPanel.tsx` | `SavedCreature[]` |
| `critter-forge:lineage` | `data/lineage.ts` | `Record<id, LineageNode>` |
| `critter-forge:profile` | `data/profile.ts` | `Profile` counters |
| `critter-forge:achievements` | `data/achievements.ts` | `string[]` (achievement ids) |
| `critter-forge:hybrids-used` | `data/achievements.ts` | `string[]` (Hybrid ids, for badges) |
| `critter-forge:quests` | `data/quests.ts` | `string[]` (completed quest ids) |
| `critter-forge:daily` | `data/quests.ts` | `{ date: 'YYYY-MM-DD', completed: boolean }` |
| `critter-forge:muted` | `sounds.ts` | `'1'` or `'0'` |

Every read is wrapped in try/catch with a sensible default — quota-exceeded, private-browsing, and corrupt JSON must not break the game. **Never** put anything sensitive in here; it's a kid's local browser.

---

## 8. The arena pattern

Six arenas (Chase, Hunt, Climb, Drought, Deep, Maze) share a contract:

```tsx
interface ArenaProps {
  creature: Creature;
  generation: number;          // for environment cycling
  onComplete: (won: boolean, kcalReward: number) => void;
  onBack: () => void;
}
```

Each arena:

1. Pulls `stats = computeStats(creature)`.
2. Picks a difficulty/scenario from generation (cycle of 4: midday/dusk/night/dawn for Chase, etc.).
3. Animates an outcome (CSS keyframes, no rAF needed for most).
4. Computes win/loss with a deterministic formula + ±15% luck swing.
5. Calls `onComplete(won, kcal)`; App.tsx awards kcal to profile, increments generation, opens EvolveModal on win.

To add a 7th arena, copy `MazeArena.tsx`, wire it into the App-level `ArenaId` union and the arena picker grid in `Builder.tsx`.

---

## 9. Evolve & Breed (mutation pipeline)

### Evolve (single-parent)
After a win, `EvolveModal.tsx` generates **3 mutated variants**. Each variant tweaks 1–3 attributes (size ±3–7, tier ±1, body plan flip with probability, add/remove a valid hybrid) and labels the change. Choosing a variant: `setCreature(variant)` + `recordEvolve(lineageId, variant, changes)` → new `lineageId`.

### Breed (two-parent)
`BreedModal.tsx` picks two parents from the album. Offspring inherits 50/50 per slot with **~20% mutation chance per slot**. Hybrids merged, validity filtered, capped at MAX_HYBRIDS. Naming: portmanteau of parent names. Lineage: record as `recordEvolve(p1Id, child, changes)` so the timeline walks one parent — keeps the chain linear.

### Lineage modal
`LineageModal.tsx` walks `parentIds[0]` from `currentId` back to root (no cycles — `visited` set guards). Renders a horizontal chain of cards with arrows. Each card: mini CreatureSVG + name + kind emoji (🌱/🥚/👨‍👩‍👧) + change notes.

---

## 10. Sound

`src/sounds.ts` is one module, zero asset files. Web Audio synthesizes 5 cues:

- `click` — short 440Hz sine, 60ms
- `win` — three-note rising arpeggio
- `lose` — descending sawtooth ramp
- `save` — soft chime
- `start` — buzzy fanfare

`sounds.setMuted(true)` persists to `critter-forge:muted`. Header has a 🔊/🔇 toggle. Total cost: ~3 KB of TypeScript.

---

## 11. PWA / install

`public/manifest.webmanifest`:

```json
{
  "name": "Critter Forge",
  "short_name": "Critter Forge",
  "start_url": "/critter-forge/",
  "display": "standalone",
  "theme_color": "#3a8dde",
  "background_color": "#f4f7fb",
  "icons": [{ "src": "apple-touch-icon.png", "sizes": "180x180", "type": "image/png" }]
}
```

`index.html` references manifest + theme-color + apple-touch-icon. iPad: Safari → Share → Add to Home Screen → standalone app.

No service worker yet. The game runs offline once loaded (no network calls), so a service worker is optional.

---

## 12. Sharing

`🔗 Share` button:
1. Serializes the current creature to JSON.
2. Base64-encodes.
3. Replaces `location.hash` with `#c=<b64>`.
4. `navigator.clipboard.writeText(href)`.

On load (`App.tsx` effect): if `location.hash` starts with `#c=`, decode → `SavedCreature` → push to album with `imported: true` marker (🌐 icon). Hash is cleared after import.

No backend, no shortener, no expiry. Long URLs but they survive forever.

---

## 13. Styling

Single `App.css` (~2600 lines). One global stylesheet is fine at this size and makes finding stuff with grep easy. Conventions:

- BEM-ish (`.album-card`, `.album-card-thumb`, `.album-card-name`)
- CSS variables in `:root` for color palette (`--accent`, `--bg-card`, etc.)
- Gradient backgrounds + soft shadows for depth (no flat design — kids respond to richer visuals)
- `@keyframes` for: `bob-run`, `breathe`, `eye-blink`, `snow-drift`, `sun-pulse`, `heartbeat`, `shimmer` (gradient header)
- Mobile-responsive at 1180 px (3→2 column) and 820 px (2→1 column)

---

## 14. Build / dev / deploy

```bash
npm install                          # one-time
npm run dev                          # http://localhost:5173/critter-forge/
npm run build                        # tsc -b && vite build → dist/
npx gh-pages -d dist                 # publish dist/ to gh-pages branch
```

`vite.config.ts` sets `base: '/critter-forge/'` — required for GitHub Pages subpath hosting. If you fork to a different repo name, change that string.

CI: none yet. Every deploy is a manual `npm run build && npx gh-pages -d dist` from Dan's laptop. Add GitHub Actions when there are more contributors.

---

## 15. How to extend

**Add a new dex animal:**
1. Create `<NewShape>` component in `dexShapes.tsx` with hand-coded SVG.
2. Add to `DexShape` union.
3. Push to `ANIMAL_DEX` in `data/animalDex.ts` with biology fact + creature config.
4. Add eats/eaten-by entry to `foodChain.ts`.
5. Add color to `ANIMAL_COLORS` if needed.

**Add a new hybrid trait:**
1. Extend `Hybrid` union in `types.ts`.
2. Add entry to `hybridCatalog` in `data/hybrids.ts`.
3. Add validity rule (if any) to `isHybridValid()` in `physics.ts`.
4. Add effect (if any) to `hybridEffect()` in `physics.ts`.

**Add a new arena:**
1. Copy `MazeArena.tsx` as a starting template.
2. Add to `ArenaId` union in `App.tsx`.
3. Add tile to the arena grid in `Builder.tsx`.
4. (Optional) Add to `tournament.ts` schedule.

**Add a new achievement:**
1. Add definition to `ACHIEVEMENTS` in `data/achievements.ts` with `check(profile, creature)` predicate.
2. The badge auto-unlocks via `checkAchievements()` called after each arena/save/breed/evolve.

---

## 16. Design principles (the why)

- **Real numbers, not game numbers.** Every formula is from the literature. A 9-year-old who plays this knows Kleiber's law cold by the end of a weekend.
- **Show the formula.** Every stat tooltip explains what's being computed and why. Stats are not opaque "RPG values."
- **Cascading edits.** Tapping +Speed bumps `legTier` AND ripples into endurance/bone-risk. Stats don't move in isolation — biology doesn't either.
- **Failure is information, not punishment.** Losing in an arena always opens evolve choices. No "game over."
- **Every screen is alive.** Breathing, blinking, running cycle, heartbeat at the actual BPM. Static UI feels dead to kids.
- **Two-tap depth.** Every feature is reachable from the header in ≤2 taps. The 9-year-old shouldn't need a menu map.
- **No accounts, no backend, no chat.** Sharing is a URL the parent copies. No social surface, no moderation problem.

---

## 17. What's deferred (not shipped)

- Climate adaptation campaign (multi-era scenario)
- Onboarding tour (overlay tooltips on first launch)
- Hebrew / RTL translation
- Real-time multiplayer (no backend by design)
- Background music

See `DEVLOG.md` for the full chronological feature list.
