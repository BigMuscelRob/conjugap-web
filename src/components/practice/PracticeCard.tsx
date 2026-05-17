'use client';

import { useState, useEffect, useRef } from 'react';
import Button from '@/components/ui/Button';
import { VERBS } from '@/lib/data/verbs';
import type { Pronoun } from '@/lib/types';

type Status = 'typing' | 'correct' | 'wrong';

const PRONOUNS: { key: Pronoun; label: string }[] = [
  { key: 'yo',          label: 'YO' },
  { key: 'tú',          label: 'TÚ' },
  { key: 'él/ella',     label: 'ÉL / ELLA' },
  { key: 'nosotros',    label: 'NOSOTROS' },
  { key: 'vosotros',    label: 'VOSOTROS' },
  { key: 'ellos/ellas', label: 'ELLOS / ELLAS' },
];

export default function PracticeCard() {
  const [idx, setIdx]       = useState(0);
  const [pronIdx, setPronIdx] = useState(1); // tú by default
  const [value, setValue]   = useState('');
  const [status, setStatus] = useState<Status>('typing');
  const inputRef            = useRef<HTMLInputElement>(null);

  const verb     = VERBS[idx];
  const pron     = PRONOUNS[pronIdx];
  const expected = verb.conjugations['Presente']?.[pron.key] ?? '';

  useEffect(() => { inputRef.current?.focus(); }, [idx]);

  function check() {
    if (status !== 'typing') return next();
    const ok = value.trim().toLowerCase() === expected.toLowerCase();
    setStatus(ok ? 'correct' : 'wrong');
  }

  function next() {
    setStatus('typing');
    setValue('');
    setIdx((idx + 1) % VERBS.length);
    setPronIdx(Math.floor(Math.random() * PRONOUNS.length));
  }

  const mascotState: 'idle' | 'think' | 'celebrate' | 'wrong' =
    status === 'correct' ? 'celebrate' :
    status === 'wrong'   ? 'wrong'     :
    value.length > 0     ? 'think'     : 'idle';

  const mascotAnim: Record<typeof mascotState, string> = {
    idle:      'animate-breathe',
    think:     'animate-think',
    celebrate: 'animate-celebrate',
    wrong:     'animate-shake',
  };

  return (
    <div className="bg-paper border-2 border-ink-900 rounded-[28px] p-9 shadow-[0_6px_0_#2A1F1A] max-w-[560px] mx-auto flex flex-col gap-5">

      {/* Top row: chips + progress */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <span className="px-3 py-1.5 rounded-pill text-[12px] font-bold bg-saffron-50 text-saffron-700 border-2 border-saffron-200">
            {verb.verbClass}
          </span>
          <span className="px-3 py-1.5 rounded-pill text-[12px] font-bold bg-ink-900 text-saffron-300 border-2 border-ink-900">
            Presente
          </span>
        </div>
        <div className="flex items-center gap-2 text-ink-500 text-[12px] font-bold uppercase tracking-[0.05em]">
          <span>{idx + 1} / {VERBS.length}</span>
          <div className="w-16 h-2 bg-ink-100 rounded-pill overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-terracotta-500 to-saffron-300 rounded-pill transition-all duration-base"
              style={{ width: `${((idx + 1) / VERBS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Prompt */}
      <div className="text-center flex flex-col gap-1">
        <div className="text-[14px] font-bold text-ink-500 tracking-wide-08 uppercase">
          {pron.label}
        </div>
        <div className="font-display text-[56px] font-bold tracking-tightest text-ink-900 leading-none">
          {verb.infinitive}
        </div>
        <div className="text-ink-500 italic text-[14px] mt-1">
          {verb.translation}
        </div>
      </div>

      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          value={status === 'wrong' ? expected : value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') check(); }}
          readOnly={status !== 'typing'}
          placeholder="conjuga aquí…"
          className={[
            'w-full font-mono text-[32px] font-bold text-center',
            'px-5 py-[18px] rounded-[18px] border-2 outline-none',
            'transition-[border-color,background-color] duration-micro',
            'shadow-inset',
            status === 'correct'
              ? 'border-sage-700 bg-sage-50 text-sage-700'
              : status === 'wrong'
              ? 'border-berry-500 bg-warn-soft text-berry-700'
              : 'border-ink-200 bg-white-warm text-ink-900 focus:border-terracotta-400',
          ].join(' ')}
        />
      </div>

      {/* Feedback hint */}
      {status === 'correct' && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-md text-[14px] font-bold bg-sage-50 text-sage-700 border border-sage-300/40">
          <i className="ph-fill ph-check-circle text-[20px]" aria-hidden="true" />
          ¡Eso es! +12 XP
        </div>
      )}
      {status === 'wrong' && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-md text-[14px] font-bold bg-warn-soft text-berry-700 border border-berry-500/25">
          <i className="ph-fill ph-arrow-right text-[18px]" aria-hidden="true" />
          <span>
            You wrote{' '}
            <span className="font-mono">&ldquo;{value || '—'}&rdquo;</span>
            {' '}· correct is{' '}
            <span className="font-mono">{expected}</span>
          </span>
        </div>
      )}

      {/* Footer: mascot + buttons */}
      <div className="flex justify-between items-center gap-3 mt-1">
        <div className="flex items-center gap-2.5">
          <img
            key={status}
            src="/mascot-mini.svg"
            alt="Verbito"
            width={56}
            height={56}
            className={`block select-none ${mascotAnim[mascotState]}`}
            draggable={false}
          />
          <span className="text-[13px] text-ink-500 font-semibold italic max-w-[200px]">
            {status === 'typing' && (value ? 'Concentra…' : 'Tú puedes.')}
            {status === 'correct' && 'Smooth.'}
            {status === 'wrong' && 'Casi. Otra vez.'}
          </span>
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" size="md" icon="lightbulb">Pista</Button>
          {status === 'typing'
            ? <Button variant="success" size="md" onClick={check} iconAfter="arrow-right">Comprobar</Button>
            : <Button variant="primary" size="md" onClick={next}  iconAfter="arrow-right">Siguiente</Button>
          }
        </div>
      </div>
    </div>
  );
}
