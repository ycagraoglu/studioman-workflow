import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  Background,
  BackgroundVariant,
  Connection,
  Edge,
  Node,
  useReactFlow,
  Panel,
  applyNodeChanges,
  NodeChange,
  MarkerType,
  MiniMap,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import CustomNode from './CustomNode';
import AddStepNode from './AddStepNode';
import RightDrawer from './RightDrawer';
import CustomEdge from './CustomEdge';
import { Asset, NodeData } from '../types';
import { Save, PlayCircle, Loader2, Maximize, ZoomIn, ZoomOut, Eraser, Plus, Search, FileText, PanelRight, ArrowLeft, RotateCcw, Check, LayoutGrid, Copy, Map } from 'lucide-react';
import dagre from 'dagre';
import { useDrawer } from '../contexts/DrawerContext';
import { showSuccessToast, showErrorToast } from '../utils/toast';

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
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

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
  const { screenToFlowPosition, zoomIn, zoomOut, fitView } = useReactFlow();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const { openDrawer, isOpen, closeDrawer } = useDrawer();
  const lastAddStepNodeIdRef = useRef<string | null>(null);

  // Auto-fit view when resetting to empty state (single addStep node)
  useEffect(() => {
    if (nodes.length === 1 && nodes[0].type === 'addStep') {
      const currentNodeId = nodes[0].id;
      // If the ID is different from the last one we saw, it's a new spawn (or initial load)
      if (currentNodeId !== lastAddStepNodeIdRef.current) {
        // User requested: don't do unnecessary zoom, just center.
        // Using maxZoom: 1 and minZoom: 1 ensures we return to 100% zoom level while centering.
        fitView({ duration: 800, maxZoom: 1, minZoom: 1 });
        lastAddStepNodeIdRef.current = currentNodeId;
      }
    }
  }, [nodes, fitView]);

  useEffect(() => {
    // Load the specific workflow
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

      // Auto-update target node time based on source node
      setNodes((nds) => {
         const sourceNode = nds.find(n => n.id === params.source);
         const targetNode = nds.find(n => n.id === params.target);
         
         if (sourceNode && targetNode && sourceNode.data.endTime) {
             const newStartTime = sourceNode.data.endTime as string;
             // Set 30 mins duration
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
                             date: sourceNode.data.date // Sync date too
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

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const assetDataStr = event.dataTransfer.getData('application/asset');

      // Check if it's an asset or a new node
      if (type === 'asset' && assetDataStr) {
        const asset: Asset = JSON.parse(assetDataStr);
        
        // Find which node we dropped on
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        const targetNode = nodes.find((n) => {
          const nx = n.position.x;
          const ny = n.position.y;
          const nw = n.measured?.width || 256; // default width
          const nh = n.measured?.height || 150; // default height
          return position.x >= nx && position.x <= nx + nw && position.y >= ny && position.y <= ny + nh;
        });

        if (targetNode) {
          setNodes((nds) =>
            nds.map((node) => {
              if (node.id === targetNode.id) {
                // Check if asset already exists
                const exists = (node.data as NodeData).assets.some(a => a.id === asset.id);
                if (!exists) {
                  return {
                    ...node,
                    data: {
                      ...node.data,
                      assets: [...(node.data as NodeData).assets, asset],
                    },
                  };
                }
              }
              return node;
            })
          );
        }
        return;
      }

      // If it's a new workstation node
      if (type === 'workstation') {
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

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

  const onSave = useCallback(async (silent = false) => {
    if (!workflowId) return;
    setIsSaving(true);
    try {
      await fetch(`/api/workflows/${workflowId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges })
      });
      // Optional: show success toast
    } catch (err) {
      console.error('Failed to save workflow:', err);
      if (!silent) showErrorToast('Hata', 'Kaydetme başarısız oldu.');
    } finally {
      setIsSaving(false);
    }
  }, [workflowId, nodes, edges]);

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Track changes
  useEffect(() => {
    if (!isLoading) {
      setHasUnsavedChanges(true);
    }
  }, [nodes, edges, isLoading]);

  // Auto-save
  useEffect(() => {
    if (isLoading || !hasUnsavedChanges) return;

    const timer = setTimeout(() => {
      onSave(true).then(() => {
        setHasUnsavedChanges(false);
        setLastSaved(new Date());
      });
    }, 2000); // Save 2 seconds after last change

    return () => clearTimeout(timer);
  }, [nodes, edges, hasUnsavedChanges, isLoading, onSave]);

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

  const handleClear = useCallback(() => {
    setShowClearConfirm(true);
  }, []);

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

  const cancelClear = useCallback(() => {
    setShowClearConfirm(false);
  }, []);

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

    // Duplicate nodes
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

    // Duplicate edges between selected nodes
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

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+D or Cmd+D for duplicate
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        onDuplicate();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onDuplicate]);

  if (isLoading) {
    return (
      <div className="flex-grow h-full flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-grow h-full relative" ref={reactFlowWrapper}>
      {showClearConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tümünü Temizle</h3>
            <p className="text-sm text-gray-500 mb-6">
              Çalışma alanındaki tüm iş adımlarını ve bağlantıları silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={cancelClear}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                İptal
              </button>
              <button
                onClick={confirmClear}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                Evet, Temizle
              </button>
            </div>
          </div>
        </div>
      )}

      {showTemplateModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Şablon Olarak Kaydet</h3>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Şablon Adı</label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTemplate();
                  if (e.key === 'Escape') setShowTemplateModal(false);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Örn: Standart Çekim Akışı"
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleSaveTemplate}
                disabled={!templateName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors disabled:opacity-50"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

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

        {/* Top Left Controls */}
        <Panel position="top-left" className="flex items-center gap-3 mt-4 ml-4">
          <button 
            onClick={onBack} 
            className="w-10 h-10 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            title="İş Akışlarına Dön"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm px-4 py-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-500" />
            <span className="font-semibold text-gray-800">{workflowName}</span>
          </div>
          { (isSaving || hasUnsavedChanges) && (
            <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm px-3 py-2 flex items-center gap-2 text-xs text-gray-500">
              {isSaving ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Kaydedilmemiş değişiklikler</span>
                </>
              )}
            </div>
          )}
        </Panel>

        {/* Bottom Left Controls */}
        <Panel position="bottom-left" className="flex gap-2 mb-4 ml-4">
          <button 
            onClick={() => setShowMiniMap(!showMiniMap)} 
            className={`w-10 h-10 border rounded-lg shadow-sm flex items-center justify-center transition-colors ${
              showMiniMap 
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100' 
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
            title={showMiniMap ? "Haritayı Gizle" : "Haritayı Göster"}
          >
            <Map className="w-5 h-5" />
          </button>
          <div className="w-px h-10 bg-gray-200 mx-1" />
          <button 
            onClick={onLayout} 
            className="w-10 h-10 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-center text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
            title="Otomatik Düzenle"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button 
            onClick={onDuplicate} 
            className="w-10 h-10 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            title="Seçili Olanları Çoğalt"
          >
            <Copy className="w-5 h-5" />
          </button>
          <div className="w-px h-10 bg-gray-200 mx-1" />
          <button 
            onClick={() => fitView({ duration: 800 })} 
            className="w-10 h-10 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            title="Ekrana Sığdır"
          >
            <Maximize className="w-5 h-5" />
          </button>
          <button 
            onClick={() => zoomIn({ duration: 800 })} 
            className="w-10 h-10 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            title="Yakınlaştır"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button 
            onClick={() => zoomOut({ duration: 800 })} 
            className="w-10 h-10 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            title="Uzaklaştır"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button 
            onClick={() => fitView({ duration: 800, padding: 0.2, minZoom: 1, maxZoom: 1 })} 
            className="w-10 h-10 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            title="Yakınlaştırmayı Sıfırla (100%)"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button 
            onClick={handleClear} 
            className="w-10 h-10 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            title="Tümünü Temizle"
          >
            <Eraser className="w-5 h-5" />
          </button>
        </Panel>

        {/* Top Right Controls */}
        <Panel position="top-right" className="flex flex-col gap-2 mt-4 mr-4">
          <button 
            onClick={() => {
              const addStepNode = nodes.find(n => n.type === 'addStep');
              if (addStepNode) {
                openDrawer('addNode', addStepNode.id);
              } else if (nodes.length > 0) {
                // If there are nodes, find the rightmost one
                const rightmostNode = nodes.reduce((prev, current) => {
                  return (prev.position.x > current.position.x) ? prev : current;
                });
                openDrawer('addNode', rightmostNode.id);
              } else {
                // Create a new addStep node in center
                const id = uuidv4();
                setNodes(nds => [...nds, {
                  id,
                  type: 'addStep',
                  position: { x: 0, y: 0 },
                  data: {}
                }]);
                openDrawer('addNode', id);
              }
            }}
            className="w-10 h-10 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            title="Yeni İş Ekle"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button 
            onClick={() => {
              const centerNode = nodes.find(n => n.type === 'addStep');
              if (centerNode) openDrawer('addNode', centerNode.id);
            }}
            className="w-10 h-10 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            title="Ara"
          >
            <Search className="w-5 h-5" />
          </button>
          <button 
            onClick={onSave}
            disabled={isSaving}
            className="w-10 h-10 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50"
            title="İş Akışını Kaydet"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          </button>
          <button 
            onClick={() => setShowTemplateModal(true)}
            className="w-10 h-10 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            title="Şablon Olarak Kaydet"
          >
            <FileText className="w-5 h-5" />
          </button>
          <button 
            onClick={() => isOpen ? closeDrawer() : openDrawer('addNode', nodes[0]?.id || '')}
            className="w-10 h-10 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            title={isOpen ? "Paneli Kapat" : "Paneli Aç"}
          >
            <PanelRight className="w-5 h-5" />
          </button>
        </Panel>
      </ReactFlow>
      
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
