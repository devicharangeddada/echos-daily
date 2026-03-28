import { createContext, useContext, useState, type ReactNode } from "react";

interface NavigationState {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const NavigationContext = createContext<NavigationState | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState("today");

  return (
    <NavigationContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigationState() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigationState must be used within a NavigationProvider");
  }
  return context;
}
