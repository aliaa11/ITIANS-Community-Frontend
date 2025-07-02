// ChatHeader.jsx
import React from "react";
import { ChevronLeft, Star } from "lucide-react";

const ChatHeader = ({ contact, onBack, onToggleFavorite }) => (
  <div className="flex items-center justify-between p-4 border-b bg-white">
    <button className="lg:hidden p-2" onClick={onBack}>
      <ChevronLeft className="w-5 h-5 text-red-600" />
    </button>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-red-600 font-bold">
        {contact.name?.[0] || "U"}
      </div>
      <div>
        <div className="font-semibold text-gray-900">{contact.name}</div>
        <div className="text-xs text-gray-500">{contact.status || "Online"}</div>
      </div>
    </div>
    <button className="p-2" onClick={onToggleFavorite}>
      <Star className="w-5 h-5 text-yellow-400" />
    </button>
  </div>
);

export default ChatHeader;
