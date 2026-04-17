import type { State } from "@/interfaces/app-common";
import type { Category } from "@/interfaces/category";
import supabase from "@/lib/supabase";
import { createAsyncThunk, createSlice, type ActionReducerMapBuilder } from "@reduxjs/toolkit"

const initialState: State<Category[]> = {
    data: [],
    loading: false,
    errors: null
}

export const getCategories = createAsyncThunk<Category[]>("categories/getCategories", async () => {
    const { data, error } = await supabase.from('categories').select(`*`);
    if (error) {
        throw new Error(error.message);
    }
    return data as Category[];
});

export const addCategory = createAsyncThunk<Category, Omit<Category, "id">>("categories/addCategory", async (categoryData, { rejectWithValue }) => {
    const { data, error } = await supabase.from('categories').insert(categoryData).select(`*`).single();
    if (error) {
        return rejectWithValue(error);
    }
    return data as Category;
});

export const updateCategory = createAsyncThunk<Category, Category>("categories/updateCategory", async (categoryData) => {
    const { data, error } = await supabase.from('categories').update(categoryData).eq('id', categoryData.id).select("*").single();
    if (error) {
        throw new Error(error.message);
    }
    return data as Category;
});

export const deleteCategory = createAsyncThunk<number, number>("categories/deleteCategory", async (categoryId) => {
    const { error } = await supabase.from('categories').delete().eq('id', categoryId);
    if (error) {
        throw new Error(error.message);
    }
    return categoryId;
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
            .addCase(addCategory.pending, (state) => {
                state.loading = true;
                state.errors = null;
            })
            .addCase(addCategory.fulfilled, (state, action) => {
                state.loading = false;
                if (state.data) {
                    state.data.push(action.payload);
                } else {
                    state.data = [action.payload];
                }
            })
            .addCase(addCategory.rejected, (state, action) => {
                state.loading = false;
                state.errors = [action.error.message || "Failed to add category."];
            })
            .addCase(updateCategory.pending, (state) => {
                state.loading = true;
                state.errors = null;
            })
            .addCase(updateCategory.fulfilled, (state, action) => {
                state.loading = false;
                if (!state.data) return;
                const index = state.data.findIndex(category => category.id === action.payload.id);
                if (index !== -1) {
                    state.data[index] = action.payload;
                }
            })
            .addCase(updateCategory.rejected, (state, action) => {
                state.loading = false;
                state.errors = [action.error.message || "Failed to update category."];
            })
            .addCase(deleteCategory.pending, (state) => {
                state.loading = true;
                state.errors = null;
            })
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data?.filter(category => Number(category.id) !== action.payload) ?? [];
            })
            .addCase(deleteCategory.rejected, (state, action) => {
                state.loading = false;
                state.errors = [action.error.message || "Failed to delete category."];
            });
    }
})

export const { clearCategories } = categoriesSlice.actions;
export default categoriesSlice.reducer;