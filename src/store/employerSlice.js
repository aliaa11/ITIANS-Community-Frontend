import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  profile: null,
};

const employerSlice = createSlice({
  name: 'employer',
  initialState,
  reducers: {
    setEmployerProfile: (state, action) => {
      state.profile = action.payload;
    },
    clearEmployerProfile: (state) => {
      state.profile = null;
    },
  },
});

export const { setEmployerProfile, clearEmployerProfile } = employerSlice.actions;

export default employerSlice.reducer;
