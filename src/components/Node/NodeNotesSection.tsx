import React from 'react';
import { FileText, X } from 'lucide-react';

interface NodeNotesSectionProps {
  notes: string | undefined;
  isEditing: boolean;
  isAddingNote: boolean;
  onSetIsAddingNote: (val: boolean) => void;
  onUpdateNotes: (notes: string) => void;
}

export const NodeNotesSection: React.FC<NodeNotesSectionProps> = ({
  notes,
  isEditing,
  isAddingNote,
  onSetIsAddingNote,
  onUpdateNotes
}) => {
  if (!notes && !isAddingNote) return null;

  return (
    <div className="mt-3 pt-3 border-t border-gray-200/60">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 text-gray-500">
          <FileText className="w-3.5 h-3.5" />
          <span className="text-[10px] font-semibold tracking-wider">NOTLAR</span>
        </div>
        {isAddingNote && !notes && (
          <button 
            onClick={() => onSetIsAddingNote(false)}
            className="text-gray-400 hover:text-red-500"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
      {isEditing || isAddingNote ? (
        <textarea
          value={notes || ''}
          onChange={(e) => onUpdateNotes(e.target.value)}
          placeholder="Görevle ilgili notlar..."
          className="w-full text-xs text-gray-700 bg-white/50 border border-gray-200 rounded p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
          rows={2}
          autoFocus={isAddingNote}
        />
      ) : (
        <div className="text-xs text-gray-600 bg-white/50 rounded p-2 border border-transparent whitespace-pre-wrap">
          {notes}
        </div>
      )}
    </div>
  );
};
