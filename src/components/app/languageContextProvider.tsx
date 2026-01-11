import React, { type ReactNode, useEffect, useMemo, useState } from "react";
import type { ProductCategory } from "./products.js";

export interface ApplicationTexts {
  productCategories: Record<ProductCategory, string>;
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
  productCategories: {
    fruits: "Fruits",
    vegetables: "Vegetables",
  },
};

const norwegian: ApplicationTexts = {
  inStockOnlyLabel: "Vis bare tilgjengelige varer",
  searchPlaceholder: "Søk...",
  nameHeader: "Navn",
  priceHeader: "Pris",
  productCategories: {
    fruits: "Frukt",
    vegetables: "Grønnsaker",
  },
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
