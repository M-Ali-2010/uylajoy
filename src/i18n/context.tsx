import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { uz, type TranslationKeys } from "./translations/uz";
import { ru } from "./translations/ru";
import { en } from "./translations/en";

export type Language = "uz" | "ru" | "en";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
};

const translations: Record<Language, TranslationKeys> = {
  uz,
  ru,
  en,
};

const STORAGE_KEY = "uyjoy-language";

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "uz";

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && (stored === "uz" || stored === "ru" || stored === "en")) {
    return stored;
  }

  // Try to detect from browser
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith("ru")) return "ru";
  if (browserLang.startsWith("en")) return "en";

  return "uz";
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("uz");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLanguageState(getInitialLanguage());
    setMounted(true);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, lang);
    }
  }, []);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <LanguageContext.Provider value={{ ...value, language: "uz", t: uz }}>
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export function useTranslation() {
  const { t, language } = useLanguage();
  return { t, language };
}
