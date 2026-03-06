import React from 'react';
import { Panel } from '@xyflow/react';
import { Plus, Search, Save, FileText, PanelRight, Loader2 } from 'lucide-react';

interface TopRightControlsProps {
  onAddNewNode: () => void;
  onSave: () => void;
  isSaving: boolean;
  onShowTemplateModal: () => void;
  onToggleDrawer: () => void;
  isDrawerOpen: boolean;
}

export const TopRightControls: React.FC<TopRightControlsProps> = ({
  onAddNewNode,
  onSave,
  isSaving,
  onShowTemplateModal,
  onToggleDrawer,
  isDrawerOpen,
}) => {
  return (
    <Panel position="top-right" className="flex flex-col gap-2 mt-4 mr-4">
      <button 
        onClick={onAddNewNode}
        className="w-10 h-10 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm flex items-center justify-center text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        title="Yeni İş Ekle"
      >
        <Plus className="w-5 h-5" />
      </button>
      <button 
        className="w-10 h-10 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm flex items-center justify-center text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        title="Ara"
      >
        <Search className="w-5 h-5" />
      </button>
      <button 
        onClick={onSave}
        disabled={isSaving}
        className="w-10 h-10 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm flex items-center justify-center text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
        title="İş Akışını Kaydet"
      >
        {isSaving ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <Save className="w-5 h-5" />}
      </button>
      <button 
        onClick={onShowTemplateModal}
        className="w-10 h-10 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm flex items-center justify-center text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        title="Şablon Olarak Kaydet"
      >
        <FileText className="w-5 h-5" />
      </button>
      <button 
        onClick={onToggleDrawer}
        className="w-10 h-10 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm flex items-center justify-center text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        title={isDrawerOpen ? "Paneli Kapat" : "Paneli Aç"}
      >
        <PanelRight className="w-5 h-5" />
      </button>
    </Panel>
  );
};
