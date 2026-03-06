import React, { useState, useRef, useCallback } from 'react';
import { NodeData, Attachment } from '../types';

export function useNodeAttachments(
  data: NodeData,
  updateNodeData: (newData: Partial<NodeData>) => void
) {
  const [isAddingAttachment, setIsAddingAttachment] = useState(false);
  const [newAttachmentUrl, setNewAttachmentUrl] = useState('');
  const [newAttachmentName, setNewAttachmentName] = useState('');
  const [previewFile, setPreviewFile] = useState<{ name: string; url: string; type: 'image' | 'file' | 'link' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addAttachment = useCallback(() => {
    if (!newAttachmentUrl) return;
    const newAttachment: Attachment = {
      id: crypto.randomUUID(),
      name: newAttachmentName || newAttachmentUrl,
      url: newAttachmentUrl,
      type: 'link'
    };
    const currentAttachments = data.attachments || [];
    updateNodeData({ attachments: [...currentAttachments, newAttachment] });
    setNewAttachmentUrl('');
    setNewAttachmentName('');
    setIsAddingAttachment(false);
  }, [data.attachments, newAttachmentName, newAttachmentUrl, updateNodeData]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      const newAttachment: Attachment = {
        id: crypto.randomUUID(),
        name: file.name,
        url: url,
        type: file.type.startsWith('image/') ? 'image' : 'file'
      };
      const currentAttachments = data.attachments || [];
      updateNodeData({ attachments: [...currentAttachments, newAttachment] });
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [data.attachments, updateNodeData]);

  const removeAttachment = useCallback((attId: string) => {
    const currentAttachments = data.attachments || [];
    updateNodeData({ attachments: currentAttachments.filter(a => a.id !== attId) });
  }, [data.attachments, updateNodeData]);

  return {
    isAddingAttachment, setIsAddingAttachment,
    newAttachmentUrl, setNewAttachmentUrl,
    newAttachmentName, setNewAttachmentName,
    previewFile, setPreviewFile,
    fileInputRef,
    addAttachment,
    handleFileUpload,
    removeAttachment
  };
}
