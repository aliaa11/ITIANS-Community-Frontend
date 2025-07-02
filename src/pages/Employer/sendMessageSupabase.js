import { supabase } from '../../supabaseClient'

export const sendMessage = async ({ from_id, to_id, body }) => {
  const { data, error } = await supabase
    .from('ch_messages')
    .insert([{ from_id, to_id, body }])

  if (error) {
    console.error('❌ Error sending message:', error.message)
    return null
  }

  return data[0]
}

