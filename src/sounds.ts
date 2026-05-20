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
}
