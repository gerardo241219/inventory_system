import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { SaleOrder, PaginatedResponse } from '@/types';
import api from '@/utils/api';

interface SalesState {
  items: SaleOrder[];
  total: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
}

const initialState: SalesState = {
  items: [],
  total: 0,
  totalPages: 1,
  loading: false,
  error: null,
};

export const fetchSaleOrders = createAsyncThunk(
  'sales/fetchAll',
  async (params: Record<string, string | number> = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get<PaginatedResponse<SaleOrder>>('/sales', { params });
      return data;
    } catch {
      return rejectWithValue('Error al cargar notas de venta');
    }
  }
);

export const createSaleOrder = createAsyncThunk(
  'sales/create',
  async (body: Partial<SaleOrder> & { items: unknown[] }, { rejectWithValue }) => {
    try {
      const { data } = await api.post<SaleOrder>('/sales', body);
      return data;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message || 'Error al crear nota de venta');
    }
  }
);

export const confirmSaleOrder = createAsyncThunk(
  'sales/confirm',
  async (id: number, { rejectWithValue }) => {
    try {
      const { data } = await api.patch<SaleOrder>(`/sales/${id}/confirm`);
      return data;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message || 'Error al confirmar nota');
    }
  }
);

export const shipSaleOrder = createAsyncThunk(
  'sales/ship',
  async (id: number, { rejectWithValue }) => {
    try {
      const { data } = await api.patch<SaleOrder>(`/sales/${id}/ship`);
      return data;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message || 'Error al embarcar nota');
    }
  }
);

export const cancelSaleOrder = createAsyncThunk(
  'sales/cancel',
  async (id: number, { rejectWithValue }) => {
    try {
      const { data } = await api.patch<SaleOrder>(`/sales/${id}/cancel`);
      return data;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message || 'Error al cancelar nota');
    }
  }
);

const upsert = (items: SaleOrder[], updated: SaleOrder) => {
  const idx = items.findIndex((o) => o.id === updated.id);
  if (idx !== -1) {
    items[idx] = { ...items[idx], ...updated, items: updated.items ?? items[idx].items };
  } else {
    items.unshift(updated);
  }
};

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: { clearError(state) { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSaleOrders.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(fetchSaleOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchSaleOrders.rejected,  (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createSaleOrder.fulfilled,  (state, action) => { upsert(state.items, action.payload); })
      .addCase(confirmSaleOrder.fulfilled, (state, action) => { upsert(state.items, action.payload); })
      .addCase(shipSaleOrder.fulfilled,    (state, action) => { upsert(state.items, action.payload); })
      .addCase(cancelSaleOrder.fulfilled,  (state, action) => { upsert(state.items, action.payload); })
      .addCase(createSaleOrder.rejected,   (state, action) => { state.error = action.payload as string; })
      .addCase(shipSaleOrder.rejected,     (state, action) => { state.error = action.payload as string; });
  },
});

export const { clearError } = salesSlice.actions;
export default salesSlice.reducer;
