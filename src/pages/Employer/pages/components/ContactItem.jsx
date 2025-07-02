// ContactItem.jsx
import React from "react";

const ContactItem = ({ contact, isActive, onClick }) => (
  <div
    className={`p-3 cursor-pointer flex items-center gap-3 hover:bg-red-50 ${isActive ? "bg-red-100" : ""}`}
    onClick={() => onClick(contact)}
  >
    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-red-600 font-bold">
      {contact.name?.[0] || "U"}
    </div>
    <div className="flex-1">
      <div className="font-semibold text-gray-900">{contact.name}</div>
      <div className="text-xs text-gray-500 truncate">{contact.lastMessage || "No messages yet"}</div>
    </div>
  </div>
);

export default ContactItem;
