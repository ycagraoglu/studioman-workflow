import React from 'react';

interface NodeDeleteConfirmProps {
  onCancel: (e: React.MouseEvent) => void;
  onConfirm: (e: React.MouseEvent) => void;
}

export const NodeDeleteConfirm: React.FC<NodeDeleteConfirmProps> = ({ onCancel, onConfirm }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/95 rounded-xl border-2 border-red-500 shadow-lg">
      <div className="text-center p-4">
        <p className="text-sm font-medium text-gray-900 mb-3">Bu adımı silmek istediğinize emin misiniz?</p>
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            İptal
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
          >
            Sil
          </button>
        </div>
      </div>
    </div>
  );
};
