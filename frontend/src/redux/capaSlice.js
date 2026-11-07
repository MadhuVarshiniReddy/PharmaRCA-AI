
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../services/api";

// Fetch a CAPA record by its ID
export const fetchCapa = createAsyncThunk(
  "capa/fetchCapa",
  async (capaId, { rejectWithValue }) => {
    try {
      const response = await API.get(`/capa/${capaId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Failed to fetch CAPA"
      );
    }
  }
);

// Generate and save CAPAs from an RCA analysis
export const generateCapas = createAsyncThunk(
  "capa/generateCapas",
  async (analysisId, { rejectWithValue }) => {
    try {
      const response = await API.post(`/capa/generate/${analysisId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Failed to generate CAPAs"
      );
    }
  }
);

const capaSlice = createSlice({
  name: "capa",

  initialState: {
    records: [],
    loading: false,
    error: null,
    message: null
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      // Fetch CAPA
      .addCase(fetchCapa.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCapa.fulfilled, (state, action) => {
        state.loading = false;

        const exists = state.records.some(
          (item) => item.id === action.payload.id
        );

        if (!exists) {
          state.records.push(action.payload);
        }
      })
      .addCase(fetchCapa.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Generate CAPAs
      .addCase(generateCapas.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(generateCapas.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        state.records = action.payload.capas || [];
      })
      .addCase(generateCapas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default capaSlice.reducer;
