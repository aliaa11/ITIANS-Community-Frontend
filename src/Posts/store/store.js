// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import itianReducer from './itianSlice';

export const store = configureStore({
  reducer: {
    itian: itianReducer,
  },
});
