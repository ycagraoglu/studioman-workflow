import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { NodeData, Asset } from '../types';
import { Plus, AlertTriangle, FileText, Link as LinkIcon, Paperclip } from 'lucide-react';
import { cn } from '../utils/cn';
import { useDrawer } from '../contexts/DrawerContext';
import { useNodeLogic } from '../hooks/useNodeLogic';
import { NodeActionBar } from './Node/NodeActionBar';
import { NodeDeleteConfirm } from './Node/NodeDeleteConfirm';
import { NodeHeader } from './Node/NodeHeader';
import { NodeAssetSection } from './Node/NodeAssetSection';
import { NodeNotesSection } from './Node/NodeNotesSection';
import { NodeAttachmentsSection } from './Node/NodeAttachmentsSection';
import FilePreviewModal from './FilePreviewModal';

const COLORS = [
  { id: 'white', class: 'bg-white dark:bg-slate-800' },
  { id: 'blue', class: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 'emerald', class: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { id: 'amber', class: 'bg-amber-50 dark:bg-amber-900/20' },
  { id: 'purple', class: 'bg-purple-50 dark:bg-purple-900/20' },
  { id: 'pink', class: 'bg-pink-50 dark:bg-pink-900/20' },
  { id: 'rose', class: 'bg-rose-50 dark:bg-rose-900/20' },
];

export default function CustomNode({ data, id, isConnectable, selected }: NodeProps<any>) {
  const logic = useNodeLogic(id, data);
  const { openDrawer } = useDrawer();
  const isActive = data.isActive !== false;

  const getNodeColor = () => {
    if (data.color) return data.color;
    if (!data.assets || data.assets.length === 0) return 'bg-white dark:bg-slate-800';
    const firstType = data.assets[0].type;
    if (firstType === 'location') return 'bg-blue-50 dark:bg-blue-900/20';
    if (firstType === 'personnel') return 'bg-emerald-50 dark:bg-emerald-900/20';
    if (firstType === 'equipment') return 'bg-amber-50 dark:bg-amber-900/20';
    return 'bg-white dark:bg-slate-800';
  };

  const conflicts = logic.validateNode(id, data.date, data.startTime, data.endTime);
  const hasConflict = conflicts.length > 0;

  const handleAttachmentClick = (e: React.MouseEvent, att: { name: string; url: string; type: 'image' | 'file' | 'link' }) => {
    e.stopPropagation();
    if (att.type === 'image') {
      e.preventDefault();
      logic.setPreviewFile(att);
    } else if (att.url.startsWith('data:')) {
      e.preventDefault();
      const newWin = window.open('', '_blank');
      if (newWin) {
        newWin.document.write('<!DOCTYPE html><html><head><title>Yükleniyor...</title></head><body><p>Dosya hazırlanıyor, lütfen bekleyin...</p></body></html>');
        fetch(att.url)
          .then(res => res.blob())
          .then(blob => {
            const blobUrl = URL.createObjectURL(blob);
            newWin.location.href = blobUrl;
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
  };

  return (
    <div className={cn("relative group/node", !isActive && "opacity-50 grayscale")}>
      {logic.showDeleteConfirm && (
        <NodeDeleteConfirm 
          onCancel={(e) => { e.stopPropagation(); logic.setShowDeleteConfirm(false); }} 
          onConfirm={logic.confirmDelete} 
        />
      )}

      <NodeActionBar 
        isActive={isActive}
        onToggleActive={(e) => { e.stopPropagation(); logic.updateNodeData({ isActive: !isActive }); }}
        onDeleteClick={(e) => { e.stopPropagation(); logic.setShowDeleteConfirm(true); }}
        onColorPickerToggle={(e) => { e.stopPropagation(); logic.setShowColorPicker(!logic.showColorPicker); }}
        showColorPicker={logic.showColorPicker}
        onColorSelect={(colorClass) => { logic.updateNodeData({ color: colorClass }); logic.setShowColorPicker(false); }}
        currentColor={data.color || ''}
        colors={COLORS}
      />

      <div className={cn(
        "w-64 rounded-xl shadow-md border-2 transition-all duration-200",
        getNodeColor(),
        selected ? "border-primary shadow-lg" : "border-transparent",
        hasConflict ? "border-red-500 bg-red-50 dark:bg-red-900/20" : ""
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

        <Handle type="target" position={Position.Left} isConnectable={isConnectable} className="w-3 h-3 bg-white dark:bg-slate-700 border-2 border-gray-300 dark:border-slate-600" />
        
        <NodeHeader 
          date={data.date}
          startTime={data.startTime}
          endTime={data.endTime}
          isActive={isActive}
          isEditing={logic.isEditing}
          onDateChange={logic.handleDateChange}
          onStartTimeChange={logic.handleStartTimeChange}
          onEndTimeChange={logic.handleEndTimeChange}
          onToggleEditing={() => logic.setIsEditing(!logic.isEditing)}
        />

        <div className="p-4">
          {logic.isEditing ? (
            <input 
              type="text" 
              value={data.title || ''} 
              onChange={(e) => logic.updateNodeData({ title: e.target.value })}
              className="w-full text-base font-semibold text-gray-900 dark:text-white border-b border-gray-300 dark:border-zinc-700 focus:border-primary focus:outline-none mb-3 pb-1 bg-transparent"
              placeholder="İş Adı"
              autoFocus
            />
          ) : (
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">{data.title || 'Yeni İş'}</h3>
          )}

          <div className="space-y-3">
            <NodeAssetSection 
              assets={data.assets || []}
              isEditing={logic.isEditing}
              editingMapUrlId={logic.editingMapUrlId}
              onSetEditingMapUrlId={logic.setEditingMapUrlId}
              onRemoveAsset={(assetId) => logic.updateNodeData({ assets: data.assets.filter((a: Asset) => a.id !== assetId) })}
              onUpdateAssetMapUrl={(assetId, url) => {
                const newAssets = data.assets.map((a: Asset) => a.id === assetId ? { ...a, mapUrl: url } : a);
                logic.updateNodeData({ assets: newAssets });
              }}
            />

            <button 
              onClick={() => openDrawer('addAsset', id)}
              className="w-full flex items-center justify-center gap-2 py-2 mt-2 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-primary hover:border-primary-light hover:bg-primary-light dark:hover:bg-primary/10 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Kaynak Ekle
            </button>
            
            <NodeNotesSection 
              notes={data.notes}
              isEditing={logic.isEditing}
              isAddingNote={logic.isAddingNote}
              onSetIsAddingNote={logic.setIsAddingNote}
              onUpdateNotes={(notes) => logic.updateNodeData({ notes })}
            />

            <NodeAttachmentsSection 
              attachments={data.attachments || []}
              isAddingAttachment={logic.isAddingAttachment}
              onSetIsAddingAttachment={logic.setIsAddingAttachment}
              newAttachmentName={logic.newAttachmentName}
              onSetNewAttachmentName={logic.setNewAttachmentName}
              newAttachmentUrl={logic.newAttachmentUrl}
              onSetNewAttachmentUrl={logic.setNewAttachmentUrl}
              onAddAttachment={logic.addAttachment}
              onRemoveAttachment={logic.removeAttachment}
              onAttachmentClick={handleAttachmentClick}
            />

            <div className="mt-3 pt-2 border-t border-gray-100 dark:border-zinc-800 flex items-center gap-2 justify-center">
              <button 
                onClick={() => logic.setIsAddingNote(true)}
                className={cn(
                  "p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors",
                  (logic.isAddingNote || data.notes) && "text-primary bg-primary-light dark:bg-primary/10 hover:bg-primary-light/80 hover:text-primary"
                )}
                title="Not Ekle"
              >
                <FileText className="w-4 h-4" />
              </button>
              <button 
                onClick={() => logic.setIsAddingAttachment(true)}
                className={cn(
                  "p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors",
                  (logic.isAddingAttachment || (data.attachments && data.attachments.length > 0)) && "text-primary bg-primary-light dark:bg-primary/10 hover:bg-primary-light/80 hover:text-primary"
                )}
                title="Link Ekle"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={() => logic.fileInputRef.current?.click()}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Dosya Ekle"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                type="file"
                ref={logic.fileInputRef}
                className="hidden"
                onChange={logic.handleFileUpload}
              />
            </div>
          </div>
        </div>

        <Handle type="source" position={Position.Right} isConnectable={isConnectable} className="w-3 h-3 bg-white dark:bg-slate-700 border-2 border-gray-300 dark:border-slate-600" />
        
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

      {!isActive && (
        <div className="absolute -bottom-6 left-0 w-full text-center pointer-events-none">
          <span className="text-xs font-medium text-gray-500">(Pasif)</span>
        </div>
      )}

      <FilePreviewModal 
        isOpen={!!logic.previewFile} 
        onClose={() => logic.setPreviewFile(null)} 
        file={logic.previewFile} 
      />
    </div>
  );
}
