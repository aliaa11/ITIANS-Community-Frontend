import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchReactionDetails } from "../../services/api";
import {
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiHeart,
  FiThumbsUp,
  FiSmile,
  FiMeh,
  FiFrown,
  FiZap,
} from "react-icons/fi";
import { Link } from "react-router-dom";

const ReactionsModal = ({ postId, onClose, isOpen, darkMode = false }) => {
  const [reactions, setReactions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [expandedUsers, setExpandedUsers] = useState({});

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 120,
      },
    },
    exit: { opacity: 0, y: 20 },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        type: "spring",
        stiffness: 150,
      },
    }),
  };

  const tabVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
  };

  useEffect(() => {
    if (!postId) return; // Prevent API call if postId is null or undefined
    const loadReactions = async () => {
      setIsLoading(true);
      try {
        const data = await fetchReactionDetails(postId);
        setReactions(data);
      } catch (error) {
        console.error("Error loading reactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReactions();
  }, [postId]);

  // Group all reactors together for the "All" tab
  const allReactors = reactions ? Object.values(reactions).flat() : [];

  // Toggle user details expansion
  const toggleUserExpansion = (userId) => {
    setExpandedUsers((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  // Premium reaction icons with smooth animations
  const getReactionIcon = (type) => {
    const icons = {
      like: <FiThumbsUp className="text-blue-500" />,
      love: <FiHeart className="text-red-500" />,
      haha: <FiSmile className="text-yellow-500" />,
      wow: <FiMeh className="text-purple-500" />,
      sad: <FiFrown className="text-indigo-500" />,
      angry: <FiFrown className="text-orange-500" />,
      support: <FiZap className="text-green-500" />,
    };

    return (
      <motion.span
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="text-xl"
      >
        {icons[type] || <FiThumbsUp className="text-red-500" />}
      </motion.span>
    );
  };

  // Format date elegantly
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={`relative rounded-2xl shadow-2xl w-full max-w-md h-[85vh] overflow-hidden flex flex-col ${
            darkMode
              ? "bg-gray-900 border border-gray-700"
              : "bg-white border border-gray-200"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div
            className={`p-5 ${
              darkMode ? "border-b border-gray-800" : "border-b border-gray-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <h3
                className={`text-xl font-bold ${
                  darkMode ? "text-gray-100" : "text-gray-900"
                }`}
              >
                Reactions
              </h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className={`p-2 rounded-full ${
                  darkMode
                    ? "hover:bg-gray-800 text-gray-300"
                    : "hover:bg-gray-100 text-gray-500"
                }`}
              >
                <FiX className="h-5 w-5" />
              </motion.button>
            </div>
          </div>

          {/* Reaction Tabs */}
          <motion.div
            className={`flex overflow-x-auto no-scrollbar px-4 py-3 ${
              darkMode ? "border-b border-gray-800" : "border-b border-gray-100"
            }`}
            initial="hidden"
            animate="visible"
          >
            <motion.button
              variants={tabVariants}
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-full font-medium text-sm flex items-center space-x-2 min-w-max mr-2 ${
                activeTab === "all"
                  ? darkMode
                    ? "bg-gray-800 text-red-400"
                    : "bg-red-50 text-red-600"
                  : darkMode
                  ? "text-gray-400 hover:bg-gray-800"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <span>All</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === "all"
                    ? darkMode
                      ? "bg-gray-700 text-red-300"
                      : "bg-red-100 text-red-600"
                    : darkMode
                    ? "bg-gray-800 text-gray-400"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {allReactors.length}
              </span>
            </motion.button>

            {reactions &&
              Object.entries(reactions).map(([type, reactors]) => (
                <motion.button
                  key={type}
                  variants={tabVariants}
                  onClick={() => setActiveTab(type)}
                  className={`px-4 py-2 rounded-full font-medium text-sm flex items-center space-x-2 min-w-max mr-2 ${
                    activeTab === type
                      ? darkMode
                        ? "bg-gray-800 text-red-400"
                        : "bg-red-50 text-red-600"
                      : darkMode
                      ? "text-gray-400 hover:bg-gray-800"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {getReactionIcon(type)}
                  <span className="capitalize">{type}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      activeTab === type
                        ? darkMode
                          ? "bg-gray-700 text-red-300"
                          : "bg-red-100 text-red-600"
                        : darkMode
                        ? "bg-gray-800 text-gray-400"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {reactors.length}
                  </span>
                </motion.button>
              ))}
          </motion.div>

          {/* Reactors List */}
          <div className="overflow-y-auto flex-1 p-4">
            {isLoading ? (
              <motion.div
                className="flex justify-center items-center h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className={`h-10 w-10 rounded-full border-2 ${
                    darkMode ? "border-gray-700" : "border-gray-200"
                  } border-t-red-500`}
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                />
              </motion.div>
            ) : (
              <motion.div
                className={`space-y-3 ${
                  darkMode ? "divide-gray-800" : "divide-gray-100"
                }`}
                initial="hidden"
                animate="visible"
              >
                {(activeTab === "all"
                  ? allReactors
                  : reactions?.[activeTab] || []
                ).map((user, i) => (
                  <motion.div
                    key={user.id}
                    variants={itemVariants}
                    custom={i}
                    className={`p-4 rounded-xl ${
                      darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50"
                    } transition-colors duration-200`}
                  >
                    <div className="flex items-center justify-between">
                      <Link
                        to={`/itian-profile/${user.id}`}
                        className="flex items-center space-x-4 flex-1"
                        onClick={(e) => {
                          onClose();
                          e.stopPropagation();
                        }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`h-12 w-12 rounded-full flex items-center justify-center overflow-hidden ${
                            darkMode ? "bg-gray-800" : "bg-gray-100"
                          }`}
                        >
                          {user.avatar ? (
                            <motion.img
                              src={user.avatar}
                              alt={user.name}
                              className="h-full w-full object-cover"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            />
                          ) : (
                            <span
                              className={`font-bold text-xl ${
                                darkMode ? "text-gray-300" : "text-gray-600"
                              }`}
                            >
                              {user.name.charAt(0)}
                            </span>
                          )}
                        </motion.div>
                        <div>
                          <motion.h4
                            className={`font-semibold ${
                              darkMode ? "text-gray-100" : "text-gray-900"
                            }`}
                            whileHover={{ x: 2 }}
                          >
                            {user.name}
                          </motion.h4>
                          <motion.p
                            className={`text-xs ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                            whileHover={{ x: 2 }}
                          >
                            {formatDate(user.reacted_at)}
                          </motion.p>
                        </div>
                      </Link>

                      {user.comment && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleUserExpansion(user.id);
                          }}
                          className={`p-2 rounded-full ${
                            darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
                          }`}
                        >
                          {expandedUsers[user.id] ? (
                            <FiChevronUp
                              className={
                                darkMode ? "text-gray-300" : "text-gray-500"
                              }
                            />
                          ) : (
                            <FiChevronDown
                              className={
                                darkMode ? "text-gray-300" : "text-gray-500"
                              }
                            />
                          )}
                        </motion.button>
                      )}
                    </div>

                    <AnimatePresence>
                      {expandedUsers[user.id] && user.comment && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className={`mt-3 pl-16 pr-4 ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          <div
                            className={`p-3 rounded-lg ${
                              darkMode ? "bg-gray-800" : "bg-gray-100"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-line">
                              {user.comment}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReactionsModal;
