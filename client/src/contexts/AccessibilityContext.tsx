import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type AccessibilityMode = "default" | "neurodivergent" | "eco" | "no-blue-light";

type AccessibilityContextType = {
  mode: AccessibilityMode;
  setMode: (mode: AccessibilityMode) => void;
};

const AccessibilityContext = createContext<AccessibilityContextType>({
  mode: "default",
  setMode: () => {},
});

const MODE_CLASSES: Record<AccessibilityMode, string> = {
  default: "",
  neurodivergent: "neuro-mode",
  eco: "eco-mode",
  "no-blue-light": "no-blue-light-mode",
};

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AccessibilityMode>(() => {
    const saved = localStorage.getItem("a11y-mode");
    return (saved as AccessibilityMode) || "default";
  });

  useEffect(() => {
    localStorage.setItem("a11y-mode", mode);
    const html = document.documentElement;
    // Remove all mode classes
    Object.values(MODE_CLASSES).forEach(cls => {
      if (cls) html.classList.remove(cls);
    });
    // Add current mode class
    const cls = MODE_CLASSES[mode];
    if (cls) html.classList.add(cls);
  }, [mode]);

  return (
    <AccessibilityContext.Provider value={{ mode, setMode }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}
