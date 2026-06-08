import { NavLink } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';

const navItems = [
  { to: '/dashboard',  label: 'Dashboard',     icon: '🏠', group: null },
  { to: '/products',   label: 'Productos',      icon: '📦', group: 'Catálogo' },
  { to: '/categories', label: 'Familias',       icon: '🗂️', group: 'Catálogo' },
  { to: '/suppliers',  label: 'Proveedores',    icon: '🚚', group: 'Catálogo' },
  { to: '/production', label: 'Producción',     icon: '🏭', group: 'Operaciones' },
  { to: '/inventory',  label: 'Movimientos',    icon: '🔄', group: 'Operaciones' },
  { to: '/sales',      label: 'Notas de Venta', icon: '🧾', group: 'Operaciones' },
  { to: '/reports',    label: 'Reportes',       icon: '📊', group: 'Reportes' },
];

export default function Sidebar() {
  const business = useAppSelector((s) => s.auth.user?.business);

  let currentGroup: string | null = undefined as unknown as null;

  return (
    <aside className="w-64 bg-gray-900 min-h-screen flex flex-col">
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            {(business?.name || 'IN').substring(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">{business?.name || 'Inventario'}</p>
            <p className="text-gray-400 text-xs capitalize">{business?.type || 'Sistema'}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const showHeader = item.group !== currentGroup;
          if (showHeader) currentGroup = item.group;

          return (
            <div key={item.to}>
              {showHeader && item.group && (
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider px-3 pt-4 pb-1">
                  {item.group}
                </p>
              )}
              <NavLink
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
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <p className="text-gray-500 text-xs text-center">v1.0.0</p>
      </div>
    </aside>
  );
}
