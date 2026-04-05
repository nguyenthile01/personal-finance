import type { State } from "@/interfaces/app-common";
import type { Country } from "@/interfaces/country";
import supabase from "@/lib/supabase";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState: State<Country[]> = {
    data: null,
    errors: [],
    loading: false
}
export const getCountries = createAsyncThunk<Country[]>("country/getCountries", async () => {
    const { data, error } = await supabase.from("countries").select("*");

    if (error) throw new Error(error.message);

    return data;
})

const countrySlice = createSlice({
    name: "country",
    initialState,
    reducers: {
        clearCountries: (state) => {
            state.data = null;
            state.errors = null;
            state.loading = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getCountries.pending, (state) => {
                state.errors = null;
                state.loading = true;
            })
            .addCase(getCountries.fulfilled, (state, action) => {
                state.errors = null;
                state.data = action.payload;
                state.loading = false;
            })
            .addCase(getCountries.rejected, (state, action) => {
                state.errors = [action.error.message || "Can't get country"];
                state.loading = false;
            })
    }
})
export const { clearCountries } = countrySlice.actions;
export default countrySlice.reducer;
