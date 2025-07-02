// إضافة هذا في ملف chatApi.js

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const chatApi = createApi({
  
  reducerPath: 'chatApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8000/api/mychat/',
    prepareHeaders: (headers, { getState }) => {
      // أضف Authorization header إذا كان متوفر
      const token = getState().auth?.token || localStorage.getItem('access-token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      headers.set('Content-Type', 'application/json')
      headers.set('Accept', 'application/json')
      return headers
    },
  }),
  tagTypes: ['Contact', 'Message'],
  endpoints: (builder) => ({
    getContacts: builder.query({
      query: () => 'getContacts',
      providesTags: ['Contact'],
    }),
    fetchMessages: builder.mutation({
      query: (conversationId) => ({
        url: 'fetchMessages',
        method: 'POST',
        body: { id: conversationId },
      }),
      invalidatesTags: ['Message'],
    }),
    sendMessage: builder.mutation({
      query: ({ id, message, type = 'user' }) => ({
        url: 'sendMessage',
        method: 'POST',
        body: { 
          id, 
          message,
          type 
        },
      }),
      invalidatesTags: ['Contact', 'Message'],
    }),
    createConversation: builder.mutation({
      query: ({ user_id, initial_message }) => ({
        url: 'createConversation', 
        method: 'POST',
        body: { 
          user_id: user_id,
          message: initial_message || '',
          type: 'user'
        },
      }),
      invalidatesTags: ['Contact'],
    }),
    getUserInfo: builder.mutation({
      query: (userId) => ({
        url: 'idInfo',
        method: 'POST',
        body: { user_id: userId },
      }),
    }),
    makeSeen: builder.mutation({
      query: (conversationId) => ({
        url: 'makeSeen',
        method: 'POST',
        body: { id: conversationId },
      }),
      invalidatesTags: ['Contact', 'Message'],
    }),
    searchUsers: builder.query({
      query: (searchTerm) => `search?q=${searchTerm}`,
    }),
    deleteConversation: builder.mutation({
      query: (conversationId) => ({
        url: 'deleteConversation',
        method: 'POST',
        body: { id: conversationId },
      }),
      invalidatesTags: ['Contact'],
    }),
    setActiveStatus: builder.mutation({
      query: (isActive) => ({
        url: 'setActiveStatus',
        method: 'POST',
        body: { active: isActive },
      }),
    }),
    updateMessage: builder.mutation({
      query: ({ id, body }) => ({
      url: 'updateMessage',
      method: 'POST',
      body: { id, body },
    }),
      invalidatesTags: ['Message'],
    }),
  })
})

export const {
  useGetContactsQuery,
  useFetchMessagesMutation,
  useSendMessageMutation,
  useCreateConversationMutation,
  useGetUserInfoMutation, // الـ hook الجديد
  useMakeSeenMutation,
  useSearchUsersQuery,
  useDeleteConversationMutation,
  useSetActiveStatusMutation,
  useUpdateMessageMutation,

} = chatApi