import React from 'react';
import { MapPin, User, Camera, X, ExternalLink, Edit2, Check } from 'lucide-react';
import { Asset } from '../../types';

interface NodeAssetSectionProps {
  assets: Asset[];
  isEditing: boolean;
  editingMapUrlId: string | null;
  onSetEditingMapUrlId: (id: string | null) => void;
  onRemoveAsset: (id: string) => void;
  onUpdateAssetMapUrl: (id: string, url: string) => void;
}

export const NodeAssetSection: React.FC<NodeAssetSectionProps> = ({
  assets,
  isEditing,
  editingMapUrlId,
  onSetEditingMapUrlId,
  onRemoveAsset,
  onUpdateAssetMapUrl
}) => {
  const renderIcon = (type: string) => {
    switch (type) {
      case 'location': return <MapPin className="w-3 h-3" />;
      case 'personnel': return <User className="w-3 h-3" />;
      case 'equipment': return <Camera className="w-3 h-3" />;
      default: return null;
    }
  };

  const locations = assets.filter(a => a.type === 'location');
  const personnel = assets.filter(a => a.type === 'personnel');
  const equipment = assets.filter(a => a.type === 'equipment');

  return (
    <div className="space-y-3">
      {/* Locations */}
      {locations.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[10px] font-semibold text-gray-400 dark:text-slate-400 tracking-wider px-1">LOKASYONLAR</div>
          {locations.map((asset) => (
            <div key={asset.id} className="flex flex-col bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded p-1.5 group shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-500">
                    {renderIcon(asset.type)}
                  </div>
                  <span className="text-xs font-medium text-gray-700 dark:text-slate-200">{asset.name}</span>
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
                        onSetEditingMapUrlId(asset.id);
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
                        onSetEditingMapUrlId(asset.id);
                      }}
                      className="text-[10px] text-gray-400 dark:text-slate-400 hover:text-indigo-600 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Linki Düzenle"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <button 
                  onClick={() => onRemoveAsset(asset.id)}
                  className="text-gray-400 dark:text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              {(isEditing || editingMapUrlId === asset.id) && (
                <div className="mt-2 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-gray-400 dark:text-slate-400" />
                  <input
                    type="text"
                    value={asset.mapUrl || ''}
                    onChange={(e) => onUpdateAssetMapUrl(asset.id, e.target.value)}
                    onBlur={() => {
                      if (!isEditing) onSetEditingMapUrlId(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isEditing) {
                        onSetEditingMapUrlId(null);
                      }
                    }}
                    autoFocus={editingMapUrlId === asset.id && !isEditing}
                    placeholder="Google Maps Linki"
                    className="flex-1 text-[10px] text-gray-600 dark:text-slate-300 border-b border-gray-200 dark:border-slate-600 focus:border-indigo-500 focus:outline-none bg-transparent pb-0.5"
                  />
                  {editingMapUrlId === asset.id && !isEditing && (
                    <button 
                      onClick={() => onSetEditingMapUrlId(null)}
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
      {personnel.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[10px] font-semibold text-gray-400 dark:text-slate-400 tracking-wider px-1">EKİP</div>
          {personnel.map((asset) => (
            <div key={asset.id} className="flex items-center justify-between bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded p-1.5 group shadow-sm">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500">
                  {renderIcon(asset.type)}
                </div>
                <span className="text-xs font-medium text-gray-700 dark:text-slate-200">{asset.name}</span>
              </div>
              <button 
                onClick={() => onRemoveAsset(asset.id)}
                className="text-gray-400 dark:text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Equipment */}
      {equipment.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[10px] font-semibold text-gray-400 dark:text-slate-400 tracking-wider px-1">EKİPMANLAR</div>
          {equipment.map((asset) => (
            <div key={asset.id} className="flex items-center justify-between bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded p-1.5 group shadow-sm">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-amber-50 dark:bg-amber-900/20 text-amber-500">
                  {renderIcon(asset.type)}
                </div>
                <span className="text-xs font-medium text-gray-700 dark:text-slate-200">{asset.name}</span>
              </div>
              <button 
                onClick={() => onRemoveAsset(asset.id)}
                className="text-gray-400 dark:text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
