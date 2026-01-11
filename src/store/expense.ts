import type { State } from "@/interfaces/app-common";
import type { Expense } from "@/interfaces/expense";
import supabase from "@/lib/supabase";
import { createAsyncThunk, createSlice, type ActionReducerMapBuilder } from "@reduxjs/toolkit";

const initialState: State<Expense[]> = {
  data: null,
  loading: false,
  errors: null
}

export const getExpense = createAsyncThunk<Expense[], { from?: string, to?: string }>("expense/getByCondition", async (params?: { from?: string, to?: string }) => {
  try {
    let query = supabase
      .from("expenses")
      .select(`*, category:categories(*)`);
    if (params?.from && params.to) {
      query = query
        .gte("expense_date", params.from)
        .lte("expense_date", params.to);
    }

    const { data, error } = await query.order("expense_date", { ascending: false });

    if (error)
      throw new Error(error.message);
    return data as Expense[];
  } catch (error) {
    throw error;
  }
});

export const addExpense = createAsyncThunk<Expense, Omit<Expense, "id">>(
  "expense/add",
  async (newExpense) => {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .insert(newExpense)
        .select(`*, category:categories(*)`)
        .single();
      if (error)
        throw new Error(error.message);
      return data;
    } catch (error) {
      throw error;
    }
  }
);

export const deleteExpense = createAsyncThunk<Expense, number>(
  `expense/delete`,
  async (id) => {
    try {
      const { error } = await supabase
        .from("revenue")
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
      } as unknown as Expense
    } catch (error) {
      throw error;
    }
  })

const expenseSlice = createSlice({
  name: "expense",
  initialState,
  reducers: {
    clearExpense: (state) => {
      state.data = null;
      state.loading = false;
      state.errors = null;
    }
  },
  extraReducers: (builder: ActionReducerMapBuilder<State<Expense[]>>) => {
    builder
      .addCase(addExpense.pending, (state) => {
        state.loading = true;
        state.errors = null;
      })
      .addCase(addExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.data?.push(action.payload);
        state.errors = null;
      })
      .addCase(addExpense.rejected, (state, action) => {
        state.loading = false;
        state.errors = [action.error.message || "Failed to add new expense"];
      })
      .addCase(getExpense.pending, (state) => {
        state.loading = true;
        state.errors = null;
      })
      .addCase(getExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.errors = null;
      })
      .addCase(getExpense.rejected, (state, action) => {
        state.loading = false;
        state.errors = [action.error.message || "Failed to get expense by condition"];
      })
      .addCase(deleteExpense.pending, (state) => {
        state.loading = true;
        state.errors = null;
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data?.filter((item) => item.id !== action.payload.id) || [];
        state.errors = null;
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.loading = false;
        state.errors = [action.error.message || "Failed to delete new expense"];
      })
  }
});

export const { clearExpense } = expenseSlice.actions;
export default expenseSlice.reducer;