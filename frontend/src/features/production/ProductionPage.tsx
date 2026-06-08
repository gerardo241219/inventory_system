import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  fetchProductionOrders,
  completeProductionOrder,
  cancelProductionOrder,
  updateProductionOrderStatus,
} from './productionSlice';
import type { ProductionOrder, ProductionOrderArea, ProductionOrderStatus } from '@/types';
import ProductionOrderForm from './ProductionOrderForm';

const areaLabel: Record<ProductionOrderArea, string> = {
  cocina_churros: '🌽 Cocina Churros',
  cocina_papas:   '🥔 Cocina Papas',
  envasado:       '📦 Envasado',
};

const statusColor: Record<ProductionOrderStatus, string> = {
  borrador:    'bg-gray-100 text-gray-600',
  en_proceso:  'bg-blue-100 text-blue-700',
  completado:  'bg-green-100 text-green-700',
  cancelado:   'bg-red-100 text-red-600',
};

const statusLabel: Record<ProductionOrderStatus, string> = {
  borrador:   'Borrador',
  en_proceso: 'En proceso',
  completado: 'Completado',
  cancelado:  'Cancelado',
};

export default function ProductionPage() {
  const dispatch = useAppDispatch();
  const { items, loading, error, total, totalPages } = useAppSelector((s) => s.production);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const load = (p = 1) => { dispatch(fetchProductionOrders({ page: p, limit: 15 })); setPage(p); };

  useEffect(() => { load(); }, []);

  const handleComplete = async (id: number) => {
    if (!confirm('¿Confirmar producción? Se descontará materia prima y se sumará el producto generado.')) return;
    const result = await dispatch(completeProductionOrder(id));
    if (!result.type.endsWith('rejected')) load(page);
  };

  const handleStatus = async (id: number, status: string) => {
    await dispatch(updateProductionOrderStatus({ id, status }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Órdenes de Producción <span className="text-sm text-gray-400 font-normal">({total})</span>
        </h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">+ Nueva orden</button>
      </div>

      {/* flujo visual */}
      <div className="card p-4 bg-blue-50 border border-blue-200">
        <p className="text-xs text-blue-700 font-medium mb-2">Flujo de producción</p>
        <div className="flex items-center gap-2 text-xs text-blue-600 flex-wrap">
          <span className="bg-blue-100 px-2 py-1 rounded">① Materia Prima</span>
          <span>→</span>
          <span className="bg-blue-100 px-2 py-1 rounded">② Cocina Churros / Cocina Papas</span>
          <span>→</span>
          <span className="bg-blue-100 px-2 py-1 rounded">③ Producto a Granel</span>
          <span>→</span>
          <span className="bg-blue-100 px-2 py-1 rounded">④ Envasado</span>
          <span>→</span>
          <span className="bg-blue-100 px-2 py-1 rounded">⑤ Producto Terminado</span>
        </div>
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
                  <span className="text-sm text-gray-500">{areaLabel[order.area]}</span>
                </div>
                <div className="flex items-center gap-3">
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
                  {/* items */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">INSUMOS (entran)</p>
                      {(order.items ?? []).filter((i) => i.itemType === 'input').map((i) => (
                        <div key={i.id} className="flex justify-between text-sm py-0.5">
                          <span className="text-gray-700">{i.product?.name}</span>
                          <span className="text-red-600 font-medium">-{i.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">PRODUCTOS (salen)</p>
                      {(order.items ?? []).filter((i) => i.itemType === 'output').map((i) => (
                        <div key={i.id} className="flex justify-between text-sm py-0.5">
                          <span className="text-gray-700">{i.product?.name}</span>
                          <span className="text-green-600 font-medium">+{i.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {order.notes && <p className="text-xs text-gray-400 italic">{order.notes}</p>}

                  {/* acciones */}
                  <div className="flex gap-2 pt-1 flex-wrap">
                    {order.status === 'borrador' && (
                      <button
                        onClick={() => handleStatus(order.id, 'en_proceso')}
                        className="btn-secondary text-xs px-3 py-1"
                      >
                        Iniciar producción
                      </button>
                    )}
                    {(order.status === 'borrador' || order.status === 'en_proceso') && (
                      <button
                        onClick={() => handleComplete(order.id)}
                        className="btn-primary text-xs px-3 py-1"
                      >
                        ✓ Completar y afectar inventario
                      </button>
                    )}
                    {order.status !== 'completado' && order.status !== 'cancelado' && (
                      <button
                        onClick={() => dispatch(cancelProductionOrder(order.id))}
                        className="btn-danger text-xs px-3 py-1"
                      >
                        Cancelar
                      </button>
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
        <ProductionOrderForm
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(1); }}
        />
      )}
    </div>
  );
}
