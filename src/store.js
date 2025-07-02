import { configureStore } from '@reduxjs/toolkit';
import itianRequestsReducer from './store/itianRequestsSlice';
import jobPostReducer from './pages/Employer/jobPostSlice';
import jobsReducer from './store/jobsSlice';
import usersReducer from './store/usersSlice';
import chatReducer from './pages/Employer/chatSlice';
import { chatApi } from './api/chatApi';
import { notificationsApi } from './api/notificationsApi';
import itianProfileReducer from './store/itianProfileSlice';
import employerProfileReducer from './store/employerProfileSlice';
import itianReducer from './Posts/store/itianSlice.js';
import applicationReducer from './applicationSlice';
import userReducer from './store/userSlice';
import { testimonialsApi } from './api/testimonialsApi'

// import reportsReducer from './store/reportsSlice';
const store = configureStore({
  reducer: {
    user: userReducer,
    itianRequests: itianRequestsReducer,
    jobPost: jobPostReducer,
    jobs: jobsReducer,
    users: usersReducer,
    chat: chatReducer,
    application: applicationReducer,
    itianProfile: itianProfileReducer,
    employerProfile: employerProfileReducer,
    itian: itianReducer,
    [testimonialsApi.reducerPath]: testimonialsApi.reducer,
    // reports: reportsReducer,
    [chatApi.reducerPath]: chatApi.reducer,
    [notificationsApi.reducerPath]: notificationsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(chatApi.middleware,testimonialsApi.middleware, notificationsApi.middleware),

});

export default store;