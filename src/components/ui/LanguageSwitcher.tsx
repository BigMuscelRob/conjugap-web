'use client';

import { useState, useRef, useEffect, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage, type Locale } from '@/i18n/LanguageProvider';

const LANGUAGES: { locale: Locale; label: string; flag: string }[] = [
  { locale: 'en', label: 'English', flag: '🇬🇧' },
  { locale: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { locale: 'es', label: 'Español', flag: '🇪🇸' },
];

const GAP = 8;

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({});
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);

  const current = LANGUAGES.find((l) => l.locale === locale) ?? LANGUAGES[1];

  useEffect(() => { setMounted(true); }, []);

  function handleToggle() {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + GAP,
        right: window.innerWidth - rect.right,
        zIndex: 9999,
      });
    }
    setOpen((v) => !v);
  }

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (
        !buttonRef.current?.contains(e.target as Node) &&
        !dropdownRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  const dropdown = (
    <ul
      ref={dropdownRef}
      role="listbox"
      aria-label="Language"
      style={dropdownStyle}
      className="w-40 bg-paper border-2 border-ink-900 rounded-md shadow-stamp-big py-1 overflow-hidden"
    >
      {LANGUAGES.map(({ locale: l, label, flag }) => {
        const active = l === locale;
        return (
          <li key={l} role="option" aria-selected={active}>
            <button
              type="button"
              onClick={() => { setLocale(l); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-left
                font-semibold text-small transition-colors duration-micro ease-smooth
                ${active
                  ? 'text-terracotta-500 bg-terracotta-500/[0.06]'
                  : 'text-ink-700 hover:bg-ink-50 hover:text-ink-900'
                }`}
            >
              <span aria-hidden="true">{flag}</span>
              <span>{label}</span>
              {active && (
                <i className="ph-bold ph-check ml-auto text-terracotta-500" aria-hidden="true" />
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 font-bold text-small text-ink-700
          px-3 py-2 rounded-sm transition-colors duration-micro ease-smooth
          hover:bg-ink-50 hover:text-ink-900 select-none"
      >
        <span aria-hidden="true">{current.flag}</span>
        <span className="hidden sm:inline">{current.label}</span>
        <i
          className={`ph-bold ph-caret-down text-[11px] transition-transform duration-micro ease-smooth
            ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {mounted && open && createPortal(dropdown, document.body)}
    </div>
  );
}
