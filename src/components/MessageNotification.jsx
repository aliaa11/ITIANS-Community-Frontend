import { useState, useEffect } from 'react';
import { FaFacebookMessenger } from 'react-icons/fa';
import { supabase } from '../supabaseClient';

const MessageNotification = ({ className = "", iconClassName = "" }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const userId = parseInt(localStorage.getItem('user-id'));

  const checkColumnExists = async () => {
    try {
      const { error } = await supabase
        .from('ch_messages')
        .select('read_at')
        .limit(0);
      return !error;
    } catch (err) {
      return false;
    }
  };

  const fetchUnreadCount = async () => {
    if (!userId) return;

    try {
      const hasReadAtColumn = await checkColumnExists();
      
      if (!hasReadAtColumn) {
            
        const lastOpenTime = localStorage.getItem(`last_chat_open_${userId}`) || new Date(0).toISOString();
        
        const { count, error } = await supabase
          .from('ch_messages')
          .select('*', { count: 'exact', head: true })
          .eq('to_id', userId)
          .gt('created_at', lastOpenTime);
        
        if (!error) {
          setUnreadCount(count || 0);
        }
        return;
      }

      const { count, error } = await supabase
        .from('ch_messages')
        .select('*', { count: 'exact', head: true })
        .eq('to_id', userId)
        .is('read_at', null);
      
      if (!error) {
        setUnreadCount(count || 0);
      }
    } catch (err) {
      console.error('Error fetching unread messages:', err);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;


    const channel = supabase
      .channel(`message_notifications_${userId}`) 
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'ch_messages',
          filter: `to_id=eq.${userId}` // فقط الرسائل المرسلة لهذا المستخدم
        },
        (payload) => {
          
          // تحديث العدد فوراً
          setUnreadCount(prev => {
            const newCount = prev + 1;
            console.log('Updating unread count from', prev, 'to', newCount);
            return newCount;
          });
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      if (channel && typeof channel.unsubscribe === 'function') {
        channel.unsubscribe();
      }
    };
  }, [userId]);

  // الاستماع لتحديثات قراءة الرسائل
  useEffect(() => {
    if (!userId) return;

    const updateChannel = supabase
      .channel(`message_read_updates_${userId}`)
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'ch_messages',
          filter: `to_id=eq.${userId}`
        },
        (payload) => {
          
          // إذا تم وضع علامة قراءة على رسالة
          if (payload.new.read_at && !payload.old.read_at) {
            setUnreadCount(prev => {
              const newCount = Math.max(0, prev - 1);
              console.log('Decreasing unread count from', prev, 'to', newCount);
              return newCount;
            });
          }
        }
      )
      .subscribe();

    return () => {
      if (updateChannel && typeof updateChannel.unsubscribe === 'function') {
        updateChannel.unsubscribe();
      }
    };
  }, [userId]);

  // دالة لإعادة تعيين العدد
  const resetUnreadCount = () => {
    console.log('Resetting unread count to 0');
    setUnreadCount(0);
    
    // احفظ وقت آخر فتح للشات
    localStorage.setItem(`last_chat_open_${userId}`, new Date().toISOString());
  };

  // جعل الدالة متاحة عالمياً
  useEffect(() => {
    window.resetMessageNotifications = resetUnreadCount;
    
    return () => {
      delete window.resetMessageNotifications;
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <FaFacebookMessenger className={iconClassName} />
      {unreadCount > 0 && (
        <div className="absolute -top-2 -right-2 min-w-[20px] h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-pulse">
          {unreadCount > 99 ? '99+' : unreadCount}
        </div>
      )}
    </div>
  );
};

export default MessageNotification;