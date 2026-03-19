import { useState, useEffect } from "react";

export type ViewMode = "table" | "list";

export function useViewMode(defaultMode: ViewMode = "table") {
  const [view, setView] = useState<ViewMode>("table");

  useEffect(() => {
    const savedView = localStorage.getItem("app-view-mode") as ViewMode | null;

    if (savedView) {
      setView(savedView);
    } else {
      // Determine device type
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      setView(isMobile ? "list" : defaultMode);
    }
  }, [defaultMode]);

  const changeView = (newView: ViewMode) => {
    setView(newView);
    localStorage.setItem("app-view-mode", newView);
  };

  return { view, setView: changeView };
}
