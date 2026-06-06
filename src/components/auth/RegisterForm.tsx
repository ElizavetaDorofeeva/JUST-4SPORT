import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Sport } from '../../types/profile';

export const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    email: '',
    password: '',
    confirmPassword: '',
    favoriteSports: [] as string[]
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSportsDropdown, setShowSportsDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Введите имя';
    }
    
    if (!formData.nickname.trim()) {
      newErrors.nickname = 'Введите никнейм';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Введите email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Введите корректный email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Введите пароль';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      await authRegister({
        name: formData.name,
        nickname: formData.nickname,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        favoriteSports: formData.favoriteSports
      });
      navigate('/dashboard');
    } catch (error: any) {
      if (error.response?.status === 409) {
        setErrors({ email: 'Пользователь с таким email уже существует' });
      } else {
        setErrors({ email: 'Ошибка регистрации' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const allSports = [
    { value: Sport.VOLLEYBALL, label: 'волейбол' },
    { value: Sport.BASKETBALL, label: 'баскетбол' },
    { value: Sport.SOCCER, label: 'футбол' },
    { value: Sport.HOCKEY, label: 'хоккей' },
    { value: Sport.ULTIMATE, label: 'алтимат' }
  ];

  const toggleSport = (sport: string) => {
    setFormData(prev => {
      const sports = prev.favoriteSports;
      if (sports.includes(sport)) {
        return { ...prev, favoriteSports: sports.filter(s => s !== sport) };
      } else {
        return { ...prev, favoriteSports: [...sports, sport] };
      }
    });
  };

  const getSportLabel = (sport: string) => {
    const labels: { [key: string]: string } = {
      VOLLEYBALL: 'волейбол',
      BASKETBALL: 'баскетбол',
      SOCCER: 'футбол',
      HOCKEY: 'хоккей',
      ULTIMATE: 'алтимат'
    };
    return labels[sport] || sport;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSportsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <h1 className="text-4xl font-bold text-[#8B1E1E] mb-8 text-center">Регистрация</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Имя"
            type="text"
            name="name"
            placeholder="Ваше имя"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
          />
          
          <Input
            label="Никнейм"
            type="text"
            name="nickname"
            placeholder="Придумайте никнейм"
            value={formData.nickname}
            onChange={handleChange}
            error={errors.nickname}
          />
          
          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />
          
          <Input
            label="Пароль"
            type="password"
            name="password"
            placeholder="Придумайте пароль"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />
          
          <Input
            label="Повторите пароль"
            type="password"
            name="confirmPassword"
            placeholder="Повторите пароль"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />
          
          <div className="pt-2">
            <label className="block text-sm font-semibold text-[#8B1E1E] mb-1">
              Любимый спорт
            </label>

            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setShowSportsDropdown(!showSportsDropdown)}
                className="w-full min-h-[42px] px-4 py-2 text-left border border-gray-300 rounded-lg focus:outline-none bg-gray-200 flex flex-wrap items-center gap-2"
              >
                {formData.favoriteSports.length > 0 ? (
                  formData.favoriteSports.map((sport) => (
                    <span
                      key={sport}
                      className="text-sm text-gray-600 font-medium"
                    >
                      {getSportLabel(sport)}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">Выберите виды спорта</span>
                )}

                <span className="ml-auto text-gray-500 pl-2 select-none">
                  {showSportsDropdown ? '▲' : '▼'}
                </span>
              </button>

              {showSportsDropdown && (
                <div className="absolute z-10 w-full bottom-full mb-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {allSports.map(sport => (
                    <label
                      key={sport.value}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.favoriteSports.includes(sport.value)}
                        onChange={() => toggleSport(sport.value)}
                        className="w-4 h-4 text-[#8B1E1E] border-gray-300 rounded focus:ring-[#8B1E1E]"
                      />
                      <span className="text-sm text-gray-700">{sport.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="pt-4 space-y-3">
            <Button type="submit" isLoading={isLoading}>
              Зарегистрироваться
            </Button>
            
            <Button type="button" variant="secondary" onClick={() => navigate('/login')}>
              Уже есть аккаунт?
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};