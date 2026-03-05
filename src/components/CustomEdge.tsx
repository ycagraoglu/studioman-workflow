import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, EdgeProps, useReactFlow } from '@xyflow/react';
import { Trash2 } from 'lucide-react';

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    setEdges((edges) => edges.filter((e) => e.id !== id));
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ ...style, strokeWidth: 1.5 }} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan flex items-center gap-1 opacity-0 hover:opacity-100 transition-opacity bg-white border border-gray-200 rounded-md shadow-sm p-1"
        >
          <button 
            className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors" 
            title="Sil"
            onClick={onEdgeClick}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
