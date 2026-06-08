import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchProducts, deleteProduct } from './productsSlice';
import { fetchCategories } from '@/features/categories/categoriesSlice';
import type { Product } from '@/types';
import ProductForm from './ProductForm';

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const { items, loading, total, totalPages, page } = useAppSelector((s) => s.products);
  const { items: categories } = useAppSelector((s) => s.categories);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const load = (p = 1) => {
    dispatch(fetchProducts({ page: p, limit: 20, search, categoryId }));
    setCurrentPage(p);
  };

  useEffect(() => {
    dispatch(fetchCategories());
    load();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load(1);
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Desactivar este producto?')) dispatch(deleteProduct(id));
  };

  const openEdit = (p: Product) => { setEditing(p); setShowForm(true); };
  const openNew = () => { setEditing(null); setShowForm(true); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Productos <span className="text-sm text-gray-400 font-normal">({total})</span></h1>
        <button onClick={openNew} className="btn-primary">+ Nuevo producto</button>
      </div>

      <div className="card p-4">
        <form onSubmit={handleSearch} className="flex gap-3 flex-wrap">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input max-w-xs"
            placeholder="Buscar por nombre..."
          />
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input max-w-xs">
            <option value="">Todas las familias</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button type="submit" className="btn-secondary">Buscar</button>
        </form>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 py-8">Cargando productos...</p>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Clave</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Familia</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Stock</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Costo</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.code}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                    <td className="px-4 py-3 text-gray-500">{p.category?.name || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold ${p.stock <= p.minStock ? 'text-red-600' : 'text-gray-800'}`}>
                        {p.stock}
                      </span>
                      <span className="text-gray-400 text-xs ml-1">{p.unitOfMeasure?.code}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      ${Number(p.cost).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${p.status === 'A' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.status === 'A' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openEdit(p)} className="text-primary-600 hover:underline text-xs mr-3">Editar</button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:underline text-xs">Desactivar</button>
                    </td>
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
        <ProductForm
          product={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(currentPage); }}
        />
      )}
    </div>
  );
}
