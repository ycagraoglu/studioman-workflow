import React, { createContext, useContext, useState } from 'react';

export type DrawerMode = 'addNode' | 'addAsset' | null;

interface DrawerContextType {
  isOpen: boolean;
  mode: DrawerMode;
  targetNodeId: string | null;
  openDrawer: (mode: DrawerMode, nodeId: string) => void;
  closeDrawer: () => void;
}

const DrawerContext = createContext<DrawerContextType | null>(null);

export function DrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<DrawerMode>(null);
  const [targetNodeId, setTargetNodeId] = useState<string | null>(null);

  const openDrawer = (newMode: DrawerMode, nodeId: string) => {
    setMode(newMode);
    setTargetNodeId(nodeId);
    setIsOpen(true);
  };

  const closeDrawer = () => {
    setIsOpen(false);
    setTimeout(() => {
      setMode(null);
      setTargetNodeId(null);
    }, 300); // Wait for transition
  };

  return (
    <DrawerContext.Provider value={{ isOpen, mode, targetNodeId, openDrawer, closeDrawer }}>
      {children}
    </DrawerContext.Provider>
  );
}

export const useDrawer = () => {
  const context = useContext(DrawerContext);
  if (!context) throw new Error('useDrawer must be used within DrawerProvider');
  return context;
};
