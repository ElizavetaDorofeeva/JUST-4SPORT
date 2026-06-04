import { useEffect } from 'react';
import { LoginForm } from '../components/auth/LoginForm';

export const Login = () => {
  useEffect(() => {
      document.body.classList.add('no-scroll');
    
      return () => {
        document.body.classList.remove('no-scroll');
      };
    }, []);
  return <LoginForm />;
};