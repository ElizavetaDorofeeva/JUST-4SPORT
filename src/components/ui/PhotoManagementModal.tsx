import React, { useState, useRef } from 'react';

interface PhotoManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasPhoto: boolean;
  onUpload: (file: File) => void;
  onDelete: () => void;
}

export const PhotoManagementModal: React.FC<PhotoManagementModalProps> = ({
  isOpen,
  onClose,
  hasPhoto,
  onUpload,
  onDelete
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    if (selectedFile) {
      onUpload(selectedFile);
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
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#8B1E1E] transition-colors"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-32 object-cover rounded-lg" />
            ) : (
              <>
                <span className="text-3xl text-gray-400 mb-2">📷</span>
                <span className="text-sm text-gray-600">Нажмите, чтобы выбрать фото</span>
              </>
            )}
          </div>

          {selectedFile && (
            <p className="text-sm text-gray-600 text-center">
              Выбрано: {selectedFile.name}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={!selectedFile}
              className="flex-1 px-4 py-2 bg-[#8B1E1E] text-white rounded-lg hover:bg-[#6B1616] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {hasPhoto ? 'Изменить' : 'Загрузить'}
            </button>
            
            {hasPhoto && (
              <button
                type="button"
                onClick={handleDeleteClick}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Удалить
              </button>
            )}
            
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};