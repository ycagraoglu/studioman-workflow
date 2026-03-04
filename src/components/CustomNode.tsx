import React, { useState, useCallback } from 'react';
import { Handle, Position, NodeProps, useReactFlow, Node } from '@xyflow/react';
import { NodeData, Asset } from '../types';
import { MapPin, User, Camera, X, Clock, Edit2, Check, Trash2, Plus, Play, Power, MoreHorizontal } from 'lucide-react';
import { cn } from '../utils/cn';
import { useDrawer } from '../contexts/DrawerContext';
import TimePicker from './TimePicker';
import DatePicker from './DatePicker';
import { showConflictToast, showValidationErrorToast } from '../utils/toast';

export type WorkstationNode = Node<NodeData & { isActive?: boolean }, 'workstation'>;

export default function CustomNode({ data, id, isConnectable, selected }: NodeProps<WorkstationNode>) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { setNodes, getNodes, setEdges } = useReactFlow();
  const { openDrawer } = useDrawer();
  const isActive = data.isActive !== false; // Default to true if undefined

  // Helper to convert HH:mm to minutes
  const timeToMinutes = (timeStr: string) => {
    const [hours, minutes] = (timeStr || '00:00').split(':').map(Number);
    return hours * 60 + (minutes || 0);
  };

  const checkOverlap = (start1: string, end1: string, start2: string, end2: string) => {
    const s1 = timeToMinutes(start1);
    const e1 = timeToMinutes(end1);
    const s2 = timeToMinutes(start2);
    const e2 = timeToMinutes(end2);
    return s1 < e2 && s2 < e1;
  };

  // Check for conflicts: if any asset in this node is also present in another node with overlapping time AND same date
  const nodes = getNodes();
  const hasConflict = data.assets.some(asset => {
    if (asset.type === 'location') return false; // Maybe locations don't conflict, or maybe they do. Let's assume personnel and equipment conflict.
    
    // Find other nodes that have overlapping time and the same asset
    return nodes.some(otherNode => {
      if (otherNode.id === id) return false; // Skip self
      if (otherNode.data.date !== data.date) return false; // Only conflict if same date
      if (!checkOverlap(data.startTime, data.endTime, otherNode.data.startTime as string, otherNode.data.endTime as string)) return false;
      
      const otherAssets = (otherNode.data.assets as Asset[]) || [];
      return otherAssets.some(a => a.id === asset.id);
    });
  });

  const checkConflictForChange = (newStartTime: string, newEndTime: string, newDate?: string) => {
    const dateToCheck = newDate || data.date;
    
    for (const asset of data.assets) {
      if (asset.type === 'location') continue;
      
      const conflictingNode = nodes.find(otherNode => {
        if (otherNode.id === id) return false;
        if (otherNode.data.date !== dateToCheck) return false;
        if (!checkOverlap(newStartTime, newEndTime, otherNode.data.startTime as string, otherNode.data.endTime as string)) return false;
        
        const otherAssets = (otherNode.data.assets as Asset[]) || [];
        return otherAssets.some(a => a.id === asset.id);
      });

      if (conflictingNode) {
        showConflictToast(asset.name, conflictingNode.data.title || 'İsimsiz İş');
        return true;
      }
    }
    return false;
  };

  const updateNodeData = useCallback((newData: Partial<NodeData & { isActive?: boolean }>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: { ...node.data, ...newData },
          };
        }
        return node;
      })
    );
  }, [id, setNodes]);

  const handleStartTimeChange = (newStartTime: string) => {
    if (timeToMinutes(newStartTime) >= timeToMinutes(data.endTime as string || '10:00')) {
      showValidationErrorToast('Başlangıç saati, bitiş saatinden büyük veya eşit olamaz.');
      return;
    }
    if (checkConflictForChange(newStartTime, data.endTime as string)) return;
    updateNodeData({ startTime: newStartTime });
  };

  const handleEndTimeChange = (newEndTime: string) => {
    if (timeToMinutes(data.startTime as string || '09:00') >= timeToMinutes(newEndTime)) {
      showValidationErrorToast('Bitiş saati, başlangıç saatinden küçük veya eşit olamaz.');
      return;
    }
    if (checkConflictForChange(data.startTime as string, newEndTime)) return;
    updateNodeData({ endTime: newEndTime });
  };

  const handleDateChange = (newDate: string) => {
    if (checkConflictForChange(data.startTime || '09:00', data.endTime || '10:00', newDate)) return;
    updateNodeData({ date: newDate });
  };

  const toggleActive = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateNodeData({ isActive: !isActive });
  };

  const onTitleChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData({ title: evt.target.value });
  }, [updateNodeData]);

  const removeAsset = (assetId: string) => {
    updateNodeData({
      assets: data.assets.filter(a => a.id !== assetId)
    });
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const confirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nds) => {
      const nextNodes = nds.filter((node) => node.id !== id);
      if (nextNodes.length === 0) {
        return [{
          id: crypto.randomUUID(),
          type: 'addStep',
          position: { x: 0, y: 0 },
          data: {}
        }];
      }
      return nextNodes;
    });
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case 'location': return <MapPin className="w-3 h-3" />;
      case 'personnel': return <User className="w-3 h-3" />;
      case 'equipment': return <Camera className="w-3 h-3" />;
      default: return null;
    }
  };

  return (
    <div className={cn("relative group/node", !isActive && "opacity-50 grayscale")}>
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/95 rounded-xl border-2 border-red-500 shadow-lg">
          <div className="text-center p-4">
            <p className="text-sm font-medium text-gray-900 mb-3">Bu adımı silmek istediğinize emin misiniz?</p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={cancelDelete}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                İptal
              </button>
              <button
                onClick={confirmDelete}
                className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Action Bar (Visible on Hover) */}
      <div className="absolute -top-10 left-0 flex items-center gap-1 opacity-0 group-hover/node:opacity-100 transition-opacity z-10 bg-white border border-gray-200 rounded-md shadow-sm p-1">
        <button 
          onClick={toggleActive}
          className={cn(
            "p-1.5 rounded transition-colors",
            isActive ? "text-emerald-600 hover:bg-emerald-50" : "text-gray-400 hover:bg-gray-100 hover:text-gray-900"
          )} 
          title={isActive ? "Pasif Yap" : "Aktif Yap"}
        >
          <Power className="w-4 h-4" />
        </button>
        <button 
          onClick={handleDeleteClick}
          className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors" 
          title="Sil"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors" title="Daha Fazla">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <div className={cn(
        "w-64 bg-white rounded-xl shadow-md border-2 transition-all duration-200",
        selected ? "border-indigo-500 shadow-lg" : "border-transparent",
        hasConflict ? "border-red-500 bg-red-50" : ""
      )}>
        <Handle type="target" position={Position.Left} isConnectable={isConnectable} className="w-3 h-3 bg-white border-2 border-gray-300" />
        
        <div className="p-3 border-b border-gray-100 flex flex-col gap-2 bg-gray-50 rounded-t-xl">
          <div className="flex justify-between items-center">
            <DatePicker 
              value={data.date} 
              onChange={handleDateChange} 
              disabled={!isActive}
            />
            <button onClick={() => setIsEditing(!isEditing)} className="text-gray-400 hover:text-indigo-600 transition-colors">
              {isEditing ? <Check className="w-4 h-4 text-emerald-500" /> : <Edit2 className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <TimePicker 
              value={data.startTime || '09:00'} 
              onChange={handleStartTimeChange} 
              disabled={!isActive}
            />
            <span>-</span>
            <TimePicker 
              value={data.endTime || '10:00'} 
              onChange={handleEndTimeChange} 
              disabled={!isActive}
            />
          </div>
        </div>

        <div className="p-4">
          {isEditing ? (
            <input 
              type="text" 
              value={data.title || ''} 
              onChange={onTitleChange}
              className="w-full text-base font-semibold text-gray-900 border-b border-gray-300 focus:border-indigo-500 focus:outline-none mb-3 pb-1"
              placeholder="İş Adı"
              autoFocus
            />
          ) : (
            <h3 className="text-base font-semibold text-gray-900 mb-3">{data.title || 'Yeni İş'}</h3>
          )}

          <div className="space-y-3 min-h-[60px]">
            {!data.assets || data.assets.length === 0 ? (
              <div className="text-xs text-gray-400 italic text-center py-4 border-2 border-dashed border-gray-200 rounded-lg">
                Varlıkları buraya sürükleyin
              </div>
            ) : (
              <div className="space-y-3">
                {/* Locations */}
                {data.assets.some(a => a.type === 'location') && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-1">Lokasyonlar</div>
                    {data.assets.filter(a => a.type === 'location').map((asset: Asset) => (
                      <div key={asset.id} className="flex items-center justify-between bg-white border border-gray-200 rounded p-1.5 group shadow-sm">
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded bg-blue-50 text-blue-500">
                            {renderIcon(asset.type)}
                          </div>
                          <span className="text-xs font-medium text-gray-700">{asset.name}</span>
                        </div>
                        <button 
                          onClick={() => removeAsset(asset.id)}
                          className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Personnel */}
                {data.assets.some(a => a.type === 'personnel') && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-1">Personeller</div>
                    {data.assets.filter(a => a.type === 'personnel').map((asset: Asset) => (
                      <div key={asset.id} className="flex items-center justify-between bg-white border border-gray-200 rounded p-1.5 group shadow-sm">
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded bg-emerald-50 text-emerald-500">
                            {renderIcon(asset.type)}
                          </div>
                          <span className="text-xs font-medium text-gray-700">{asset.name}</span>
                        </div>
                        <button 
                          onClick={() => removeAsset(asset.id)}
                          className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Equipment */}
                {data.assets.some(a => a.type === 'equipment') && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-1">Ekipmanlar</div>
                    {data.assets.filter(a => a.type === 'equipment').map((asset: Asset) => (
                      <div key={asset.id} className="flex items-center justify-between bg-white border border-gray-200 rounded p-1.5 group shadow-sm">
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded bg-amber-50 text-amber-500">
                            {renderIcon(asset.type)}
                          </div>
                          <span className="text-xs font-medium text-gray-700">{asset.name}</span>
                        </div>
                        <button 
                          onClick={() => removeAsset(asset.id)}
                          className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <button 
              onClick={() => openDrawer('addAsset', id)}
              className="w-full flex items-center justify-center gap-2 py-2 mt-2 border-2 border-dashed border-gray-200 rounded-lg text-xs font-medium text-gray-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Varlık Ekle
            </button>
          </div>
        </div>

        <Handle type="source" position={Position.Right} isConnectable={isConnectable} className="w-3 h-3 bg-white border-2 border-gray-300" />
        
        {/* Right Add Button (Visible on Hover) */}
        <div className="absolute top-1/2 -right-10 -translate-y-1/2 opacity-0 group-hover/node:opacity-100 transition-opacity z-10">
          <button 
            onClick={() => openDrawer('addNode', id)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-md p-1 shadow-sm transition-colors"
            title="Yeni Düğüm Ekle"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Deactivated Label */}
      {!isActive && (
        <div className="absolute -bottom-6 left-0 w-full text-center pointer-events-none">
          <span className="text-xs font-medium text-gray-500">(Pasif)</span>
        </div>
      )}
    </div>
  );
}
