import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Category } from '@/types';
import api from '@/utils/api';

interface CategoriesState {
  items: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState = { items: [], loading: false, error: null };

export const fetchCategories = createAsyncThunk('categories/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get<Category[]>('/categories');
    return data;
  } catch {
    return rejectWithValue('Error al cargar familias');
  }
});

export const createCategory = createAsyncThunk(
  'categories/create',
  async (body: Partial<Category>, { rejectWithValue }) => {
    try {
      const { data } = await api.post<Category>('/categories', body);
      return data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Error al crear familia');
    }
  }
);

export const updateCategory = createAsyncThunk(
  'categories/update',
  async ({ id, ...body }: Partial<Category> & { id: number }, { rejectWithValue }) => {
    try {
      const { data } = await api.put<Category>(`/categories/${id}`, body);
      return data;
    } catch {
      return rejectWithValue('Error al actualizar familia');
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/categories/${id}`);
      return id;
    } catch {
      return rejectWithValue('Error al eliminar familia');
    }
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: { clearError(state) { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => { state.loading = true; })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const idx = state.items.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.id !== action.payload);
      });
  },
});

export const { clearError } = categoriesSlice.actions;
export default categoriesSlice.reducer;
