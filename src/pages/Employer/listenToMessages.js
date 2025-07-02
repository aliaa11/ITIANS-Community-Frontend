import { supabase } from '../../supabaseClient'

export const listenToMessages = (to_id, onNewMessage) => {
  return supabase
    .channel('realtime:messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `to_id=eq.${to_id}`,
      },
      (payload) => {
        onNewMessage(payload.new)
      }
    )
    .subscribe()
}
