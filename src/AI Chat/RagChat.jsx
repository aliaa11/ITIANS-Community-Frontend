import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { askRag } from "../api/aiChat";
import ItianNavbar from "../components/ItianNavbar";
import EmployerNavbar from "../components/EmployerNavbar";
import AdminNavbar from "../components/AdminNavbar";
import { useSelector } from "react-redux";

const RagChat = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [conversation, setConversation] = useState([]);
  const messagesEndRef = useRef(null);
  const user = useSelector((state) => state.user.user);
  const role = user?.role;

  // Sample job-related starter questions
  const jobStarterQuestions = [
    "What are the most recent jobs available?",
    "Are there any on-site jobs listed?",
    "What is the salary range for backend roles?",
    "Do you have any jobs for frontend developers?"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // Add user message immediately
    const userMessage = {
      id: Date.now(),
      text: input,
      isUser: true,
      timestamp: new Date().toLocaleTimeString()
    };

    setConversation(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const response = await askRag(input);
      
      // Add AI response
      const aiResponse = {
        id: Date.now() + 1,
        text: response.data.answer,
        isUser: false,
        sources: response.data.sources || [],
        timestamp: new Date().toLocaleTimeString()
      };

      setConversation(prev => [...prev, aiResponse]);
    } catch (err) {
      setError("Failed to get response. Please try again.");
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderNavbar = () => {
    switch(role) {
      case "itian": return <ItianNavbar />;
      case "employer": return <EmployerNavbar />;
      case "admin": return <AdminNavbar />;
      default: return null;
    }
  };

  const MessageBubble = ({ message }) => (
    <motion.div
      initial={{ opacity: 0, y: message.isUser ? 20 : -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`max-w-[85%] rounded-2xl p-4 ${message.isUser 
        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white rounded-br-none' 
        : 'bg-gray-50 text-gray-800 rounded-bl-none border border-gray-200'}`}
      >
        <div className="text-sm whitespace-pre-wrap">{message.text}</div>
        {message.sources && message.sources.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-3 pt-3 border-t border-gray-200"
          >
            <p className="text-xs text-gray-500 mb-2 font-medium">SOURCES</p>
            <div className="flex flex-wrap gap-2">
              {message.sources.map((source, idx) => (
                <motion.a
                  key={idx}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.03 }}
                  className="text-xs bg-white hover:bg-gray-100 text-gray-700 px-3 py-1 rounded-lg border border-gray-200 inline-flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  {source.title || 'Source'} {source.page && `(p. ${source.page})`}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
        <div className={`text-xs mt-1 ${message.isUser ? 'text-white/70' : 'text-gray-500'}`}>
          {message.timestamp}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {renderNavbar()}

      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-4xl h-[85vh] flex flex-col bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 flex items-center justify-between border-b border-red-800/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Career Assistant</h2>
                <p className="text-xs text-white/90">Powered by RAG technology</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
              <span className="text-xs text-white">Online</span>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-white">
            <LayoutGroup>
              <AnimatePresence>
                {conversation.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center p-8"
                  >
                    <div className="w-20 h-20 mb-6 opacity-10 text-red-500">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-medium text-gray-700 mb-4">How can I help with your career today?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-md">
                      {jobStarterQuestions.map((question, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setInput(question)}
                          className="text-sm bg-red-50 hover:bg-red-100 text-red-700 p-3 rounded-lg border border-red-100 text-left"
                        >
                          {question}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-2">
                    {conversation.map((message) => (
                      <MessageBubble key={message.id} message={message} />
                    ))}
                  </div>
                )}

                {loading && (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start mb-4"
                  >
                    <div className="max-w-[85%] bg-gray-50 text-gray-800 p-4 rounded-xl rounded-bl-none border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="flex space-x-1">
                          {[...Array(3)].map((_, i) => (
                            <motion.div
                              key={i}
                              animate={{ y: [0, -5, 0] }}
                              transition={{
                                repeat: Infinity,
                                duration: 1,
                                delay: i * 0.2
                              }}
                              className="w-2 h-2 bg-red-400 rounded-full"
                            />
                          ))}
                        </div>
                        <span className="text-sm">Researching career resources...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </AnimatePresence>
            </LayoutGroup>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-600 text-sm mb-3 p-3 bg-red-100 rounded-lg border border-red-200 flex items-start gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="flex gap-3">
              <motion.div 
                className="flex-1 relative"
                whileFocus={{ scale: 1.01 }}
              >
                <textarea
                  rows="1"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about jobs, resumes, interviews..."
                  disabled={loading}
                  className="w-full bg-white text-gray-800 placeholder-gray-400 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-sm transition-all duration-200 max-h-32 border border-gray-300"
                  style={{ minHeight: '48px' }}
                />
                {input && (
                  <motion.button
                    type="button"
                    onClick={() => setInput('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-600 p-1"
                    whileHover={{ scale: 1.1 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                )}
              </motion.div>
              
              <motion.button
                type="submit"
                disabled={loading || !input.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl px-5 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RagChat;