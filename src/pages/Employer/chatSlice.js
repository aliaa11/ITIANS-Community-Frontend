// chatSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { chatApi } from '../../api/chatApi';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    contacts: [],
    messages: [],
    activeChat: null,
    searchQuery: '',
    showMobileChat: false,
    typingUsers: [],
    onlineUsers: [],
    unreadCounts: {},
    currentUser: null,
  },
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
      state.showMobileChat = true;
      if (action.payload?.id) {
        state.unreadCounts[action.payload.id] = 0;
      }
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    hideMobileChat: (state) => {
      state.showMobileChat = false;
    },
    addMessage: (state, action) => {
      const message = action.payload;
      state.messages.push(message);
      const contact = state.contacts.find(
        (c) => c.id === message.from_id || c.id === message.to_id
      );
      if (contact) {
        contact.lastMessage = message.body;
        contact.timestamp = message.created_at;
        if (state.activeChat?.id !== contact.id) {
          state.unreadCounts[contact.id] = (state.unreadCounts[contact.id] || 0) + 1;
        }
      }
    },
    updateMessageStatus: (state, action) => {
      const { messageId, status } = action.payload;
      const message = state.messages.find((m) => m.id === messageId);
      if (message) {
        message.status = status;
      }
    },
    setTypingUsers: (state, action) => {
      state.typingUsers = action.payload;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
      state.contacts.forEach((c) => {
        c.isOnline = state.onlineUsers.includes(c.id);
      });
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    updateContactLastSeen: (state, action) => {
      const { userId, lastSeen } = action.payload;
      const contact = state.contacts.find((c) => c.id === userId);
      if (contact) {
        contact.lastSeen = lastSeen;
      }
    },
    addContact: (state, action) => {
      const exists = state.contacts.find(c => c.id === action.payload.id);
      if (!exists) {
        state.contacts.push(action.payload);
      }
    },
    saveContact: (state, action) => {
      const contact = action.payload;
      const exists = state.contacts.some(c => c.id === contact.id);
      if (!exists) {
        state.contacts.push(contact);
      }
    },
  },

  // 👇 انقل extraReducers هنا
  extraReducers: (builder) => {
    builder
      .addMatcher(chatApi.endpoints.getContacts.matchFulfilled, (state, action) => {
        let contactsData = action.payload;

        if (contactsData?.data && Array.isArray(contactsData.data)) {
          contactsData = contactsData.data;
        } else if (contactsData?.contacts && Array.isArray(contactsData.contacts)) {
          contactsData = contactsData.contacts;
        } else if (!Array.isArray(contactsData)) {
          contactsData = [];
        }

        state.contacts = contactsData.map((c) => ({
          ...c,
          unreadCount: state.unreadCounts[c.id] || 0,
          isOnline: state.onlineUsers.includes(c.id),
        }));
      })
      .addMatcher(chatApi.endpoints.fetchMessages.matchFulfilled, (state, action) => {
        let messagesData = [];

        if (Array.isArray(action.payload)) {
          messagesData = action.payload;
        } else if (action.payload?.data && Array.isArray(action.payload.data)) {
          messagesData = action.payload.data;
        }

        state.messages = messagesData;

        if (messagesData.length > 0) {
          const firstMessage = messagesData[0];
          const currentUserId = state.currentUser?.id;
          const contactId =
            firstMessage.from_id === currentUserId
              ? firstMessage.to_id
              : firstMessage.from_id;

          const contactExists = state.contacts.some((c) => c.id === contactId);
          if (!contactExists) {
            state.contacts.push({
              id: contactId,
              name: `User #${contactId}`,
              lastMessage: firstMessage.body,
              timestamp: firstMessage.created_at,
              unreadCount: 0,
              isOnline: false,
            });
          } else {
            const contactIndex = state.contacts.findIndex((c) => c.id === contactId);
            if (contactIndex !== -1) {
              state.contacts[contactIndex].lastMessage = firstMessage.body;
              state.contacts[contactIndex].timestamp = firstMessage.created_at;
            }
          }
        }
      });
  },
});


export const {
  setActiveChat,
  setSearchQuery,
  hideMobileChat,
  addMessage,
  updateMessageStatus,
  setTypingUsers,
  setOnlineUsers,
  setCurrentUser,
  clearMessages,
  updateContactLastSeen,
  addContact,
  saveContact, // هنا
} = chatSlice.actions;

export default chatSlice.reducer;