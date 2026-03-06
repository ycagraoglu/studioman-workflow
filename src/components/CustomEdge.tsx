import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, EdgeProps, useReactFlow, Edge } from '@xyflow/react';
import { Trash2, Car, X } from 'lucide-react';
import { EdgeData } from '../types';
import { useDrawer } from '../contexts/DrawerContext';

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
  data,
}: EdgeProps<Edge<EdgeData, 'default'>>) {
  const { setEdges } = useReactFlow();
  const { openDrawer } = useDrawer();
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
          className="nodrag nopan flex items-center gap-2"
        >
          {data?.vehicle && (
            <div 
              className="bg-amber-100 border border-amber-200 rounded-md shadow-sm px-2 py-1 flex items-center gap-1 text-xs font-medium text-amber-800 group cursor-pointer hover:bg-amber-200 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                openDrawer('addAsset', id, true, 'vehicle');
              }}
            >
              <Car className="w-3 h-3" />
              {data.vehicle.name}
              <button
                className="ml-1 p-0.5 hover:bg-amber-300 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  setEdges((edges) =>
                    edges.map((edge) => {
                      if (edge.id === id) {
                        const { vehicle, ...restData } = edge.data || {};
                        return { ...edge, data: restData };
                      }
                      return edge;
                    })
                  );
                }}
                title="Aracı Kaldır"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <div className="opacity-0 hover:opacity-100 transition-opacity bg-white border border-gray-200 rounded-md shadow-sm p-1 flex items-center gap-1">
            <button 
              className="p-1 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors" 
              title="Araç Ata"
              onClick={(e) => {
                e.stopPropagation();
                openDrawer('addAsset', id, true, 'vehicle');
              }}
            >
              <Car className="w-4 h-4" />
            </button>
            <button 
              className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors" 
              title="Sil"
              onClick={onEdgeClick}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
