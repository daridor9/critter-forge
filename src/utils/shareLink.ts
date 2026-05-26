import type { Creature } from '../types';
import type { MakerStamp } from '../data/family';
import type { Venue } from '../data/battle';

// A share link encodes the creature plus the maker stamp of whoever
// sent it. Optionally a "challenge" can be attached — a pre-set battle
// venue that opens the BattleModal directly when the recipient lands.
export interface ShareBundle {
  c: Creature;
  m?: MakerStamp | null;
  ch?: { v: Venue };
}

function encode(obj: unknown): string {
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
  } catch {
    return '';
  }
}

function decode<T>(hash: string): T | null {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(hash)))) as T;
  } catch {
    return null;
  }
}

// Back-compat: old links just encoded a Creature directly. Detect by
// the presence of `bodyPlan` on the decoded payload.
export function encodeCreature(c: Creature): string {
  return encode(c);
}

export function decodeCreature(hash: string): Creature | null {
  const obj = decode<Record<string, unknown>>(hash);
  if (!obj || typeof obj !== 'object') return null;
  if (typeof (obj as { bodyPlan?: unknown }).bodyPlan === 'string') {
    return obj as unknown as Creature;
  }
  return null;
}

export function buildShareLink(c: Creature, maker?: MakerStamp | null, challengeVenue?: Venue): string {
  const bundle: ShareBundle = { c, m: maker ?? null };
  if (challengeVenue) bundle.ch = { v: challengeVenue };
  const hash = encode(bundle);
  const base = window.location.origin + window.location.pathname;
  return `${base}#s=${hash}`;
}

export interface ReadShareResult {
  creature: Creature;
  maker: MakerStamp | null;
  challengeVenue: Venue | null;
}

export function readShareFromHash(): ReadShareResult | null {
  const h = window.location.hash;
  // New shape: #s=... (bundle).
  const sMatch = h.match(/[#&]s=([^&]+)/);
  if (sMatch) {
    const bundle = decode<ShareBundle>(sMatch[1]);
    if (bundle && bundle.c && typeof bundle.c.bodyPlan === 'string') {
      return {
        creature: bundle.c,
        maker: bundle.m ?? null,
        challengeVenue: bundle.ch?.v ?? null,
      };
    }
  }
  // Legacy shape: #c=... (creature only).
  const cMatch = h.match(/[#&]c=([^&]+)/);
  if (cMatch) {
    const c = decodeCreature(cMatch[1]);
    if (c) return { creature: c, maker: null, challengeVenue: null };
  }
  return null;
}

// Back-compat helper for any caller still using the old name.
export function readCreatureFromHash(): Creature | null {
  return readShareFromHash()?.creature ?? null;
}

export function clearCreatureHash(): void {
  if (window.location.hash) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }
}
