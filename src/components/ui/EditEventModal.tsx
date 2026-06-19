import React, { useState, useEffect, useRef } from 'react';
import { EventCreateDto } from '../../api/event';
import { eventApi } from '../../api/event';

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EventCreateDto) => Promise<void>;
  initialData: EventCreateDto & { id?: string; photo?: { id: string; path: string; title: string } | null };
  loading?: boolean;
  eventId?: string;
  onPhotoChanged?: () => void;
}

export const EditEventModal: React.FC<EditEventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  loading = false,
  eventId,
  onPhotoChanged
}) => {
  const [formData, setFormData] = useState<EventCreateDto>(initialData);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [shouldDeletePhoto, setShouldDeletePhoto] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
      
      if (initialData.photo?.path && !shouldDeletePhoto) {
        loadPhoto(initialData.photo.path);
      } else {
        setPhotoUrl(null);
      }
      
      setSelectedFile(null);
      setPreview(null);
      setShouldDeletePhoto(false);
    }
  }, [initialData, isOpen]);

  const loadPhoto = async (photoPath: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/photo/${photoPath}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPhotoUrl(url);
      }
    } catch (error) {
      console.error('❌ Не удалось загрузить фото:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setShouldDeletePhoto(false);
    }
  };

  const handleDeletePhoto = () => {
    setShouldDeletePhoto(true);
    setSelectedFile(null);
    setPreview(null);
    setPhotoUrl(null);
  };

  const handleCancelDelete = () => {
    setShouldDeletePhoto(false);
    if (initialData.photo?.path) {
      loadPhoto(initialData.photo.path);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      if (eventId) {
        if (shouldDeletePhoto) {
          await eventApi.deleteEventPhoto(eventId);
        } else if (selectedFile) {
          await eventApi.uploadEventPhoto(eventId, selectedFile);
        }
      }
      
      await onSave(formData);
      
      if ((shouldDeletePhoto || selectedFile) && onPhotoChanged) {
        onPhotoChanged();
      }
      
      onClose();
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
      alert('❌ Не удалось сохранить изменения');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const showPhoto = shouldDeletePhoto ? null : (preview || photoUrl);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-[#8B1E1E] mb-6">Редактировать мероприятие</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Фото мероприятия
            </label>
            
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-[#8B1E1E] transition-colors bg-gray-50">
              <div className="flex flex-col items-center gap-4">
                
                {showPhoto ? (
                  <div className="relative w-40 h-40 rounded-xl overflow-hidden shadow-lg">
                    <img 
                      src={showPhoto} 
                      alt="Фото мероприятия" 
                      className="w-full h-full object-cover"
                    />
                    {shouldDeletePhoto && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="text-center text-white">
                          <svg className="w-10 h-10 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span className="text-sm font-bold">Будет удалено</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                )}

                <div className="text-center">
                  {photoUrl && !shouldDeletePhoto ? (
                    <div>
                      <p className="text-base font-semibold text-gray-900 mb-1">
                        Текущее фото
                      </p>
                      <p className="text-sm text-gray-500">
                        Нажмите кнопку ниже, чтобы изменить
                      </p>
                    </div>
                  ) : shouldDeletePhoto ? (
                    <div>
                      <p className="text-base font-semibold text-red-600 mb-1">
                        Фото будет удалено
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-base font-semibold text-gray-900 mb-1">
                        Фото не загружено
                      </p>
                      <p className="text-sm text-gray-500">
                        Добавьте фото мероприятия
                      </p>
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                
                <div className="flex gap-3 flex-wrap justify-center">
                  {photoUrl && !shouldDeletePhoto ? (
                    <>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-5 py-2.5 bg-[#8B1E1E] text-white rounded-xl hover:bg-[#6B1616] transition-all text-sm font-medium shadow-sm hover:shadow-md flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Изменить фото
                      </button>
                      <button
                        type="button"
                        onClick={handleDeletePhoto}
                        className="px-5 py-2.5 bg-red-50 text-red-700 border border-red-200 rounded-xl hover:bg-red-100 transition-all text-sm font-medium flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Удалить
                      </button>
                    </>
                  ) : shouldDeletePhoto ? (
                    <button
                      type="button"
                      onClick={() => {
                        setShouldDeletePhoto(false);
                        if (initialData.photo?.path) {
                          loadPhoto(initialData.photo.path);
                        }
                      }}
                      className="px-5 py-2.5 bg-green-50 text-green-700 border border-green-200 rounded-xl hover:bg-green-100 transition-all text-sm font-medium flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                      Отменить удаление
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-2.5 bg-[#8B1E1E] text-white rounded-xl hover:bg-[#6B1616] transition-all text-sm font-medium shadow-sm hover:shadow-md flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Выбрать фото
                    </button>
                  )}
                </div>

                {selectedFile && (
                  <div className="text-xs text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200">
                    <span className="font-medium">📎 Файл:</span> {selectedFile.name}
                    <span className="mx-2">•</span>
                    <span className="font-medium">📦 Размер:</span> {(selectedFile.size / 1024).toFixed(1)} KB
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Место</label>
              <input
                name="place"
                value={formData.place}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Стоимость</label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата начала</label>
              <input
                type="datetime-local"
                name="dateStart"
                value={formData.dateStart}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата окончания</label>
              <input
                type="datetime-local"
                name="dateEnd"
                value={formData.dateEnd}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дедлайн записи</label>
            <input
              type="datetime-local"
              name="deadline"
              value={formData.deadline || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
              disabled={isProcessing}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading || isProcessing}
              className="flex-1 px-4 py-2 bg-[#8B1E1E] text-white rounded-xl hover:bg-[#6B1616] transition-colors disabled:opacity-50"
            >
              {isProcessing ? 'Сохранение...' : loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};