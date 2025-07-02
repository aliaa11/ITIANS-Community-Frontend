// Notification.jsx
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { useGetNotificationsQuery , useDeleteAllNotificationsMutation} from '../api/notificationsApi';
import { useSelector } from 'react-redux';
import useSupabaseNotifications from '../hooks/useSupabaseNotifications';
import { toast } from 'react-hot-toast';
import { supabase } from '../supabaseClient';
const Notifications = () => {

  const user = useSelector((state) => state.user.user);
  const role = useSelector((state) => state.user.role);
  const [deleteAllNotifications] = useDeleteAllNotificationsMutation(); // 👈 خليه فوق الشرط
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const { data: notifications, isLoading, error, refetch } = useGetNotificationsQuery();
  
  // Use ref to track if we're already processing a notification
  const processingRef = useRef(false);
  const lastNotificationRef = useRef(null);


  const storedUserId = localStorage.getItem('user-id') || localStorage.getItem('userId');
  const userId = useMemo(() => user?.id || storedUserId, [user?.id, storedUserId]);


  const handleNewNotification = useCallback((newNotification) => {
    // Prevent duplicate processing
    if (processingRef.current) {
      console.log('⚠️ Already processing a notification, skipping...');
      return;
    }

    // Check if this is the same notification we just processed
    if (lastNotificationRef.current?.id === newNotification.id) {
      console.log('⚠️ Duplicate notification detected, skipping...');
      return;
    }

    processingRef.current = true;
    lastNotificationRef.current = newNotification;
    
    console.log('⚡ New Realtime Notification received:', newNotification);
    
    // Show toast notification
    toast.success(newNotification.title || 'New notification received!', {
      duration: 4000,
      position: 'top-right',
      icon: '🔔',
    });
    
    // Refetch notifications to update the list
    refetch().then(() => {
      console.log('✅ Notifications refetched successfully');
      // Reset processing flag after a short delay
      setTimeout(() => {
        processingRef.current = false;
      }, 1000);
    }).catch((err) => {
      console.error('❌ Error refetching notifications:', err);
      processingRef.current = false;
    });
  }, [refetch]);

  // Setup real-time notifications with stable userId
  const {isConnected } = useSupabaseNotifications(handleNewNotification, userId);

  if (!user || !role) {
  console.log('⏳ Waiting for user data...');
  return null; 
  }

  if (!['itian', 'employer'].includes(role)) {
    console.log('🚫 User role not authorized:', role);
    return null;
  }


 const handleDeleteAllNotifications = async () => {
  try {
    await deleteAllNotifications().unwrap();
    toast.success('All notifications deleted!', { icon: '🗑️' });
    refetch();
    setShowDeleteConfirm(false);
  } catch (err) {
    console.error('❌ Error deleting notifications:', err);
    toast.error('Failed to delete notifications');
  }
};

  const unreadCount = notifications?.filter(n => !n.seen)?.length || 0;

  return (
    <>
      {/* Notification Button */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-red-300 group"
        >
          <svg 
            className="w-6 h-6 text-gray-600 group-hover:text-red-600 transition-colors duration-200" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
            />
          </svg>
          
          {/* Connection status indicator */}
          <div className={`absolute -top-1 -left-1 w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          } animate-pulse`} title={isConnected ? 'Realtime connected' : 'Realtime disconnected'} />
          
          {/* Unread notifications count */}
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notifications Dropdown */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 transform origin-top-right">
            
            {/* Header */}
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-red-50 to-pink-50 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  Notifications
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 hover:bg-white rounded-full"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {unreadCount > 0 && (
                <p className="text-sm text-red-600 mt-1 font-medium">
                  {unreadCount} new notification{unreadCount !== 1 ? 's' : ''}
                </p>
              )}
              {/* Debug info - remove in production */}
              <p className="text-xs text-gray-500 mt-1">
                Total: {notifications?.length || 0} | RT: {isConnected ? '✅' : '❌'}
              </p>
            </div>

            {/* Notifications Content */}
            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-2"></div>
                  <p className="text-gray-500">Loading notifications...</p>
                </div>
              ) : error ? (
                <div className="p-6 text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-red-600 font-medium">Error loading notifications</p>
                  <p className="text-gray-500 text-sm mt-1">Please try again</p>
                  <button 
                    onClick={() => refetch()}
                    className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                  >
                    Retry
                  </button>
                </div>
              ) : notifications?.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">No notifications</p>
                  <p className="text-gray-400 text-sm mt-1">Your new notifications will appear here</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => {
                    const isUnread = !notification.seen;

                    return (
                      <div
                          key={notification.id}
                           onClick={async () => {
                            console.log('🟢 Trying to update notification with ID:', notification.id);

                            const { error } = await supabase
                              .from('notifications')
                              .update({ seen: true })
                              .eq('id', notification.id);

                            if (error) {
                              console.error('❌ Error updating seen:', error);
                            } else {
                              console.log('✅ Seen updated successfully');
                              refetch();
                              if (notification.job_id) {
                              if (role === 'employer') {
                               window.location.href = `/employer/job/${notification.job_id}`;
                              } else {
                                window.location.href = `/jobs/${notification.job_id}`;
                              }
                            }

                            }
                          }}
                          className={`p-4 hover:bg-gray-50 transition-all duration-200 cursor-pointer group ${
                            !notification.seen ? 'bg-red-50 border-l-4 border-red-500' : ''
                          }`}
                        >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isUnread ? 'bg-red-100' : 'bg-gray-100'
                          }`}>
                            <svg className={`w-5 h-5 ${isUnread ? 'text-red-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className={`font-semibold text-sm truncate ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </h4>
                              {isUnread && <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 ml-2"></span>}
                            </div>
                            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-gray-400 text-xs mt-2">
                              {new Date(notification.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer with Mark as Read and Delete All buttons */}
            {notifications?.length > 0 && (
              <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      const storedUserId = localStorage.getItem('user-id');
                      await supabase
                        .from('notifications')
                        .update({ seen: true })
                        .eq('user_id', storedUserId);
                      refetch();
                    }}
                    className="flex-1 text-center text-red-600 hover:text-red-700 font-medium text-sm py-2 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    Mark all as read
                  </button>
                  
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex-1 text-center text-gray-600 hover:text-red-600 font-medium text-sm py-2 hover:bg-red-50 rounded-lg transition-colors duration-200 flex items-center justify-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete all
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Delete All Notifications?</h3>
                <p className="text-sm text-gray-600">This action cannot be undone.</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllNotifications}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Notifications;