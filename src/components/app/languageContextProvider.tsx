import React, { type ReactNode, useEffect, useMemo, useState } from "react";

export interface ApplicationTexts {
  searchPlaceholder: string;
}

const english: ApplicationTexts = {
  searchPlaceholder: "Search...",
};

const norwegian: ApplicationTexts = {
  searchPlaceholder: "Søk...",
};

export const LanguageContext = React.createContext({
  language: navigator.language,
  applicationTexts: english,
});

export function LanguageContextProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState(navigator.language);
  const applicationTexts = useMemo(() => {
    if (language === "no") return norwegian;
    return english;
  }, [language]);
  useEffect(() => {
    window.addEventListener("languagechange", () =>
      setLanguage(navigator.language),
    );
  }, []);
  return (
    <LanguageContext.Provider value={{ language, applicationTexts }}>
      {children}
    </LanguageContext.Provider>
  );
}
