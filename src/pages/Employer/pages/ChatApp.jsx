import { useEffect, useState, useRef, useCallback } from 'react';
import { MessageCircle, Send, User, Clock, Search, Menu, Sparkles, Smile, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import { useLocation } from 'react-router-dom';

// Avatar component
const Avatar = ({ src, name, size = 12, className = "" }) => {
  const [imageState, setImageState] = useState({
    loading: !!src,
    error: false,
    loaded: false
  });

  useEffect(() => {
    if (src) {
      setImageState({ loading: true, error: false, loaded: false });
    } else {
      setImageState({ loading: false, error: false, loaded: false });
    }
  }, [src]);

  const handleLoad = () => {
    setImageState({ loading: false, error: false, loaded: true });
  };

  const sizeClasses = {
    8: 'w-8 h-8',
    10: 'w-10 h-10',
    12: 'w-12 h-12',
    16: 'w-16 h-16',
    20: 'w-20 h-20'
  };

  const iconSizes = {
    8: 12,
    10: 16,
    12: 20,
    16: 24,
    20: 32
  };

  return (
    <div className={`${sizeClasses[size] || `w-${size} h-${size}`} rounded-full flex items-center justify-center shadow-lg ring-2 ring-red-300 overflow-hidden relative ${className}`}
         style={{
           background: (!src || imageState.error) ? "linear-gradient(to right, #d0443c, #b33a34)" : "#ffffff",
           border: (!src || imageState.error) ? "none" : "2px solid #ef4444"
         }}>

      {/* Loading spinner */}
      {imageState.loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Image */}
      {src && !imageState.error && (
        <img
          src={src}
          alt={name || 'Profile'}
          className={`w-full h-full object-cover rounded-full transition-opacity duration-300 ${
            imageState.loaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          loading="lazy"
        />
      )}

      {/* Fallback icon */}
      {(!src || imageState.error) && !imageState.loading && (
        <User
          size={iconSizes[size] || 20}
          className="text-white"
        />
      )}
    </div>
  );
};

const ChatApp = () => {
  const userId = parseInt(localStorage.getItem('user-id'));
  const location = useLocation();

  // State declarations
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState({});
  const [editingMessage, setEditingMessage] = useState(null);
  const [editMessageText, setEditMessageText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showDeleteConversation, setShowDeleteConversation] = useState(false);

  const messagesEndRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const contactId = location.state?.user;
  const contactName = location.state?.name;

  // Helper function to safely fetch user profile data
  const fetchUserProfile = async (userId) => {
    // Try to get basic user data first
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', userId)
      .maybeSingle();

    let displayName = `User ${userId}`;
    let displayImage = null;

    if (userData && !userError) {
      displayName = userData.name || userData.email || displayName;
    }

    // Try ITI profile with enhanced image handling
    const { data: itiData, error: itiError } = await supabase
      .from('itian_profiles')
      .select('first_name, last_name, profile_picture')
      .eq('user_id', userId)
      .maybeSingle();

    if (itiData && !itiError) {
      const fullName = `${itiData.first_name || ''} ${itiData.last_name || ''}`.trim();
      if (fullName) {
        displayName = fullName;
      }
      if (itiData.profile_picture) {
        displayImage = await processProfilePicture(itiData.profile_picture);
      }
      return { displayName, displayImage, profileType: 'iti' };
    }

    const { data: empData, error: empError } = await supabase
      .from('employer_profiles')
      .select('company_name, company_logo')
      .eq('user_id', userId)
      .maybeSingle();

    if (empData && !empError) {
      displayName = empData.company_name || displayName;
      if (empData.company_logo) {
        displayImage = await processProfilePicture(empData.company_logo, 'company_logos');
      }
      return { displayName, displayImage, profileType: 'employer' };
    }

    const finalResult = { displayName, displayImage, profileType: 'basic' };
    return finalResult;
  };

  const processProfilePicture = (picturePath, bucket = 'profile_pictures') => {
    if (!picturePath) return null;
    if (picturePath.startsWith("http")) return picturePath;
    return `${import.meta.env.VITE_APP_URL}/storage/${picturePath}`;
  };

  useEffect(() => {
    if (window.resetMessageNotifications) {
      window.resetMessageNotifications();
    }
  }, []);

  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
    setUnreadMessages(prev => ({ ...prev, [contact.contact_id]: 0 }));
    fetchMessages(contact.contact_id);
    markMessagesAsRead(contact.contact_id);
    setIsMobileMenuOpen(false);

    if (window.resetMessageNotifications) {
      window.resetMessageNotifications();
    }
  };

  useEffect(() => {
    const handleContactFromRoute = async () => {
      if (contactId && !contacts.some(c => c.contact_id === contactId)) {
        try {
          const profileResult = await fetchUserProfile(contactId);
          const tempContact = {
            id: `temp-${Date.now()}`,
            contact_id: contactId,
            contact_name: profileResult.displayName,
            contact_avatar: profileResult.displayImage,
            body: "Start a conversation...",
            created_at: new Date().toISOString(),
            from_id: contactId
          };
          setContacts(prev => [tempContact, ...prev]);
          setSelectedContact(tempContact);
          fetchMessages(contactId);
          if (window.resetMessageNotifications) {
            window.resetMessageNotifications();
          }
        } catch (error) {
          const basicContact = {
            id: `temp-${Date.now()}`,
            contact_id: contactId,
            contact_name: contactName || `User ${contactId}`,
            contact_avatar: null,
            body: "Start a conversation...",
            created_at: new Date().toISOString(),
            from_id: contactId
          };
          setContacts(prev => [basicContact, ...prev]);
          setSelectedContact(basicContact);
          fetchMessages(contactId);
        }
      } else if (contactId) {
        const existingContact = contacts.find(c => c.contact_id === contactId);
        if (existingContact) {
          setSelectedContact(existingContact);
          fetchMessages(contactId);
          markMessagesAsRead(contactId);
          if (window.resetMessageNotifications) {
            window.resetMessageNotifications();
          }
        }
      }
    };

    handleContactFromRoute();
    // eslint-disable-next-line
  }, [contactId, contactName, location.key]);

  useEffect(() => {
    if (!userId) return;

    const presenceChannel = supabase.channel('online_users', {
      config: {
        presence: {
          key: userId.toString()
        }
      }
    });

    presenceChannel.on('presence', { event: 'sync' }, () => {
      const newState = presenceChannel.presenceState();
      const onlineUserIds = Object.keys(newState).map(Number);
      setOnlineUsers(onlineUserIds);
    });

    presenceChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await presenceChannel.track({
          user_id: userId,
          online_at: new Date().toISOString(),
          status: 'online'
        });
      }
    });

    const handleBeforeUnload = () => {
      presenceChannel.untrack();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      presenceChannel.unsubscribe();
    };
  }, [userId]);

  const isOnline = useCallback((userId) => {
    return onlineUsers.includes(userId);
  }, [onlineUsers]);

  // Emoji categories (unchanged)
  const emojiCategories = {
    'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐'],
    'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'],
    'Gestures': ['👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '🤲', '🤝', '🙏'],
    'Activities': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️‍♀️', '🏋️', '🏋️‍♂️', '🤼‍♀️', '🤼', '🤼‍♂️', '🤸‍♀️', '🤸', '🤸‍♂️', '⛹️‍♀️', '⛹️', '⛹️‍♂️', '🤺', '🤾‍♀️', '🤾', '🤾‍♂️', '🏌️‍♀️', '🏌️', '🏌️‍♂️', '🏇', '🧘‍♀️', '🧘', '🧘‍♂️', '🏄‍♀️', '🏄', '🏄‍♂️', '🏊‍♀️', '🏊', '🏊‍♂️', '🤽‍♀️', '🤽', '🤽‍♂️', '🚣‍♀️', '🚣', '🚣‍♂️', '🧗‍♀️', '🧗', '🧗‍♂️', '🚵‍♀️', '🚵', '🚵‍♂️', '🚴‍♀️', '🚴', '🚴‍♂️'],
    'Objects': ['🎮', '🕹️', '🎰', '🎲', '🧩', '🎯', '🎪', '🎨', '🎬', '🎤', '🎧', '🎼', '🎵', '🎶', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻', '🎳', '🎉', '🎊', '🎈', '🎁', '🎀', '🎂', '🍰', '🧁', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '☕', '🫖', '🍵', '🧃', '🥤', '🧋', '🍶', '🍾', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🥃', '🥤', '🧊', '🥢', '🍽️', '🍴', '🥄', '🔪', '🏺'],
    'Nature': ['🌍', '🌎', '🌏', '🌐', '🗺️', '🗾', '🧭', '🏔️', '⛰️', '🌋', '🗻', '🏕️', '🏖️', '🏜️', '🏝️', '🏞️', '🏟️', '🏛️', '🏗️', '🧱', '🪨', '🪵', '🛖', '🏘️', '🏚️', '🏠', '🏡', '🏢', '🏣', '🏤', '🏥', '🏦', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏯', '🏰', '🗼', '🗽', '⛪', '🕌', '🛕', '🕍', '⛩️', '🕋', '⛲', '⛺', '🌁', '🌃', '🏙️', '🌄', '🌅', '🌆', '🌇', '🌉', '♨️', '🎠', '🎡', '🎢', '💈', '🎪', '🚂', '🚃', '🚄', '🚅', '🚆', '🚇', '🚈', '🚉', '🚊', '🚝', '🚞', '🚋', '🚌', '🚍', '🚎', '🚐', '🚑', '🚒', '🚓', '🚔', '🚕', '🚖', '🚗', '🚘', '🚙', '🛻', '🚚', '🚛', '🚜', '🏎️', '🏍️', '🛵', '🦽', '🦼', '🛴', '🚲', '🛺', '🚁', '🚟', '🚠', '🚡', '🛰️', '🚀', '🛸', '🛶', '⛵', '🚤', '🛥️', '🛳️', '⛴️', '🚢', '⚓', '⛽', '🚧', '🚨', '🚥', '🚦', '🛑', '🚏', '⛱️', '🏖️', '🏝️', '🏜️', '🌋', '⛰️', '🏔️', '🗻', '🏕️', '⛺', '🏠', '🏡', '🏘️', '🏚️', '🏗️', '🏭', '🏢', '🏬', '🏣', '🏤', '🏥', '🏦', '🏨', '🏪', '🏫', '🏩', '💒', '🏛️', '⛪', '🕌', '🕍', '🛕', '🕋', '⛩️', '🛤️', '🛣️', '🗾', '🎑', '🏞️', '🌅', '🌄', '🌠', '🎇', '🎆', '🌇', '🌆', '🏙️', '🌃', '🌌', '🌉', '🌁']
  };

  const quickEmojis = ['😀', '😂', '😍', '🤔', '👍', '❤️', '😢', '😡', '🎉', '🔥'];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const initializeUnreadCounts = async (contactsList) => {
    const counts = {};
    const hasReadAtColumn = await checkColumnExists();
    if (!hasReadAtColumn) {
      contactsList.forEach(contact => {
        counts[contact.contact_id] = 0;
      });
      setUnreadCounts(counts);
      return;
    }
    for (const contact of contactsList) {
      try {
        const { count, error } = await supabase
          .from('ch_messages')
          .select('*', { count: 'exact', head: true })
          .eq('from_id', contact.contact_id)
          .eq('to_id', userId)
          .is('read_at', null);
        counts[contact.contact_id] = error ? 0 : count;
      } catch (error) {
        counts[contact.contact_id] = 0;
      }
    }
    setUnreadCounts(counts);
  };

  const checkColumnExists = async () => {
    try {
      const { error } = await supabase
        .from('ch_messages')
        .select('read_at')
        .limit(0);
      return !error;
    } catch (error) {
      return false;
    }
  };

  const markMessagesAsRead = async (contactId) => {
    try {
      const { error: testError } = await supabase
        .from('ch_messages')
        .select('read_at')
        .limit(0);
      if (!testError) {
        await supabase
          .from('ch_messages')
          .update({ read_at: new Date().toISOString() })
          .eq('from_id', contactId)
          .eq('to_id', userId)
          .is('read_at', null);
      }
      setUnreadCounts(prev => ({ ...prev, [contactId]: 0 }));
    } catch (error) {}
  };

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const numericUserId = parseInt(userId, 10);
      if (isNaN(numericUserId)) {
        throw new Error('Invalid user ID format');
      }
      const response = await fetch('https://obrhuhasrppixjwkznri.supabase.co/functions/v1/last_conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_user_id: numericUserId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch contacts');
      }
      const data = await response.json();
      const transformedContacts = await Promise.all(data.map(async (msg) => {
        const contactId = msg.from_id === numericUserId ? msg.to_id : msg.from_id;
        const profileResult = await fetchUserProfile(contactId);
        const transformedContact = {
          id: msg.id,
          contact_id: contactId,
          contact_name: profileResult.displayName,
          contact_avatar: profileResult.displayImage,
          body: msg.body,
          created_at: msg.created_at,
          from_id: msg.from_id,
        };
        return transformedContact;
      }));
      setContacts(transformedContacts);
      await initializeUnreadCounts(transformedContacts);
    } catch (err) {
      // error fetching contacts
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const fetchMessages = async (contactId) => {
    try {
      const { data, error } = await supabase
        .from('ch_messages')
        .select('*')
        .or(`and(from_id.eq.${userId},to_id.eq.${contactId}),and(from_id.eq.${contactId},to_id.eq.${userId})`)
        .order('created_at', { ascending: true });
console.log('Insert message:', { data, error });
if (error) alert(error.message);
      if (error) {
        setMessages([]);
      } else {
        setMessages(data || []);
      }
    } catch (error) {
      setMessages([]);
    }
  };

const sendMessage = async () => {
  if (!newMessage.trim() || !selectedContact) return;

  const trimmedMessage = newMessage.trim();
  try {
    const messageData = {
      from_id: userId,
      to_id: selectedContact.contact_id,
      body: trimmedMessage,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('ch_messages')
      .insert([messageData])
      .select();

    setNewMessage('');
    // Do NOT call setMessages here! Real-time will handle it.
  } catch (err) {}
};

useEffect(() => {
  if (!userId) return;
  const channel = supabase
    .channel('public:ch_messages')
    // INSERT
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ch_messages' }, (payload) => {
      const msg = payload.new;
      if (
        selectedContact &&
        (
          (msg.from_id === selectedContact.contact_id && msg.to_id === userId) ||
          (msg.from_id === userId && msg.to_id === selectedContact.contact_id)
        )
      ) {
        setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
      }
    })
    // UPDATE
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'ch_messages' }, (payload) => {
      const updatedMsg = payload.new;
      if (
        selectedContact &&
        (
          (updatedMsg.from_id === selectedContact.contact_id && updatedMsg.to_id === userId) ||
          (updatedMsg.from_id === userId && updatedMsg.to_id === selectedContact.contact_id)
        )
      ) {
        setMessages(prev =>
          prev.map(msg => (msg.id === updatedMsg.id ? { ...msg, ...updatedMsg } : msg))
        );
      }
    })
    // DELETE
.on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'ch_messages' }, (payload) => {
  const deletedMsg = payload.old;
  setMessages(prev => prev.filter(msg => msg.id !== deletedMsg.id));
})
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
}, [userId, selectedContact]);
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([],
      {
        hour: '2-digit',
        minute: '2-digit'
      });
  };
const deleteMessage = async (messageId) => {
  try {
    const { error } = await supabase
      .from('ch_messages')
      .delete()
      .eq('id', messageId)
      .eq('from_id', userId);

    if (!error) {
      setShowDeleteConfirm(null);
    }
  } catch (error) {
    console.error('Error deleting message:', error);
  }
};

const saveEditMessage = async (messageId) => {
  if (!editMessageText.trim()) return;

  try {
    const { error } = await supabase
      .from('ch_messages')
      .update({
        body: editMessageText.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .eq('from_id', userId);

    if (!error) {
      setEditingMessage(null);
      setEditMessageText('');
    }
  } catch (error) {
    console.error('Error updating message:', error);
  }
};
  const startEditMessage = (message) => {
    setEditingMessage(message.id);
    setEditMessageText(message.body);
  };

  const cancelEditMessage = () => {
    setEditingMessage(null);
    setEditMessageText('');
  };

  const deleteConversation = async () => {
    if (!selectedContact) return;

    try {
      const { error } = await supabase
        .from('ch_messages')
        .delete()
        .or(`and(from_id.eq.${userId},to_id.eq.${selectedContact.contact_id}),and(from_id.eq.${selectedContact.contact_id},to_id.eq.${userId})`);

      if (!error) {
        setContacts(prev => prev.filter(contact => contact.contact_id !== selectedContact.contact_id));
        setMessages([]);
        setSelectedContact(null);
        setShowDeleteConversation(false);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.contact_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br  via-red-100 flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-red-500 rounded-full animate-spin animation-delay-150"></div>
          <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-600 w-8 h-8 animate-pulse" />
        </div>
        <p className="ml-6 text-red-800 text-xl font-medium animate-pulse">Loading chat details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br via-red-100 ">
      <div className="container mx-auto max-w-7xl h-screen flex flex-col p-2 md:p-4">
        {/* Header */}
        <div className="bg-gradient-to-r  backdrop-blur-lg rounded-xl shadow-2xl border border-red-300 mb-4 p-4 md:p-6" style={{ background: "linear-gradient(to right, #d0443c, #b33a34)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                className="md:hidden text-white hover:text-red-200 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu size={24} />
              </button>
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                <MessageCircle className="text-white drop-shadow-lg" size={28} />
                <span className="hidden sm:inline drop-shadow-md">Messenger</span>
                <span className="sm:hidden drop-shadow-md">Chat</span>
              </h1>
            </div>
            <div className="hidden md:block w-64">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-red-300 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent bg-white/90 backdrop-blur-sm text-red-900 placeholder-red-400"
                />
                <Search className="absolute left-3 top-2.5 text-red-400" size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 flex bg-white backdrop-blur-lg rounded-xl shadow-2xl border border-red-200 overflow-hidden">
          {/* Mobile Menu Button */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 bg-opacity-50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
          )}

          {/* Contacts Sidebar */}
          <div className={`w-72 md:w-80 border-r-2 border-red-200 bg-gradient-to-b from-red-50 via-white to-red-50 absolute md:relative z-50 md:z-auto h-full transition-all duration-300 ${isMobileMenuOpen ? 'left-0' : '-left-full'} md:left-0`}>
            <div className="p-4 border-b-2 border-red-200" style={{ background: "linear-gradient(to right, #d0443c, #b33a34)" }}>
              <div className="relative md:hidden">
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-red-300 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent bg-white text-red-900 placeholder-red-400"
                />
                <Search className="absolute left-3 top-2.5 text-red-400" size={18} />
              </div>
            </div>

            <div className="overflow-y-auto h-[calc(100%-80px)]">
              {filteredContacts.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="bg-gradient-to-br rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(to right, #d0443c, #b33a34)" }}>
                    <MessageCircle className="text-red-500" size={24} />
                  </div>
                  <p className="text-red-800 font-medium">No conversations found</p>
                  <p className="text-red-500 text-sm mt-1">{searchQuery ? 'Try a different search' : 'Start a new chat'}</p>
                </div>
              ) : (
                filteredContacts.map((contact) => (
                  <div
                    key={`${contact.id}-${contact.contact_id}`}
                    onClick={() => handleContactSelect(contact)}
                    className={`p-3 border-b border-red-100 relative cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedContact?.contact_id === contact.contact_id
                        ? 'bg-gradient-to-r from-red-100 to-red-200 shadow-inner border-l-4 border-l-red-500'
                        : 'hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg ring-2 ring-red-300 overflow-hidden"
                          style={{
                            background: contact.contact_avatar ? "#ffffff" : "linear-gradient(to right, #d0443c, #b33a34)",
                            border: contact.contact_avatar ? "2px solid #ef4444" : "none"
                          }}>
                          {contact.contact_avatar ? (
                            <img
                              src={contact.contact_avatar}
                              alt={contact.contact_name}
                              className="w-full h-full object-cover rounded-full"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <User
                            size={20}
                            className="text-white"
                            style={{
                              display: contact.contact_avatar ? 'none' : 'flex'
                            }}
                          />
                        </div>
                        {isOnline(contact.contact_id) && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                        )}

                        {/* Notification Badge */}
                        {unreadCounts[contact.contact_id] > 0 && (
                          <div className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-pulse">
                            {unreadCounts[contact.contact_id] > 99 ? '99+' : unreadCounts[contact.contact_id]}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h3 className={`font-semibold truncate ${
                            unreadCounts[contact.contact_id] > 0 ? 'text-red-900 font-bold' : 'text-red-900'
                          }`}>
                            {contact.contact_name}
                          </h3>
                          <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                            <Clock size={10} />
                            {formatTime(contact.created_at)}
                          </span>
                        </div>
                        <p className={`text-sm truncate mt-1 ${
                          unreadCounts[contact.contact_id] > 0 ? 'text-red-800 font-semibold' : 'text-red-700 font-medium'
                        }`}>
                          {contact.body}
                        </p>
                      </div>
                      {/* Delete Conversation Button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedContact(contact); setShowDeleteConversation(true); }}
                        className="text-white hover:text-red-200 transition-colors p-2 hover:bg-red-600 rounded-full"
                        title="Delete Conversation"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-gradient-to-b from-white to-red-50 relative">
            {selectedContact ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b-2 border-red-200 bg-gradient-to-r  backdrop-blur-sm flex items-center justify-between" style={{ background: "linear-gradient(to right, #d0443c, #b33a34)" }}>
                  <div className="flex items-center gap-3">
                    <button className="md:hidden text-white hover:text-red-200 transition-colors" onClick={() => setIsMobileMenuOpen(true)}>
                      <Menu size={24} />
                    </button>
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg ring-2 ring-red-300 overflow-hidden"
                        style={{
                          background: selectedContact?.contact_avatar ? "#ffffff" : "linear-gradient(to right, #d0443c, #b33a34)",
                          border: selectedContact?.contact_avatar ? "2px solid #ef4444" : "none"
                        }}>
                        {selectedContact?.contact_avatar ? (
                          <img
                            src={selectedContact.contact_avatar}
                            alt={selectedContact.contact_name}
                            className="w-full h-full object-cover rounded-full"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <User
                          size={20}
                          className="text-white"
                          style={{
                            display: selectedContact?.contact_avatar ? 'none' : 'flex'
                          }}
                        />
                      </div>
                      {selectedContact && isOnline(selectedContact.contact_id) && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-semibold text-white drop-shadow-md">
                        {selectedContact ? selectedContact.contact_name : "Select a chat"}
                      </h3>
                      {selectedContact && (
                        <div className="text-xs font-medium flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${
                            isOnline(selectedContact.contact_id)
                              ? 'bg-green-500 animate-pulse'
                              : 'bg-red-200'
                          }`}></div>
                          <span className={isOnline(selectedContact.contact_id)
                            ? 'text-green-200'
                            : 'text-gray-300'
                          }>
                            {isOnline(selectedContact.contact_id) ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.from_id === userId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="relative group">
                        {/* Message Options Menu */}
                        {message.from_id === userId && (
                          <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                            <div className="flex gap-1 bg-white rounded-full shadow-lg border border-red-200 p-1">
                              <button
                                onClick={() => startEditMessage(message)}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                                title="Edit Message"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(message.id)}
                                className="p-1 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                                title="Delete Message"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        )}
                        <div
                          className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl ${
                            message.from_id === userId
                              ? 'bg-gradient-to-br from-red-600 to-red-700 text-white'
                              : 'bg-white text-red-900 border-2 border-red-200'
                          }`}
                        >
                          {editingMessage === message.id ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editMessageText}
                                onChange={(e) => setEditMessageText(e.target.value)}
                                className="w-full p-2 border rounded text-black text-sm"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveEditMessage(message.id);
                                  if (e.key === 'Escape') cancelEditMessage();
                                }}
                              />
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => saveEditMessage(message.id)}
                                  className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={cancelEditMessage}
                                  className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="text-sm leading-relaxed" style={{ fontSize: '16px', lineHeight: '1.4' }}>
                                {message.body}
                              </p>
                              <div className="flex justify-between items-center mt-2">
                                <p className={`text-xs ${
                                  message.from_id === userId ? 'text-red-200' : 'text-red-500'
                                }`}>
                                  {formatTime(message.created_at)}
                                </p>
                                {message.updated_at && message.updated_at !== message.created_at && (
                                  <p className={`text-xs italic ${
                                    message.from_id === userId ? 'text-red-200' : 'text-red-500'
                                  }`}>
                                    edited
                                  </p>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                        {/* Delete Message Confirm Modal */}
                        {showDeleteConfirm === message.id && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-40">
                            <div className="bg-white rounded-lg shadow-xl p-6 flex flex-col items-center">
                              <p className="mb-4 text-red-700">Are you sure you want to delete this message?</p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => deleteMessage(message.id)}
                                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                  Delete
                                </button>
                                <button
                                  onClick={() => setShowDeleteConfirm(null)}
                                  className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                {/* Delete Conversation Confirm Modal */}
                {showDeleteConversation && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-xl p-6 flex flex-col items-center">
                      <p className="mb-4 text-red-700">Are you sure you want to delete this conversation?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={deleteConversation}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setShowDeleteConversation(false)}
                          className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {/* Message Input */}
                <div className="p-4 border-t-2 border-red-200 bg-gradient-to-r from-red-50 to-white relative">
                  {/* Quick Emoji Bar */}
                  <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                    {quickEmojis.map((emoji, index) => (
                      <button
                        key={index}
                        onClick={() => addEmoji(emoji)}
                        className="text-xl hover:scale-125 transition-transform duration-200 p-1 hover:bg-red-100 rounded-full flex-shrink-0"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div
                      ref={emojiPickerRef}
                      className="absolute bottom-full left-4 right-4 mb-2 bg-white border-2 border-red-200 rounded-lg shadow-2xl z-50 max-h-64 overflow-hidden"
                    >
                      <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold text-sm">
                        Choose an emoji
                      </div>
                      <div className="overflow-y-auto max-h-48">
                        {Object.entries(emojiCategories).map(([category, emojis]) => (
                          <div key={category} className="p-2">
                            <div className="text-xs font-semibold text-red-700 mb-2">{category}</div>
                            <div className="grid grid-cols-8 gap-1">
                              {emojis.map((emoji, index) => (
                                <button
                                  key={index}
                                  onClick={() => addEmoji(emoji)}
                                  className="text-lg hover:bg-red-100 p-1 rounded transition-colors duration-150"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 items-end">
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-all duration-200 hover:scale-110 flex-shrink-0"
                    >
                      <Smile size={20} />
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-3 border-2 border-red-200 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-400 bg-white shadow-inner text-red-900 placeholder-red-400 transition-all duration-200"
                      style={{ fontSize: '16px' }}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="p-3 bg-gradient-to-br from-red-600 to-red-700 text-white rounded-full hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl flex-shrink-0"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-red-700">
                <div className="text-center p-8">
                  <div className="bg-gradient-to-br from-red-200 to-red-300 rounded-full p-8 w-32 h-32 mx-auto mb-8 flex items-center justify-center shadow-2xl ring-4 ring-red-100">
                    <MessageCircle size={48} className="text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-red-800 mb-3 drop-shadow-sm">Messenger</h3>
                  <p className="text-red-600 text-lg">Select a conversation to start chatting</p>
                  <div className="flex justify-center gap-2 mt-4">
                    <span className="text-2xl animate-bounce">💬</span>
                    <span className="text-2xl animate-bounce" style={{ animationDelay: '0.1s' }}>❤️</span>
                    <span className="text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>😊</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;