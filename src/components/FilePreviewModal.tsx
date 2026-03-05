import React, { useState, useRef, useEffect } from 'react';
import { X, Maximize2, Minimize2, ExternalLink, Download, GripHorizontal } from 'lucide-react';
import { createPortal } from 'react-dom';
import { cn } from '../utils/cn';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: {
    name: string;
    url: string;
    type: 'image' | 'file' | 'link';
  } | null;
}

export default function FilePreviewModal({ isOpen, onClose, file }: FilePreviewModalProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);

  // Center modal on open
  useEffect(() => {
    if (isOpen) {
      const width = isMaximized ? window.innerWidth : Math.min(800, window.innerWidth - 40);
      const height = isMaximized ? window.innerHeight : Math.min(600, window.innerHeight - 40);
      const x = (window.innerWidth - width) / 2;
      const y = (window.innerHeight - height) / 2;
      setPosition({ x, y });
    }
  }, [isOpen, isMaximized]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return;
    if (modalRef.current && (e.target as HTMLElement).closest('.modal-header')) {
      setIsDragging(true);
      const rect = modalRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (!isOpen || !file) return null;

  const renderContent = () => {
    if (file.type === 'image') {
      return (
        <div className="flex items-center justify-center h-full bg-gray-100/50 rounded-lg overflow-hidden">
          <img 
            src={file.url} 
            alt={file.name} 
            className="max-w-full max-h-full object-contain shadow-sm"
          />
        </div>
      );
    }

    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.url.startsWith('data:application/pdf');

    if (isPdf) {
      return (
        <div className="w-full h-full bg-white rounded-lg overflow-hidden border border-gray-200 relative">
          <object
            data={file.url}
            type="application/pdf"
            className="w-full h-full"
          >
            <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-gray-50">
              <p>PDF önizlemesi yüklenemedi.</p>
              <a 
                href={file.url} 
                download={file.name}
                className="mt-2 text-indigo-600 hover:underline flex items-center gap-1"
              >
                Dosyayı İndir <Download className="w-4 h-4" />
              </a>
            </div>
          </object>
          {/* Fallback/Overlay for blocked content */}
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg border border-gray-200 text-sm flex items-center gap-2 z-10">
            <span>Görüntülenemiyor mu?</span>
            <a 
              href={file.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline font-medium flex items-center gap-1"
            >
              Yeni sekmede aç <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      );
    }

    if (file.type === 'link' || file.type === 'file') {
      // For PDFs and other files that can be previewed in iframe
      // Note: Some sites block iframe embedding (X-Frame-Options)
      return (
        <div className="w-full h-full bg-white rounded-lg overflow-hidden border border-gray-200">
          <iframe 
            src={file.url} 
            className="w-full h-full" 
            title={file.name}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
          {/* Fallback/Overlay for blocked content */}
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg border border-gray-200 text-sm flex items-center gap-2">
            <span>Görüntülenemiyor mu?</span>
            <a 
              href={file.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline font-medium flex items-center gap-1"
            >
              Yeni sekmede aç <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <p>Bu dosya türü önizlenemiyor.</p>
        <a 
          href={file.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-2 text-indigo-600 hover:underline flex items-center gap-1"
        >
          İndir / Görüntüle <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-[1px] pointer-events-auto transition-opacity"
        onClick={onClose}
      />

      {/* Window */}
      <div
        ref={modalRef}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          width: isMaximized ? '100vw' : '800px',
          height: isMaximized ? '100vh' : '600px',
          maxWidth: isMaximized ? '100vw' : 'calc(100vw - 40px)',
          maxHeight: isMaximized ? '100vh' : 'calc(100vh - 40px)',
        }}
        className={cn(
          "absolute bg-white shadow-2xl pointer-events-auto flex flex-col transition-[width,height] duration-200 ease-in-out",
          isMaximized ? "rounded-none" : "rounded-xl border border-gray-200/50 ring-1 ring-black/5"
        )}
      >
        {/* Header */}
        <div 
          className="modal-header h-10 flex items-center justify-between px-3 border-b border-gray-100 bg-gray-50/50 select-none cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onDoubleClick={() => setIsMaximized(!isMaximized)}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <GripHorizontal className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-700 truncate">{file.name}</span>
          </div>
          
          <div className="flex items-center gap-1 ml-2" onMouseDown={e => e.stopPropagation()}>
            <a
              href={file.url}
              download={file.name}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title="İndir / Yeni Sekmede Aç"
            >
              <Download className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title={isMaximized ? "Küçült" : "Tam Ekran"}
            >
              {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden p-2 bg-white relative">
          {renderContent()}
        </div>
      </div>
    </div>,
    document.body
  );
}
