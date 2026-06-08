import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import productsReducer from '@/features/products/productsSlice';
import categoriesReducer from '@/features/categories/categoriesSlice';
import inventoryReducer from '@/features/inventory/inventorySlice';
import suppliersReducer from '@/features/suppliers/suppliersSlice';
import reportsReducer from '@/features/reports/reportsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    categories: categoriesReducer,
    inventory: inventoryReducer,
    suppliers: suppliersReducer,
    reports: reportsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
