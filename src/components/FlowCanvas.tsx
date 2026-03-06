import React, { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  MiniMap,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import CustomNode from './CustomNode';
import AddStepNode from './AddStepNode';
import RightDrawer from './RightDrawer';
import CustomEdge from './CustomEdge';
import { Loader2 } from 'lucide-react';
import { useDrawer } from '../contexts/DrawerContext';
import { showSuccessToast } from '../utils/toast';
import { useFlowLogic } from '../hooks/useFlowLogic';
import { FlowControls } from './Flow/FlowControls';
import { FlowModals } from './Flow/FlowModals';

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
    isLoading, isSaving, workflowName,
    hasUnsavedChanges,
    onConnect, onSave, onLayout, onDuplicate, onDrop
  } = useFlowLogic(workflowId);

  const { openDrawer, isOpen, closeDrawer } = useDrawer();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [showMiniMap, setShowMiniMap] = useState(true);

  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;
    const templates = JSON.parse(localStorage.getItem('workflowTemplates') || '[]');
    templates.push({
      id: uuidv4(),
      name: templateName,
      nodes,
      edges,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('workflowTemplates', JSON.stringify(templates));
    setShowTemplateModal(false);
    setTemplateName('');
    showSuccessToast('Başarılı', 'Şablon başarıyla kaydedildi!');
  };

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

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        onDuplicate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onDuplicate]);

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
      <div className="flex-grow h-full flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
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
        className="bg-gray-100"
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={24} 
          size={1.5} 
          color="#9ca3af" 
          bgColor="#f3f4f6"
        />
        
        {showMiniMap && (
          <MiniMap 
            className="bg-white border border-gray-200 rounded-lg shadow-sm !bottom-4 !right-4"
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
        )}

        <FlowControls 
          onBack={onBack}
          workflowName={workflowName}
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
