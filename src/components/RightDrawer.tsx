import React, { useState, useEffect } from 'react';
import { useDrawer } from '../contexts/DrawerContext';
import { useReactFlow, MarkerType } from '@xyflow/react';
import { Search, X, MapPin, User, Camera, PlusSquare, Play, Calendar, ArrowLeft, ChevronRight, Briefcase, Settings, FileText, Video, Music, Image as ImageIcon, CheckSquare, Plus, Aperture, Focus, MonitorPlay, Film, Clapperboard, Scissors, Wand2, Sun, Printer, Users, Palette, HardDrive, Share2, Car, Utensils, Cake, Laptop, Monitor, PartyPopper, Heart, Church, Tent, Plane, Sparkles, Brush, Crown, Gift, Truck, Mic, Cloud, Smartphone, Edit2, Trash2 } from 'lucide-react';
import { Asset, NodeData, AssetCategory } from '../types';
import { cn } from '../utils/cn';
import { showConflictToast } from '../utils/toast';

const ICON_MAP: Record<string, React.ElementType> = {
  PlusSquare,
  Calendar,
  Play,
  Briefcase,
  Settings,
  FileText,
  Video,
  Music,
  ImageIcon,
  CheckSquare,
  Camera,
  Aperture,
  Focus,
  MonitorPlay,
  Film,
  Clapperboard,
  Scissors,
  Wand2,
  Sun,
  Printer,
  Users,
  Palette,
  HardDrive,
  Share2,
  Car,
  Utensils,
  Cake,
  Laptop,
  Monitor,
  PartyPopper,
  Heart,
  Church,
  Tent,
  Plane,
  Sparkles,
  Brush,
  Crown,
  Gift,
  Truck,
  Mic,
  Cloud,
  Smartphone
};

const ASSETS: Asset[] = [
  { id: 'loc-1', type: 'location', name: 'Studio A', roleOrDetails: 'İç Mekan' },
  { id: 'loc-2', type: 'location', name: 'Studio B', roleOrDetails: 'İç Mekan' },
  { id: 'loc-3', type: 'location', name: 'Kır Bahçesi', roleOrDetails: 'Dış Mekan' },
  { id: 'per-1', type: 'personnel', name: 'Ali Yılmaz', roleOrDetails: 'Fotoğrafçı' },
  { id: 'per-2', type: 'personnel', name: 'Ayşe Demir', roleOrDetails: 'Asistan' },
  { id: 'per-3', type: 'personnel', name: 'Can Kaya', roleOrDetails: 'Editör' },
  { id: 'eq-1', type: 'equipment', name: 'Canon R5', roleOrDetails: 'Gövde' },
  { id: 'eq-2', type: 'equipment', name: 'Sony A7IV', roleOrDetails: 'Gövde' },
  { id: 'eq-3', type: 'equipment', name: '24-70mm f/2.8', roleOrDetails: 'Lens' },
  { id: 'eq-4', type: 'equipment', name: 'DJI Mavic 3', roleOrDetails: 'Dron' },
  { id: 'eq-5', type: 'equipment', name: 'Temizlik Kiti', roleOrDetails: 'Diğer' },
  { id: 'veh-1', type: 'vehicle', name: '16 BA 529', roleOrDetails: 'Şirket Aracı' },
  { id: 'veh-2', type: 'vehicle', name: '34 ABC 123', roleOrDetails: 'Şirket Aracı' },
];

const DEFAULT_NODE_TYPES = [
  { id: 'workstation', title: 'Boş İş (Workstation)', description: 'Yeni bir çalışma alanı oluşturun', iconName: 'PlusSquare', color: 'text-primary' },
  { id: 'meeting', title: 'Toplantı', description: 'Ekip ile toplantı planlayın', iconName: 'Calendar', color: 'text-blue-500' },
  { id: 'shooting', title: 'Çekim', description: 'Fotoğraf/Video çekim aşaması', iconName: 'Play', color: 'text-emerald-500' },
];

export default function RightDrawer() {
  const { isOpen, mode, targetNodeId, targetEdgeId, initialCategory, closeDrawer } = useDrawer();
  const { setNodes, setEdges } = useReactFlow();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory>(null);

  useEffect(() => {
    if (isOpen && initialCategory) {
      setSelectedCategory(initialCategory);
    } else if (!isOpen) {
      setTimeout(() => {
        setSelectedCategory(null);
        setSearch('');
      }, 300);
    }
  }, [isOpen, initialCategory]);

  const [customNodeTypes, setCustomNodeTypes] = useState<any[]>(() => {
    const saved = localStorage.getItem('customNodeTypes');
    return saved ? JSON.parse(saved) : [];
  });

  const [isAddingNewType, setIsAddingNewType] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [newTypeTitle, setNewTypeTitle] = useState('');
  const [newTypeDesc, setNewTypeDesc] = useState('');
  const [newTypeIcon, setNewTypeIcon] = useState('Briefcase');
  const [nodeTypeToDelete, setNodeTypeToDelete] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('customNodeTypes', JSON.stringify(customNodeTypes));
  }, [customNodeTypes]);

  // Reset category when drawer closes or mode changes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setSelectedCategory(null);
        setIsAddingNewType(false);
        setEditingNodeId(null);
        setNewTypeTitle('');
        setNewTypeDesc('');
      }, 300);
      setSearch('');

      // Clean up any stray 'addStep' nodes if there are other nodes
      setNodes((nds) => {
        const hasOtherNodes = nds.some(n => n.type !== 'addStep');
        if (hasOtherNodes) {
          return nds.filter(n => n.type !== 'addStep');
        }
        return nds;
      });
    }
  }, [isOpen, mode, setNodes]);

  const handleAddNode = (typeId: string, title: string) => {
    if (!targetNodeId) return;
    
    setNodes((nds) => {
      const targetNode = nds.find(n => n.id === targetNodeId);
      
      // Calculate times based on previous node
      let newStartTime = '09:00';
      let newEndTime = '10:00';
      let newDate = new Date().toISOString().split('T')[0];

      if (targetNode && targetNode.type !== 'addStep' && targetNode.data.endTime) {
          newDate = targetNode.data.date as string || newDate;
          newStartTime = targetNode.data.endTime as string;
          
          // Add 30 minutes duration
          const [h, m] = newStartTime.split(':').map(Number);
          const startMins = h * 60 + m;
          const endMins = startMins + 30;
          const endH = Math.floor(endMins / 60) % 24;
          const endM = endMins % 60;
          newEndTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
      }

      // If target is the 'addStep' node, replace it
      if (targetNode?.type === 'addStep') {
        return nds.map((node) => {
          if (node.id === targetNodeId) {
            return {
              ...node,
              type: 'workstation',
              data: { title: title, startTime: '09:00', endTime: '10:00', date: newDate, assets: [] }, // Keep default for first node
            };
          }
          return node;
        });
      }

      // Otherwise, add a new node to the right of the target node
      const newNodeId = crypto.randomUUID();
      const newX = (targetNode?.position.x || 0) + 350; // Offset to the right
      const newY = targetNode?.position.y || 0;

      // Also create an edge connecting them
      setEdges((eds) => [
        ...eds,
        {
          id: `e-${targetNodeId}-${newNodeId}`,
          source: targetNodeId,
          target: newNodeId,
          type: 'default',
          animated: false,
          style: { stroke: '#737373', strokeWidth: 3 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: '#737373',
          },
        }
      ]);

      // Remove any existing 'addStep' nodes from the canvas
      const filteredNodes = nds.filter(n => n.type !== 'addStep');

      return [
        ...filteredNodes,
        {
          id: newNodeId,
          type: 'workstation',
          position: { x: newX, y: newY },
          data: { title: title, startTime: newStartTime, endTime: newEndTime, date: newDate, assets: [] },
        }
      ];
    });
    closeDrawer();
  };

  const handleAddAsset = (asset: Asset) => {
    if (targetNodeId) {
      setNodes((nds) => {
        const targetNode = nds.find(n => n.id === targetNodeId);
        if (!targetNode) return nds;

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

        // Check for conflicts before adding
        if (asset.type !== 'location') {
          const conflictingNode = nds.find(otherNode => {
            if (otherNode.id === targetNodeId) return false;
            if (otherNode.data.date !== targetNode.data.date) return false;
            if (!checkOverlap(
              targetNode.data.startTime as string || '09:00', 
              targetNode.data.endTime as string || '10:00', 
              otherNode.data.startTime as string || '09:00', 
              otherNode.data.endTime as string || '10:00'
            )) return false;
            
            const otherAssets = (otherNode.data.assets as Asset[]) || [];
            return otherAssets.some(a => a.id === asset.id);
          });

          if (conflictingNode) {
            showConflictToast(asset.name, (conflictingNode.data.title as string) || 'İsimsiz İş');
            return nds; // Return unchanged nodes
          }
        }

        return nds.map((node) => {
          if (node.id === targetNodeId) {
            const currentAssets = (node.data as NodeData).assets || [];
            if (!currentAssets.some(a => a.id === asset.id)) {
              return {
                ...node,
                data: {
                  ...node.data,
                  assets: [...currentAssets, asset],
                },
              };
            }
          }
          return node;
        });
      });
    } else if (targetEdgeId) {
      setEdges((eds) => 
        eds.map(edge => {
          if (edge.id === targetEdgeId) {
            return {
              ...edge,
              data: { ...edge.data, vehicle: asset }
            };
          }
          return edge;
        })
      );
    }
    if (asset.type === 'vehicle') {
      closeDrawer();
    }
    // Don't close drawer immediately so they can add multiple
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case 'location': return <MapPin className="w-5 h-5" />;
      case 'personnel': return <User className="w-5 h-5" />;
      case 'equipment': return <Camera className="w-5 h-5" />;
      case 'vehicle': return <Car className="w-5 h-5" />;
      default: return null;
    }
  };

  const filteredAssets = ASSETS.filter(a => 
    (!selectedCategory || a.type === selectedCategory) &&
    (a.name.toLowerCase().includes(search.toLowerCase()) || a.roleOrDetails?.toLowerCase().includes(search.toLowerCase()))
  );
  
  const allNodeTypes = [...DEFAULT_NODE_TYPES, ...customNodeTypes];
  const filteredNodes = allNodeTypes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.description.toLowerCase().includes(search.toLowerCase()));

  const getCategoryTitle = (category: AssetCategory) => {
    switch (category) {
      case 'location': return 'Lokasyonlar';
      case 'personnel': return 'Ekip';
      case 'equipment': return 'Ekipmanlar';
      case 'vehicle': return 'Araçlar';
      default: return 'Kaynak Ekle';
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="absolute inset-0 bg-black/5 z-40 transition-opacity"
          onClick={closeDrawer}
        />
      )}

      {nodeTypeToDelete && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/20 dark:bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">İş Tipini Sil</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
              Bu iş tipini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setNodeTypeToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  setCustomNodeTypes(prev => prev.filter(n => n.id !== nodeTypeToDelete));
                  if (editingNodeId === nodeTypeToDelete) {
                    setIsAddingNewType(false);
                    setEditingNodeId(null);
                    setNewTypeTitle('');
                    setNewTypeDesc('');
                  }
                  setNodeTypeToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Drawer */}
      <div 
        className={cn(
          "absolute top-0 right-0 h-full w-full sm:w-[400px] bg-white dark:bg-slate-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {mode === 'addAsset' && selectedCategory && selectedCategory !== 'vehicle' && (
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-colors text-gray-500 dark:text-gray-400"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {mode === 'addNode' ? 'Ne eklemek istersiniz?' : getCategoryTitle(selectedCategory)}
              </h2>
            </div>
            <button onClick={closeDrawer} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col">
          {mode === 'addNode' && (
            <div className="flex-1 flex flex-col">
              <div className="space-y-1 mb-4">
                {filteredNodes.map((nodeType) => {
                  const Icon = ICON_MAP[nodeType.iconName] || Briefcase;
                  const isCustom = nodeType.id.startsWith('custom-');
                  return (
                    <div key={nodeType.id} className="relative group/item">
                      <button
                        onClick={() => handleAddNode(nodeType.id, nodeType.title)}
                        className="w-full flex items-start gap-4 p-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors text-left group"
                      >
                        <div className={cn("mt-0.5 p-2 bg-white dark:bg-slate-700 border border-gray-100 dark:border-slate-600 rounded-lg shadow-sm group-hover:shadow transition-all", nodeType.color)}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="pr-16">
                          <div className="font-medium text-gray-900 dark:text-white text-sm">{nodeType.title}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{nodeType.description}</div>
                        </div>
                      </button>
                      {isCustom && (
                        <div className="absolute top-1/2 right-2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingNodeId(nodeType.id);
                              setNewTypeTitle(nodeType.title);
                              setNewTypeDesc(nodeType.description);
                              setNewTypeIcon(nodeType.iconName);
                              setIsAddingNewType(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary-light dark:hover:bg-primary/10 rounded-md transition-colors"
                            title="Düzenle"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setNodeTypeToDelete(nodeType.id);
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
                {filteredNodes.length === 0 && (
                  <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                    Sonuç bulunamadı.
                  </div>
                )}
              </div>

              <div className="mt-auto pt-4 border-t border-gray-100 dark:border-slate-700">
                {isAddingNewType ? (
                  <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 border border-gray-200 dark:border-slate-600">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{editingNodeId ? 'İş Tipini Düzenle' : 'Yeni İş Tipi Ekle'}</h3>
                      <button onClick={() => {
                        setIsAddingNewType(false);
                        setEditingNodeId(null);
                        setNewTypeTitle('');
                        setNewTypeDesc('');
                      }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">İş Adı</label>
                        <input 
                          type="text" 
                          value={newTypeTitle}
                          onChange={e => setNewTypeTitle(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-md text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          placeholder="Örn: Kurgu"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Açıklama</label>
                        <input 
                          type="text" 
                          value={newTypeDesc}
                          onChange={e => setNewTypeDesc(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-md text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          placeholder="Örn: Video montaj aşaması"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">İkon</label>
                        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                          {[
                            'Briefcase', 'Settings', 'FileText', 'CheckSquare', 'Users', 
                            'Camera', 'Video', 'ImageIcon', 'Film', 'Clapperboard', 
                            'Aperture', 'Focus', 'Sun', 'Palette', 'Wand2', 
                            'Scissors', 'MonitorPlay', 'Music', 'Printer', 'HardDrive', 'Share2',
                            'Car', 'Utensils', 'Cake', 'Laptop', 'Monitor', 'PartyPopper', 
                            'Heart', 'Church', 'Tent', 'Plane', 'Sparkles', 'Brush', 
                            'Crown', 'Gift', 'Truck', 'Mic', 'Cloud', 'Smartphone'
                          ].map(iconName => {
                            const IconComponent = ICON_MAP[iconName];
                            return (
                              <button
                                key={iconName}
                                onClick={() => setNewTypeIcon(iconName)}
                                className={cn(
                                  "p-2 rounded-md border transition-colors",
                                  newTypeIcon === iconName ? "border-primary bg-primary-light dark:bg-primary/10 text-primary" : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-600"
                                )}
                                title={iconName}
                              >
                                <IconComponent className="w-4 h-4" />
                              </button>
                            )
                          })}
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          if (!newTypeTitle.trim()) return;
                          if (editingNodeId) {
                            setCustomNodeTypes(prev => prev.map(n => n.id === editingNodeId ? {
                              ...n,
                              title: newTypeTitle,
                              description: newTypeDesc,
                              iconName: newTypeIcon
                            } : n));
                          } else {
                            setCustomNodeTypes([...customNodeTypes, {
                              id: `custom-${crypto.randomUUID()}`,
                              title: newTypeTitle,
                              description: newTypeDesc,
                              iconName: newTypeIcon,
                              color: 'text-primary'
                            }]);
                          }
                          setNewTypeTitle('');
                          setNewTypeDesc('');
                          setIsAddingNewType(false);
                          setEditingNodeId(null);
                        }}
                        disabled={!newTypeTitle.trim()}
                        className="w-full py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
                      >
                        {editingNodeId ? 'Güncelle' : 'Ekle'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setEditingNodeId(null);
                      setNewTypeTitle('');
                      setNewTypeDesc('');
                      setNewTypeIcon('Briefcase');
                      setIsAddingNewType(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary hover:border-primary-light hover:bg-primary-light dark:hover:bg-primary/10 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Yeni İş Tipi Oluştur
                  </button>
                )}
              </div>
            </div>
          )}

          {mode === 'addAsset' && !selectedCategory && (
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory('location')}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-lg shadow-sm group-hover:shadow transition-all text-blue-500">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">Lokasyonlar</div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              
              <button
                onClick={() => setSelectedCategory('personnel')}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-lg shadow-sm group-hover:shadow transition-all text-emerald-500">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">Ekip</div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              
              <button
                onClick={() => setSelectedCategory('equipment')}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-lg shadow-sm group-hover:shadow transition-all text-amber-500">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">Ekipmanlar</div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          )}

          {mode === 'addAsset' && selectedCategory && (
            <div className="space-y-1">
              {filteredAssets.map(asset => (
                <button
                  key={asset.id}
                  onClick={() => handleAddAsset(asset)}
                  className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors text-left group"
                >
                  <div className={cn(
                    "p-1.5 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-md shadow-sm group-hover:shadow transition-all",
                    asset.type === 'location' ? "text-blue-500" :
                    asset.type === 'personnel' ? "text-emerald-500" : 
                    asset.type === 'vehicle' ? "text-amber-800" : "text-amber-500"
                  )}>
                    {renderIcon(asset.type)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">{asset.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{asset.roleOrDetails}</div>
                  </div>
                </button>
              ))}
              {filteredAssets.length === 0 && (
                <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                  Sonuç bulunamadı.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
