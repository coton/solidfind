"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { uiTranslationsId } from "@/lib/ui-translations";

export type SiteLanguage = "en" | "id";

type LanguageContextValue = {
  language: SiteLanguage;
  setLanguage: (language: SiteLanguage) => void;
  t: (english: string, indonesian?: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SiteLanguage>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem("solidfind_language");
    if (stored === "en" || stored === "id") setLanguageState(stored);
  }, []);

  const setLanguage = (nextLanguage: SiteLanguage) => {
    setLanguageState(nextLanguage);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("solidfind_language", nextLanguage);
      document.documentElement.lang = nextLanguage;
    }
  };

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t: (english, indonesian) => (language === "id" ? (indonesian || uiTranslationsId[english] || english) : english),
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useSiteLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: "en" as const,
      setLanguage: () => undefined,
      t: (english: string) => english,
    };
  }
  return context;
}
