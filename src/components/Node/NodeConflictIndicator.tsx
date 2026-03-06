import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface NodeConflictIndicatorProps {
  conflicts: string[];
}

export const NodeConflictIndicator: React.FC<NodeConflictIndicatorProps> = ({ conflicts }) => {
  if (conflicts.length === 0) return null;

  return (
    <div className="absolute -top-3 right-2 z-20 group/conflict">
      <div className="bg-red-500 text-white p-1 rounded-full shadow-md animate-pulse">
        <AlertTriangle className="w-4 h-4" />
      </div>
      <div className="absolute top-full right-0 mt-1 w-48 bg-red-600 text-white text-xs p-2 rounded shadow-lg opacity-0 group-hover/conflict:opacity-100 transition-opacity pointer-events-none z-30">
        {conflicts.map((conflict, i) => (
          <div key={i} className="mb-1 last:mb-0">{conflict}</div>
        ))}
      </div>
    </div>
  );
};
