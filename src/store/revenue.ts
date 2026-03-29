import type { Revenue } from "@/interfaces/revenue";
import { createAsyncThunk, createSlice, type ActionReducerMapBuilder } from "@reduxjs/toolkit";
import { supabase } from "@/lib/supabase";
import type { State } from "@/interfaces/app-common";

interface RevenueState extends State<Revenue[]> {
  from?: string,
  to?: string,
  page: number,
  pageSize: number,
  total: number
}
const initialState: RevenueState = {
  data: [],
  loading: false,
  errors: null,
  from: undefined,
  to: undefined,
  page: 1,
  pageSize: 30,
  total: 0
};

export const getRevenues = createAsyncThunk<{ rows: Revenue[]; count: number }, { from?: string, to?: string, page?: number, pageSize?: number }>(
  "revenue/get",
  async (params?: { from?: string, to?: string, page?: number, pageSize?: number }) => {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 10;
    const start = (page - 1) * pageSize;
    const end = page * pageSize - 1;

    let query = supabase
      .from('revenues')
      .select(`*, category:categories(*)`, { count: 'exact' });

    if (params?.from && params?.to) {
      query = query
        .gte("revenue_date", params.from)
        .lte("revenue_date", params.to);
    }

    // apply pagination range
    const { data, error, count } = await query.order("revenue_date", { ascending: false }).range(start, end);
    if (error) throw new Error(error.message);
    return { rows: data as unknown as Revenue[], count: count ?? 0 };
  }
);

export const addRevenue = createAsyncThunk<Revenue, Omit<Revenue, "id">>(
  "revenue/add",
  async (newRevenue) => {
    const { data, error } = await supabase
      .from("revenues").insert(newRevenue)
      .select(`*, category:categories(*)`)
      .single();
    if (error) throw new Error(error.message);
    return data as unknown as Revenue;
  });

export const deleteRevenue = createAsyncThunk<Revenue, number>(
  "revenue/delete",
  async (id) => {
    const { error } = await supabase
      .from("revenues")
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);
    return {
      id,
      amount: null,
      category_id: null,
      revenue_date: null,
      user_id: null,
      description: null,
      category: null
    } as unknown as Revenue
  }
);

export const getRevenueComparision = createAsyncThunk(
  `revenue/getComparision`,
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
      supabase.from("revenues")
        .select("amount")
        .gte("revenue_date", startOfCurrent)
        .lte("revenue_date", endOfCurrent),
      supabase.from("revenues")
        .select("amount")
        .gte("revenue_date", startOfLast)
        .lte("revenue_date", endOfLast)
    ]);

    const currentTotal = currentRes.data?.reduce((sum, row) => sum + row.amount, 0) || 0;
    const lastTotal = lastRes.data?.reduce((sum, row) => sum + row.amount, 0) || 0;

    return { currentTotal, lastTotal };
  }
);

const revenueSlice = createSlice({
  name: "revenue",
  initialState,
  reducers: {
    clearRevenues: (state) => {
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
    }
  },
  extraReducers: (builder: ActionReducerMapBuilder<RevenueState>) => {
    builder
      .addCase(getRevenues.pending, (state) => {
        state.loading = true;
        state.errors = null;
      })
      .addCase(getRevenues.fulfilled, (state, action) => {
        state.data = action.payload.rows;
        state.loading = false;
        state.from = action.meta.arg.from;
        state.to = action.meta.arg.to;
        state.total = action.payload.count;
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
        const revenue = action.payload;
        const matchFilter = (state.from && state.to) ? (new Date(revenue.revenue_date) >= new Date(state.from) && new Date(revenue.revenue_date) <= new Date(state.to)) : true;
        if (matchFilter) {
          state.data?.push(action.payload);
          // sort descending by date
          state.data?.sort(
            (a, b) => new Date(b.revenue_date).getTime() - new Date(a.revenue_date).getTime()
          );
        }
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
      })
      .addCase(getRevenueComparision.pending, (state) => {
        state.loading = true;
        state.errors = null;
      })
      .addCase(getRevenueComparision.fulfilled, (state) => {
        state.loading = false;
        state.errors = null;
      })
      .addCase(getRevenueComparision.rejected, (state, action) => {
        state.loading = false;
        state.errors = [action.error.message || "Failed to get comparision revenue"];
      })
  }
});

export const { clearRevenues, setPage, setPageSize } = revenueSlice.actions;
export default revenueSlice.reducer;