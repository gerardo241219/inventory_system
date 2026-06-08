import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { createSaleOrder } from './salesSlice';
import { fetchProducts } from '@/features/products/productsSlice';

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

interface ItemForm {
  productId: string;
  quantity: number;
  unitPrice: number;
}

interface FormData {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  notes: string;
  discount: number;
  items: ItemForm[];
}

export default function SaleOrderForm({ onClose, onSaved }: Props) {
  const dispatch = useAppDispatch();
  const { items: products } = useAppSelector((s) => s.products);
  const { error } = useAppSelector((s) => s.sales);

  const { register, control, handleSubmit, watch, setValue, formState: { isSubmitting } } = useForm<FormData>({
    defaultValues: { discount: 0, items: [{ productId: '', quantity: 1, unitPrice: 0 }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchedItems = watch('items');
  const watchedDiscount = watch('discount');

  const subtotal = watchedItems.reduce((acc, i) => acc + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0), 0);
  const total = subtotal - (Number(watchedDiscount) || 0);

  // auto-fill price from product catalog
  const handleProductChange = (idx: number, productId: string) => {
    const product = products.find((p) => p.id === Number(productId));
    if (product && product.price > 0) {
      setValue(`items.${idx}.unitPrice`, product.price);
    }
  };

  useEffect(() => {
    dispatch(fetchProducts({ limit: 999, status: 'A', productType: 'terminado' }));
  }, [dispatch]);

  const onSubmit = async (data: FormData) => {
    const result = await dispatch(
      createSaleOrder({
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerAddress: data.customerAddress,
        notes: data.notes,
        discount: Number(data.discount) || 0,
        items: data.items.map((i) => ({
          productId: Number(i.productId),
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
        })),
      } as never)
    );
    if (!result.type.endsWith('rejected')) onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold">Nueva nota de venta</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded px-3 py-2 text-sm">{error}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Cliente</label>
              <input {...register('customerName')} className="input" placeholder="Nombre del cliente" />
            </div>
            <div>
              <label className="label">Teléfono</label>
              <input {...register('customerPhone')} className="input" placeholder="55 1234 5678" />
            </div>
          </div>
          <div>
            <label className="label">Dirección de entrega</label>
            <input {...register('customerAddress')} className="input" />
          </div>

          {/* productos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-700">Productos</p>
              <button
                type="button"
                onClick={() => append({ productId: '', quantity: 1, unitPrice: 0 })}
                className="text-primary-600 text-xs hover:underline"
              >
                + Agregar producto
              </button>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-1 text-xs text-gray-500 font-medium px-1">
                <span className="col-span-6">Producto</span>
                <span className="col-span-2">Cant.</span>
                <span className="col-span-3">Precio unit.</span>
                <span className="col-span-1"></span>
              </div>
              {fields.map((field, idx) => (
                <div key={field.id} className="grid grid-cols-12 gap-1 items-center">
                  <div className="col-span-6">
                    <select
                      {...register(`items.${idx}.productId`)}
                      className="input text-xs py-1.5"
                      onChange={(e) => handleProductChange(idx, e.target.value)}
                    >
                      <option value="">Seleccionar</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input {...register(`items.${idx}.quantity`)} type="number" step="0.01" min="0.01" className="input text-xs py-1.5" />
                  </div>
                  <div className="col-span-3">
                    <input {...register(`items.${idx}.unitPrice`)} type="number" step="0.01" min="0" className="input text-xs py-1.5" />
                  </div>
                  <div className="col-span-1 text-center">
                    {fields.length > 1 && (
                      <button type="button" onClick={() => remove(idx)} className="text-red-400 hover:text-red-600 text-sm">✕</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* totales */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Descuento</span>
              <input
                {...register('discount')}
                type="number"
                step="0.01"
                min="0"
                className="input text-xs py-1 w-28 text-right"
              />
            </div>
            <div className="flex justify-between font-bold text-gray-800 border-t pt-2">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="label">Notas</label>
            <textarea {...register('notes')} className="input" rows={2} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Guardando...' : 'Crear nota de venta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
