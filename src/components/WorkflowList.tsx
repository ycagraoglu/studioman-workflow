import React, { useState, useEffect } from 'react';
import { Plus, Loader2, FileText, Trash2, Edit2, Check, X, LayoutDashboard, Search, Calendar } from 'lucide-react';
import { format, parseISO, startOfDay, endOfDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import DatePicker from './DatePicker';
import { cn } from '../utils/cn';
import { Logo } from './Logo';

interface Workflow {
  id: string;
  name: string;
  created_at: string;
}

interface WorkflowListProps {
  onSelectWorkflow: (id: string) => void;
  onViewDashboard: () => void;
}

export default function WorkflowList({ onSelectWorkflow, onViewDashboard }: WorkflowListProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState<string>('');

  const fetchWorkflows = async () => {
    try {
      const res = await fetch('/api/workflows');
      const data = await res.json();
      setWorkflows(data);
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
    const savedTemplates = JSON.parse(localStorage.getItem('workflowTemplates') || '[]');
    setTemplates(savedTemplates);
  }, []);

  const handleCreateNew = async (templateId?: string) => {
    try {
      let initialData = { name: 'Yeni İş Akışı' };
      
      if (templateId) {
        const template = templates.find(t => t.id === templateId);
        if (template) {
          initialData = {
            name: `${template.name} (Kopya)`,
            nodes: template.nodes,
            edges: template.edges
          } as any;
        }
      }

      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(initialData)
      });
      const data = await res.json();
      onSelectWorkflow(data.id);
    } catch (error) {
      console.error('Failed to create workflow:', error);
      showErrorToast('Hata', 'İş akışı oluşturulamadı.');
    }
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
  };

  const handleDeleteTemplate = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingTemplateId(id);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    
    try {
      await fetch(`/api/workflows/${deletingId}`, { method: 'DELETE' });
      setWorkflows(workflows.filter(w => w.id !== deletingId));
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      showErrorToast('Hata', 'İş akışı silinemedi.');
    } finally {
      setDeletingId(null);
    }
  };

  const confirmDeleteTemplate = () => {
    if (!deletingTemplateId) return;
    const newTemplates = templates.filter(t => t.id !== deletingTemplateId);
    setTemplates(newTemplates);
    localStorage.setItem('workflowTemplates', JSON.stringify(newTemplates));
    setDeletingTemplateId(null);
  };

  const cancelDelete = () => {
    setDeletingId(null);
    setDeletingTemplateId(null);
  };

  const handleEditName = async (e: React.MouseEvent, workflow: Workflow) => {
    e.stopPropagation();
    setEditingId(workflow.id);
    setEditName(workflow.name);
  };

  const saveName = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!editName.trim()) return;
    
    try {
      await fetch(`/api/workflows/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName })
      });
      setWorkflows(workflows.map(w => w.id === id ? { ...w, name: editName } : w));
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update workflow name:', error);
      showErrorToast('Hata', 'İsim güncellenemedi.');
    }
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(search.toLowerCase());
    const matchesDate = !filterDate || format(new Date(workflow.created_at), 'yyyy-MM-dd') === filterDate;
    return matchesSearch && matchesDate;
  });

  if (isLoading) {
    return (
      <div className="flex-grow h-full flex items-center justify-center bg-gray-50 dark:bg-slate-800">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-grow h-full bg-gray-50 dark:bg-slate-800 overflow-y-auto relative transition-colors duration-300">
      <div className="sticky top-0 z-40 bg-gray-50/90 dark:bg-slate-800/90 backdrop-blur-md border-b border-gray-200/50 dark:border-slate-700/50 px-6 py-4">
        <div className="inline-block">
          <Logo />
        </div>
      </div>
      
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">İş Akışını Sil</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
              Bu iş akışını silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve içindeki tüm veriler kaybolur.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
              >
                İptal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingTemplateId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Şablonu Sil</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
              Bu şablonu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
              >
                İptal
              </button>
              <button
                onClick={confirmDeleteTemplate}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-8 sm:pt-12 sm:pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-medium text-gray-900 dark:text-white tracking-tight">İş Akışları</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">Tüm iş akışlarınızı buradan yönetebilirsiniz.</p>
          </div>
          <div className="flex flex-col min-[400px]:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={onViewDashboard}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95"
            >
              <LayoutDashboard className="w-5 h-5 text-primary" />
              Kaynak Takibi
            </button>
            <button
              onClick={() => handleCreateNew()}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Yeni İş Akışı
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm mb-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text"
                placeholder="İş akışı adına göre ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
              />
            </div>
            <div className="md:col-span-4">
              <DatePicker 
                value={filterDate}
                onChange={setFilterDate}
                placeholder="Tarihe Göre Filtrele"
                className="w-full"
                showClear
                mode="single"
              />
            </div>
          </div>
        </div>

        {filteredWorkflows.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 border-dashed">
            <div className="w-16 h-16 bg-primary-light dark:bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Henüz iş akışı yok</h3>
            <p className="text-gray-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
              Yeni bir iş akışı oluşturarak süreçlerinizi planlamaya başlayın.
            </p>
            <button
              onClick={() => handleCreateNew()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              İlk İş Akışını Oluştur
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredWorkflows.map((workflow) => (
              <div
                key={workflow.id}
                onClick={() => onSelectWorkflow(workflow.id)}
                className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 hover:shadow-md hover:border-primary transition-all cursor-pointer group flex flex-col h-40"
              >
                <div className="flex items-start justify-between mb-auto">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 bg-primary-light dark:bg-primary/10 text-primary rounded-lg shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    {editingId === workflow.id ? (
                      <div className="flex items-center gap-1 w-full" onClick={e => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === 'Enter') saveName(e as any, workflow.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                        />
                        <button onClick={(e) => saveName(e, workflow.id)} className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingId(null)} className="p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate pr-2">{workflow.name}</h3>
                    )}
                  </div>
                  
                  {editingId !== workflow.id && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={(e) => handleEditName(e, workflow)}
                        className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary-light dark:hover:bg-primary/10 rounded-md transition-colors"
                        title="İsmi Düzenle"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, workflow.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 text-xs text-gray-500 dark:text-slate-400 flex items-center justify-between">
                  <span>Oluşturulma:</span>
                  <span>{format(new Date(workflow.created_at), 'd MMM yyyy HH:mm', { locale: tr })}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {templates.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-medium text-gray-900 dark:text-white">Şablonlarım</h2>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Kaydettiğiniz şablonlardan yeni iş akışları oluşturun.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleCreateNew(template.id)}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 hover:shadow-md hover:border-primary transition-all cursor-pointer group flex flex-col h-40"
                >
                  <div className="flex items-start justify-between mb-auto">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 bg-primary-light dark:bg-primary/10 text-primary rounded-lg shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate pr-2">{template.name}</h3>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={(e) => handleDeleteTemplate(e, template.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
                        title="Şablonu Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 text-xs text-gray-500 dark:text-slate-400 flex items-center justify-between">
                    <span>Oluşturulma:</span>
                    <span>{format(new Date(template.createdAt), 'd MMM yyyy HH:mm', { locale: tr })}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
