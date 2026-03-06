import React from 'react';
import { MiniMap } from '@xyflow/react';

interface CustomMiniMapProps {
  showMiniMap: boolean;
}

export const CustomMiniMap: React.FC<CustomMiniMapProps> = ({ showMiniMap }) => {
  if (!showMiniMap) return null;

  return (
    <MiniMap 
      className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm !bottom-4 !right-4"
      nodeColor={(node) => {
        if (node.type === 'addStep') return '#e5e7eb';
        const color = node.data?.color as string;
        if (color?.includes('blue')) return '#bfdbfe';
        if (color?.includes('emerald')) return '#a7f3d0';
        if (color?.includes('amber')) return '#fde68a';
        if (color?.includes('purple')) return '#e9d5ff';
        if (color?.includes('pink')) return '#fbcfe8';
        if (color?.includes('rose')) return '#fecdd3';
        return '#f3f4f6';
      }}
      maskColor="rgba(243, 244, 246, 0.6)"
    />
  );
};
