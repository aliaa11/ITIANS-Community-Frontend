import { useEffect, useRef } from 'react';

const ReactionPicker = ({ onSelect, onClose }) => {
  const reactions = [
    { type: 'like', emoji: '👍', label: 'Like' },
    { type: 'love', emoji: '❤️', label: 'Love' },
    { type: 'haha', emoji: '😂', label: 'Haha' },
    { type: 'wow', emoji: '😮', label: 'Wow' },
    { type: 'sad', emoji: '😢', label: 'Sad' },
    { type: 'angry', emoji: '😠', label: 'Angry' },
    { type: 'support', emoji: '💪', label: 'Support' }
  ];

  const pickerRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div 
      ref={pickerRef}
      className="absolute bottom-full left-0 mb-2 bg-white rounded-full shadow-lg p-2 flex space-x-1 z-10 border border-gray-200"
    >
      {reactions.map((reaction) => (
        <button
          key={reaction.type}
          onClick={() => {
            onSelect(reaction.type);
            onClose();
          }}
          className="text-2xl hover:scale-125 transform transition-transform duration-100"
          title={reaction.label}
        >
          {reaction.emoji}
        </button>
      ))}
    </div>
  );
};

export default ReactionPicker; 