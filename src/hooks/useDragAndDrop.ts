import React, { useCallback } from 'react';
import { useReactFlow, Node } from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import { Asset, NodeData } from '../types';

export function useDragAndDrop(
  nodes: Node[],
  setNodes: (nodes: Node[] | ((nds: Node[]) => Node[])) => void
) {
  const { screenToFlowPosition } = useReactFlow();

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

  return { onDrop };
}
