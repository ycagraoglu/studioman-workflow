import React, { useState, useCallback } from 'react';
import { Handle, Position, NodeProps, useReactFlow, Node } from '@xyflow/react';
import { NodeData, Asset } from '../types';
import { MapPin, User, Camera, X, Clock, Edit2, Check, Trash2, Plus, Play, Power, MoreHorizontal, Palette, FileText, ExternalLink, Link as LinkIcon, Paperclip, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { cn } from '../utils/cn';
import { useDrawer } from '../contexts/DrawerContext';
import TimePicker from './TimePicker';
import DatePicker from './DatePicker';
import { showConflictToast, showValidationErrorToast } from '../utils/toast';

export type WorkstationNode = Node<NodeData & { isActive?: boolean }, 'workstation'>;

import FilePreviewModal from './FilePreviewModal';

export default function CustomNode({ data, id, isConnectable, selected }: NodeProps<WorkstationNode>) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingMapUrlId, setEditingMapUrlId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isAddingAttachment, setIsAddingAttachment] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newAttachmentUrl, setNewAttachmentUrl] = useState('');
  const [newAttachmentName, setNewAttachmentName] = useState('');
  const [previewFile, setPreviewFile] = useState<{ name: string; url: string; type: 'image' | 'file' | 'link' } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { setNodes, getNodes, setEdges, getEdges } = useReactFlow();
  const { openDrawer } = useDrawer();
  const isActive = data.isActive !== false; // Default to true if undefined

  const addAttachment = () => {
    if (!newAttachmentUrl) return;
    
    const newAttachment = {
      id: crypto.randomUUID(),
      name: newAttachmentName || newAttachmentUrl,
      url: newAttachmentUrl,
      type: 'link' as const
    };

    const currentAttachments = data.attachments || [];
    updateNodeData({ attachments: [...currentAttachments, newAttachment] });
    
    setNewAttachmentUrl('');
    setNewAttachmentName('');
    setIsAddingAttachment(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      const newAttachment = {
        id: crypto.randomUUID(),
        name: file.name,
        url: url,
        type: file.type.startsWith('image/') ? 'image' : 'file' as const
      };

      const currentAttachments = data.attachments || [];
      updateNodeData({ attachments: [...currentAttachments, newAttachment] });
    };
    reader.readAsDataURL(file);
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    const currentAttachments = data.attachments || [];
    updateNodeData({ attachments: currentAttachments.filter(a => a.id !== id) });
  };

  const handleAttachmentClick = (e: React.MouseEvent, att: { name: string; url: string; type: 'image' | 'file' | 'link' }) => {
    e.stopPropagation();

    if (att.type === 'image') {
      e.preventDefault();
      setPreviewFile(att);
    } else if (att.url.startsWith('data:')) {
      // Handle data URLs (like PDF uploads) by converting to Blob URL
      // This bypasses browser restrictions on top-frame navigation to data: URIs
      e.preventDefault();
      
      // Open window immediately to avoid popup blockers
      const newWin = window.open('', '_blank');
      
      if (newWin) {
        newWin.document.write('<!DOCTYPE html><html><head><title>Yükleniyor...</title></head><body><p>Dosya hazırlanıyor, lütfen bekleyin...</p></body></html>');
        
        fetch(att.url)
          .then(res => res.blob())
          .then(blob => {
            const blobUrl = URL.createObjectURL(blob);
            newWin.location.href = blobUrl;
            // Cleanup blob URL after a delay
            setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
          })
          .catch(err => {
             console.error("Failed to load data URL:", err);
             newWin.document.body.innerHTML = '<p style="color:red">Dosya yüklenirken bir hata oluştu.</p>';
          });
      } else {
          alert('Lütfen açılır pencerelere izin verin.');
      }
    }
    // For standard http/https links, let the <a> tag handle it naturally
  };

  const COLORS = [
    { id: 'white', class: 'bg-white' },
    { id: 'blue', class: 'bg-blue-50' },
    { id: 'emerald', class: 'bg-emerald-50' },
    { id: 'amber', class: 'bg-amber-50' },
    { id: 'purple', class: 'bg-purple-50' },
    { id: 'pink', class: 'bg-pink-50' },
    { id: 'rose', class: 'bg-rose-50' },
  ];

  const getNodeColor = () => {
    if (data.color) return data.color;
    if (!data.assets || data.assets.length === 0) return 'bg-white';
    const firstType = data.assets[0].type;
    if (firstType === 'location') return 'bg-blue-50';
    if (firstType === 'personnel') return 'bg-emerald-50';
    if (firstType === 'equipment') return 'bg-amber-50';
    return 'bg-white';
  };

  // Helper to convert HH:mm to minutes
  const timeToMinutes = (timeStr: string) => {
    const [hours, minutes] = (timeStr || '00:00').split(':').map(Number);
    return hours * 60 + (minutes || 0);
  };

  // Validation function for sequential time order
  const validateNode = (
    currentId: string,
    currentDate: string,
    currentStart: string,
    currentEnd: string
  ) => {
    const nodes = getNodes();
    const edges = getEdges();
    const conflicts: string[] = [];

    // Check incoming connections (previous nodes)
    const incomingEdges = edges.filter(edge => edge.target === currentId);
    
    incomingEdges.forEach(edge => {
      const prevNode = nodes.find(n => n.id === edge.source);
      if (prevNode && prevNode.data.date === currentDate) {
        const prevEndTime = prevNode.data.endTime as string;
        
        // If current start time is BEFORE previous end time, it's invalid
        if (timeToMinutes(currentStart) < timeToMinutes(prevEndTime)) {
          conflicts.push(`Zaman hatası: Önceki iş (${prevNode.data.title || 'İsimsiz'}) ${prevEndTime}'de bitiyor.`);
        }
      }
    });

    return conflicts;
  };

  // Check for conflicts to display visual indicator
  const conflicts = validateNode(id, data.date, data.startTime, data.endTime);
  const hasConflict = conflicts.length > 0;

  const checkConflictForChange = (newStartTime: string, newEndTime: string, newDate?: string) => {
    const dateToCheck = newDate || data.date;
    const potentialConflicts = validateNode(id, dateToCheck, newStartTime, newEndTime);

    if (potentialConflicts.length > 0) {
      // Show the first conflict message
      showValidationErrorToast(potentialConflicts[0]);
      return true;
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
    let newEndTime = data.endTime as string || '10:00';
    
    // Auto-adjust end time if start time is pushed past it
    if (timeToMinutes(newStartTime) >= timeToMinutes(newEndTime)) {
       const startMins = timeToMinutes(newStartTime);
       const newEndMins = startMins + 60; // Default to 1 hour duration
       const newEndHours = Math.floor(newEndMins / 60) % 24;
       const newEndMinutes = newEndMins % 60;
       newEndTime = `${String(newEndHours).padStart(2, '0')}:${String(newEndMinutes).padStart(2, '0')}`;
    }

    if (checkConflictForChange(newStartTime, newEndTime)) return;
    updateNodeData({ startTime: newStartTime, endTime: newEndTime });
  };

  const handleEndTimeChange = (newEndTime: string) => {
    let newStartTime = data.startTime as string || '09:00';

    // Auto-adjust start time if end time is pulled before it
    if (timeToMinutes(newStartTime) >= timeToMinutes(newEndTime)) {
       const endMins = timeToMinutes(newEndTime);
       const newStartMins = endMins - 60; // Default to 1 hour duration
       if (newStartMins >= 0) {
          const newStartHours = Math.floor(newStartMins / 60) % 24;
          const newStartMinutes = newStartMins % 60;
          newStartTime = `${String(newStartHours).padStart(2, '0')}:${String(newStartMinutes).padStart(2, '0')}`;
       } else {
          // Fallback if end time is too early (e.g. 00:30), just block it or set start to 00:00
          showValidationErrorToast('Bitiş saati çok erken.');
          return;
       }
    }

    if (checkConflictForChange(newStartTime, newEndTime)) return;
    updateNodeData({ startTime: newStartTime, endTime: newEndTime });
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
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowColorPicker(!showColorPicker); }}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors" 
            title="Renk Seç"
          >
            <Palette className="w-4 h-4" />
          </button>
          
          {showColorPicker && (
            <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 shadow-lg rounded-lg p-2 flex gap-1 z-50">
              {COLORS.map(c => (
                <button
                  key={c.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateNodeData({ color: c.class });
                    setShowColorPicker(false);
                  }}
                  className={cn(
                    "w-6 h-6 rounded-full border border-gray-200 hover:scale-110 transition-transform",
                    c.class,
                    data.color === c.class ? "ring-2 ring-indigo-500 ring-offset-1" : ""
                  )}
                  title="Renk Seç"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={cn(
        "w-64 rounded-xl shadow-md border-2 transition-all duration-200",
        getNodeColor(),
        selected ? "border-indigo-500 shadow-lg" : "border-transparent",
        hasConflict ? "border-red-500 bg-red-50" : ""
      )}>
        {hasConflict && (
          <div className="absolute -top-3 right-2 z-20 group/conflict">
            <div className="bg-red-500 text-white p-1 rounded-full shadow-md animate-pulse">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="absolute top-full right-0 mt-1 w-48 bg-red-600 text-white text-xs p-2 rounded shadow-lg opacity-0 group-hover/conflict:opacity-100 transition-opacity pointer-events-none z-30">
              {conflicts.map((conflict, i) => (
                <div key={i} className="mb-1 last:mb-0">{conflict}</div>
              ))}
            </div>
          </div>
        )}

        <Handle type="target" position={Position.Left} isConnectable={isConnectable} className="w-3 h-3 bg-white border-2 border-gray-300" />
        
        <div className="p-3 border-b border-black/5 flex flex-col gap-2 bg-black/5 rounded-t-xl">
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

          <div className="space-y-3">
            {data.assets && data.assets.length > 0 && (
              <div className="space-y-3">
                {/* Locations */}
                {data.assets.some(a => a.type === 'location') && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-semibold text-gray-400 tracking-wider px-1">LOKASYONLAR</div>
                    {data.assets.filter(a => a.type === 'location').map((asset: Asset) => (
                      <div key={asset.id} className="flex flex-col bg-white border border-gray-200 rounded p-1.5 group shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-1 rounded bg-blue-50 text-blue-500">
                              {renderIcon(asset.type)}
                            </div>
                            <span className="text-xs font-medium text-gray-700">{asset.name}</span>
                            {asset.mapUrl && !isEditing && editingMapUrlId !== asset.id && (
                              <a 
                                href={asset.mapUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-700 ml-1"
                                title="Haritada Gör"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            {!asset.mapUrl && !isEditing && editingMapUrlId !== asset.id && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingMapUrlId(asset.id);
                                }}
                                className="text-[10px] text-indigo-500 hover:text-indigo-700 font-medium ml-2"
                              >
                                + Link Ekle
                              </button>
                            )}
                            {asset.mapUrl && !isEditing && editingMapUrlId !== asset.id && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingMapUrlId(asset.id);
                                }}
                                className="text-[10px] text-gray-400 hover:text-indigo-600 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Linki Düzenle"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <button 
                            onClick={() => removeAsset(asset.id)}
                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        {(isEditing || editingMapUrlId === asset.id) && (
                          <div className="mt-2 flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <input
                              type="text"
                              value={asset.mapUrl || ''}
                              onChange={(e) => {
                                const newAssets = data.assets.map(a => 
                                  a.id === asset.id ? { ...a, mapUrl: e.target.value } : a
                                );
                                updateNodeData({ assets: newAssets });
                              }}
                              onBlur={() => {
                                if (!isEditing) setEditingMapUrlId(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !isEditing) {
                                  setEditingMapUrlId(null);
                                }
                              }}
                              autoFocus={editingMapUrlId === asset.id && !isEditing}
                              placeholder="Google Maps Linki"
                              className="flex-1 text-[10px] text-gray-600 border-b border-gray-200 focus:border-indigo-500 focus:outline-none bg-transparent pb-0.5"
                            />
                            {editingMapUrlId === asset.id && !isEditing && (
                              <button 
                                onClick={() => setEditingMapUrlId(null)}
                                className="text-emerald-500 hover:text-emerald-600"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Personnel */}
                {data.assets.some(a => a.type === 'personnel') && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-semibold text-gray-400 tracking-wider px-1">EKİP</div>
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
                    <div className="text-[10px] font-semibold text-gray-400 tracking-wider px-1">EKİPMANLAR</div>
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
              Kaynak Ekle
            </button>
            
            {/* Notes Section - Only show if has notes or is adding note */}
            {(data.notes || isAddingNote) && (
              <div className="mt-3 pt-3 border-t border-gray-200/60">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <FileText className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-semibold tracking-wider">NOTLAR</span>
                  </div>
                  {isAddingNote && !data.notes && (
                    <button 
                      onClick={() => setIsAddingNote(false)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                {isEditing || isAddingNote ? (
                  <textarea
                    value={data.notes || ''}
                    onChange={(e) => updateNodeData({ notes: e.target.value })}
                    placeholder="Görevle ilgili notlar..."
                    className="w-full text-xs text-gray-700 bg-white/50 border border-gray-200 rounded p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                    rows={2}
                    autoFocus={isAddingNote}
                  />
                ) : (
                  <div className="text-xs text-gray-600 bg-white/50 rounded p-2 border border-transparent whitespace-pre-wrap">
                    {data.notes}
                  </div>
                )}
              </div>
            )}

            {/* Attachments Section - Only show if has attachments or is adding attachment */}
            {((data.attachments && data.attachments.length > 0) || isAddingAttachment) && (
              <div className="mt-3 pt-3 border-t border-gray-200/60">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-semibold tracking-wider">DOSYALAR / LİNKLER</span>
                  </div>
                  {isAddingAttachment && (
                    <button 
                      onClick={() => {
                        setIsAddingAttachment(false);
                        setNewAttachmentUrl('');
                        setNewAttachmentName('');
                      }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="space-y-1.5">
                  {data.attachments?.map(att => (
                    <div key={att.id} className="flex items-center justify-between bg-white border border-gray-200 rounded p-1.5 group">
                      <a 
                        href={att.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-blue-600 hover:underline truncate flex-1 min-w-0"
                        onClick={(e) => handleAttachmentClick(e, att)}
                      >
                        {att.type === 'image' ? <ImageIcon className="w-3 h-3 flex-shrink-0" /> : 
                         att.type === 'file' ? <FileText className="w-3 h-3 flex-shrink-0" /> : 
                         <LinkIcon className="w-3 h-3 flex-shrink-0" />}
                        <span className="truncate">{att.name}</span>
                      </a>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeAttachment(att.id);
                        }}
                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0"
                        title="Dosyayı Sil"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {isAddingAttachment && (
                    <div className="bg-gray-50 p-2 rounded border border-gray-200 space-y-2">
                      <input
                        type="text"
                        placeholder="Link Adı (Opsiyonel)"
                        value={newAttachmentName}
                        onChange={(e) => setNewAttachmentName(e.target.value)}
                        className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-indigo-500"
                        autoFocus
                      />
                      <input
                        type="text"
                        placeholder="URL (https://...)"
                        value={newAttachmentUrl}
                        onChange={(e) => setNewAttachmentUrl(e.target.value)}
                        className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-indigo-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') addAttachment();
                        }}
                      />
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={addAttachment}
                          disabled={!newAttachmentUrl}
                          className="text-xs bg-indigo-500 text-white px-2 py-1 rounded hover:bg-indigo-600 disabled:opacity-50"
                        >
                          Ekle
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="mt-3 pt-2 border-t border-gray-100 flex items-center gap-2 justify-center">
              <button 
                onClick={() => setIsAddingNote(true)}
                className={cn(
                  "p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors",
                  (isAddingNote || data.notes) && "text-indigo-500 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-600"
                )}
                title="Not Ekle"
              >
                <FileText className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsAddingAttachment(true)}
                className={cn(
                  "p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors",
                  (isAddingAttachment || (data.attachments && data.attachments.length > 0)) && "text-indigo-500 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-600"
                )}
                title="Link Ekle"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                title="Dosya Ekle"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
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

      {/* File Preview Modal */}
      <FilePreviewModal 
        isOpen={!!previewFile} 
        onClose={() => setPreviewFile(null)} 
        file={previewFile} 
      />
    </div>
  );
}
