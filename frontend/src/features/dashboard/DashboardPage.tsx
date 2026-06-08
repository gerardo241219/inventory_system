import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchSummary } from '@/features/reports/reportsSlice';
import { fetchProducts } from '@/features/products/productsSlice';

const StatCard = ({
  title,
  value,
  icon,
  colorClass,
}: {
  title: string;
  value: string | number;
  icon: string;
  colorClass: string;
}) => (
  <div className="card flex items-center gap-4">
    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${colorClass}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { summary, loading } = useAppSelector((s) => s.reports);
  const { items: lowStock } = useAppSelector((s) => s.products);

  useEffect(() => {
    dispatch(fetchSummary());
    dispatch(fetchProducts({ status: 'A', limit: 5 }));
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {loading && <p className="text-gray-500">Cargando...</p>}

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total productos" value={summary.totalProducts} icon="📦" colorClass="bg-blue-100" />
          <StatCard title="Stock bajo" value={summary.lowStockCount} icon="⚠️" colorClass="bg-yellow-100" />
          <StatCard title="Movimientos hoy" value={summary.movementsToday} icon="🔄" colorClass="bg-green-100" />
          <StatCard
            title="Valor inventario"
            value={`$${Number(summary.totalInventoryValue).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
            icon="💰"
            colorClass="bg-purple-100"
          />
        </div>
      )}

      {summary && summary.lowStockCount > 0 && (
        <div className="card border-l-4 border-yellow-400">
          <h2 className="font-semibold text-gray-700 mb-2">
            ⚠️ {summary.lowStockCount} producto(s) con stock bajo
          </h2>
          <p className="text-sm text-gray-500">
            Revisa el módulo de Inventario &gt; Alertas para ver el detalle.
          </p>
        </div>
      )}

      <div className="card">
        <h2 className="font-semibold text-gray-700 mb-4">Últimos productos</h2>
        <div className="space-y-2">
          {lowStock.slice(0, 5).map((p) => (
            <div key={p.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
              <div>
                <span className="text-sm font-medium text-gray-800">{p.name}</span>
                <span className="text-xs text-gray-400 ml-2">[{p.code}]</span>
              </div>
              <span className="text-sm font-semibold text-gray-600">
                {p.stock} {p.unitOfMeasure?.code || ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
