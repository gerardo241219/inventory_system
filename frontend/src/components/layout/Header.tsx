import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { logout } from '@/features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-800">{user?.name}</p>
          <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
        </div>
        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold text-sm">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-red-500 transition-colors"
          title="Cerrar sesión"
        >
          ⬡ Salir
        </button>
      </div>
    </header>
  );
}
