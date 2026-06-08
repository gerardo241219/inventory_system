import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchSuppliers, createSupplier, updateSupplier, deleteSupplier } from './suppliersSlice';
import { useForm } from 'react-hook-form';
import type { Supplier } from '@/types';

type FormData = Omit<Supplier, 'id' | 'businessId' | 'isActive'>;

export default function SuppliersPage() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((s) => s.suppliers);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const { register, handleSubmit, reset } = useForm<FormData>();

  useEffect(() => { dispatch(fetchSuppliers()); }, [dispatch]);

  const openNew = () => { setEditing(null); reset({}); setShowForm(true); };
  const openEdit = (s: Supplier) => { setEditing(s); reset(s); setShowForm(true); };

  const onSubmit = async (data: FormData) => {
    if (editing) {
      await dispatch(updateSupplier({ id: editing.id, ...data }));
    } else {
      await dispatch(createSupplier(data));
    }
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
        <button onClick={openNew} className="btn-primary">+ Nuevo proveedor</button>
      </div>

      {loading ? <p className="text-gray-500">Cargando...</p> : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Contacto</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Teléfono</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">RFC</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{s.name}</td>
                  <td className="px-4 py-3 text-gray-500">{s.contact || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{s.phone || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{s.rfc || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {s.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(s)} className="text-primary-600 hover:underline text-xs mr-3">Editar</button>
                    <button onClick={() => dispatch(deleteSupplier(s.id))} className="text-red-500 hover:underline text-xs">Desactivar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editing ? 'Editar proveedor' : 'Nuevo proveedor'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <label className="label">Nombre *</label>
                <input {...register('name', { required: true })} className="input" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Contacto</label>
                  <input {...register('contact')} className="input" />
                </div>
                <div>
                  <label className="label">Teléfono</label>
                  <input {...register('phone')} className="input" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Email</label>
                  <input {...register('email')} type="email" className="input" />
                </div>
                <div>
                  <label className="label">RFC</label>
                  <input {...register('rfc')} className="input" />
                </div>
              </div>
              <div>
                <label className="label">Dirección</label>
                <textarea {...register('address')} className="input" rows={2} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">{editing ? 'Actualizar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
