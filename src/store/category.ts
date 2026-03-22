import type { State } from "@/interfaces/app-common";
import type { Category } from "@/interfaces/category";
import supabase from "@/lib/supabase";
import { createAsyncThunk, createSlice, type ActionReducerMapBuilder } from "@reduxjs/toolkit"

const initialState: State<Category[]> = {
    data: [],
    loading: false,
    errors: null
}

export const getCategories = createAsyncThunk<Category[]>("category/getCategories", async () => {
    const { data, error } = await supabase.from('categories').select(`id, name, type`);
    if (error) {
        throw new Error(error.message);
    }
    return data as Category[];
});

const categoriesSlice = createSlice({
    name: "categories",
    initialState,
    reducers: {
        clearCategories: (state) => {
            state.data = [];
            state.loading = false;
            state.errors = null;
        }
    },
    extraReducers: (builder: ActionReducerMapBuilder<State<Category[]>>) => {
        builder
            .addCase(getCategories.pending, (state) => {
                state.loading = true;
                state.errors = null;
            })
            .addCase(getCategories.fulfilled, (state, action) => {
                state.data = action.payload;
                state.loading = false;
            })
            .addCase(getCategories.rejected, (state, action) => {
                state.loading = false;
                state.errors = [action.error.message || "Failed to fetch revenues."];
            })
    }
})

export const {clearCategories} = categoriesSlice.actions;
export default categoriesSlice.reducer;