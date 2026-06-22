import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { createProductionOrder } from './productionSlice';
import { fetchProducts } from '@/features/products/productsSlice';
import type { ProductionOrderArea, ProductionItemType } from '@/types';

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

interface ItemForm {
  productId: string;
  quantity: number;
  itemType: ProductionItemType;
  unitCost: number;
}

interface FormData {
  area: ProductionOrderArea;
  notes: string;
  items: ItemForm[];
}

const areaOptions: { value: ProductionOrderArea; label: string }[] = [
  { value: 'cocina_churros', label: '🌽 Cocina Churros' },
  { value: 'cocina_papas',   label: '🥔 Cocina Papas' },
  { value: 'envasado',       label: '📦 Envasado' },
];

export default function ProductionOrderForm({ onClose, onSaved }: Props) {
  const dispatch = useAppDispatch();
  const { items: products } = useAppSelector((s) => s.products);
  const { error } = useAppSelector((s) => s.production);

  const { register, control, handleSubmit, formState: { isSubmitting } } = useForm<FormData>({
    defaultValues: { area: 'cocina_churros', items: [{ productId: '', quantity: 1, itemType: 'input', unitCost: 0 }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  useEffect(() => {
    dispatch(fetchProducts({ limit: 999, status: 'A' }));
  }, [dispatch]);

  const onSubmit = async (data: FormData) => {
    const result = await dispatch(
      createProductionOrder({
        area: data.area,
        notes: data.notes,
        items: data.items.map((i) => ({
          productId: Number(i.productId),
          quantity: Number(i.quantity),
          itemType: i.itemType,
          unitCost: Number(i.unitCost) || 0,
        })),
      } as never)
    );
    if (!result.type.endsWith('rejected')) onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold">Nueva orden de producción</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded px-3 py-2 text-sm">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Área de producción *</label>
              <select {...register('area')} className="input">
                {areaOptions.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Notas</label>
              <input {...register('notes')} className="input" placeholder="Lote, turno..." />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-700">Materiales e productos</p>
              <button
                type="button"
                onClick={() => append({ productId: '', quantity: 1, itemType: 'input', unitCost: 0 })}
                className="text-primary-600 text-xs hover:underline"
              >
                + Agregar línea
              </button>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-1 text-xs text-gray-500 font-medium px-1">
                <span className="col-span-5">Producto</span>
                <span className="col-span-2">Tipo</span>
                <span className="col-span-2">Cantidad</span>
                <span className="col-span-2">Costo unit.</span>
                <span className="col-span-1"></span>
              </div>

              {fields.map((field, idx) => (
                <div key={field.id} className="grid grid-cols-12 gap-1 items-center">
                  <div className="col-span-5">
                    <select {...register(`items.${idx}.productId`)} className="input text-xs py-1.5">
                      <option value="">Seleccionar</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <select {...register(`items.${idx}.itemType`)} className="input text-xs py-1.5">
                      <option value="input">Insumo</option>
                      <option value="output">Producto</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input {...register(`items.${idx}.quantity`)} type="number" step="0.01" min="0.01" className="input text-xs py-1.5" />
                  </div>
                  <div className="col-span-2">
                    <input {...register(`items.${idx}.unitCost`)} type="number" step="0.01" min="0" className="input text-xs py-1.5" />
                  </div>
                  <div className="col-span-1 text-center">
                    {fields.length > 1 && (
                      <button type="button" onClick={() => remove(idx)} className="text-red-400 hover:text-red-600 text-sm">✕</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              "Insumo" = materia prima que se consume | "Producto" = lo que se genera
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Guardando...' : 'Crear orden'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
