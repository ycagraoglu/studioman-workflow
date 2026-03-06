import React from 'react';
import { X, Save, Trash2 } from 'lucide-react';

interface FlowModalsProps {
  showClearConfirm: boolean;
  onCloseClearConfirm: () => void;
  onConfirmClear: () => void;
  showTemplateModal: boolean;
  onCloseTemplateModal: () => void;
  templateName: string;
  onTemplateNameChange: (name: string) => void;
  onSaveTemplate: () => void;
}

export const FlowModals: React.FC<FlowModalsProps> = ({
  showClearConfirm,
  onCloseClearConfirm,
  onConfirmClear,
  showTemplateModal,
  onCloseTemplateModal,
  templateName,
  onTemplateNameChange,
  onSaveTemplate
}) => {
  return (
    <>
      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Tümünü Temizle?</h3>
              <p className="text-gray-600">Bu işlem tüm işleri ve bağlantıları silecektir. Bu işlem geri alınamaz.</p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button 
                onClick={onCloseClearConfirm}
                className="px-4 py-2 text-gray-700 font-medium hover:text-gray-900 transition-colors"
              >
                Vazgeç
              </button>
              <button 
                onClick={onConfirmClear}
                className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-sm"
              >
                Evet, Temizle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Şablon Olarak Kaydet</h3>
                <button onClick={onCloseTemplateModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Şablon Adı</label>
                  <input 
                    type="text"
                    value={templateName}
                    onChange={(e) => onTemplateNameChange(e.target.value)}
                    placeholder="Örn: Standart Çekim Akışı"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    autoFocus
                  />
                </div>
                <p className="text-sm text-gray-500 bg-indigo-50 p-3 rounded-lg">
                  Bu şablonu daha sonra yeni bir iş akışı oluştururken kullanabilirsiniz.
                </p>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button 
                onClick={onCloseTemplateModal}
                className="px-4 py-2 text-gray-700 font-medium hover:text-gray-900 transition-colors"
              >
                Vazgeç
              </button>
              <button 
                onClick={onSaveTemplate}
                disabled={!templateName.trim()}
                className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
