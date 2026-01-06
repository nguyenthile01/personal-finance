import type { State } from "@/interfaces/app-common";
import type { Credentials } from "@/interfaces/auth";
import supabase from "@/lib/supabase";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { User } from "@supabase/supabase-js";
const initialState: State<User> = {
    data: {
        id: "",
        app_metadata: {},
        user_metadata: {},
        aud: "",
        created_at: ""
    },
    errors: [],
    loading: false
}
export const getUser = createAsyncThunk("auth/getUser", async () => {
    const { data, error} = await supabase.auth.getUser();
    if (error) throw new Error(error.message);
    return data?.user || null;
});

export const signIn = createAsyncThunk<User, Credentials>("auth/signIn", async ({ email, password }) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error(error.message);
        return data?.user || null;
    } catch (error) {
        throw error;
    }
});

export const signOut = createAsyncThunk("auth/signOut", async () => {
    await supabase.auth.signOut();
    return null;
});

export const signUp = createAsyncThunk<User | null, Credentials>("auth/signUP", async ({ email, password }) => {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });
        if (error) throw new Error(error.message);
        return data?.user || null;
    } catch (error) {
        throw error;
    }
});

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        clearRevenues: (state) => {
            state.data = null;
            state.loading = false;
            state.errors = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getUser.pending, (state) => {
                state.loading = true;
                state.errors = null;
            })
            .addCase(getUser.fulfilled, (state, action) => {
                state.data = action.payload;
                state.loading = false;
            })
            .addCase(getUser.rejected, (state, action) => {
                state.loading = false;
                state.errors = [action.error.message || "Can't get session"];
            })
            .addCase(signIn.pending, (state) => {
                state.loading = true;
                state.errors = null;
            })
            .addCase(signIn.fulfilled, (state, action) => {
                state.data = action.payload;
                state.loading = false;
            })
            .addCase(signIn.rejected, (state, action) => {
                state.loading = false;
                state.errors = [action.error.message || "sign in failed"];
            })
            .addCase(signOut.pending, (state) => {
                state.loading = true;
                state.errors = null;
            })
            .addCase(signOut.fulfilled, (state) => {
                state.data = null;
                state.loading = false;
            })
            .addCase(signOut.rejected, (state, action) => {
                state.loading = false;
                state.errors = [action.error.message || "sign out failed"];
            })
            .addCase(signUp.pending, (state) => {
                state.loading = true;
                state.errors = null;
            })
            .addCase(signUp.fulfilled, (state, action) => {
                state.data = action.payload;
                state.loading = false;
            })
            .addCase(signUp.rejected, (state, action) => {
                state.loading = false;
                state.errors = [action.error.message || "sign up failed"];
            })
    },
});
export const { clearRevenues } = authSlice.actions;
export default authSlice.reducer;