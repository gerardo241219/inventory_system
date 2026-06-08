import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchStockValuation } from './reportsSlice';

export default function ReportsPage() {
  const dispatch = useAppDispatch();
  const { valuation, loading } = useAppSelector((s) => s.reports);

  useEffect(() => { dispatch(fetchStockValuation()); }, [dispatch]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Valuación de inventario</h2>
          {valuation && (
            <div className="text-right">
              <p className="text-xs text-gray-500">Valor total</p>
              <p className="text-2xl font-bold text-primary-600">
                ${Number(valuation.totalValue).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}
        </div>

        {loading ? <p className="text-gray-500">Cargando...</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Clave</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Producto</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Familia</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Stock</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Costo unit.</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {valuation?.products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{p.code}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{p.category?.name || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      {p.stock} <span className="text-gray-400">{p.unitOfMeasure?.code}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">${Number(p.cost).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">
                      ${Number(p.stockValue).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
              {valuation && (
                <tfoot>
                  <tr className="bg-gray-50 font-semibold border-t-2 border-gray-200">
                    <td colSpan={5} className="px-4 py-3 text-right text-gray-600">Total</td>
                    <td className="px-4 py-3 text-right text-primary-700 text-base">
                      ${Number(valuation.totalValue).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
