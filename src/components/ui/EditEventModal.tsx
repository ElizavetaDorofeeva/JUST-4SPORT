import React, { useState, useEffect } from 'react';
import { EventCreateDto } from '../../api/event';

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EventCreateDto) => Promise<void>;
  initialData: EventCreateDto;
  loading?: boolean;
}

export const EditEventModal: React.FC<EditEventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  loading = false
}) => {
  const [formData, setFormData] = useState<EventCreateDto>(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-[#8B1E1E] mb-6">Редактировать мероприятие</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#8B1E1E] text-white rounded-xl hover:bg-[#6B1616] transition-colors disabled:opacity-50"
            >
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};