import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  useReactFlow, 
  Node, 
  Edge, 
  useEdgesState, 
  applyNodeChanges, 
  NodeChange, 
  Connection, 
  addEdge, 
  MarkerType 
} from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import { useWorkflowApi } from './useWorkflowApi';
import { useGraphOperations } from './useGraphOperations';
import { useDragAndDrop } from './useDragAndDrop';

export function useFlowLogic(workflowId: string) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [workflowName, setWorkflowName] = useState('');
  const lastAddStepNodeIdRef = useRef<string | null>(null);

  const { fitView } = useReactFlow();

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => {
      const nextNodes = applyNodeChanges(changes, nds);
      if (nextNodes.length === 0) {
        return [{
          id: uuidv4(),
          type: 'addStep',
          position: { x: 0, y: 0 },
          data: {}
        }];
      }
      return nextNodes;
    });
  }, []);

  const {
    isLoading,
    isSaving,
    hasUnsavedChanges,
    lastSaved,
    agreementId,
    saveWorkflow,
    setHasUnsavedChanges
  } = useWorkflowApi(workflowId, nodes, edges, setNodes, setEdges, setWorkflowName);

  const { onLayout, onDuplicate } = useGraphOperations(nodes, edges, setNodes, setEdges);
  const { onDrop } = useDragAndDrop(nodes, setNodes);

  useEffect(() => {
    if (nodes.length === 1 && nodes[0].type === 'addStep') {
      const currentNodeId = nodes[0].id;
      if (currentNodeId !== lastAddStepNodeIdRef.current) {
        fitView({ duration: 800, maxZoom: 1, minZoom: 1 });
        lastAddStepNodeIdRef.current = currentNodeId;
      }
    }
  }, [nodes, fitView]);

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      const edge = { 
        ...params, 
        type: 'default',
        animated: false, 
        style: { stroke: '#737373', strokeWidth: 1.5 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#737373',
        },
      } as Edge;
      setEdges((eds) => addEdge(edge, eds));

      setNodes((nds) => {
         const sourceNode = nds.find(n => n.id === params.source);
         const targetNode = nds.find(n => n.id === params.target);
         
         if (sourceNode && targetNode && sourceNode.data.endTime) {
             const newStartTime = sourceNode.data.endTime as string;
             const [h, m] = newStartTime.split(':').map(Number);
             const startMins = h * 60 + m;
             const endMins = startMins + 30;
             const endH = Math.floor(endMins / 60) % 24;
             const endM = endMins % 60;
             const newEndTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
             
             return nds.map(n => {
                 if (n.id === targetNode.id) {
                     return {
                         ...n,
                         data: {
                             ...n.data,
                             startTime: newStartTime,
                             endTime: newEndTime,
                             date: sourceNode.data.date
                         }
                     };
                 }
                 return n;
             });
         }
         return nds;
      });
    },
    [setEdges, setNodes]
  );

  const onSave = useCallback((silent = false) => {
    return saveWorkflow(workflowName, silent);
  }, [saveWorkflow, workflowName]);

  useEffect(() => {
    if (isLoading || !hasUnsavedChanges) return;
    const timer = setTimeout(() => {
      onSave(true).then(() => {
        setHasUnsavedChanges(false);
        // setLastSaved is handled in useWorkflowApi
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, [nodes, edges, workflowName, hasUnsavedChanges, isLoading, onSave, setHasUnsavedChanges]);

  return {
    nodes, setNodes, onNodesChange,
    edges, setEdges, onEdgesChange,
    isLoading, isSaving, workflowName, setWorkflowName,
    hasUnsavedChanges, lastSaved, agreementId,
    onConnect, onSave, onLayout, onDuplicate, onDrop
  };
}
