import { useEffect, useState } from "react";

export function useDarkMode() {
  const [darkMode, setDarkMode] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setDarkMode(mediaQuery.matches);
    mediaQuery.addEventListener("change", (event) =>
      setDarkMode(event.matches),
    );
  }, []);
  return darkMode;
}
