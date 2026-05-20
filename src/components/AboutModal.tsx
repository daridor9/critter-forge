interface Props {
  onClose: () => void;
}

export function AboutModal({ onClose }: Props) {
  return (
    <div className="insight-overlay about-overlay" onClick={onClose}>
      <div className="about-modal" onClick={(e) => e.stopPropagation()}>
        <div className="about-head">
          <h2>🦎 About Critter Forge</h2>
          <button className="about-close" type="button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="about-content">
          <p className="dedication">
            Built by <strong>Dan Aridor</strong> with <strong>Claude Opus 4.7</strong> for{' '}
            <strong>Adam Aridor</strong> (age 9) — who already knows biology is the best subject and that the math of life is even cooler than the animals themselves.
          </p>

          <h3>What is Critter Forge?</h3>
          <p>
            Critter Forge is a creature-design game where every choice — body size, warm or cold blooded, how long the legs are, whether to give it wings or armor or sonar — has a <em>real</em> biological consequence. Then you take your creature into one of six survival arenas to see if it lives.
          </p>
          <p>
            The numbers and rules aren't made up. They come from real biology — the same equations that govern why cheetahs are 50 kg and not 5000 kg, why hummingbirds eat their body weight in nectar every day, and why a T-rex built like a chihuahua would collapse under its own weight.
          </p>
          <p>
            Inspired by <strong>Geoffrey West's <em>Scale</em></strong> (2017), which shows that biology runs on a small set of beautiful mathematical patterns.
          </p>

          <h3>The eight principles behind the game</h3>

          <h4>1. Kleiber's Law — the food bill</h4>
          <p>
            Daily energy use ≈ 70 × (body mass)<sup>¾</sup>. A 1 g shrew burns way more food per gram than a 100 t whale. Big bodies are more efficient per kilo. <strong>Whales eat a lot in total, but mice eat much more for their size.</strong>
          </p>

          <h4>2. The square-cube law — why a giant mouse can't exist</h4>
          <p>
            Body weight scales with length³; bone strength with length². Double a creature in every direction and it gets 8× heavier but only 4× stronger — bones snap. African elephants (~6 t) are near the land limit; dinosaurs only got bigger by evolving hollow bones.
          </p>

          <h4>3. Surface-to-volume ratio — why small things freeze and big things overheat</h4>
          <p>
            Surface area grows as length²; volume as length³. Small bodies have lots of surface for their volume → heat leaks out fast. Big bodies trap heat. Musk-oxen survive the Arctic; shrews can't. Elephants would die in deep winters AND in deserts — for opposite reasons.
          </p>

          <h4>4. The 1.5 billion heartbeats rule</h4>
          <p>
            Almost every mammal — mouse to whale — gets ~1.5 billion heartbeats over a lifetime. Mouse: ~600 bpm, ~2 years. Blue whale: ~6 bpm, ~100 years. Same total beats. See <strong>Heart rate</strong> and <strong>Lifespan</strong> — they always tell the same story.
          </p>

          <h4>5. The speed peak — why 50 kg is magic</h4>
          <p>
            Top sprint speed peaks around 50 kg. Smaller (cat, mouse) and larger (elephant, rhino) animals are slower. Cheetah (50 kg, 110 km/h), pronghorn (50 kg, 88 km/h), ostrich (90 kg, 70 km/h) — the fastest land animals all live in a narrow size band.
          </p>

          <h4>6. Warm-blood vs cold-blood — the temperature tax</h4>
          <p>
            Warm-blooded animals keep a constant body temperature, costing <strong>~10× more food per kg</strong> than cold-blooded ones. A crocodile can fast for a year; a wolf the same size needs to eat every day.
          </p>

          <h4>7. Brain energy cost — intelligence is expensive</h4>
          <p>
            A human brain is ~2% of body mass but burns ~20% of total energy. Same for dolphins, ravens, octopi. You can't have a big brain on a starvation diet — that's why big brains evolved in rich-food environments.
          </p>

          <h4>8. Flight has a hard weight limit</h4>
          <p>
            Wing loading caps powered flight at small body sizes. Above ~12 kg, sustained flapping is essentially impossible. Swans (~12 kg) are at the limit. No flying-elephant in any era. In the game, the <strong>Wings</strong> hybrid is locked out above 2 kg.
          </p>

          <h3>The six arenas</h3>
          <table className="about-table">
            <thead>
              <tr>
                <th>Arena</th>
                <th>Wins when you have…</th>
                <th>Real animals</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>🦌 Chase</td><td>speed + stamina balance</td><td>wolves, pronghorns, cheetahs</td></tr>
              <tr><td>🌳 Hunt</td><td>stealth, armor, OR escape speed</td><td>rabbits, turtles, pronghorns</td></tr>
              <tr><td>🏔 Climb</td><td>cold tolerance + manageable mass</td><td>snow leopards, musk-oxen, yaks</td></tr>
              <tr><td>☀️ Drought</td><td>low metabolism + fat reserves</td><td>camels, crocodiles, tortoises</td></tr>
              <tr><td>🌊 Deep</td><td>gills, OR huge lungs + armor</td><td>fish, sperm whales (with blubber)</td></tr>
              <tr><td>🧩 Maze</td><td>brain power + sharp senses</td><td>apes, ravens, octopi, bats</td></tr>
            </tbody>
          </table>
          <p>
            Every choice pays off <em>somewhere</em> — and is a liability <em>somewhere else</em>. That's the whole point of biology.
          </p>

          <h3>The eight hybrid traits — borrowed from real animals</h3>
          <ul className="about-list">
            <li><strong>🦇 Echolocation</strong> (bats, dolphins) — pings the world with sound; works in darkness and water.</li>
            <li><strong>🦅 Wings</strong> (bats, birds) — flight, hard-capped at 2 kg.</li>
            <li><strong>🐍 Venom</strong> (snakes, octopi) — a 50 g snake can drop a 100 kg deer.</li>
            <li><strong>⚡ Electric organs</strong> (electric eels) — 600 V shocks. Costs ⅓ of daily energy.</li>
            <li><strong>🦎 Camouflage</strong> (octopi, chameleons) — skin color change in 0.3 seconds.</li>
            <li><strong>🧊 Antifreeze blood</strong> (arctic fish) — survive at -2°C salt water.</li>
            <li><strong>🦣 Thick fur</strong> (musk-oxen, mammoths) — ~8× warmer per gram than sheep wool.</li>
            <li><strong>🐟 Gills</strong> (fish) — O₂ from water; needs fast flow (water has 30× less O₂ than air).</li>
          </ul>

          <h3>Credits</h3>
          <ul className="about-list">
            <li>🧠 <strong>Game design & direction:</strong> Dan Aridor</li>
            <li>🤖 <strong>Pair-programmer:</strong> Claude Opus 4.7 (1M context) by Anthropic</li>
            <li>🎯 <strong>Dedicated to:</strong> Adam Aridor (age 9), who loves animals and the math of life</li>
            <li>📚 <strong>Inspired by:</strong> Geoffrey West, <em>Scale</em> (2017)</li>
          </ul>

          <blockquote className="about-quote">
            "Bigger isn't better. Faster isn't better. Smarter isn't better. Everything has a cost. The art of biology is choosing which costs to pay."
          </blockquote>

          <p className="about-links">
            <a href="https://github.com/daridor9/critter-forge" target="_blank" rel="noreferrer">Source on GitHub →</a>
          </p>
        </div>
      </div>
    </div>
  );
}
