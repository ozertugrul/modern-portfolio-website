'use client';

import { useLocale } from '@/contexts/LocaleContext';
import { Locale } from '@/lib/i18n';

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  const toggleLanguage = () => {
    setLocale(locale === 'tr' ? 'en' : 'tr');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-semibold text-zinc-600 hover:text-zinc-900 border border-zinc-300 rounded-lg hover:bg-zinc-100 transition-colors"
      aria-label="Change language"
      title={locale === 'tr' ? 'Switch to English' : 'Türkçeye Geç'}
    >
      {locale === 'tr' ? 'EN' : 'TR'}
    </button>
  );
}
