'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import en from './messages/en.json';
import de from './messages/de.json';
import es from './messages/es.json';

export type Locale = 'en' | 'de' | 'es';

const MESSAGES: Record<Locale, typeof en> = { en, de, es };
const STORAGE_KEY = 'conjugap-locale';
const DEFAULT_LOCALE: Locale = 'de';

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
});

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && stored in MESSAGES) {
      setLocaleState(stored);
    }
    setMounted(true);
  }, []);

  function setLocale(next: Locale) {
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  const activeLocale = mounted ? locale : DEFAULT_LOCALE;

  return (
    <NextIntlClientProvider
      locale={activeLocale}
      messages={MESSAGES[activeLocale]}
      timeZone="Europe/Berlin"
    >
      <LanguageContext.Provider value={{ locale: activeLocale, setLocale }}>
        {children}
      </LanguageContext.Provider>
    </NextIntlClientProvider>
  );
}
