import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Node, Edge } from '@xyflow/react';
import { showSuccessToast } from '../utils/toast';

export function useTemplates(nodes: Node[], edges: Edge[]) {
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');

  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;
    const templates = JSON.parse(localStorage.getItem('workflowTemplates') || '[]');
    templates.push({
      id: uuidv4(),
      name: templateName,
      nodes,
      edges,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('workflowTemplates', JSON.stringify(templates));
    setShowTemplateModal(false);
    setTemplateName('');
    showSuccessToast('Başarılı', 'Şablon başarıyla kaydedildi!');
  };

  return {
    showTemplateModal,
    setShowTemplateModal,
    templateName,
    setTemplateName,
    handleSaveTemplate
  };
}
