import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { createProduct, updateProduct } from './productsSlice';
import type { Product } from '@/types';
import api from '@/utils/api';
import { useState } from 'react';
import type { UnitOfMeasure } from '@/types';

interface Props {
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}

type FormData = {
  code: string;
  name: string;
  description?: string;
  cost: number;
  price: number;
  minStock: number;
  classification: string;
  status: 'A' | 'I';
  categoryId: string;
  unitOfMeasureId: string;
};

export default function ProductForm({ product, onClose, onSaved }: Props) {
  const dispatch = useAppDispatch();
  const { items: categories } = useAppSelector((s) => s.categories);
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>();

  useEffect(() => {
    api.get<UnitOfMeasure[]>('/units').then((r) => setUnits(r.data));
    if (product) {
      reset({
        code: product.code,
        name: product.name,
        description: product.description || '',
        cost: product.cost,
        price: product.price,
        minStock: product.minStock,
        classification: product.classification,
        status: product.status,
        categoryId: product.categoryId?.toString() || '',
        unitOfMeasureId: product.unitOfMeasureId?.toString() || '',
      });
    }
  }, [product, reset]);

  const onSubmit = async (data: FormData) => {
    const payload = {
      ...data,
      categoryId: data.categoryId ? Number(data.categoryId) : undefined,
      unitOfMeasureId: data.unitOfMeasureId ? Number(data.unitOfMeasureId) : undefined,
    };

    if (product) {
      await dispatch(updateProduct({ id: product.id, ...payload }));
    } else {
      await dispatch(createProduct(payload));
    }
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">{product ? 'Editar producto' : 'Nuevo producto'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Clave *</label>
              <input {...register('code', { required: 'Requerido' })} className="input" />
              {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>}
            </div>
            <div>
              <label className="label">Clasificación</label>
              <input {...register('classification')} className="input" defaultValue="M" />
            </div>
          </div>

          <div>
            <label className="label">Nombre *</label>
            <input {...register('name', { required: 'Requerido' })} className="input" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="label">Descripción</label>
            <textarea {...register('description')} className="input" rows={2} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Costo</label>
              <input {...register('cost')} type="number" step="0.01" className="input" defaultValue={0} />
            </div>
            <div>
              <label className="label">Precio venta</label>
              <input {...register('price')} type="number" step="0.01" className="input" defaultValue={0} />
            </div>
            <div>
              <label className="label">Stock mínimo</label>
              <input {...register('minStock')} type="number" step="0.01" className="input" defaultValue={0} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Familia</label>
              <select {...register('categoryId')} className="input">
                <option value="">Sin familia</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Unidad de medida</label>
              <select {...register('unitOfMeasureId')} className="input">
                <option value="">Sin unidad</option>
                {units.map((u) => <option key={u.id} value={u.id}>{u.code} — {u.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Status</label>
            <select {...register('status')} className="input">
              <option value="A">Activo</option>
              <option value="I">Inactivo</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Guardando...' : product ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
