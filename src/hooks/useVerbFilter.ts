'use client';

import { useState } from 'react';
import { useVerbData } from './useVerbData';
import type { VerbEntry } from './useVerbData';

export type { VerbEntry };

// ── Static data ───────────────────────────────────────────────────────────────

export const TOP_VERBS = [
  'ser', 'estar', 'haber', 'tener', 'hacer',
  'poder', 'saber', 'ir', 'querer', 'venir',
  'dar', 'hablar', 'ver', 'decir', 'poner', 'salir',
];

export const SETUP_CLASSES = [
  { key: '-ar',         label: '-ar regulares', dotClass: 'bg-terracotta-500' },
  { key: '-er',         label: '-er regulares', dotClass: 'bg-saffron-500'    },
  { key: '-ir',         label: '-ir regulares', dotClass: 'bg-sage-300'       },
  { key: 'irregulares', label: 'irregulares',   dotClass: 'bg-berry-500'      },
] as const;

// ── Public type ───────────────────────────────────────────────────────────────

export type VerbFilterResult = {
  selectedClasses:     string[];
  selectedVerbs:       string[];
  verbSearch:          string;
  filteredVerbs:       VerbEntry[];  // tiles visible in the grid
  effectiveVerbs:      string[];     // verb list used to build the session
  allVerbs:            VerbEntry[];  // full list from API (for fill-up logic etc.)
  classesAreFilterOnly: boolean;    // true when individual verbs override class selection
  isLoading:           boolean;
  error:               string | null;
  toggleClass:         (cls: string)  => void;
  toggleVerb:          (word: string) => void;
  setVerbSearch:       (q: string)    => void;
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useVerbFilter(): VerbFilterResult {
  const { verbs, isLoading, error } = useVerbData();

  const [selectedClasses, setSelectedClasses] = useState<string[]>(['-ar', '-er']);
  const [selectedVerbs,   setSelectedVerbs]   = useState<string[]>([]);
  const [verbSearch,      setVerbSearch]      = useState('');

  function toggleClass(cls: string) {
    setSelectedClasses(prev =>
      prev.includes(cls) ? prev.filter(x => x !== cls) : [...prev, cls]
    );
  }

  function toggleVerb(word: string) {
    setSelectedVerbs(prev =>
      prev.includes(word) ? prev.filter(x => x !== word) : [...prev, word]
    );
  }

  // Class chips are the display filter and fallback group when no verb is hand-picked.
  // Individual tile selections take full priority when any verb is chosen.
  const classVerbs     = verbs.filter(v => selectedClasses.includes(v.cls)).map(v => v.word);
  const effectiveVerbs = selectedVerbs.length > 0 ? selectedVerbs : classVerbs;

  const query         = verbSearch.trim().toLowerCase();
  const filteredVerbs = verbs.filter(v => {
    const isSelected   = selectedVerbs.includes(v.word);
    const matchesGroup = selectedClasses.length === 0 || selectedClasses.includes(v.cls);
    const matchesQuery = query === '' || v.word.includes(query);
    return isSelected || (matchesGroup && matchesQuery); // selected verbs always visible
  });

  return {
    selectedClasses,
    selectedVerbs,
    verbSearch,
    filteredVerbs,
    effectiveVerbs,
    allVerbs:            verbs,
    classesAreFilterOnly: selectedVerbs.length > 0,
    isLoading,
    error,
    toggleClass,
    toggleVerb,
    setVerbSearch,
  };
}
