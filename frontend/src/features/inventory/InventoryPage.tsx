import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchMovements } from './inventorySlice';
import MovementForm from './MovementForm';
import type { MovementType } from '@/types';

const typeLabel: Record<MovementType, string> = {
  entrada: 'Entrada',
  salida: 'Salida',
  ajuste: 'Ajuste',
};

const typeColor: Record<MovementType, string> = {
  entrada: 'bg-green-100 text-green-700',
  salida: 'bg-red-100 text-red-700',
  ajuste: 'bg-blue-100 text-blue-700',
};

export default function InventoryPage() {
  const dispatch = useAppDispatch();
  const { movements, loading, total, totalPages, error } = useAppSelector((s) => s.inventory);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);

  const load = (p = 1) => {
    dispatch(fetchMovements({ page: p, limit: 20 }));
    setPage(p);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Movimientos de inventario <span className="text-sm text-gray-400 font-normal">({total})</span>
        </h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">+ Registrar movimiento</button>
      </div>

      {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded-md px-4 py-3 text-sm">{error}</div>}

      {loading ? (
        <p className="text-center text-gray-500 py-8">Cargando...</p>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Producto</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Tipo</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Cantidad</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Stock ant.</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Stock nuevo</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Usuario</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(m.createdAt).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{m.product?.name}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${typeColor[m.type]}`}>
                        {typeLabel[m.type]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{m.quantity}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{m.previousStock}</td>
                    <td className="px-4 py-3 text-right text-gray-800 font-semibold">{m.newStock}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{m.user?.name}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{m.reason || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 py-4 border-t border-gray-100">
              <button disabled={page <= 1} onClick={() => load(page - 1)} className="btn-secondary text-xs px-3 py-1 disabled:opacity-40">← Anterior</button>
              <span className="text-sm text-gray-500">Página {page} de {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => load(page + 1)} className="btn-secondary text-xs px-3 py-1 disabled:opacity-40">Siguiente →</button>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <MovementForm
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(1); }}
        />
      )}
    </div>
  );
}
