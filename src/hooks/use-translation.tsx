'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import en from '@/lang/en.json';
import fr from '@/lang/fr.json';

// Ensure 'uuid' is in package.json. If not, I should add it.
// Looking at package.json... it's not there. I need to add it.
// And also @types/uuid for TypeScript.

const translations = {
  en,
  fr,
};

export type Teacher = {
  id: string;
  name: string;
  language: 'en' | 'fr';
};

type Language = 'en' | 'fr';

interface TranslationContextType {
  language: Language;
  t: (key: string) => string;
  teachers: Teacher[];
  activeTeacher: Teacher | null;
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
  setActiveTeacherId: (id: string | null) => void;
  addTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  updateTeacher: (id: string, updates: Partial<Omit<Teacher, 'id'>>) => void;
  deleteTeacher: (id: string) => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [activeTeacherId, setActiveTeacherId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedTeachers = localStorage.getItem('teachers');
      const storedActiveId = localStorage.getItem('activeTeacherId');
      
      let initialTeachers: Teacher[] = [];
      if (storedTeachers) {
        initialTeachers = JSON.parse(storedTeachers);
      }
      
      if (initialTeachers.length === 0) {
        // Create a default teacher if none exist
        initialTeachers = [{ id: uuidv4(), name: 'Sarah Dubois', language: 'en' }];
      }
      
      setTeachers(initialTeachers);

      if (storedActiveId && initialTeachers.some(t => t.id === storedActiveId)) {
        setActiveTeacherId(storedActiveId);
      } else if (initialTeachers.length > 0) {
        setActiveTeacherId(initialTeachers[0].id);
      }

    } catch (error) {
       console.error("Failed to parse teachers from localStorage", error);
       const defaultTeacher = { id: uuidv4(), name: 'Sarah Dubois', language: 'en' };
       setTeachers([defaultTeacher]);
       setActiveTeacherId(defaultTeacher.id);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('teachers', JSON.stringify(teachers));
      if (activeTeacherId) {
        localStorage.setItem('activeTeacherId', activeTeacherId);
      } else {
        localStorage.removeItem('activeTeacherId');
      }
    }
  }, [teachers, activeTeacherId, isLoaded]);

  const activeTeacher = teachers.find(t => t.id === activeTeacherId) || null;
  const language = activeTeacher?.language || 'en';

  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let result: any = translations[language];
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        let fallbackResult: any = translations.en;
        for (const fk of keys) {
          fallbackResult = fallbackResult?.[fk];
        }
        return fallbackResult || key;
      }
    }
    return result || key;
  }, [language]);

  const addTeacher = (teacherData: Omit<Teacher, 'id'>) => {
    const newTeacher = { ...teacherData, id: uuidv4() };
    const newTeachers = [...teachers, newTeacher];
    setTeachers(newTeachers);
    setActiveTeacherId(newTeacher.id); // Switch to the new teacher
  };

  const updateTeacher = (id: string, updates: Partial<Omit<Teacher, 'id'>>) => {
    setTeachers(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };
  
  const deleteTeacher = (id: string) => {
    const newTeachers = teachers.filter(t => t.id !== id);
    setTeachers(newTeachers);
    if (activeTeacherId === id) {
      setActiveTeacherId(newTeachers.length > 0 ? newTeachers[0].id : null);
    }
  };

  const value = {
    language,
    t,
    teachers,
    activeTeacher,
    setTeachers,
    setActiveTeacherId,
    addTeacher,
    updateTeacher,
    deleteTeacher,
  };
  
  // Render children only when fully loaded to prevent hydration issues
  return (
    <TranslationContext.Provider value={value}>
      {isLoaded ? children : null}
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
