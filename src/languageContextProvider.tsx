import React, { type ReactNode, useEffect, useMemo, useState } from "react";

export interface ApplicationTexts {
  productTablePriceHeader: string;
  productTableNameHeader: string;
  onlyShowInStockLabel: string;
  searchInputPlaceholder: string;
}

const english: ApplicationTexts = {
  onlyShowInStockLabel: "Only show in stock items",
  searchInputPlaceholder: "Search...",
  productTableNameHeader: "Name",
  productTablePriceHeader: "Price",
};
const norwegian: ApplicationTexts = {
  onlyShowInStockLabel: "Bare vis tilgjengelige varer",
  searchInputPlaceholder: "Søk...",
  productTableNameHeader: "Navn",
  productTablePriceHeader: "Pris",
};

export const LanguageContext = React.createContext({
  language: navigator.language,
  applicationText: english,
});

export function LanguageContextProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState(navigator.language);
  const applicationText = useMemo(() => {
    if (language === "no") return norwegian;
    return english;
  }, [language]);
  useEffect(() => {
    addEventListener("languagechange", () => setLanguage(navigator.language));
  }, []);
  return (
    <LanguageContext.Provider value={{ language, applicationText }}>
      {children}
    </LanguageContext.Provider>
  );
}
