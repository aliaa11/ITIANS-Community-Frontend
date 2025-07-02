// MessageBubble.jsx
import React from "react";

const MessageBubble = ({ message, isOwn }) => (
  <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2`}>
    <div className={`rounded-2xl px-4 py-2 max-w-xs break-words shadow-sm text-sm ${isOwn ? "bg-red-500 text-white" : "bg-gray-200 text-gray-900"}`}>
      {message.body || message.text || message.message}

    </div>
  </div>
);

export default MessageBubble;
