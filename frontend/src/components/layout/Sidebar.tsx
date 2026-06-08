import { NavLink } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/products', label: 'Productos', icon: '📦' },
  { to: '/categories', label: 'Familias', icon: '🗂️' },
  { to: '/inventory', label: 'Inventario', icon: '🔄' },
  { to: '/suppliers', label: 'Proveedores', icon: '🚚' },
  { to: '/reports', label: 'Reportes', icon: '📊' },
];

export default function Sidebar() {
  const business = useAppSelector((s) => s.auth.user?.business);

  return (
    <aside className="w-64 bg-gray-900 min-h-screen flex flex-col">
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            {(business?.name || 'IN').substring(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">{business?.name || 'Inventario'}</p>
            <p className="text-gray-400 text-xs">{business?.type || 'Sistema'}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white font-medium'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span className="text-lg leading-none">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <p className="text-gray-500 text-xs text-center">v1.0.0</p>
      </div>
    </aside>
  );
}
