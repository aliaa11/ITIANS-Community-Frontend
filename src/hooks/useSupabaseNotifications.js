// useSupabaseNotifications.js
import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../supabaseClient';

const useSupabaseNotifications = (onNotification, userId) => {
  const subscriptionRef = useRef(null);
  const callbackRef = useRef(onNotification);
  const reconnectTimeoutRef = useRef(null);
  const isConnectedRef = useRef(false);

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = onNotification;
  }, [onNotification]);

  // Reconnection logic
  const reconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    reconnectTimeoutRef.current = setTimeout(() => {
      console.log('🔄 Attempting to reconnect realtime subscription...');
      setupSubscription();
    }, 2000);
  }, []);

  // Setup subscription function
  const setupSubscription = useCallback(async () => {
  const token = localStorage.getItem('access-token');
  const storedUserId = localStorage.getItem('user-id') || localStorage.getItem('userId');
  const finalUserId = userId || storedUserId;

  if (!finalUserId) {
    console.log('❌ No userId provided, skipping subscription');
    return;
  }

  // Clean up existing subscription first
  if (subscriptionRef.current) {
    console.log('🧹 Cleaning up existing subscription');
    subscriptionRef.current.unsubscribe();
    subscriptionRef.current = null;
    isConnectedRef.current = false;
  }

  try {
    console.log('🔑 Auth setup - Token exists:', !!token, 'Stored User ID:', storedUserId, 'Component User ID:', userId);

    console.log('🔄 Setting up real-time subscription for user:', finalUserId);

    const channelName = `notifications-${finalUserId}-${Date.now()}`;

    const subscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${finalUserId}`
        },
        (payload) => {
          console.log('📨 New notification received via realtime:', payload);
          if (payload.new && callbackRef.current) {
            callbackRef.current(payload.new);
          }
        }
      )
      .subscribe((status, err) => {
        console.log('📡 Subscription status:', status, err ? 'Error:' : '', err);

        switch (status) {
          case 'SUBSCRIBED':
            console.log('✅ Successfully subscribed to notifications for user:', finalUserId);
            isConnectedRef.current = true;
            if (reconnectTimeoutRef.current) {
              clearTimeout(reconnectTimeoutRef.current);
              reconnectTimeoutRef.current = null;
            }
            break;

          case 'CHANNEL_ERROR':
            console.error('❌ Channel subscription error:', err);
            isConnectedRef.current = false;
            reconnect();
            break;

          case 'TIMED_OUT':
            console.error('⏰ Channel subscription timed out');
            isConnectedRef.current = false;
            reconnect();
            break;

          case 'CLOSED':
            console.log('🔒 Channel subscription closed');
            isConnectedRef.current = false;
            break;
        }
      });

    subscriptionRef.current = subscription;

  } catch (error) {
    console.error('❌ Error setting up subscription:', error);
    reconnect();
  }
}, [userId, reconnect]);

  // Main effect to setup subscription
  useEffect(() => {
    setupSubscription();

    // Cleanup function
    return () => {
      if (subscriptionRef.current) {
        console.log('🧹 Cleaning up notification subscription for user:', userId);
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
        isConnectedRef.current = false;
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [setupSubscription]);

  // Listen for storage changes (when user logs in/out)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'access-token' || e.key === 'user-id' || e.key === 'userId') {
        console.log('🔄 Storage changed, reconnecting subscription...');
        setTimeout(setupSubscription, 1000);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [setupSubscription]);

  // Return cleanup function and connection status
  return {
    cleanup: () => {
      if (subscriptionRef.current) {
        console.log('🧹 Manual cleanup of notification subscription');
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
        isConnectedRef.current = false;
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    },
    isConnected: isConnectedRef.current
  };
};

export default useSupabaseNotifications;