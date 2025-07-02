import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiRefreshCw } from "react-icons/fi";
import { fetchPosts, deletePost as apiDeletePost } from "../../services/api";
import PostCard from "./PostCard";
import CreatePostModal from "./CreatePostModal";
import EditPostModal from "./EditPostModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import ReactionsModal from "./ReactionsModal";
import { useSelector, useDispatch } from "react-redux";
import { fetchItianProfile } from "../../store/itianSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ItianSidebarProfile from "./ItianSidebarProfile";
import ChatbotButton from "../../../AI Chat/ChatbotButton";

const PostList = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.itian?.user ?? null);

  useEffect(() => {
    if (!user) {
      dispatch(fetchItianProfile());
    }
  }, [user, dispatch]);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [editPost, setEditPost] = useState(null);
  const [deletePostId, setDeletePostId] = useState(null);
  const [reactionsModalOpen, setReactionsModalOpen] = useState(false);
  const [reactionsModalPostId, setReactionsModalPostId] = useState(null);

  const observer = useRef();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 12,
      },
    },
    exit: {
      y: -20,
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  // const buttonVariants = {
  //   hover: { scale: 1.05, boxShadow: "0px 5px 15px rgba(0,0,0,0.1)" },
  //   tap: { scale: 0.98 },
  // };

  const loadPosts = useCallback(async (reset = false, pageNumber = 1) => {
    try {
      setLoading(true);
      const data = await fetchPosts({ page: pageNumber });
      const postsArray = Array.isArray(data.data) ? data.data : [];

      if (reset) {
        setPosts(postsArray);
      } else {
        setPosts((prev) => [...prev, ...postsArray]);
      }

      setHasMore(data.current_page < data.last_page);
    } catch (err) {
      toast.error("Failed to load posts. Please try again.");
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    loadPosts(true, 1);
  }, [loadPosts]);

  useEffect(() => {
    if (page === 1) return;
    loadPosts(false, page);
  }, [page, loadPosts]);

  const lastPostRef = useCallback(
    (node) => {
      if (loading || !hasMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
    setIsModalOpen(false);
    toast.success("Post created successfully!");
  };

  const handleDeletePost = (postId) => {
    setPosts(posts.filter((post) => post.id !== postId));
    toast.success("Post deleted successfully!");
  };

  const handleUpdatePost = (updatedPost) => {
    setPosts(
      posts.map((post) => (post.id === updatedPost.id ? updatedPost : post))
    );
    toast.success("Post updated successfully!");
  };

  const handleRefresh = () => {
    setPage(1);
    loadPosts(true, 1);
  };

  const openEditModal = (post) => setEditPost(post);
  const closeEditModal = () => setEditPost(null);
  const openDeleteModal = (postId) => setDeletePostId(postId);
  const closeDeleteModal = () => setDeletePostId(null);

  const handleDeleteConfirmed = async () => {
    if (!deletePostId) return;
    try {
      await apiDeletePost(deletePostId);
      handleDeletePost(deletePostId);
      closeDeleteModal();
    } catch {
      toast.error("Failed to delete post.");
    }
  };

  const handleOpenReactionsModal = (postId) => {
    setReactionsModalOpen(true);
    setReactionsModalPostId(postId);
  };
  const handleCloseReactionsModal = () => {
    setReactionsModalOpen(false);
    setReactionsModalPostId(null);
  };

  const handleEditClick = (post) => openEditModal(post);
  const handleDeleteClick = (postId) => openDeleteModal(postId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Three Column Layout */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - 20% width */}
          <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {user && <ItianSidebarProfile profile={user} />}
            </motion.div>
          </div>

          {/* Center Posts - 60% width */}
          <div className="w-full lg:w-3/3">
            <div className="max-w-3xl mx-auto">
              {/* Header with Refresh Button */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center mb-6"
              >
                <h1 className="text-2xl font-bold text-gray-800">
                  Community Posts
                </h1>
                <motion.button
                  whileHover={{ rotate: 180 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleRefresh}
                  disabled={loading}
                  className="p-2 rounded-full bg-white shadow-sm hover:bg-gray-50 text-gray-600 transition-all"
                >
                  <FiRefreshCw
                    className={`text-lg ${loading ? "animate-spin" : ""}`}
                  />
                </motion.button>
              </motion.div>

              {/* Posts List */}
              {loading && page === 1 ? (
                <div className="flex justify-center py-16">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      ease: "linear",
                    }}
                    className="h-12 w-12 border-4 border-red-500 border-t-transparent rounded-full"
                  />
                </div>
              ) : posts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center"
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    No posts yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Be the first to share your thoughts with the community!
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-6"
                >
                  <AnimatePresence>
                    {posts.map((post, index) => (
                      <motion.div
                        key={post.id}
                        variants={itemVariants}
                        layout
                        exit="exit"
                        ref={index === posts.length - 1 ? lastPostRef : null}
                      >
                        <PostCard
                          post={post}
                          onEditClick={handleEditClick}
                          onDeleteClick={handleDeleteClick}
                          onOpenReactionsModal={handleOpenReactionsModal}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {loading && page > 1 && (
                    <div className="flex justify-center py-8">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 1,
                          ease: "linear",
                        }}
                        className="h-8 w-8 border-3 border-red-500 border-t-transparent rounded-full"
                      />
                    </div>
                  )}

                  {!hasMore && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8 text-gray-500"
                    >
                      You've reached the end of posts
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>
          </div>

          {/* Right Column - 20% width (Only for Chatbot on desktop) */}
          <div className="hidden lg:block lg:w-1/5 lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)]">
            <div className="flex flex-col h-full">
              <div className="flex-1"></div>
              <div className="sticky bottom-8 flex flex-col items-end">
                <ChatbotButton />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-30 right-6 z-50 flex flex-col items-end gap-4">
        {/* Chatbot Button (Mobile only) */}
        <div className="lg:hidden">
          <ChatbotButton />
        </div>

        {/* Create Post Button (All screens) */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white p-4 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 group"
            style={{ boxShadow: "0 4px 24px 0 rgba(220,38,38,0.15)" }}
            aria-label="Create Post"
          >
            <FiPlus className="text-2xl" />
            <span className="font-bold text-lg hidden sm:inline group-hover:inline ml-2">
              Create Post
            </span>
          </button>
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isModalOpen && (
          <CreatePostModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onPostCreated={handlePostCreated}
          />
        )}
      </AnimatePresence>

      {editPost && (
        <EditPostModal
          post={editPost}
          onClose={closeEditModal}
          onUpdate={handleUpdatePost}
        />
      )}

      <DeleteConfirmModal
        isOpen={!!deletePostId}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirmed}
      />

      <ReactionsModal
        isOpen={reactionsModalOpen}
        postId={reactionsModalPostId}
        onClose={handleCloseReactionsModal}
      />

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastClassName="shadow-lg"
        progressClassName="bg-gradient-to-r from-red-500 to-red-600"
      />
    </div>
  );
};

export default PostList;