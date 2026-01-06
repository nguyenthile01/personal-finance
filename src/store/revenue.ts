import type { Revenue } from "@/interfaces/revenue";
import { createAsyncThunk, createSlice, type ActionReducerMapBuilder } from "@reduxjs/toolkit";
import { supabase } from "@/lib/supabase";

type State = {
  revenueDatas: Revenue[];
  loading: boolean;
  errors: string[] | null;
};

const initialState: State = {
  revenueDatas: [],
  loading: false,
  errors: null,
};

export const getRevenues = createAsyncThunk<Revenue[]>("revenue/getRevenues", async () => {
  try {
    const { data, error } = await supabase
    .from('revenues')
    .select(`
        id,
        category_id,
        amount,
        revenue_date,
        user_id,
        description,
        category:categories!inner(id, name)
    `);
    if (error) {
      throw new Error(error.message);
    }
    return data as unknown as Revenue[];
  } catch (error) {
    throw error;
  }
});

export const addRevenue = createAsyncThunk<Revenue, Omit<Revenue, "id" | "created_at">>(
  "revenue/addRevenue",
  async (newRevenue) => {
    try {
      const { data, error } = await supabase.from("revenues").insert(newRevenue).select().single();
      if (error) {
        throw new Error(error.message);
      }
      return data as Revenue;
    } catch (error) {
      throw error;
    }
});

const revenueSlice = createSlice({
    name: "revenue",
    initialState,
    reducers: {
        clearRevenues: (state) => {
            state.revenueDatas = [];
            state.loading = false;
            state.errors = null;
        }
    },
    extraReducers: (builder: ActionReducerMapBuilder<State>) => {
      builder
        .addCase(getRevenues.pending, (state) => {
          state.loading = true;
          state.errors = null;
        })
        .addCase(getRevenues.fulfilled, (state, action) => {
          state.revenueDatas = action.payload;
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
          state.revenueDatas.push(action.payload);
          state.loading = false;
        })
        .addCase(addRevenue.rejected, (state, action) => {
          state.loading = false;
          state.errors = [action.error.message || "Failed to add revenue."];
        });
    }
});

export const { clearRevenues } = revenueSlice.actions;
export default revenueSlice.reducer;