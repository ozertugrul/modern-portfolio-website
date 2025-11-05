'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, defaultLocale, getTranslations } from '@/lib/i18n';

type LocaleContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: ReturnType<typeof getTranslations>;
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [customTranslations, setCustomTranslations] = useState<any>(null);

  useEffect(() => {
    // Browser'dan dil tercihini al
    const savedLocale = localStorage.getItem('locale') as Locale | null;
    if (savedLocale && (savedLocale === 'tr' || savedLocale === 'en')) {
      setLocaleState(savedLocale);
    } else {
      // Browser dilini kontrol et
      const browserLang = navigator.language.split('-')[0];
      if (browserLang === 'tr' || browserLang === 'en') {
        setLocaleState(browserLang as Locale);
      }
    }

    // Backend'den custom translations'? y?kle
    fetch('/api/translations')
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        return null;
      })
      .then(data => {
        if (data && (data.tr || data.en)) {
          setCustomTranslations(data);
        }
      })
      .catch(() => {
        // Backend'den y?klenemezse default kullan
      });
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  // Default translations'? al ve custom translations ile birle?tir
  const defaultT = getTranslations(locale);
  const customT = customTranslations?.[locale];
  
  // Deep merge: custom translations varsa default'u override et
  const t = customT ? deepMerge(defaultT, customT) : defaultT;

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

// Deep merge helper
function deepMerge(target: any, source: any): any {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
