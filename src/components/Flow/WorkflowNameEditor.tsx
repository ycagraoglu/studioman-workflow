import React, { useState, useRef, useEffect } from 'react';
import { FileText, Pencil } from 'lucide-react';

interface WorkflowNameEditorProps {
  workflowName: string;
  onWorkflowNameChange: (name: string) => void;
}

export const WorkflowNameEditor: React.FC<WorkflowNameEditorProps> = ({
  workflowName,
  onWorkflowNameChange
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditingName]);

  const handleNameSubmit = () => {
    setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    }
  };

  return (
    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm px-3 py-2 flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingName(true)}>
      <FileText className="w-4 h-4 text-primary shrink-0" />
      
      {isEditingName ? (
        <div className="grid grid-cols-[auto] items-center">
          <span className="col-start-1 row-start-1 font-semibold text-transparent whitespace-pre px-0.5 pointer-events-none select-none min-w-[50px]">
            {workflowName || 'İş Akışı Adı'}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={workflowName}
            onChange={(e) => onWorkflowNameChange(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={handleKeyDown}
            className="col-start-1 row-start-1 font-semibold text-gray-800 dark:text-slate-200 bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-full min-w-[50px]"
            placeholder="İş Akışı Adı"
          />
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-800 dark:text-slate-200 whitespace-nowrap">
            {workflowName || 'İş Akışı Adı'}
          </span>
          <Pencil className="w-3.5 h-3.5 text-gray-400 hidden group-hover:block transition-none shrink-0" />
        </div>
      )}
    </div>
  );
};
