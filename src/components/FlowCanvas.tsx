import React, { useState, useCallback } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import CustomNode from './CustomNode';
import AddStepNode from './AddStepNode';
import RightDrawer from './RightDrawer';
import CustomEdge from './CustomEdge';
import { Loader2 } from 'lucide-react';
import { useDrawer } from '../contexts/DrawerContext';
import { useFlowLogic } from '../hooks/useFlowLogic';
import { useTemplates } from '../hooks/useTemplates';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { FlowControls } from './Flow/FlowControls';
import { FlowModals } from './Flow/FlowModals';
import { CustomMiniMap } from './Flow/CustomMiniMap';

const nodeTypes = {
  workstation: CustomNode,
  addStep: AddStepNode,
};

const edgeTypes = {
  default: CustomEdge,
};

interface FlowProps {
  workflowId: string;
  onBack: () => void;
}

function Flow({ workflowId, onBack }: FlowProps) {
  const {
    nodes, setNodes, onNodesChange,
    edges, setEdges, onEdgesChange,
    isLoading, isSaving, workflowName, setWorkflowName,
    hasUnsavedChanges,
    onConnect, onSave, onLayout, onDuplicate, onDrop
  } = useFlowLogic(workflowId);

  const { openDrawer, isOpen, closeDrawer } = useDrawer();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(true);

  const {
    showTemplateModal,
    setShowTemplateModal,
    templateName,
    setTemplateName,
    handleSaveTemplate
  } = useTemplates(nodes, edges);

  useKeyboardShortcuts(onDuplicate);

  const confirmClear = useCallback(() => {
    setNodes([{
      id: uuidv4(),
      type: 'addStep',
      position: { x: 0, y: 0 },
      data: {}
    }]);
    setEdges([]);
    setShowClearConfirm(false);
  }, [setNodes, setEdges]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleAddNewNode = () => {
    const addStepNode = nodes.find(n => n.type === 'addStep');
    if (addStepNode) {
      openDrawer('addNode', addStepNode.id);
    } else if (nodes.length > 0) {
      const rightmostNode = nodes.reduce((prev, current) => {
        return (prev.position.x > current.position.x) ? prev : current;
      });
      openDrawer('addNode', rightmostNode.id);
    } else {
      const id = uuidv4();
      setNodes(nds => [...nds, {
        id,
        type: 'addStep',
        position: { x: 0, y: 0 },
        data: {}
      }]);
      openDrawer('addNode', id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-grow h-full flex items-center justify-center bg-gray-50 dark:bg-slate-800">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-grow h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ maxZoom: 1, minZoom: 0.1 }}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        className="bg-gray-100 dark:bg-slate-800"
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={24} 
          size={1.5} 
          color="#9ca3af" 
          bgColor="transparent"
        />
        
        <CustomMiniMap showMiniMap={showMiniMap} />

        <FlowControls 
          onBack={onBack}
          workflowName={workflowName}
          onWorkflowNameChange={setWorkflowName}
          isSaving={isSaving}
          hasUnsavedChanges={hasUnsavedChanges}
          showMiniMap={showMiniMap}
          onToggleMiniMap={() => setShowMiniMap(!showMiniMap)}
          onLayout={onLayout}
          onDuplicate={onDuplicate}
          onClear={() => setShowClearConfirm(true)}
          onSave={() => onSave()}
          onShowTemplateModal={() => setShowTemplateModal(true)}
          isDrawerOpen={isOpen}
          onToggleDrawer={() => isOpen ? closeDrawer() : openDrawer('addNode', nodes[0]?.id || '')}
          onAddNewNode={handleAddNewNode}
        />
      </ReactFlow>
      
      <FlowModals 
        showClearConfirm={showClearConfirm}
        onCloseClearConfirm={() => setShowClearConfirm(false)}
        onConfirmClear={confirmClear}
        showTemplateModal={showTemplateModal}
        onCloseTemplateModal={() => setShowTemplateModal(false)}
        templateName={templateName}
        onTemplateNameChange={setTemplateName}
        onSaveTemplate={handleSaveTemplate}
      />

      <RightDrawer />
    </div>
  );
}

export default function FlowCanvas({ workflowId, onBack }: FlowProps) {
  return (
    <ReactFlowProvider>
      <Flow workflowId={workflowId} onBack={onBack} />
    </ReactFlowProvider>
  );
}
