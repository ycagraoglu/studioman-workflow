import React from 'react';
import { TopLeftControls } from './Controls/TopLeftControls';
import { BottomLeftControls } from './Controls/BottomLeftControls';
import { TopRightControls } from './Controls/TopRightControls';

interface FlowControlsProps {
  onBack: () => void;
  workflowName: string;
  onWorkflowNameChange: (name: string) => void;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  showMiniMap: boolean;
  onToggleMiniMap: () => void;
  onLayout: () => void;
  onDuplicate: () => void;
  onClear: () => void;
  onSave: () => void;
  onShowTemplateModal: () => void;
  isDrawerOpen: boolean;
  onToggleDrawer: () => void;
  onAddNewNode: () => void;
}

export const FlowControls: React.FC<FlowControlsProps> = ({
  onBack,
  workflowName,
  onWorkflowNameChange,
  isSaving,
  hasUnsavedChanges,
  showMiniMap,
  onToggleMiniMap,
  onLayout,
  onDuplicate,
  onClear,
  onSave,
  onShowTemplateModal,
  isDrawerOpen,
  onToggleDrawer,
  onAddNewNode
}) => {
  return (
    <>
      <TopLeftControls 
        onBack={onBack}
        workflowName={workflowName}
        onWorkflowNameChange={onWorkflowNameChange}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      <BottomLeftControls 
        showMiniMap={showMiniMap}
        onToggleMiniMap={onToggleMiniMap}
        onLayout={onLayout}
        onDuplicate={onDuplicate}
        onClear={onClear}
      />

      <TopRightControls 
        onAddNewNode={onAddNewNode}
        onSave={onSave}
        isSaving={isSaving}
        onShowTemplateModal={onShowTemplateModal}
        onToggleDrawer={onToggleDrawer}
        isDrawerOpen={isDrawerOpen}
      />
    </>
  );
};
