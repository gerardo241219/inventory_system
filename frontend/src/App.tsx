import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute  from '@/features/auth/ProtectedRoute';
import LoginPage       from '@/features/auth/LoginPage';
import Layout          from '@/components/layout/Layout';
import DashboardPage   from '@/features/dashboard/DashboardPage';
import ProductsPage    from '@/features/products/ProductsPage';
import CategoriesPage  from '@/features/categories/CategoriesPage';
import InventoryPage   from '@/features/inventory/InventoryPage';
import SuppliersPage   from '@/features/suppliers/SuppliersPage';
import ReportsPage     from '@/features/reports/ReportsPage';
import ProductionPage  from '@/features/production/ProductionPage';
import SalesPage       from '@/features/sales/SalesPage';

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/"           element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"  element={<DashboardPage />} />
            <Route path="/products"   element={<ProductsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/inventory"  element={<InventoryPage />} />
            <Route path="/suppliers"  element={<SuppliersPage />} />
            <Route path="/production" element={<ProductionPage />} />
            <Route path="/sales"      element={<SalesPage />} />
            <Route path="/reports"    element={<ReportsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
