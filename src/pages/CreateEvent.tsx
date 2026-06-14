import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventApi, EventCreateDto } from '../api/event'; 
import { Button } from '../components/ui/Button';

const SPORTS = [
  { value: 'VOLLEYBALL', label: 'Волейбол' },
  { value: 'BASKETBALL', label: 'Баскетбол' },
  { value: 'SOCCER', label: 'Футбол' },
  { value: 'HOCKEY', label: 'Хоккей' },
  { value: 'ULTIMATE', label: 'Алтимат' }
];

const EVENT_TYPES = [
  { value: 'TRAINING', label: 'Тренировка' },
  { value: 'GAME', label: 'Игра' },
  { value: 'TOURNAMENT', label: 'Турнир' }
];

const SKILL_LEVELS = [
  { value: 'START', label: 'Новичок' },
  { value: 'MEDIUM', label: 'Средний' },
  { value: 'HARD', label: 'Продвинутый' }
];

export const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    place: '',
    cost: '0',
    sport: 'VOLLEYBALL',
    eventType: 'TRAINING',
    skillLevel: 'START',
    teamsNumber: '2',
    dateStart: '',
    dateEnd: '',
    deadline: ''
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const eventDto: EventCreateDto = {
        name: formData.name,
        description: formData.description,
        place: formData.place,
        cost: Number(formData.cost),
        sport: formData.sport,
        eventType: formData.eventType,
        skillLevel: formData.skillLevel,
        teamsNumber: Number(formData.teamsNumber),
        dateStart: new Date(formData.dateStart).toISOString(),
        dateEnd: new Date(formData.dateEnd).toISOString(),
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null
      };

      await eventApi.createEvent(eventDto, imageFile || undefined);

      navigate('/dashboard');
    } catch (err: any) {
      console.error('Ошибка создания:', err);
      console.error('Ответ сервера:', err.response?.data);
      setError(err.response?.data?.message || 'Не удалось создать мероприятие');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 flex justify-center">
      <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Создание мероприятия</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
            <input
              name="name"
              required
              placeholder="Какое-то название"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E] transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Вид спорта</label>
              <select
                name="sport"
                value={formData.sport}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E] appearance-none"
              >
                {SPORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Тип активности</label>
              <select
                name="eventType"
                value={formData.eventType}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E] appearance-none"
              >
                {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата начала</label>
              <input
                type="datetime-local"
                name="dateStart"
                required
                value={formData.dateStart}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]"
              />
            </div>

             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата окончания</label>
              <input
                type="datetime-local"
                name="dateEnd"
                required
                value={formData.dateEnd}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Кол-во человек/команд</label>
              <input
                type="number"
                name="teamsNumber"
                min="1"
                value={formData.teamsNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]"
              />
            </div>

             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дедлайн записи</label>
              <input
                type="datetime-local"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Адрес</label>
              <input
                name="place"
                required
                placeholder="Адрес площадки"
                value={formData.place}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Стоимость</label>
              <input
                type="number"
                name="cost"
                min="0"
                value={formData.cost}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]"
              />
            </div>
          </div>
          
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Уровень подготовки</label>
              <select
                name="skillLevel"
                value={formData.skillLevel}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E] appearance-none"
              >
                {SKILL_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea
              name="description"
              rows={4}
              placeholder="Расскажите о деталях..."
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E] resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Обложка</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                imagePreview ? 'border-[#8B1E1E] bg-red-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="max-h-40 object-cover rounded-lg shadow-sm" />
              ) : (
                <>
                  <span className="text-4xl text-gray-300 mb-2">+</span>
                  <span className="text-sm text-gray-500">Нажмите, чтобы загрузить фото</span>
                </>
              )}
            </div>
          </div>

          <Button 
            type="submit" 
            isLoading={isLoading}
            className="w-full py-4 bg-[#8B1E1E] text-white rounded-xl hover:bg-[#6B1616] font-semibold text-lg transition-colors"
          >
            Опубликовать
          </Button>

        </form>
      </div>
    </div>
  );
};