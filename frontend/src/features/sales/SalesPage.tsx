import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  fetchSaleOrders,
  confirmSaleOrder,
  shipSaleOrder,
  cancelSaleOrder,
} from './salesSlice';
import type { SaleOrderStatus } from '@/types';
import SaleOrderForm from './SaleOrderForm';

const statusColor: Record<SaleOrderStatus, string> = {
  borrador:   'bg-gray-100 text-gray-600',
  confirmada: 'bg-blue-100 text-blue-700',
  embarcada:  'bg-green-100 text-green-700',
  cancelada:  'bg-red-100 text-red-600',
};

const statusLabel: Record<SaleOrderStatus, string> = {
  borrador:   'Borrador',
  confirmada: 'Confirmada',
  embarcada:  'Embarcada',
  cancelada:  'Cancelada',
};

export default function SalesPage() {
  const dispatch = useAppDispatch();
  const { items, loading, error, total, totalPages } = useAppSelector((s) => s.sales);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const load = (p = 1) => { dispatch(fetchSaleOrders({ page: p, limit: 15 })); setPage(p); };

  useEffect(() => { load(); }, []);

  const handleShip = async (id: number) => {
    if (!confirm('¿Embarcar esta nota de venta? Se descontará el inventario de producto terminado.')) return;
    const result = await dispatch(shipSaleOrder(id));
    if (result.type.endsWith('rejected')) return;
    load(page);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Notas de Venta <span className="text-sm text-gray-400 font-normal">({total})</span>
        </h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">+ Nueva nota de venta</button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 text-sm">{error}</div>}

      {loading ? <p className="text-center text-gray-500 py-8">Cargando...</p> : (
        <div className="space-y-3">
          {items.map((order) => (
            <div key={order.id} className="card p-0 overflow-hidden">
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-semibold text-gray-700">{order.folio}</span>
                  <span className="text-sm text-gray-600">{order.customerName || 'Sin cliente'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-800">
                    ${Number(order.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[order.status]}`}>
                    {statusLabel[order.status]}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('es-MX')}
                  </span>
                  <span className="text-gray-400">{expanded === order.id ? '▲' : '▼'}</span>
                </div>
              </div>

              {expanded === order.id && (
                <div className="border-t border-gray-100 px-4 py-3 space-y-3">
                  {/* cliente */}
                  {(order.customerPhone || order.customerAddress) && (
                    <div className="text-sm text-gray-500 space-y-0.5">
                      {order.customerPhone && <p>📞 {order.customerPhone}</p>}
                      {order.customerAddress && <p>📍 {order.customerAddress}</p>}
                    </div>
                  )}

                  {/* items */}
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-500 border-b">
                        <th className="text-left py-1">Producto</th>
                        <th className="text-right py-1">Cant.</th>
                        <th className="text-right py-1">Precio unit.</th>
                        <th className="text-right py-1">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((i) => (
                        <tr key={i.id} className="border-b border-gray-50">
                          <td className="py-1 text-gray-700">{i.product?.name}</td>
                          <td className="py-1 text-right">{i.quantity}</td>
                          <td className="py-1 text-right">${Number(i.unitPrice).toFixed(2)}</td>
                          <td className="py-1 text-right font-medium">${Number(i.subtotal).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      {Number(order.discount) > 0 && (
                        <tr className="text-sm text-gray-500">
                          <td colSpan={3} className="text-right py-1">Descuento</td>
                          <td className="text-right py-1">-${Number(order.discount).toFixed(2)}</td>
                        </tr>
                      )}
                      <tr className="font-bold text-gray-800">
                        <td colSpan={3} className="text-right py-1">Total</td>
                        <td className="text-right py-1">${Number(order.total).toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>

                  {order.notes && <p className="text-xs text-gray-400 italic">{order.notes}</p>}

                  {/* acciones */}
                  <div className="flex gap-2 pt-1 flex-wrap">
                    {order.status === 'borrador' && (
                      <button
                        onClick={() => dispatch(confirmSaleOrder(order.id))}
                        className="btn-secondary text-xs px-3 py-1"
                      >
                        ✓ Confirmar
                      </button>
                    )}
                    {(order.status === 'borrador' || order.status === 'confirmada') && (
                      <button
                        onClick={() => handleShip(order.id)}
                        className="btn-primary text-xs px-3 py-1"
                      >
                        🚚 Embarcar y descontar inventario
                      </button>
                    )}
                    {order.status !== 'embarcada' && order.status !== 'cancelada' && (
                      <button
                        onClick={() => dispatch(cancelSaleOrder(order.id))}
                        className="btn-danger text-xs px-3 py-1"
                      >
                        Cancelar
                      </button>
                    )}
                    {order.status === 'embarcada' && order.shippedAt && (
                      <span className="text-xs text-gray-400 self-center">
                        Embarcado: {new Date(order.shippedAt).toLocaleDateString('es-MX')}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page <= 1} onClick={() => load(page - 1)} className="btn-secondary text-xs px-3 py-1 disabled:opacity-40">← Anterior</button>
          <span className="text-sm text-gray-500 py-1">Pág. {page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => load(page + 1)} className="btn-secondary text-xs px-3 py-1 disabled:opacity-40">Siguiente →</button>
        </div>
      )}

      {showForm && (
        <SaleOrderForm
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(1); }}
        />
      )}
    </div>
  );
}
