import { supabase } from '../supabaseClient';

export const getLastMessages = async (userId) => {
  const { data, error } = await supabase.functions.invoke('last_message', {
    body: { current_user_id: userId }
  });

  if (error) throw error;

  return data;
};