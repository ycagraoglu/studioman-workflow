import React, { useCallback } from 'react';

export function useAttachmentHandler(
  setPreviewFile: (file: { name: string; url: string; type: 'image' | 'file' | 'link' } | null) => void
) {
  const handleAttachmentClick = useCallback((e: React.MouseEvent, att: { name: string; url: string; type: 'image' | 'file' | 'link' }) => {
    e.stopPropagation();
    if (att.type === 'image') {
      e.preventDefault();
      setPreviewFile(att);
    } else if (att.url.startsWith('data:')) {
      e.preventDefault();
      const newWin = window.open('', '_blank');
      if (newWin) {
        newWin.document.write('<!DOCTYPE html><html><head><title>Yükleniyor...</title></head><body><p>Dosya hazırlanıyor, lütfen bekleyin...</p></body></html>');
        fetch(att.url)
          .then(res => res.blob())
          .then(blob => {
            const blobUrl = URL.createObjectURL(blob);
            newWin.location.href = blobUrl;
            setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
          })
          .catch(err => {
             console.error("Failed to load data URL:", err);
             newWin.document.body.innerHTML = '<p style="color:red">Dosya yüklenirken bir hata oluştu.</p>';
          });
      } else {
          alert('Lütfen açılır pencerelere izin verin.');
      }
    }
  }, [setPreviewFile]);

  return { handleAttachmentClick };
}
