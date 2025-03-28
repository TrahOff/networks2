import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        token: localStorage.getItem('access_token') || null,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null
    },
    reducers: {
        setToken: (state, action) => {
            state.token = action.payload;
            state.isAuthenticated = true;
            localStorage.setItem('access_token', action.payload);
        },
        removeToken: (state) => {
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem('access_token');
        },
        setUserData: (state, action) => {
            state.user = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        }
    }
});

export const {
    setToken,
    removeToken,
    setUserData,  // Экспортируем новое действие
    setLoading,
    setError
} = authSlice.actions;

export default authSlice.reducer;