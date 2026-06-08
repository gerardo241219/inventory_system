import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Product, PaginatedResponse } from '@/types';
import api from '@/utils/api';

interface ProductsState {
  items: Product[];
  total: number;
  totalPages: number;
  page: number;
  loading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  items: [],
  total: 0,
  totalPages: 1,
  page: 1,
  loading: false,
  error: null,
};

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (params: Record<string, string | number> = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get<PaginatedResponse<Product>>('/products', { params });
      return data;
    } catch {
      return rejectWithValue('Error al cargar productos');
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/create',
  async (product: Partial<Product>, { rejectWithValue }) => {
    try {
      const { data } = await api.post<Product>('/products', product);
      return data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Error al crear producto');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ id, ...body }: Partial<Product> & { id: number }, { rejectWithValue }) => {
    try {
      const { data } = await api.put<Product>(`/products/${id}`, body);
      return data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar producto');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/products/${id}`);
      return id;
    } catch {
      return rejectWithValue('Error al eliminar producto');
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.page = action.payload.page;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const idx = state.items.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id !== action.payload);
      });
  },
});

export const { clearError } = productsSlice.actions;
export default productsSlice.reducer;
