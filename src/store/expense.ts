import type { State } from "@/interfaces/app-common";
import type { Expense } from "@/interfaces/expense";
import supabase from "@/lib/supabase";
import { createAsyncThunk, createSlice, type ActionReducerMapBuilder } from "@reduxjs/toolkit";

interface ExpenseState extends State<Expense[]> {
  currentTotal?: number,
  lastTotal?: number
}

const initialState: ExpenseState = {
  data: null,
  loading: false,
  errors: null,
  currentTotal: undefined,
  lastTotal: undefined
}

export const getExpenses = createAsyncThunk<Expense[], { from?: string, to?: string }>("expense/getByCondition", async (params?: { from?: string, to?: string }) => {
  try {
    let query = supabase
      .from("expenses")
      .select(`*, category:categories(*)`);
    if (params?.from && params?.to) {
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
        .from("expense")
        .delete()
        .eq("id", id);
      if (error)
        throw new Error(error.message);
      return {
        id,
        amount: null,
        category_id: null,
        expense_date: null,
        user_id: null,
        description: null,
        category: null
      } as unknown as Expense
    } catch (error) {
      throw error;
    }
  }
);

export const getExpenseComparision = createAsyncThunk(
  `expense/getComparision`,
  async () => {
    const now = new Date();
    // Current Month Range
    const startOfCurrent = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfCurrent = now.toISOString();

    // Last Month Range
    const startOfLast = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const endOfLast = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

    // Fetch both ranges
    const [currentRes, lastRes] = await Promise.all([
      supabase.from("expenses")
        .select("amount")
        .gte("expense_date", startOfCurrent)
        .lte("expense_date", endOfCurrent),
      supabase.from("expenses")
        .select("amount")
        .gte("expense_date", startOfLast)
        .lte("expense_date", endOfLast)
    ]);

    const currentTotal = currentRes.data?.reduce((sum, row) => sum + row.amount, 0) || 0;
    const lastTotal = lastRes.data?.reduce((sum, row) => sum + row.amount, 0) || 0;

    return { currentTotal, lastTotal };
  }
);

const expenseSlice = createSlice({
  name: "expense",
  initialState,
  reducers: {
    clearExpense: (state) => {
      state.data = null;
      state.loading = false;
      state.errors = null;
      state.currentTotal = undefined;
      state.lastTotal = undefined
    }
  },
  extraReducers: (builder: ActionReducerMapBuilder<ExpenseState>) => {
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
      .addCase(getExpenses.pending, (state) => {
        state.loading = true;
        state.errors = null;
      })
      .addCase(getExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.errors = null;
      })
      .addCase(getExpenses.rejected, (state, action) => {
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
      .addCase(getExpenseComparision.pending, (state) => {
        state.loading = true;
        state.errors = null;
      })
      .addCase(getExpenseComparision.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTotal = action.payload.currentTotal;
        state.lastTotal = action.payload.lastTotal;
        state.errors = null;
      })
      .addCase(getExpenseComparision.rejected, (state, action) => {
        state.loading = false;
        state.errors = [action.error.message || "Failed to get comparision expense"];
      })
  }
});

export const { clearExpense } = expenseSlice.actions;
export default expenseSlice.reducer;