import React, { type ReactNode, useEffect, useMemo, useState } from "react";

export interface ApplicationTexts {
  searchPlaceholder: string;
  inStockOnlyLabel: string;
  nameHeader: string;
  priceHeader: string;
}

const english: ApplicationTexts = {
  inStockOnlyLabel: "Only show available items",
  searchPlaceholder: "Search...",
  nameHeader: "Name",
  priceHeader: "Price",
};

const norwegian: ApplicationTexts = {
  inStockOnlyLabel: "Vis bare tilgjengelige varer",
  searchPlaceholder: "Søk...",
  nameHeader: "Navn",
  priceHeader: "Pris",
};

export const LanguageContext = React.createContext<{
  language: string;
  applicationTexts: ApplicationTexts;
}>({ language: "en", applicationTexts: english });

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
