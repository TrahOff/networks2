import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './authSlice';

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth']
};

const store = configureStore({
    reducer: {
        auth: persistReducer(persistConfig, authReducer)
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST'],
            },
        }),
});

const persistor = persistStore(store);

// Правильный экспорт
export default store;
export { persistor };