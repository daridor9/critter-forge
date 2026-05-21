import type { Creature } from '../types';

export interface LineageNode {
  id: string;
  creature: Creature;
  parentIds: string[];
  changes: string[];
  kind: 'root' | 'evolve' | 'breed';
  timestamp: number;
}

const KEY = 'critter-forge:lineage';

function loadAll(): Record<string, LineageNode> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

function saveAll(map: Record<string, LineageNode>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

function genId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function recordRoot(c: Creature): string {
  const id = genId();
  const map = loadAll();
  map[id] = {
    id,
    creature: c,
    parentIds: [],
    changes: [],
    kind: 'root',
    timestamp: Date.now(),
  };
  saveAll(map);
  return id;
}

export function recordEvolve(parentId: string, child: Creature, changes: string[]): string {
  const id = genId();
  const map = loadAll();
  map[id] = {
    id,
    creature: child,
    parentIds: [parentId],
    changes,
    kind: 'evolve',
    timestamp: Date.now(),
  };
  saveAll(map);
  return id;
}

export function recordBreed(p1Id: string, p2Id: string, child: Creature, changes: string[]): string {
  const id = genId();
  const map = loadAll();
  map[id] = {
    id,
    creature: child,
    parentIds: [p1Id, p2Id],
    changes,
    kind: 'breed',
    timestamp: Date.now(),
  };
  saveAll(map);
  return id;
}

export function getLineage(currentId: string | null): LineageNode[] {
  if (!currentId) return [];
  const map = loadAll();
  const chain: LineageNode[] = [];
  let cur: LineageNode | undefined = map[currentId];
  const visited = new Set<string>();
  while (cur && !visited.has(cur.id)) {
    visited.add(cur.id);
    chain.unshift(cur);
    cur = cur.parentIds.length > 0 ? map[cur.parentIds[0]] : undefined;
  }
  return chain;
}

export function getNode(id: string): LineageNode | null {
  return loadAll()[id] ?? null;
}
