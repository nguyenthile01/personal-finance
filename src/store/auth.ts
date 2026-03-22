import type { State } from "@/interfaces/app-common";
import type { Credentials } from "@/interfaces/auth";
import supabase from "@/lib/supabase";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { User } from "@supabase/supabase-js";

const initialState: State<User> = {
  data: null,
  errors: [],
  loading: false
}
export const getUser = createAsyncThunk("auth/getUser", async () => {
  const authData = localStorage.getItem("sb-vmtthgtnabastdkktcol-auth-token");
  const user = authData ? JSON.parse(authData).user : null;
  return user;
});

export const signIn = createAsyncThunk<User, Credentials>("auth/signIn", async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data?.user || null;
});

export const signOut = createAsyncThunk("auth/signOut", async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
  localStorage.clear();
  return null;
});

export const signUp = createAsyncThunk<User | null, Credentials>("auth/signUP", async ({ email, password }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });
  if (error) throw new Error(error.message);
  return data?.user || null;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearUser: (state) => {
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
export const { clearUser } = authSlice.actions;
export default authSlice.reducer;