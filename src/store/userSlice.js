import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
    name: "user",
    initialState: {
        user: {},
        token: null,
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload.user || "";
            state.token = action.payload.token || "";
        },
        logoutUser: (state) => {
            state.user = "";
            state.token = null;
        },
    },
});

export const { setUser, logoutUser } = userSlice.actions;

export const selectUser = (state) => state.user;
export const selectToken = (state) => state.token;

export default userSlice.reducer;