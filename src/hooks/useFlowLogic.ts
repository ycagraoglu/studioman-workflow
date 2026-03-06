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
import dagre from 'dagre';
import { Asset, NodeData } from '../types';
import { showSuccessToast, showErrorToast } from '../utils/toast';

export function useFlowLogic(workflowId: string) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const lastAddStepNodeIdRef = useRef<string | null>(null);

  const { screenToFlowPosition, zoomIn, zoomOut, fitView } = useReactFlow();

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

  useEffect(() => {
    if (nodes.length === 1 && nodes[0].type === 'addStep') {
      const currentNodeId = nodes[0].id;
      if (currentNodeId !== lastAddStepNodeIdRef.current) {
        fitView({ duration: 800, maxZoom: 1, minZoom: 1 });
        lastAddStepNodeIdRef.current = currentNodeId;
      }
    }
  }, [nodes, fitView]);

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
        setEdges((data.edges || []).map(edge => ({
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
  }, [workflowId, setNodes, setEdges]);

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

  const onSave = useCallback(async (silent = false) => {
    if (!workflowId) return;
    setIsSaving(true);
    try {
      await fetch(`/api/workflows/${workflowId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges })
      });
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

  useEffect(() => {
    if (isLoading || !hasUnsavedChanges) return;
    const timer = setTimeout(() => {
      onSave(true).then(() => {
        setHasUnsavedChanges(false);
        setLastSaved(new Date());
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, [nodes, edges, hasUnsavedChanges, isLoading, onSave]);

  const onLayout = useCallback(() => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    const nodeWidth = 256;
    const nodeHeight = 150;
    dagreGraph.setGraph({ rankdir: 'LR', nodesep: 100, ranksep: 200 });
    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });
    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });
    dagre.layout(dagreGraph);
    const newNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - nodeWidth / 2,
          y: nodeWithPosition.y - nodeHeight / 2,
        },
      };
    });
    setNodes(newNodes);
    window.requestAnimationFrame(() => {
      fitView({ duration: 800, maxZoom: 1 });
    });
  }, [nodes, edges, setNodes, fitView]);

  const onDuplicate = useCallback(() => {
    const selectedNodes = nodes.filter(n => n.selected);
    if (selectedNodes.length === 0) return;
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    const idMap = new Map<string, string>();
    selectedNodes.forEach(node => {
      const newId = uuidv4();
      idMap.set(node.id, newId);
      newNodes.push({
        ...node,
        id: newId,
        position: {
          x: node.position.x + 50,
          y: node.position.y + 50,
        },
        selected: false,
      });
    });
    edges.forEach(edge => {
      if (idMap.has(edge.source) && idMap.has(edge.target)) {
        newEdges.push({
          ...edge,
          id: `e-${idMap.get(edge.source)}-${idMap.get(edge.target)}`,
          source: idMap.get(edge.source)!,
          target: idMap.get(edge.target)!,
          selected: false,
        });
      }
    });
    setNodes(nds => [...nds.map(n => ({ ...n, selected: false })), ...newNodes]);
    setEdges(eds => [...eds.map(e => ({ ...e, selected: false })), ...newEdges]);
  }, [nodes, edges, setNodes, setEdges]);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      const assetDataStr = event.dataTransfer.getData('application/asset');
      if (type === 'asset' && assetDataStr) {
        const asset: Asset = JSON.parse(assetDataStr);
        const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
        const targetNode = nodes.find((n) => {
          const nx = n.position.x;
          const ny = n.position.y;
          const nw = n.measured?.width || 256;
          const nh = n.measured?.height || 150;
          return position.x >= nx && position.x <= nx + nw && position.y >= ny && position.y <= ny + nh;
        });
        if (targetNode) {
          setNodes((nds) =>
            nds.map((node) => {
              if (node.id === targetNode.id) {
                const exists = (node.data as NodeData).assets.some(a => a.id === asset.id);
                if (!exists) {
                  return {
                    ...node,
                    data: { ...node.data, assets: [...(node.data as NodeData).assets, asset] },
                  };
                }
              }
              return node;
            })
          );
        }
        return;
      }
      if (type === 'workstation') {
        const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
        const newNode: Node = {
          id: uuidv4(),
          type: 'workstation',
          position,
          data: { title: 'Yeni İş', startTime: '09:00', endTime: '10:00', date: new Date().toISOString().split('T')[0], assets: [] },
        };
        setNodes((nds) => {
          const filteredNodes = nds.filter(n => n.type !== 'addStep');
          return [...filteredNodes, newNode];
        });
      }
    },
    [screenToFlowPosition, nodes, setNodes]
  );

  return {
    nodes, setNodes, onNodesChange,
    edges, setEdges, onEdgesChange,
    isLoading, isSaving, workflowName,
    hasUnsavedChanges, lastSaved,
    onConnect, onSave, onLayout, onDuplicate, onDrop
  };
}
