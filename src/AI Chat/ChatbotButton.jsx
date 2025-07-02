import React from "react";
import { useNavigate } from "react-router-dom";

const ChatbotButton = () => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate("/rag")}
      className="fixed bottom-8 right-8 z-40 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white p-4 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 group"
      style={{ boxShadow: "0 4px 24px 0 rgba(220,38,38,0.15)" }}
      aria-label="Open Chatbot"
    >
      <span className="text-2xl mr-2">🤖</span>
      <span className="font-bold text-lg hidden sm:inline group-hover:inline">
       Chat Bot
      </span>
    </button>
  );
};

export default ChatbotButton;
