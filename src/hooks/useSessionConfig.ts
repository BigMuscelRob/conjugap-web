'use client';

import { useState } from 'react';
import { useVerbFilter } from './useVerbFilter';
import type { VerbFilterResult } from './useVerbFilter';

// ── Types ─────────────────────────────────────────────────────────────────────

export type Mode = 'structured' | 'random';

export type SessionConfig = {
  verbs:   string[];
  tenses:  string[];
  mode:    Mode;
  length:  number | null;  // null = all selected verbs/tenses
};

// ── Static data ───────────────────────────────────────────────────────────────

export const SETUP_TENSES = [
  { key: 'pres',  label: 'Presente',             level: 'A1' },
  { key: 'pi',    label: 'Pretérito Indefinido', level: 'A2' },
  { key: 'imp',   label: 'Imperfecto',           level: 'A2' },
  { key: 'pp',    label: 'Pretérito Perfecto',   level: 'B1' },
  { key: 'fut',   label: 'Futuro Simple',        level: 'B1' },
  { key: 'cond',  label: 'Condicional',          level: 'B1' },
  { key: 'sub',   label: 'Subjuntivo Presente',  level: 'B2' },
  { key: 'imper', label: 'Imperativo',           level: 'B1' },
] as const;

// ── Public type ───────────────────────────────────────────────────────────────

export type SessionConfigResult = VerbFilterResult & {
  // Tense / mode / length
  selectedTenses:   string[];
  mode:             Mode;
  length:           number | null;
  toggleTense:      (key: string) => void;
  setMode:          (m: Mode) => void;
  setLength:        (n: number | null) => void;

  // Computed
  canStart:         boolean;
  totalQuestions:   number;
  estimatedMinutes: number;

  // Session builder
  buildConfig:      () => SessionConfig;
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useSessionConfig(): SessionConfigResult {
  const filter = useVerbFilter();

  const [selectedTenses, setSelectedTenses] = useState<string[]>(['pres']);
  const [mode,           setMode]           = useState<Mode>('structured');
  const [length,         setLength]         = useState<number | null>(null);

  function toggleTense(key: string) {
    setSelectedTenses(prev =>
      prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key]
    );
  }

  const PRONOUNS_PER_BLOCK = 6;
  const allQuestionsCount = filter.effectiveVerbs.length * selectedTenses.length * PRONOUNS_PER_BLOCK;
  const totalQuestions    = length === null
    ? allQuestionsCount
    : length * selectedTenses.length * PRONOUNS_PER_BLOCK;
  const estimatedMinutes  = Math.max(1, Math.round(totalQuestions * 0.25));
  const canStart          = filter.effectiveVerbs.length > 0 && selectedTenses.length > 0;

  function buildConfig(): SessionConfig {
    let finalVerbs = filter.effectiveVerbs;
    if (length !== null) {
      if (finalVerbs.length < length) {
        // Fill up with random verbs from pool not already included
        const extra = filter.allVerbs
          .map(v => v.word)
          .filter(w => !finalVerbs.includes(w))
          .sort(() => Math.random() - 0.5);
        finalVerbs = [...finalVerbs, ...extra].slice(0, length);
      } else if (finalVerbs.length > length) {
        // More selected than session length — take a random subset
        finalVerbs = [...finalVerbs]
          .sort(() => Math.random() - 0.5)
          .slice(0, length);
      }
    }
    return { verbs: finalVerbs, tenses: selectedTenses, mode, length };
  }

  return {
    // Verb filter (re-exposed so callers only need this one hook)
    ...filter,

    // Tense / mode / length
    selectedTenses,
    mode,
    length,
    toggleTense,
    setMode,
    setLength,

    // Computed
    canStart,
    totalQuestions,
    estimatedMinutes,

    // Session builder
    buildConfig,
  };
}
