import React from 'react';
import { NodeProps } from '@xyflow/react';
import { Plus } from 'lucide-react';
import { useDrawer } from '../contexts/DrawerContext';

export default function AddStepNode({ id }: NodeProps) {
  const { openDrawer } = useDrawer();

  return (
    <div 
      onClick={() => openDrawer('addNode', id)}
      className="flex flex-col items-center justify-center cursor-pointer group p-2"
    >
      <div className="w-24 h-24 border-2 border-dashed border-gray-400 dark:border-slate-600 rounded-xl flex items-center justify-center bg-transparent group-hover:bg-gray-50 dark:group-hover:bg-slate-700 transition-colors">
        <Plus className="w-10 h-10 text-gray-500 dark:text-slate-400" />
      </div>
      <span className="mt-3 text-sm font-medium text-gray-800 dark:text-slate-200">İlk adımı ekle...</span>
    </div>
  );
}
