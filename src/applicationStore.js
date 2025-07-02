import { configureStore } from '@reduxjs/toolkit';
import applicationReducer from './applicationSlice';

const applicationStore = configureStore({
  reducer: {
    application: applicationReducer,
  },
});

export default applicationStore;
