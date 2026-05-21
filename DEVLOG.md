# Critter Forge — Development Log

Built May 2026 over a single multi-day session between **Dan Aridor** and **Claude Opus 4.7 (1M context)** for **Adam Aridor (age 9)**.

Each entry below is a feature shipped — roughly the order things were built. Use this as the recreation roadmap.

## Phase 0 — foundation

1. **Project scaffold** — Vite + React + TypeScript at `~/Dropbox/critter-forge`, no router, no state library.
2. **Core types** — `Creature` (size 0-100 log scale, body plan, warm/cold, 4 tiers, hybrids[], name).
3. **Physics module** (`src/physics.ts`) — Kleiber's law (mass^0.75), square-cube bone risk, surface/volume cold tolerance, lifespan ≈ 11.8·M^0.20, heart rate ∝ M^(-0.25), top-speed peak around 50kg.
4. **Builder UI** — size slider + 4 tier pill rows + body plan + warm/cold.
5. **Schematic CreatureSVG** — body+legs+head from primitive shapes, mass-scaled.
6. **The Chase arena (MVP)** — savanna scene, animated runner cycle vs gazelle, stamina meter.
7. **Family album** — `localStorage` save/load with thumbnails.
8. **Hybrid traits** (8) with validity rules (Wings ≤2kg, Electric=fish only, Antifreeze=cold only, etc.).
9. **Real-animal preset loader** — clickable rows in the compare table.

## Phase 1 — depth

10. **5 more arenas** — Hunt, Climb, Drought, Deep, Maze. Each with its own visual scene.
11. **Generation co-evolution** — Gen N badge; environment shifts per cycle of 4 (midday → dusk → night → dawn for Chase; clear → snowstorm → aurora → glacial for Climb; etc.).
12. **Evolution mode** — 🥚 Next-generation modal showing 3 mutated variants after a win.
13. **Tournament mode** — sequential 6-arena campaign with mutation gates between rounds and final ranking (Brave Beginner → Apex Designer).
14. **Real-animal Dex** — 25 then 29 animals as full pre-built creatures with biology facts and "your creature is most like…" matcher.
15. **Achievements** (22 badges) with toast notifications and modal grid.
16. **Sounds** — Web Audio synthesized click, win, lose, save, start (no audio files).
17. **PWA** — manifest.webmanifest + apple-touch-icon + theme-color → installable on iPad.

## Phase 2 — pedagogy

18. **Brain influence expanded** — every arena gets a small brain bonus + Mountain/Desert food bonuses.
19. **Vigilance tax stat** — sharp senses/big brain cost more food; camouflage/armor reduce it.
20. **Food economy panel** — 5 biomes with intake vs need bars + thrive/tight/starve status.
21. **Stat tooltips** — every stat row has an ℹ icon with the formula in plain English.
22. **Stat +/− buttons** — cascade through the creature (e.g. + on speed → leg tier up → endurance + bone risk also move).
23. **Mutation explanations** — every Evolve/Breed variant card shows what changed.
24. **Per-prey kcal rewards in Chase** (Rabbit 600 / Gazelle 2200 / Kangaroo 4800) so slower prey = less food.
25. **Hunt encounter overhaul** — 5 biomes with real predators (Lion/Wolf/Snow Leopard/Hyena/Shark) + Hide/Run/Fight choice with live success preview and ±15 luck swing.
26. **Symbiosis hybrid** (9th) — partner saves 8% food + 12 cold tolerance.

## Phase 3 — visual identity

27. **Mass-aware creature proportions** — silhouette morphs from mouse (round, huge eyes/ears, long tail, whiskers) to elephant (long body, columnar legs, small head, dewlap).
28. **Living habitat creature stage** — 4 body-plan biomes (meadow / rocky desert / sky-branch / underwater) replace the empty stage. With sun, clouds, fish, etc.
29. **Friendlier stats panel** — icons per stat, colored bars, pulsing heart at the actual BPM.
30. **Comprehensive visual polish** — gradient header with animated shimmer, custom slider, gradient pills, soft shadows, depth on every card.
31. **Bespoke dex shapes** (28 components) — every dex animal has its own SVG (mouse with whiskers, lion with mane, cheetah with tear stripes, snake undulating, whale with flukes, dolphin with dorsal fin, octopus with 8 tentacles, penguin black/white belly, polar bear massive white body, eagle with hooked beak + spread wings, owl with huge forward eyes, tortoise with shell, crocodile with long jaw + teeth, shark with triangular dorsal, chameleon with curled tail + turret eyes, raptor/triceratops/stegosaurus/pterodactyl, etc.).

## Phase 4 — player retention

32. **🔗 Share creature link** — URL hash encodes the creature; opener auto-imports to album with 🌐 marker.
33. **👨‍👩‍👧 Breeding** — 🧬 Breed mode in album; pick two parents, offspring inherit 50/50 with ~20% mutation chance per slot.
34. **👤 Player profile** — lifetime stats (tests, wins, kcal, generations, tournaments, bred, imported).
35. **🎯 Quests** (18) + **📅 Daily challenge** (date-seeded) + completion tracking.
36. **🧩 Maze visual upgrade** — grid lines, wall pillars, dashed path, big START + EXIT markers.
37. **🦴 X-ray toggle** on creature stage — dark blue background with skeleton, pulsing heart, brain, lungs, stomach.
38. **🐾 Food chain** per dex card — eats / eaten-by lists.
39. **📸 Creature card export** — PNG download via canvas, with name + stats + watermark.
40. **↶ Undo button** — stack of last 20 creature states.
41. **📝 Album notes** — per-saved-creature description.
42. **⚖️ Compare side-by-side** — pick any two (current / album / dex), see stats + hybrids + deltas with winner highlighted.
43. **📈 Lineage timeline** — every Evolve and Breed records a node in `critter-forge:lineage`; the modal walks the chain from earliest ancestor to current creature with mutation notes per step.

## Cross-cutting

- **Living About modal** — kept growing with every feature; serves as the in-game manual.
- **Mobile responsive** — 3 column → 2 column → 1 column at 1180/820 px.
- **Sound mute** persisted to localStorage.
- **GitHub Pages deploy** via `npx gh-pages -d dist` after every batch.

## Deploy + repo

- Live: `https://daridor9.github.io/critter-forge/`
- Source: `https://github.com/daridor9/critter-forge`
- Build: `npm run build`
- Deploy: `npm run build && npx gh-pages -d dist`
- Dev: `npm run dev` → http://localhost:5173/critter-forge/

## What's NOT shipped (deferred)

- Climate adaptation campaign (multi-era scenario)
- Onboarding tour
- Hebrew/RTL translation
- Real-time multiplayer (no backend)
- Background music
