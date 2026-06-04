import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email.trim()) {
      newErrors.email = 'Введите email';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Введите корректный email';
    }
    
    if (!password) {
      newErrors.password = 'Введите пароль';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      await authLogin({ email, password });
      navigate('/profile');
    } catch (error) {
      setErrors({ email: 'Неверный email или пароль' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col">
      <div className="flex-1 flex flex-col justify-start pt-20 max-w-md mx-auto w-full overflow-auto">
        <h1 className="text-4xl font-bold text-[#8B1E1E] mb-8 text-center">Вход</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />
          
          <Input
            label="Пароль"
            type="password"
            placeholder="Введите пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          
          <div className="pt-4 space-y-3">
            <Button type="submit" isLoading={isLoading}>
              Войти
            </Button>
            
            <Button type="button" variant="secondary" onClick={() => navigate('/register')}>
              Нет аккаунта?
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};