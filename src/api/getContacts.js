import { supabase } from '../supabaseClient';

export const getContactsFromMessages = async (userId) => {
  const { data, error } = await supabase
    .rpc('get_last_messages_for_user', { current_user_id: userId });

  if (error) throw error;

  return data.map((msg) => {
    const contactId = msg.from_id === userId ? msg.to_id : msg.from_id;
    return {
      id: contactId,
      name: msg.contact_name || `User ${contactId}`,
      avatar: msg.contact_avatar,
      lastMessage: msg.body,
      timestamp: msg.created_at,
      unreadCount: 0
    };
  });
};