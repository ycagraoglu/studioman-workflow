import React from 'react';
import { Panel } from '@xyflow/react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { WorkflowNameEditor } from '../WorkflowNameEditor';

interface TopLeftControlsProps {
  onBack: () => void;
  workflowName: string;
  onWorkflowNameChange: (name: string) => void;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
}

export const TopLeftControls: React.FC<TopLeftControlsProps> = ({
  onBack,
  workflowName,
  onWorkflowNameChange,
  isSaving,
  hasUnsavedChanges,
}) => {
  return (
    <Panel position="top-left" className="flex items-center gap-3 mt-4" style={{ left: '160px' }}>
      <button 
        onClick={onBack} 
        className="w-10 h-10 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm flex items-center justify-center text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        title="İş Akışlarına Dön"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      
      <WorkflowNameEditor 
        workflowName={workflowName} 
        onWorkflowNameChange={onWorkflowNameChange} 
      />

      { (isSaving || hasUnsavedChanges) && (
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm px-3 py-2 flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
          {isSaving ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin text-primary" />
              <span className="hidden min-[450px]:inline">Kaydediliyor...</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="hidden min-[450px]:inline">Kaydedilmemiş</span>
            </>
          )}
        </div>
      )}
    </Panel>
  );
};
