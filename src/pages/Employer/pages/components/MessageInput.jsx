// MessageInput.jsx - Enhanced with better UX and error handling
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Mic, 
  Image, 
  File,
  AlertCircle,
  Loader2
} from 'lucide-react';

const MessageInput = ({ onSendMessage, isLoading = false, error = null, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  // Focus textarea on mount
  useEffect(() => {
    if (textareaRef.current && !disabled) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      setShowAttachMenu(false);
      setShowEmojiPicker(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileUpload = (type) => {
    if (type === 'image') {
      imageInputRef.current?.click();
    } else {
      fileInputRef.current?.click();
    }
    setShowAttachMenu(false);
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      // Handle file upload logic here
      console.log(`Uploading ${type}:`, file);
      // You can implement file upload to your backend here
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      console.log('Stopping voice recording');
    } else {
      // Start recording
      setIsRecording(true);
      console.log('Starting voice recording');
    }
  };

  // Quick emoji reactions
  const quickEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🔥'];

  const insertEmoji = (emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="border-t border-gray-200 bg-white">
      {/* Error display */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-100">
          <div className="flex items-center text-sm text-red-600">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>
              {error.data?.message || error.message || 'Failed to send message'}
            </span>
            {error.status && (
              <span className="ml-2 text-xs text-red-500">
                (Error {error.status})
              </span>
            )}
          </div>
        </div>
      )}

      {/* Emoji picker */}
      {showEmojiPicker && (
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 mr-2">Quick reactions:</span>
            {quickEmojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => insertEmoji(emoji)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors text-lg"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Attachment menu */}
      {showAttachMenu && (
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleFileUpload('image')}
              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Image className="w-4 h-4 mr-2" />
              Photo
            </button>
            <button
              onClick={() => handleFileUpload('file')}
              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <File className="w-4 h-4 mr-2" />
              Document
            </button>
          </div>
        </div>
      )}

      {/* Main input area */}
      <div className="p-4">
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          {/* Attachment button */}
          <button
            type="button"
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            disabled={disabled || isLoading}
            className={`flex-shrink-0 p-2 rounded-full transition-colors ${
              showAttachMenu
                ? 'bg-red-100 text-red-600'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Message input container */}
          <div className="flex-1 relative">
            <div className="flex items-end bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-red-300 focus-within:ring-1 focus-within:ring-red-300 transition-colors">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={disabled ? "Chat unavailable" : "Type a message..."}
                disabled={disabled || isLoading}
                className="flex-1 px-4 py-3 bg-transparent border-none resize-none focus:outline-none placeholder-gray-500 disabled:opacity-50 max-h-32 min-h-[24px]"
                rows={1}
              />
              
              {/* Emoji button */}
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                disabled={disabled || isLoading}
                className={`p-2 rounded-full transition-colors ${
                  showEmojiPicker
                    ? 'bg-red-100 text-red-600'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title="Add emoji"
              >
                <Smile className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Voice message button (when no text) */}
          {!message.trim() && (
            <button
              type="button"
              onClick={toggleRecording}
              disabled={disabled || isLoading}
              className={`flex-shrink-0 p-3 rounded-full transition-all duration-200 ${
                isRecording
                  ? 'bg-red-500 text-white scale-110 animate-pulse'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={isRecording ? "Stop recording" : "Record voice message"}
            >
              <Mic className="w-5 h-5" />
            </button>
          )}

          {/* Send button (when there's text) */}
          {message.trim() && (
            <button
              type="submit"
              disabled={disabled || isLoading || !message.trim()}
              className="flex-shrink-0 p-3 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              title="Send message"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          )}
        </form>

        {/* Recording indicator */}
        {isRecording && (
          <div className="mt-3 flex items-center justify-center">
            <div className="flex items-center px-4 py-2 bg-red-50 rounded-full border border-red-200">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-sm text-red-600 font-medium">Recording...</span>
              <button
                onClick={toggleRecording}
                className="ml-3 text-xs text-red-600 hover:text-red-700 underline"
              >
                Stop
              </button>
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {isLoading && (
          <div className="mt-2 flex items-center text-xs text-gray-500">
            <div className="flex space-x-1 mr-2">
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            Sending...
          </div>
        )}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="*/*"
        onChange={(e) => handleFileChange(e, 'file')}
        className="hidden"
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileChange(e, 'image')}
        className="hidden"
      />
    </div>
  );
};

export default MessageInput;