import React, { useState, useEffect } from 'react';

interface PhotoManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasPhoto: boolean;
  currentPhotoUrl?: string;
  onUpload: (url: string) => void;
  onDelete: () => void;
}

export const PhotoManagementModal: React.FC<PhotoManagementModalProps> = ({
  isOpen,
  onClose,
  hasPhoto,
  currentPhotoUrl,
  onUpload,
  onDelete
}) => {
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      setUrl(currentPhotoUrl || '');
    }
  }, [isOpen, currentPhotoUrl]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (url.trim()) {
      onUpload(url.trim());
    }
  };

  const handleDeleteClick = () => {
    onDelete();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl animate-fade-in">
        <h3 className="text-xl font-bold text-[#8B1E1E] mb-4">
          {hasPhoto ? 'Изменить фото' : 'Загрузить фото'}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ссылка на фото (URL)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1E1E] focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleSave}
                disabled={!url.trim()}
                className="px-4 py-2 bg-[#8B1E1E] text-white rounded-lg hover:bg-[#6B1616] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {hasPhoto ? 'Изменить' : 'Загрузить'}
              </button>
            </div>
          </div>

          {hasPhoto && (
            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Отмена
              </button>
              
              <button
                onClick={handleDeleteClick}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Удалить
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};