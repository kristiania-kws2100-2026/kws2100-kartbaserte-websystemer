import React, { type ReactNode, useEffect, useState } from "react";

export const LanguageContext = React.createContext({
  language: navigator.language,
});

export function LanguageContextProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState(navigator.language);
  useEffect(() => {
    window.addEventListener("languagechange", () =>
      setLanguage(navigator.language),
    );
  }, []);
  return (
    <LanguageContext.Provider value={{ language }}>
      {children}
    </LanguageContext.Provider>
  );
}
