import { useState, useCallback, useEffect } from 'react';
import { Node, Edge, MarkerType } from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import { showErrorToast } from '../utils/toast';

export function useWorkflowApi(
  workflowId: string,
  nodes: Node[],
  edges: Edge[],
  setNodes: (nodes: Node[]) => void,
  setEdges: (edges: Edge[]) => void,
  setWorkflowName: (name: string) => void
) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/workflows/${workflowId}`)
      .then(res => res.json())
      .then(data => {
        setWorkflowName(data.name || 'İsimsiz İş Akışı');
        if (data.nodes && data.nodes.length > 0) {
          setNodes(data.nodes);
        } else {
          setNodes([{
            id: uuidv4(),
            type: 'addStep',
            position: { x: 0, y: 0 },
            data: {}
          }]);
        }
        setEdges((data.edges || []).map((edge: any) => ({
          ...edge,
          type: 'default',
          style: { stroke: '#737373', strokeWidth: 1.5 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: '#737373',
          }
        })));
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load workflow:', err);
        setIsLoading(false);
      });
  }, [workflowId, setNodes, setEdges, setWorkflowName]);

  const saveWorkflow = useCallback(async (currentName: string, silent = false) => {
    if (!workflowId) return;
    setIsSaving(true);
    try {
      await fetch(`/api/workflows/${workflowId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: currentName, nodes, edges })
      });
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
    } catch (err) {
      console.error('Failed to save workflow:', err);
      if (!silent) showErrorToast('Hata', 'Kaydetme başarısız oldu.');
    } finally {
      setIsSaving(false);
    }
  }, [workflowId, nodes, edges]);

  useEffect(() => {
    if (!isLoading) {
      setHasUnsavedChanges(true);
    }
  }, [nodes, edges, isLoading]);

  return {
    isLoading,
    isSaving,
    hasUnsavedChanges,
    lastSaved,
    saveWorkflow,
    setHasUnsavedChanges
  };
}
