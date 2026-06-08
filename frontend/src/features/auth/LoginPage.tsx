import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { login, clearError } from './authSlice';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useAppSelector((s) => s.auth);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  useEffect(() => {
    if (token) navigate('/dashboard', { replace: true });
  }, [token, navigate]);

  const onSubmit = (data: LoginForm) => {
    dispatch(clearError());
    dispatch(login(data));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-500 to-primary-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📦</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Sistema de Inventario</h1>
          <p className="text-gray-500 text-sm mt-1">Ingresa tus credenciales para continuar</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-md px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="label">Correo electrónico</label>
            <input
              {...register('email', { required: 'Campo requerido', pattern: { value: /\S+@\S+\.\S+/, message: 'Correo inválido' } })}
              type="email"
              className="input"
              placeholder="usuario@empresa.com"
              autoComplete="email"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="label">Contraseña</label>
            <input
              {...register('password', { required: 'Campo requerido' })}
              type="password"
              className="input"
              placeholder="••••••••"
              autoComplete="current-password"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}
