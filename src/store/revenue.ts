import type { Revenue } from "@/interfaces/revenue";
import { createAsyncThunk, createSlice, type ActionReducerMapBuilder } from "@reduxjs/toolkit";
import { supabase } from "@/lib/supabase";
import type { State } from "@/interfaces/app-common";

const initialState: State<Revenue[]> = {
  data: null,
  loading: false,
  errors: null,
};

export const getRevenues = createAsyncThunk<Revenue[], { from?: string, to?: string }>("revenue/get", async (params?: { from?: string, to?: string }) => {
  try {
    let query = supabase
      .from('revenues')
      .select(`*, category:categories(*)`);
    if (params?.from && params.to) {
      query = query
        .gte("revenue_date", params.from)
        .lte("revenue_date", params.to)
    }
    const { data, error } = await query.order("revenue_date", { ascending: false });
    if (error) {
      throw new Error(error.message);
    }
    return data as unknown as Revenue[];
  } catch (error) {
    throw error;
  }
});

export const addRevenue = createAsyncThunk<Revenue, Omit<Revenue, "id">>(
  "revenue/add",
  async (newRevenue) => {
    try {
      const { data, error } = await supabase
        .from("revenues").insert(newRevenue)
        .select(`*, category:categories(*)`)
        .single();
      if (error) {
        throw new Error(error.message);
      }
      return data as unknown as Revenue;
    } catch (error) {
      throw error;
    }
  });

export const deleteRevenue = createAsyncThunk<Revenue, number>(
  "revenue/delete",
  async (id) => {
    try {
      const { error } = await supabase
        .from("revenues")
        .delete()
        .eq("id", id);
      if (error)
        throw new Error(error.message);
      return {
        id,
        amount: null,
        category_id: null,
        revenue_date: null,
        user_id: null,
        description: null,
        category: null
      } as unknown as Revenue
    } catch (error) {
      throw error;
    }
  }
)

const revenueSlice = createSlice({
  name: "revenue",
  initialState,
  reducers: {
    clearRevenues: (state) => {
      state.data = null;
      state.loading = false;
      state.errors = null;
    }
  },
  extraReducers: (builder: ActionReducerMapBuilder<State<Revenue[]>>) => {
    builder
      .addCase(getRevenues.pending, (state) => {
        state.loading = true;
        state.errors = null;
      })
      .addCase(getRevenues.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(getRevenues.rejected, (state, action) => {
        state.loading = false;
        state.errors = [action.error.message || "Failed to fetch revenues."];
      })
      .addCase(addRevenue.pending, (state) => {
        state.loading = true;
        state.errors = null;
      })
      .addCase(addRevenue.fulfilled, (state, action) => {
        state.data?.push(action.payload);
        state.loading = false;
      })
      .addCase(addRevenue.rejected, (state, action) => {
        state.loading = false;
        state.errors = [action.error.message || "Failed to add revenue."];
      })
      .addCase(deleteRevenue.pending, (state) => {
        state.loading = true;
        state.errors = null
      })
      .addCase(deleteRevenue.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data?.filter((item) => item.id !== action.payload.id) || [];
      })
      .addCase(deleteRevenue.rejected, (state, action) => {
        state.loading = false;
        state.errors = [action.error.message || "Failed to delete revenue"]
      });
  }
});

export const { clearRevenues } = revenueSlice.actions;
export default revenueSlice.reducer;