'use client';

import { useState, useEffect } from 'react';

// ── API shape ─────────────────────────────────────────────────────────────────

type ApiVerb = {
  id:         number;
  infinitive: string;
  cls:        string;
  irregular:  boolean;
  meaningDe:  string;
  meaningEn:  string;
};

// ── Public types ──────────────────────────────────────────────────────────────

export type VerbEntry = { word: string; cls: string };

export type VerbDataResult = {
  verbs:     VerbEntry[];
  byClass:   Record<string, string[]>;  // e.g. { '-ar': ['hablar', ...] }
  isLoading: boolean;
  error:     string | null;
};

// ── Module-level cache ────────────────────────────────────────────────────────
// Shared across all hook instances — verbs are only fetched once per app session.

let cache:   VerbEntry[] | null          = null;
let pending: Promise<VerbEntry[]> | null = null;

function loadVerbs(): Promise<VerbEntry[]> {
  if (cache)   return Promise.resolve(cache);
  if (pending) return pending;             // deduplicate concurrent callers

  pending = fetch('/api/verbs')
    .then(r => r.json() as Promise<ApiVerb[]>)
    .then(data => {
      cache   = data.map(v => ({ word: v.infinitive, cls: v.cls }));
      pending = null;
      return cache;
    });

  return pending;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useVerbData(): VerbDataResult {
  const [verbs,     setVerbs]     = useState<VerbEntry[]>(cache ?? []);
  const [isLoading, setIsLoading] = useState(cache === null);
  const [error,     setError]     = useState<string | null>(null);

  useEffect(() => {
    if (cache !== null) return; // already cached — nothing to do

    loadVerbs()
      .then(loaded => {
        setVerbs(loaded);
        setIsLoading(false);
      })
      .catch(() => {
        setError('Fehler beim Laden der Verben.');
        setIsLoading(false);
      });
  }, []);

  const byClass = verbs.reduce<Record<string, string[]>>((acc, v) => {
    (acc[v.cls] ??= []).push(v.word);
    return acc;
  }, {});

  return { verbs, byClass, isLoading, error };
}
