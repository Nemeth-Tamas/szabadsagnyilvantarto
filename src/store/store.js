import { applyMiddleware, createStore, configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';
import {thunk} from 'redux-thunk';

const presistConfig = {
    key: 'root',
    storage,
}

const presistedReducer = persistReducer(presistConfig, userReducer)

export const store = createStore(presistedReducer, applyMiddleware(thunk));

// export const store = configureStore({
//     reducer: presistedReducer,
//     devTools: process.env.NODE_ENV !== 'production',
//     middleware: [thunk]
// });

export const presistor = persistStore(store);