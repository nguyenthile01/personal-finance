import type { State } from "@/interfaces/app-common";
import type { Expense } from "@/interfaces/expense";
import supabase from "@/lib/supabase";
import { createAsyncThunk, createSlice, type ActionReducerMapBuilder } from "@reduxjs/toolkit";

interface ExpenseState extends State<Expense[]> {
  from?: string,
  to?: string,
  page: number,
  pageSize: number,
  total: number
}

const initialState: ExpenseState = {
  data: [],
  loading: false,
  errors: null,
  from: undefined,
  to: undefined,
  page: 1,
  pageSize: 10,
  total: 0
}

export const getExpenses = createAsyncThunk<{ rows: Expense[]; count: number }, { from?: string, to?: string, page?: number, pageSize?: number }>(
  "expense/get",
  async (params?: { from?: string, to?: string, page?: number, pageSize?: number }) => {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 10;
    const start = (page - 1) * pageSize;
    const end = page * pageSize - 1;

    let query = supabase
      .from('expenses')
      .select(`*, category:categories(*)`, { count: 'exact' });

    if (params?.from && params?.to) {
      query = query
        .gte("expense_date", params.from)
        .lte("expense_date", params.to);
    }

    // apply pagination range
    const { data, error, count } = await query.order("expense_date", { ascending: false }).range(start, end);
    if (error) throw new Error(error.message);
    return { rows: data as unknown as Expense[], count: count ?? 0 };
  }
);

export const addExpense = createAsyncThunk<Expense, Omit<Expense, "id">>(
  "expense/add",
  async (newExpense) => {
    const { data, error } = await supabase
      .from("expenses")
      .insert(newExpense)
      .select(`*, category:categories(*)`)
      .single();
    if (error) throw new Error(error.message);
    return data as Expense;
  }
);

export const deleteExpense = createAsyncThunk<Expense, number>(
  `expense/delete`,
  async (id) => {
    const { error } = await supabase
      .from("expense")
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);
    return {
      id,
      amount: null,
      category_id: null,
      expense_date: null,
      user_id: null,
      description: null,
      category: null
    } as unknown as Expense
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
      state.from = undefined;
      state.to = undefined;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setPageSize: (state, action) => {
      state.pageSize = action.payload;
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<ExpenseState>) => {
    builder
      .addCase(addExpense.pending, (state) => {
        state.loading = true;
        state.errors = null;
      })
      .addCase(addExpense.fulfilled, (state, action) => {
        const expense = action.payload;
        const matchFilter = (state.from && state.to) ?
          (new Date(expense.expense_date) >= new Date(state.from) && new Date(expense.expense_date) <= new Date(state.to)) :
          true;
        if (matchFilter) {
          state.data?.push(action.payload);
          // sort descending by date
          state.data?.sort(
            (a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime()
          );
        }

        state.loading = false;
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
        state.data = action.payload.rows;
        state.from = action.meta.arg.from;
        state.to = action.meta.arg.to;
        state.total = action.payload.count;
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
      .addCase(getExpenseComparision.fulfilled, (state) => {
        state.loading = false;
        state.errors = null;
      })
      .addCase(getExpenseComparision.rejected, (state, action) => {
        state.loading = false;
        state.errors = [action.error.message || "Failed to get comparision expense"];
      })
  }
});

export const { clearExpense, setPage, setPageSize } = expenseSlice.actions;
export default expenseSlice.reducer;