import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Supplier } from '@/types';
import api from '@/utils/api';

interface SuppliersState {
  items: Supplier[];
  loading: boolean;
  error: string | null;
}

const initialState: SuppliersState = { items: [], loading: false, error: null };

export const fetchSuppliers = createAsyncThunk('suppliers/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get<Supplier[]>('/suppliers');
    return data;
  } catch {
    return rejectWithValue('Error al cargar proveedores');
  }
});

export const createSupplier = createAsyncThunk(
  'suppliers/create',
  async (body: Partial<Supplier>, { rejectWithValue }) => {
    try {
      const { data } = await api.post<Supplier>('/suppliers', body);
      return data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Error al crear proveedor');
    }
  }
);

export const updateSupplier = createAsyncThunk(
  'suppliers/update',
  async ({ id, ...body }: Partial<Supplier> & { id: number }, { rejectWithValue }) => {
    try {
      const { data } = await api.put<Supplier>(`/suppliers/${id}`, body);
      return data;
    } catch {
      return rejectWithValue('Error al actualizar proveedor');
    }
  }
);

export const deleteSupplier = createAsyncThunk(
  'suppliers/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/suppliers/${id}`);
      return id;
    } catch {
      return rejectWithValue('Error al eliminar proveedor');
    }
  }
);

const suppliersSlice = createSlice({
  name: 'suppliers',
  initialState,
  reducers: { clearError(state) { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuppliers.pending, (state) => { state.loading = true; })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createSupplier.fulfilled, (state, action) => { state.items.push(action.payload); })
      .addCase(updateSupplier.fulfilled, (state, action) => {
        const idx = state.items.findIndex((s) => s.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        state.items = state.items.filter((s) => s.id !== action.payload);
      });
  },
});

export const { clearError } = suppliersSlice.actions;
export default suppliersSlice.reducer;
