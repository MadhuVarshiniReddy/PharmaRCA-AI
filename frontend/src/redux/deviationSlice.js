
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../services/api";

// Fetch all deviations from FastAPI
export const fetchDeviations = createAsyncThunk(
  "deviations/fetchDeviations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get("/deviations/");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Failed to fetch deviations"
      );
    }
  }
);

const deviationSlice = createSlice({
  name: "deviations",

  initialState: {
    records: [],
    loading: false,
    error: null
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchDeviations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchDeviations.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
      })

      .addCase(fetchDeviations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default deviationSlice.reducer;
