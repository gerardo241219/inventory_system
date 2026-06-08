import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { createMovement } from './inventorySlice';
import { fetchProducts } from '@/features/products/productsSlice';
import { fetchSuppliers } from '@/features/suppliers/suppliersSlice';

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

interface FormData {
  productId: string;
  type: 'entrada' | 'salida' | 'ajuste';
  quantity: number;
  cost: number;
  reason: string;
  notes: string;
  supplierId: string;
}

export default function MovementForm({ onClose, onSaved }: Props) {
  const dispatch = useAppDispatch();
  const { items: products } = useAppSelector((s) => s.products);
  const { items: suppliers } = useAppSelector((s) => s.suppliers);
  const { error } = useAppSelector((s) => s.inventory);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: { type: 'entrada' },
  });
  const type = watch('type');

  useEffect(() => {
    dispatch(fetchProducts({ limit: 999, status: 'A' }));
    dispatch(fetchSuppliers());
  }, [dispatch]);

  const onSubmit = async (data: FormData) => {
    const result = await dispatch(
      createMovement({
        productId: Number(data.productId),
        type: data.type,
        quantity: Number(data.quantity),
        cost: data.cost ? Number(data.cost) : undefined,
        reason: data.reason || undefined,
        notes: data.notes || undefined,
        supplierId: data.supplierId ? Number(data.supplierId) : undefined,
      })
    );
    if (!result.type.endsWith('rejected')) onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">Registrar movimiento</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded px-3 py-2 text-sm">{error}</div>}

          <div>
            <label className="label">Tipo de movimiento *</label>
            <select {...register('type')} className="input">
              <option value="entrada">Entrada</option>
              <option value="salida">Salida</option>
              <option value="ajuste">Ajuste de inventario</option>
            </select>
          </div>

          <div>
            <label className="label">Producto *</label>
            <select {...register('productId', { required: 'Requerido' })} className="input">
              <option value="">Seleccionar producto</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
              ))}
            </select>
            {errors.productId && <p className="text-red-500 text-xs mt-1">{errors.productId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{type === 'ajuste' ? 'Nuevo stock *' : 'Cantidad *'}</label>
              <input
                {...register('quantity', { required: 'Requerido', min: { value: 0.01, message: 'Mínimo 0.01' } })}
                type="number"
                step="0.01"
                className="input"
              />
              {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
            </div>
            {type === 'entrada' && (
              <div>
                <label className="label">Costo unitario</label>
                <input {...register('cost')} type="number" step="0.01" className="input" />
              </div>
            )}
          </div>

          {type === 'entrada' && (
            <div>
              <label className="label">Proveedor</label>
              <select {...register('supplierId')} className="input">
                <option value="">Sin proveedor</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="label">Motivo</label>
            <input {...register('reason')} className="input" placeholder="Compra, devolución, pérdida..." />
          </div>

          <div>
            <label className="label">Notas adicionales</label>
            <textarea {...register('notes')} className="input" rows={2} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Guardando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
