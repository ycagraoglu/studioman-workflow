import React, { createContext, useContext, useState } from 'react';
import { AssetCategory } from '../types';

export type DrawerMode = 'addNode' | 'addAsset' | null;

interface DrawerContextType {
  isOpen: boolean;
  mode: DrawerMode;
  targetNodeId: string | null;
  targetEdgeId: string | null;
  initialCategory?: AssetCategory;
  openDrawer: (mode: DrawerMode, id: string, isEdge?: boolean, category?: AssetCategory) => void;
  closeDrawer: () => void;
}

const DrawerContext = createContext<DrawerContextType | null>(null);

export function DrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<DrawerMode>(null);
  const [targetNodeId, setTargetNodeId] = useState<string | null>(null);
  const [targetEdgeId, setTargetEdgeId] = useState<string | null>(null);
  const [initialCategory, setInitialCategory] = useState<AssetCategory>(null);

  const openDrawer = (newMode: DrawerMode, id: string, isEdge = false, category: AssetCategory = null) => {
    setMode(newMode);
    setInitialCategory(category);
    if (isEdge) {
      setTargetEdgeId(id);
      setTargetNodeId(null);
    } else {
      setTargetNodeId(id);
      setTargetEdgeId(null);
    }
    setIsOpen(true);
  };

  const closeDrawer = () => {
    setIsOpen(false);
    setTimeout(() => {
      setMode(null);
      setTargetNodeId(null);
      setTargetEdgeId(null);
      setInitialCategory(null);
    }, 300); // Wait for transition
  };

  return (
    <DrawerContext.Provider value={{ isOpen, mode, targetNodeId, targetEdgeId, initialCategory, openDrawer, closeDrawer }}>
      {children}
    </DrawerContext.Provider>
  );
}

export const useDrawer = () => {
  const context = useContext(DrawerContext);
  if (!context) throw new Error('useDrawer must be used within DrawerProvider');
  return context;
};
