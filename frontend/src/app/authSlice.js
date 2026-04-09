import {createSlice} from '@reduxjs/toolkit';

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        isAuthenticated: false,
        isCheckingAuth: true,
    },
    reducers: {
        loginSuccess: (state, action) => {
            state.user =action.payload; // Saves { email, username }
            state.isAuthenticated =true;
            state.isCheckingAuth = false;
        },
        setAuthChecked: (state) => {
            state.isCheckingAuth = false; 
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated =false;
             state.isCheckingAuth = false;
        }, 
    },
});

export const { loginSuccess, logout, setAuthChecked } = authSlice.actions;
export default authSlice.reducer;