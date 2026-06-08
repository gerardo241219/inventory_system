import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { InventoryMovement, PaginatedResponse } from '@/types';
import api from '@/utils/api';

interface InventoryState {
  movements: InventoryMovement[];
  total: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
}

const initialState: InventoryState = {
  movements: [],
  total: 0,
  totalPages: 1,
  loading: false,
  error: null,
};

export const fetchMovements = createAsyncThunk(
  'inventory/fetchMovements',
  async (params: Record<string, string | number> = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get<PaginatedResponse<InventoryMovement>>('/inventory/movements', { params });
      return data;
    } catch {
      return rejectWithValue('Error al cargar movimientos');
    }
  }
);

export const createMovement = createAsyncThunk(
  'inventory/createMovement',
  async (
    body: { productId: number; type: string; quantity: number; cost?: number; reason?: string; notes?: string; supplierId?: number },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post<InventoryMovement>('/inventory/movements', body);
      return data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Error al registrar movimiento');
    }
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: { clearError(state) { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMovements.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMovements.fulfilled, (state, action) => {
        state.loading = false;
        state.movements = action.payload.data;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchMovements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createMovement.fulfilled, (state, action) => {
        state.movements.unshift(action.payload);
      })
      .addCase(createMovement.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = inventorySlice.actions;
export default inventorySlice.reducer;
