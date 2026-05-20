'use client';

import { useState } from 'react';

// ── Static data ───────────────────────────────────────────────────────────────

export const SETUP_CLASSES = [
  { key: '-ar',         label: '-ar regulares', dotClass: 'bg-terracotta-500' },
  { key: '-er',         label: '-er regulares', dotClass: 'bg-saffron-500'    },
  { key: '-ir',         label: '-ir regulares', dotClass: 'bg-sage-300'       },
  { key: 'irregulares', label: 'irregulares',   dotClass: 'bg-berry-500'      },
] as const;

export const SETUP_VERBS = [
  { word: 'hablar',   cls: '-ar'         },
  { word: 'comer',    cls: '-er'         },
  { word: 'vivir',    cls: '-ir'         },
  { word: 'tener',    cls: 'irregulares' },
  { word: 'ir',       cls: 'irregulares' },
  { word: 'ser',      cls: 'irregulares' },
  { word: 'estar',    cls: 'irregulares' },
  { word: 'querer',   cls: 'irregulares' },
  { word: 'estudiar', cls: '-ar'         },
  { word: 'trabajar', cls: '-ar'         },
  { word: 'beber',    cls: '-er'         },
  { word: 'leer',     cls: '-er'         },
  { word: 'escribir', cls: '-ir'         },
  { word: 'salir',    cls: 'irregulares' },
  { word: 'venir',    cls: 'irregulares' },
  { word: 'hacer',    cls: 'irregulares' },
];

export type VerbEntry = typeof SETUP_VERBS[number];

// ── Public type ───────────────────────────────────────────────────────────────

export type VerbFilterResult = {
  selectedClasses: string[];
  selectedVerbs:   string[];
  verbSearch:      string;
  filteredVerbs:   VerbEntry[];  // tiles visible in the grid
  effectiveVerbs:  string[];     // verb list used to build the session
  toggleClass:     (cls: string)  => void;
  toggleVerb:      (word: string) => void;
  setVerbSearch:   (q: string)    => void;
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useVerbFilter(): VerbFilterResult {
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
  const classVerbs     = SETUP_VERBS.filter(v => selectedClasses.includes(v.cls)).map(v => v.word);
  const effectiveVerbs = selectedVerbs.length > 0 ? selectedVerbs : classVerbs;

  const query         = verbSearch.trim().toLowerCase();
  const filteredVerbs = SETUP_VERBS.filter(v => {
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
    toggleClass,
    toggleVerb,
    setVerbSearch,
  };
}
