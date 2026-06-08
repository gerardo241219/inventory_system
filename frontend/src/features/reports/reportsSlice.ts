import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { DashboardSummary, StockValuationReport } from '@/types';
import api from '@/utils/api';

interface ReportsState {
  summary: DashboardSummary | null;
  valuation: StockValuationReport | null;
  loading: boolean;
  error: string | null;
}

const initialState: ReportsState = { summary: null, valuation: null, loading: false, error: null };

export const fetchSummary = createAsyncThunk('reports/summary', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get<DashboardSummary>('/reports/summary');
    return data;
  } catch {
    return rejectWithValue('Error al cargar resumen');
  }
});

export const fetchStockValuation = createAsyncThunk('reports/valuation', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get<StockValuationReport>('/reports/stock-valuation');
    return data;
  } catch {
    return rejectWithValue('Error al cargar valuación');
  }
});

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSummary.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(fetchSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchStockValuation.fulfilled, (state, action) => {
        state.valuation = action.payload;
      });
  },
});

export default reportsSlice.reducer;
