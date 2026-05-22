import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  
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
        favoriteSports: []
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