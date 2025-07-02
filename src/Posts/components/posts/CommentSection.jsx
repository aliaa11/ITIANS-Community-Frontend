import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchItianProfile } from "../../store/itianSlice";
import { toast } from "react-toastify";
import {
  fetchComments,
  addComment,
  updateComment,
  deleteComment,
} from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiEdit2,
  FiTrash2,
  FiSend,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiMessageSquare,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom"; // Added for navigation

const CommentSection = ({ postId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Added for navigation
  const user = useSelector((state) => state.itian.user);

  useEffect(() => {
    if (!user) {
      dispatch(fetchItianProfile());
    }
  }, [user, dispatch]);

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [collapsedComments, setCollapsedComments] = useState({});
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: 5,
    total: 0,
  });

  // Load initial comments
  useEffect(() => {
    const loadComments = async () => {
      try {
        setLoading(true);
        const data = await fetchComments(postId);
        setComments(data.data);
        setPagination({
          currentPage: data.current_page,
          lastPage: data.last_page,
          perPage: data.per_page,
          total: data.total,
        });
      } catch (err) {
        setError("Failed to load comments");
        console.error("Error loading comments:", err);
        toast.error("Failed to load comments");
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, [postId]);

  // Load more comments
  const loadMoreComments = async () => {
    if (pagination.currentPage >= pagination.lastPage || loadingMore) return;

    try {
      setLoadingMore(true);
      const nextPage = pagination.currentPage + 1;
      const data = await fetchComments(postId, { page: nextPage });

      setComments((prev) => [...prev, ...data.data]);
      setPagination((prev) => ({
        ...prev,
        currentPage: data.current_page,
        lastPage: data.last_page,
      }));
    } catch (err) {
      console.error("Error loading more comments:", err);
      toast.error("Failed to load more comments");
    } finally {
      setLoadingMore(false);
    }
  };

  // Toggle comment collapse
  const toggleCollapse = (commentId) => {
    setCollapsedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  // Add comment or reply
  const handleAddComment = async () => {
    const content = replyingTo ? replyContent : newComment;
    if (!content.trim()) return;

    try {
      const response = await addComment(postId, content, replyingTo);

      if (replyingTo) {
        const addReplyToComments = (commentsList, parentId, newReply) => {
          return commentsList.map((comment) => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), newReply],
              };
            }

            return comment;
          });
        };

        setComments((prev) => addReplyToComments(prev, replyingTo, response));
        setReplyContent("");
      } else {
        setComments((prev) => [response, ...prev]);
        setNewComment("");
      }

      setReplyingTo(null);
      toast.success(
        replyingTo ? "Reply added successfully" : "Comment added successfully"
      );
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };

  // Update comment or reply
  const handleUpdateComment = async () => {
    if (!editContent.trim() || !editingComment) return;

    try {
      const updatedComment = await updateComment(editingComment, editContent);

      const updateCommentInList = (commentsList, commentId, updatedContent) => {
        return commentsList.map((comment) => {
          if (comment.id === commentId) {
            return { ...comment, content: updatedContent };
          }

          if (comment.replies) {
            return {
              ...comment,
              replies: updateCommentInList(
                comment.replies,
                commentId,
                updatedContent
              ),
            };
          }

          return comment;
        });
      };

      setComments((prev) =>
        updateCommentInList(
          prev,
          editingComment,
          updatedComment.comment.content
        )
      );

      setEditingComment(null);
      setEditContent("");
      toast.success("Comment updated successfully");
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error("Failed to update comment");
    }
  };

  // Delete confirmation
  const confirmDelete = (commentId, isReply = false, parentId = null) => {
    setCommentToDelete({ commentId, isReply, parentId });
    setShowDeleteModal(true);
  };

  // Delete comment or reply
  const handleDeleteComment = async () => {
    if (!commentToDelete) return;

    try {
      await deleteComment(commentToDelete.commentId);

      const deleteCommentFromList = (commentsList, commentId) => {
        const filtered = commentsList.filter(
          (comment) => comment.id !== commentId
        );

        if (filtered.length === commentsList.length) {
          return commentsList.map((comment) => {
            if (comment.replies) {
              return {
                ...comment,
                replies: deleteCommentFromList(comment.replies, commentId),
              };
            }
            return comment;
          });
        }

        return filtered;
      };

      setComments((prev) =>
        deleteCommentFromList(prev, commentToDelete.commentId)
      );

      toast.success("Comment deleted successfully");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    } finally {
      setShowDeleteModal(false);
      setCommentToDelete(null);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Check if current user owns the content
  const isOwner = (commentUserId) => {
    return String(user?.user_id) === String(commentUserId);
  };

  // Navigate to profile
  const handleProfileClick = (commentUserId) => {
    if (!user) return;
    if (String(user.user_id) === String(commentUserId)) {
      navigate("/itian-profile");
    } else {
      navigate(`/itian-profile/${commentUserId}`);
    }
  };

  // Render comment with its replies
  const renderComment = (comment, depth = 0) => {
    const isTopLevel = depth === 0;
    const isCollapsed = collapsedComments[comment.id];
    const hasReplies = comment.replies && comment.replies.length > 0;

    return (
      <motion.div
        key={comment.id}
        className={`relative ${!isTopLevel ? "ml-10 pl-4" : ""}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="bg-white rounded-xl p-4 shadow-sm transition-all duration-200 hover:shadow-md">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              {/* Avatar clickable for profile navigation */}
              {comment.user.profile_picture ? (
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  src={`http://localhost:8000/storage/${comment.user.profile_picture}`}
                  alt="Profile"
                  className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-md cursor-pointer"
                  onClick={() => handleProfileClick(comment.user.id)}
                />
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="h-10 w-10 rounded-full bg-gradient-to-br from-red-100 to-red-300 flex items-center justify-center text-red-600 font-bold text-lg shadow-md cursor-pointer"
                  onClick={() => handleProfileClick(comment.user.id)}
                >
                  {comment.user.name?.charAt(0) || "U"}
                </motion.div>
              )}
              <div>
                {/* Name clickable for profile navigation */}
                <h4
                  className="font-medium text-gray-900 cursor-pointer"
                  onClick={() => handleProfileClick(comment.user.id)}
                >
                  {comment.user.name ||
                    `${comment.user.first_name} ${comment.user.last_name}`}
                </h4>
                <p className="text-xs text-gray-500">
                  {formatDate(comment.created_at)}
                </p>
              </div>
            </div>

            <div className="flex space-x-2">
              {/* Reply Button - Only for top-level comments */}
              {isTopLevel && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-gray-400 hover:text-red-500 p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setReplyingTo(comment.id);
                    setEditingComment(null);
                  }}
                  title="Reply"
                >
                  <FiMessageSquare />
                </motion.button>
              )}

              {/* Edit/Delete Buttons - Only for owner */}
              {isOwner(comment.user.id) && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-gray-400 hover:text-red-500 p-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingComment(comment.id);
                      setEditContent(comment.content);
                      setReplyingTo(null);
                    }}
                    title="Edit"
                  >
                    <FiEdit2 />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-gray-400 hover:text-red-500 p-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDelete(comment.id);
                    }}
                    title="Delete"
                  >
                    <FiTrash2 />
                  </motion.button>
                </>
              )}
            </div>
          </div>

          {editingComment === comment.id ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-2"
            >
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                rows={3}
                autoFocus
              />
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpdateComment}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm shadow-sm transition-all"
                >
                  Update
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setEditingComment(null)}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm transition-all"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <div className="mt-2">
              <p className="text-gray-700 whitespace-pre-line">
                {comment.content}
              </p>
              {hasReplies && (
                <div className="mt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCollapse(comment.id);
                    }}
                    className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                  >
                    {isCollapsed ? (
                      <>
                        <FiChevronDown className="inline mr-1" />
                        Show replies ({comment.replies.length})
                      </>
                    ) : (
                      <>
                        <FiChevronUp className="inline mr-1" />
                        Hide replies
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Reply Input - positioned below the comment */}
        {replyingTo === comment.id && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 bg-gray-50 rounded-lg p-4"
          >
            <div className="flex items-start space-x-3">
              {user?.profile_picture ? (
                <img
                  src={`http://localhost:8000/storage/${user.profile_picture}`}
                  alt="Profile"
                  className="h-8 w-8 rounded-full object-cover border border-white shadow-sm"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-red-100 to-red-300 flex items-center justify-center text-red-600 font-bold text-sm shadow-sm">
                  {user?.first_name?.charAt(0) || "Y"}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center text-sm text-red-500 mb-2">
                  <span>
                    Replying to {comment.user.name || comment.user.first_name}
                  </span>
                  <button
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent("");
                    }}
                    className="ml-2 p-1 text-gray-400 hover:text-red-500 rounded-full"
                  >
                    <FiX />
                  </button>
                </div>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write your reply..."
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none transition-all"
                  rows={2}
                  autoFocus
                />
                <div className="flex justify-end mt-2 space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setReplyingTo(null);
                      setReplyContent("");
                    }}
                    className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddComment();
                    }}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors shadow-sm ${
                      replyContent.trim()
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                    disabled={!replyContent.trim()}
                  >
                    Reply
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Render replies if not collapsed */}
        {hasReplies && !isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="mt-3 space-y-3"
          >
            {comment.replies.map((reply) => renderComment(reply, depth + 1))}
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4">
      {/* Comment Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-sm p-6 mb-6"
      >
        <div className="flex items-start space-x-4">
          {user?.profile_picture ? (
            <motion.img
              whileHover={{ scale: 1.05 }}
              src={`http://localhost:8000/storage/${user.profile_picture}`}
              alt="Profile"
              className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-md"
            />
          ) : (
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="h-12 w-12 rounded-full bg-gradient-to-br from-red-100 to-red-300 flex items-center justify-center text-red-600 font-bold text-xl shadow-md"
            >
              {user?.name?.charAt(0) || "Y"}
            </motion.div>
          )}

          <div className="flex-1 space-y-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none transition-all shadow-sm"
              rows={3}
            />
            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddComment}
                className={`px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center space-x-2 ${
                  newComment.trim()
                    ? "bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600"
                    : "bg-gray-100 text-gray-500 cursor-not-allowed"
                }`}
                disabled={!newComment.trim()}
              >
                <FiSend size={18} />
                <span>Post Comment</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Comments Count */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center mb-6"
      >
        <div className="h-px bg-gray-200 flex-1"></div>
        <span className="px-4 text-gray-500 font-medium">
          {pagination.total} {pagination.total === 1 ? "Comment" : "Comments"}
        </span>
        <div className="h-px bg-gray-200 flex-1"></div>
      </motion.div>

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="h-10 w-10 rounded-full border-4 border-red-500 border-t-transparent"
          ></motion.div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-3">
            <FiX className="h-6 w-6 text-red-500" />
          </div>
          <p className="text-red-500">{error}</p>
        </div>
      ) : comments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="mx-auto h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <FiSend className="h-6 w-6 text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No comments yet
          </h3>
          <p className="text-gray-500">Be the first to share what you think!</p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => renderComment(comment))}

          {/* Load More Button */}
          {pagination.currentPage < pagination.lastPage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex justify-center pt-4"
            >
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={loadMoreComments}
                disabled={loadingMore}
                className={`px-5 py-2.5 rounded-xl flex items-center space-x-2 transition-all ${
                  loadingMore
                    ? "bg-gray-100 text-gray-500"
                    : "bg-white border border-gray-200 text-gray-700 hover:border-red-300 hover:text-red-600 shadow-sm"
                }`}
              >
                {loadingMore ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-500 mr-2"></span>
                    Loading...
                  </>
                ) : (
                  <>
                    <FiChevronDown />
                    <span>Load more comments</span>
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 overflow-hidden"
            >
              <div className="text-center space-y-5">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                  <FiTrash2 className="h-6 w-6 text-red-600" />
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Delete comment?
                  </h3>
                  <p className="text-gray-500 mt-2">
                    This will permanently remove the comment and all its
                    replies.
                  </p>
                </div>

                <div className="flex justify-center space-x-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDeleteModal(false)}
                    className="px-5 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-all text-sm"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDeleteComment}
                    className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm shadow-sm"
                  >
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommentSection;
