import React from 'react';
import { Paperclip, X, Image as ImageIcon, FileText, Link as LinkIcon } from 'lucide-react';

interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'file' | 'link';
}

interface NodeAttachmentsSectionProps {
  attachments: Attachment[];
  isAddingAttachment: boolean;
  onSetIsAddingAttachment: (val: boolean) => void;
  newAttachmentName: string;
  onSetNewAttachmentName: (val: string) => void;
  newAttachmentUrl: string;
  onSetNewAttachmentUrl: (val: string) => void;
  onAddAttachment: () => void;
  onRemoveAttachment: (id: string) => void;
  onAttachmentClick: (e: React.MouseEvent, att: Attachment) => void;
}

export const NodeAttachmentsSection: React.FC<NodeAttachmentsSectionProps> = ({
  attachments,
  isAddingAttachment,
  onSetIsAddingAttachment,
  newAttachmentName,
  onSetNewAttachmentName,
  newAttachmentUrl,
  onSetNewAttachmentUrl,
  onAddAttachment,
  onRemoveAttachment,
  onAttachmentClick
}) => {
  if (attachments.length === 0 && !isAddingAttachment) return null;

  return (
    <div className="mt-3 pt-3 border-t border-gray-200/60">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 text-gray-500">
          <Paperclip className="w-3.5 h-3.5" />
          <span className="text-[10px] font-semibold tracking-wider">DOSYALAR / LİNKLER</span>
        </div>
        {isAddingAttachment && (
          <button 
            onClick={() => {
              onSetIsAddingAttachment(false);
              onSetNewAttachmentUrl('');
              onSetNewAttachmentName('');
            }}
            className="text-gray-400 hover:text-red-500"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        {attachments.map(att => (
          <div key={att.id} className="flex items-center justify-between bg-white border border-gray-200 rounded p-1.5 group">
            <a 
              href={att.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-blue-600 hover:underline truncate flex-1 min-w-0"
              onClick={(e) => onAttachmentClick(e, att)}
            >
              {att.type === 'image' ? <ImageIcon className="w-3 h-3 flex-shrink-0" /> : 
               att.type === 'file' ? <FileText className="w-3 h-3 flex-shrink-0" /> : 
               <LinkIcon className="w-3 h-3 flex-shrink-0" />}
              <span className="truncate">{att.name}</span>
            </a>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onRemoveAttachment(att.id);
              }}
              className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0"
              title="Dosyayı Sil"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {isAddingAttachment && (
          <div className="bg-gray-50 p-2 rounded border border-gray-200 space-y-2">
            <input
              type="text"
              placeholder="Link Adı (Opsiyonel)"
              value={newAttachmentName}
              onChange={(e) => onSetNewAttachmentName(e.target.value)}
              className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-indigo-500"
              autoFocus
            />
            <input
              type="text"
              placeholder="URL (https://...)"
              value={newAttachmentUrl}
              onChange={(e) => onSetNewAttachmentUrl(e.target.value)}
              className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-indigo-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') onAddAttachment();
              }}
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={onAddAttachment}
                disabled={!newAttachmentUrl}
                className="text-xs bg-indigo-500 text-white px-2 py-1 rounded hover:bg-indigo-600 disabled:opacity-50"
              >
                Ekle
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
