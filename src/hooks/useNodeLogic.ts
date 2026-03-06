import React, { useState, useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { NodeData } from '../types';
import { timeToMinutes } from '../utils/timeUtils';
import { useNodeValidation } from './useNodeValidation';
import { useNodeAttachments } from './useNodeAttachments';

export function useNodeLogic(id: string, data: NodeData & { isActive?: boolean }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingMapUrlId, setEditingMapUrlId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  
  const { setNodes, setEdges } = useReactFlow();

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

  const { validateNode, checkConflictForChange } = useNodeValidation();
  const {
    isAddingAttachment, setIsAddingAttachment,
    newAttachmentUrl, setNewAttachmentUrl,
    newAttachmentName, setNewAttachmentName,
    previewFile, setPreviewFile,
    fileInputRef,
    addAttachment,
    handleFileUpload,
    removeAttachment
  } = useNodeAttachments(data, updateNodeData);

  const handleStartTimeChange = (newStartTime: string) => {
    let newEndTime = data.endTime as string || '10:00';
    if (timeToMinutes(newStartTime) >= timeToMinutes(newEndTime)) {
       const startMins = timeToMinutes(newStartTime);
       const newEndMins = startMins + 60;
       const newEndHours = Math.floor(newEndMins / 60) % 24;
       const newEndMinutes = newEndMins % 60;
       newEndTime = `${String(newEndHours).padStart(2, '0')}:${String(newEndMinutes).padStart(2, '0')}`;
    }
    if (checkConflictForChange(id, data.date, newStartTime, newEndTime)) return;
    updateNodeData({ startTime: newStartTime, endTime: newEndTime });
  };

  const handleEndTimeChange = (newEndTime: string) => {
    let newStartTime = data.startTime as string || '09:00';
    if (timeToMinutes(newStartTime) >= timeToMinutes(newEndTime)) {
       const endMins = timeToMinutes(newEndTime);
       const newStartMins = endMins - 60;
       if (newStartMins >= 0) {
          const newStartHours = Math.floor(newStartMins / 60) % 24;
          const newStartMinutes = newStartMins % 60;
          newStartTime = `${String(newStartHours).padStart(2, '0')}:${String(newStartMinutes).padStart(2, '0')}`;
       } else {
          // Validation error handled by checkConflictForChange if needed, but here it's logic error
          return;
       }
    }
    if (checkConflictForChange(id, data.date, newStartTime, newEndTime)) return;
    updateNodeData({ startTime: newStartTime, endTime: newEndTime });
  };

  const handleDateChange = (newDate: string) => {
    if (checkConflictForChange(id, data.date, data.startTime || '09:00', data.endTime || '10:00', newDate)) return;
    updateNodeData({ date: newDate });
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

  return {
    isEditing, setIsEditing,
    editingMapUrlId, setEditingMapUrlId,
    showDeleteConfirm, setShowDeleteConfirm,
    showColorPicker, setShowColorPicker,
    isAddingAttachment, setIsAddingAttachment,
    isAddingNote, setIsAddingNote,
    newAttachmentUrl, setNewAttachmentUrl,
    newAttachmentName, setNewAttachmentName,
    previewFile, setPreviewFile,
    fileInputRef,
    updateNodeData,
    handleStartTimeChange,
    handleEndTimeChange,
    handleDateChange,
    addAttachment,
    handleFileUpload,
    removeAttachment,
    confirmDelete,
    validateNode
  };
}
