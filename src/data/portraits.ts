import type { Creature } from '../types';
import { portraitKey } from '../utils/portraitPrompt';

const KEY = 'critter-forge:portraits';

interface PortraitEntry {
  url: string;
  savedAt: number;
}

type PortraitMap = Record<string, PortraitEntry>;

function loadAll(): PortraitMap {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

function saveAll(map: PortraitMap) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    /* localStorage may be full; ignore */
  }
}

export function getPortrait(creature: Creature): string | null {
  const map = loadAll();
  return map[portraitKey(creature)]?.url ?? null;
}

export function setPortrait(creature: Creature, url: string): void {
  const map = loadAll();
  map[portraitKey(creature)] = { url, savedAt: Date.now() };
  saveAll(map);
}

export function removePortrait(creature: Creature): void {
  const map = loadAll();
  delete map[portraitKey(creature)];
  saveAll(map);
}

export function countPortraits(): number {
  return Object.keys(loadAll()).length;
}
