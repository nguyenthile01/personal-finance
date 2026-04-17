import type { State } from "@/interfaces/app-common";
import type { Profile } from "@/interfaces/profile";
import supabase from "@/lib/supabase";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState: State<Profile> = {
    data: null,
    errors: [],
    loading: false
}

export const getProfile = createAsyncThunk("profile/getProfile", async (id: string, { rejectWithValue }) => {
    const { data, error } = await supabase.from("profile").select(`*, country:countries(*)`).eq("id", id).maybeSingle();
    if (error) return rejectWithValue(error);
    return data;
});

export const updateProfile = createAsyncThunk<Profile, Profile>("profile/updateProfile", async (profile: Profile, { rejectWithValue }) => {
    const { data, error } = await supabase.from("profile").update(profile).eq("id", profile.id).select(`*, country:countries(*)`).single();
    if (error) return rejectWithValue(error);
    return data;
});

export const addProfile = createAsyncThunk<Profile, Profile>("profile/addProfile", async (profile: Profile, { rejectWithValue }) => {
    const { data, error } = await supabase.from("profile").insert(profile).select(`*, country:countries(*)`).single();
    if (error) return rejectWithValue(error);
    return data;
});

const profileSlice = createSlice({
    name: "profile",
    initialState,
    reducers: {
        clearProfile: (state) => {
            state.data = null;
            state.errors = null;
            state.loading = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getProfile.pending, (state) => {
                state.loading = true;
                state.errors = null;
            })
            .addCase(getProfile.fulfilled, (state, action) => {
                state.data = action.payload;
                state.loading = false;
                state.errors = null;
            })
            .addCase(getProfile.rejected, (state, action) => {
                state.loading = false;
                state.errors = [action.error.message || "Can't get user profile"];
            })
            .addCase(updateProfile.pending, (state) => {
                state.loading = true;
                state.errors = null;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.errors = null;
                state.data = action.payload;
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.loading = false;
                state.errors = [action.error.message || "Can't update user profile"];
            })
            .addCase(addProfile.pending, (state) => {
                state.loading = true;
                state.errors = null;
            })
            .addCase(addProfile.fulfilled, (state) => {
                state.loading = false;
                state.errors = null;
            })
            .addCase(addProfile.rejected, (state, action) => {
                state.loading = false;
                state.errors = [action.error.message || "Can't update user profile"];
            })
    }
});
export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;