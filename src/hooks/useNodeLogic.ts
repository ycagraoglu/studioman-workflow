import React, { useState, useCallback, useRef } from 'react';
import { useReactFlow } from '@xyflow/react';
import { NodeData, Asset } from '../types';
import { showValidationErrorToast } from '../utils/toast';
import { timeToMinutes } from '../utils/timeUtils';

export function useNodeLogic(id: string, data: NodeData & { isActive?: boolean }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingMapUrlId, setEditingMapUrlId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isAddingAttachment, setIsAddingAttachment] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newAttachmentUrl, setNewAttachmentUrl] = useState('');
  const [newAttachmentName, setNewAttachmentName] = useState('');
  const [previewFile, setPreviewFile] = useState<{ name: string; url: string; type: 'image' | 'file' | 'link' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { setNodes, getNodes, setEdges, getEdges } = useReactFlow();

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

  const validateNode = useCallback((
    currentId: string,
    currentDate: string,
    currentStart: string,
    currentEnd: string
  ) => {
    const nodes = getNodes();
    const edges = getEdges();
    const conflicts: string[] = [];

    const incomingEdges = edges.filter(edge => edge.target === currentId);
    
    incomingEdges.forEach(edge => {
      const prevNode = nodes.find(n => n.id === edge.source);
      if (prevNode && prevNode.data.date === currentDate) {
        const prevEndTime = prevNode.data.endTime as string;
        if (timeToMinutes(currentStart) < timeToMinutes(prevEndTime)) {
          conflicts.push(`Zaman hatası: Önceki iş (${prevNode.data.title || 'İsimsiz'}) ${prevEndTime}'de bitiyor.`);
        }
      }
    });

    return conflicts;
  }, [getNodes, getEdges]);

  const checkConflictForChange = useCallback((newStartTime: string, newEndTime: string, newDate?: string) => {
    const dateToCheck = newDate || data.date;
    const potentialConflicts = validateNode(id, dateToCheck, newStartTime, newEndTime);

    if (potentialConflicts.length > 0) {
      showValidationErrorToast(potentialConflicts[0]);
      return true;
    }
    return false;
  }, [id, data.date, validateNode]);

  const handleStartTimeChange = (newStartTime: string) => {
    let newEndTime = data.endTime as string || '10:00';
    if (timeToMinutes(newStartTime) >= timeToMinutes(newEndTime)) {
       const startMins = timeToMinutes(newStartTime);
       const newEndMins = startMins + 60;
       const newEndHours = Math.floor(newEndMins / 60) % 24;
       const newEndMinutes = newEndMins % 60;
       newEndTime = `${String(newEndHours).padStart(2, '0')}:${String(newEndMinutes).padStart(2, '0')}`;
    }
    if (checkConflictForChange(newStartTime, newEndTime)) return;
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (attId: string) => {
    const currentAttachments = data.attachments || [];
    updateNodeData({ attachments: currentAttachments.filter(a => a.id !== attId) });
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
