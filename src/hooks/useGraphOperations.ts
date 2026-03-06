import { useCallback } from 'react';
import { Node, Edge, useReactFlow } from '@xyflow/react';
import dagre from 'dagre';
import { v4 as uuidv4 } from 'uuid';

export function useGraphOperations(
  nodes: Node[],
  edges: Edge[],
  setNodes: (nodes: Node[] | ((nds: Node[]) => Node[])) => void,
  setEdges: (edges: Edge[] | ((eds: Edge[]) => Edge[])) => void
) {
  const { fitView } = useReactFlow();

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

  return {
    onLayout,
    onDuplicate
  };
}
