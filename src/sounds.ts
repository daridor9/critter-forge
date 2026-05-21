const MUTE_KEY = 'critter-forge:muted';

let ctx: AudioContext | null = null;
let muted = false;

try {
  muted = localStorage.getItem(MUTE_KEY) === '1';
} catch {
  /* ignore */
}

function getCtx(): AudioContext | null {
  if (ctx) return ctx;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  return ctx;
}

async function tone(freq: number, duration = 0.15, type: OscillatorType = 'sine', gain = 0.08): Promise<void> {
  if (muted) return;
  const c = getCtx();
  if (!c) return;
  if (c.state === 'suspended') {
    try {
      await c.resume();
    } catch {
      return;
    }
  }
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.value = gain;
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
  osc.connect(g).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + duration + 0.01);
}

function sequence(notes: { freq: number; at: number; duration?: number; type?: OscillatorType; gain?: number }[]) {
  if (muted) return;
  for (const n of notes) {
    setTimeout(() => void tone(n.freq, n.duration ?? 0.18, n.type ?? 'sine', n.gain ?? 0.08), n.at);
  }
}

export const sounds = {
  win: () => sequence([
    { freq: 523, at: 0 },
    { freq: 659, at: 90 },
    { freq: 784, at: 180, duration: 0.3 },
  ]),
  lose: () => sequence([
    { freq: 392, at: 0, type: 'triangle' },
    { freq: 311, at: 90, type: 'triangle' },
    { freq: 233, at: 180, type: 'triangle', duration: 0.25 },
  ]),
  save: () => sequence([
    { freq: 880, at: 0, duration: 0.1, gain: 0.06 },
    { freq: 1175, at: 70, duration: 0.12, gain: 0.06 },
  ]),
  click: () => void tone(700, 0.04, 'square', 0.04),
  start: () => sequence([
    { freq: 440, at: 0, duration: 0.08 },
    { freq: 660, at: 60, duration: 0.1 },
  ]),
};

export function isMuted(): boolean {
  return muted;
}

export function setMuted(m: boolean): void {
  muted = m;
  try {
    localStorage.setItem(MUTE_KEY, m ? '1' : '0');
  } catch {
    /* ignore */
  }
  if (m) stopAmbient();
}

// ─── Ambient habitat audio ──────────────────────────────────────────────
// Synthesized atmosphere — no audio assets. Each habitat layers a few
// oscillators (wind, water, low rumble) and slow LFOs so it doesn't loop
// audibly. Volume sits well below SFX and ducks if the page is hidden.
type Habitat = 'meadow' | 'rocky' | 'sky' | 'underwater';

let ambient: {
  habitat: Habitat;
  nodes: AudioNode[];
  master: GainNode;
} | null = null;

function makeNoiseBuffer(c: AudioContext, seconds = 2): AudioBuffer {
  const buf = c.createBuffer(1, c.sampleRate * seconds, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.6;
  return buf;
}

export function startAmbient(habitat: Habitat): void {
  if (muted) return;
  if (ambient && ambient.habitat === habitat) return;
  stopAmbient();
  const c = getCtx();
  if (!c) return;
  if (c.state === 'suspended') {
    c.resume().catch(() => {/* ignore */});
  }

  const master = c.createGain();
  master.gain.value = 0;
  master.connect(c.destination);
  // Fade in.
  master.gain.linearRampToValueAtTime(0.05, c.currentTime + 1.2);

  const nodes: AudioNode[] = [];
  const noise = makeNoiseBuffer(c);

  const addLayer = (filter: BiquadFilterNode, gain: number) => {
    const src = c.createBufferSource();
    src.buffer = noise;
    src.loop = true;
    const g = c.createGain();
    g.gain.value = gain;
    src.connect(filter).connect(g).connect(master);
    src.start();
    nodes.push(src, filter, g);
    return g;
  };

  if (habitat === 'meadow') {
    // Soft wind through grass + occasional birdcall hint
    const wind = c.createBiquadFilter();
    wind.type = 'bandpass'; wind.frequency.value = 500; wind.Q.value = 0.7;
    addLayer(wind, 0.4);
    const breeze = c.createBiquadFilter();
    breeze.type = 'lowpass'; breeze.frequency.value = 220;
    addLayer(breeze, 0.5);
  } else if (habitat === 'rocky') {
    // Dry desert hum, low rumble
    const dust = c.createBiquadFilter();
    dust.type = 'lowpass'; dust.frequency.value = 180;
    addLayer(dust, 0.6);
    const wind = c.createBiquadFilter();
    wind.type = 'bandpass'; wind.frequency.value = 300; wind.Q.value = 1.2;
    addLayer(wind, 0.3);
  } else if (habitat === 'sky') {
    // Higher whoosh, airy
    const air = c.createBiquadFilter();
    air.type = 'highpass'; air.frequency.value = 800;
    addLayer(air, 0.25);
    const lift = c.createBiquadFilter();
    lift.type = 'bandpass'; lift.frequency.value = 1200; lift.Q.value = 0.8;
    addLayer(lift, 0.18);
  } else if (habitat === 'underwater') {
    // Muffled low rumble + bubble-like bandpass
    const deep = c.createBiquadFilter();
    deep.type = 'lowpass'; deep.frequency.value = 120;
    addLayer(deep, 0.7);
    const bubbles = c.createBiquadFilter();
    bubbles.type = 'bandpass'; bubbles.frequency.value = 600; bubbles.Q.value = 2;
    addLayer(bubbles, 0.2);
  }

  ambient = { habitat, nodes, master };
}

export function stopAmbient(): void {
  if (!ambient) return;
  const c = getCtx();
  if (c) {
    try {
      ambient.master.gain.cancelScheduledValues(c.currentTime);
      ambient.master.gain.linearRampToValueAtTime(0, c.currentTime + 0.4);
    } catch { /* ignore */ }
  }
  const local = ambient;
  setTimeout(() => {
    for (const n of local.nodes) {
      try { (n as AudioScheduledSourceNode).stop?.(); } catch { /* ignore */ }
      try { n.disconnect(); } catch { /* ignore */ }
    }
    try { local.master.disconnect(); } catch { /* ignore */ }
  }, 500);
  ambient = null;
}
