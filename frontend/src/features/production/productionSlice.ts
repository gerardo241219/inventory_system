import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { ProductionOrder, PaginatedResponse } from '@/types';
import api from '@/utils/api';

interface ProductionState {
  items: ProductionOrder[];
  total: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
}

const initialState: ProductionState = {
  items: [],
  total: 0,
  totalPages: 1,
  loading: false,
  error: null,
};

export const fetchProductionOrders = createAsyncThunk(
  'production/fetchAll',
  async (params: Record<string, string | number> = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get<PaginatedResponse<ProductionOrder>>('/production', { params });
      return data;
    } catch {
      return rejectWithValue('Error al cargar órdenes de producción');
    }
  }
);

export const createProductionOrder = createAsyncThunk(
  'production/create',
  async (body: Partial<ProductionOrder> & { items: unknown[] }, { rejectWithValue }) => {
    try {
      const { data } = await api.post<ProductionOrder>('/production', body);
      return data;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message || 'Error al crear orden');
    }
  }
);

export const completeProductionOrder = createAsyncThunk(
  'production/complete',
  async (id: number, { rejectWithValue }) => {
    try {
      const { data } = await api.patch<ProductionOrder>(`/production/${id}/complete`);
      return data;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message || 'Error al completar orden');
    }
  }
);

export const cancelProductionOrder = createAsyncThunk(
  'production/cancel',
  async (id: number, { rejectWithValue }) => {
    try {
      const { data } = await api.patch<ProductionOrder>(`/production/${id}/cancel`);
      return data;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message || 'Error al cancelar orden');
    }
  }
);

export const updateProductionOrderStatus = createAsyncThunk(
  'production/updateStatus',
  async ({ id, status }: { id: number; status: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch<ProductionOrder>(`/production/${id}/status`, { status });
      return data;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message || 'Error al actualizar status');
    }
  }
);

const upsert = (items: ProductionOrder[], updated: ProductionOrder) => {
  const idx = items.findIndex((o) => o.id === updated.id);
  if (idx !== -1) {
    items[idx] = { ...items[idx], ...updated, items: updated.items ?? items[idx].items };
  } else {
    items.unshift(updated);
  }
};

const productionSlice = createSlice({
  name: 'production',
  initialState,
  reducers: { clearError(state) { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductionOrders.pending,  (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProductionOrders.fulfilled,(state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchProductionOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createProductionOrder.fulfilled,        (state, action) => { upsert(state.items, action.payload); })
      .addCase(completeProductionOrder.fulfilled,      (state, action) => { upsert(state.items, action.payload); })
      .addCase(cancelProductionOrder.fulfilled,        (state, action) => { upsert(state.items, action.payload); })
      .addCase(updateProductionOrderStatus.fulfilled,  (state, action) => { upsert(state.items, action.payload); })
      .addCase(createProductionOrder.rejected,         (state, action) => { state.error = action.payload as string; })
      .addCase(completeProductionOrder.rejected,       (state, action) => { state.error = action.payload as string; });
  },
});

export const { clearError } = productionSlice.actions;
export default productionSlice.reducer;
