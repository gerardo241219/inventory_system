import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from './categoriesSlice';
import type { Category } from '@/types';

export default function CategoriesPage() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((s) => s.categories);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);

  const openNew = () => { setEditing(null); setName(''); setDescription(''); setShowForm(true); };
  const openEdit = (c: Category) => { setEditing(c); setName(c.name); setDescription(c.description || ''); setShowForm(true); };

  const handleSave = async () => {
    if (!name.trim()) return;
    if (editing) {
      await dispatch(updateCategory({ id: editing.id, name, description }));
    } else {
      await dispatch(createCategory({ name, description }));
    }
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Familias de productos</h1>
        <button onClick={openNew} className="btn-primary">+ Nueva familia</button>
      </div>

      {loading ? <p className="text-gray-500">Cargando...</p> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((c) => (
            <div key={c.id} className="card flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">{c.name}</p>
                {c.description && <p className="text-xs text-gray-400 mt-0.5">{c.description}</p>}
                <span className={`mt-1 inline-flex px-2 py-0.5 rounded-full text-xs ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {c.isActive ? 'Activa' : 'Inactiva'}
                </span>
              </div>
              <div className="flex flex-col gap-1 ml-4">
                <button onClick={() => openEdit(c)} className="text-primary-600 hover:underline text-xs">Editar</button>
                <button onClick={() => dispatch(deleteCategory(c.id))} className="text-red-500 hover:underline text-xs">Desactivar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">{editing ? 'Editar familia' : 'Nueva familia'}</h2>
            <div className="space-y-3">
              <div>
                <label className="label">Nombre *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">Descripción</label>
                <input value={description} onChange={(e) => setDescription(e.target.value)} className="input" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
              <button onClick={handleSave} className="btn-primary">{editing ? 'Actualizar' : 'Crear'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
