import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { setApiLanguage } from '@/services/api';

type Language = 'en' | 'pl';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  // The API header must be set synchronously (not in an effect): child queries fire before this provider's effects.
  const [language, setLanguageState] = useState<Language>(() => {
    const initial = (localStorage.getItem('language') as Language) || 'en';
    setApiLanguage(initial);
    return initial;
  });

  useEffect(() => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language, i18n]);

  const setLanguage = (lang: Language) => {
    setApiLanguage(lang);
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'pl' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
