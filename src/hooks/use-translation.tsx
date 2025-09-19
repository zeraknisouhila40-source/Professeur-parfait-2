'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import en from '@/lang/en.json';
import fr from '@/lang/fr.json';

const translations = {
  en,
  fr,
};

type Language = 'en' | 'fr';

interface TranslationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  teacherName: string;
  setTeacherName: (name: string) => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [teacherName, setTeacherNameState] = useState<string>('Sarah Dubois');

  useEffect(() => {
    const storedLanguage = localStorage.getItem('language') as Language;
    if (storedLanguage && (storedLanguage === 'en' || storedLanguage === 'fr')) {
      setLanguageState(storedLanguage);
    }
    const storedTeacherName = localStorage.getItem('teacherName');
    if (storedTeacherName) {
      setTeacherNameState(storedTeacherName);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    localStorage.setItem('language', lang);
    setLanguageState(lang);
  };
  
  const setTeacherName = (name: string) => {
    localStorage.setItem('teacherName', name);
    setTeacherNameState(name);
  };

  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let result: any = translations[language];
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to English if key not found in current language
        let fallbackResult: any = translations.en;
        for (const fk of keys) {
          fallbackResult = fallbackResult?.[fk];
        }
        return fallbackResult || key;
      }
    }
    return result || key;
  }, [language]);

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t, teacherName, setTeacherName }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
