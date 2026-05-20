import type { Creature } from '../types';

export function encodeCreature(c: Creature): string {
  try {
    const json = JSON.stringify(c);
    return btoa(unescape(encodeURIComponent(json)));
  } catch {
    return '';
  }
}

export function decodeCreature(hash: string): Creature | null {
  try {
    const json = decodeURIComponent(escape(atob(hash)));
    const obj = JSON.parse(json);
    if (typeof obj !== 'object' || !obj || !obj.bodyPlan || !Array.isArray(obj.hybrids)) return null;
    return obj as Creature;
  } catch {
    return null;
  }
}

export function buildShareLink(c: Creature): string {
  const hash = encodeCreature(c);
  const base = window.location.origin + window.location.pathname;
  return `${base}#c=${hash}`;
}

export function readCreatureFromHash(): Creature | null {
  const h = window.location.hash;
  const match = h.match(/[#&]c=([^&]+)/);
  if (!match) return null;
  return decodeCreature(match[1]);
}

export function clearCreatureHash(): void {
  if (window.location.hash) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }
}
