import { useState, useRef, useEffect } from "react";
import { createPost } from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const [postData, setPostData] = useState({
    title: "",
    content: "",
    image: null,
  });
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const fileInputRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPostData({ ...postData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newPost = await createPost(postData);
      onPostCreated(newPost);
      setShowSuccess(true);
      setTimeout(() => {
        setPostData({ title: "", content: "", image: null });
        setPreview(null);
        setShowSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        >
          {/* Animated Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Main Modal */}
          <motion.div
            ref={modalRef}
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col border-4 border-red-500/20"
          >
            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-all"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.button>

            {/* Header with Gradient */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-red-600 to-red-700 p-6 shadow-inner"
            >
              <div className="flex items-center space-x-3">
                <motion.div 
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    repeatType: "reverse", 
                    duration: 2 
                  }}
                  className="text-3xl"
                >
                  ✍️
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold text-white drop-shadow-md">
                    Create New Post
                  </h2>
                  <p className="text-red-100/90 mt-1 font-medium">
                    Share your thoughts with the community
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-grow bg-gradient-to-b from-white to-red-50">
              {showSuccess ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1,
                    transition: { type: "spring", stiffness: 500 }
                  }}
                  className="text-center py-8"
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      repeatType: "mirror", 
                      duration: 1.5 
                    }}
                    className="text-5xl mb-4"
                  >
                    🎉
                  </motion.div>
                  <h3 className="text-2xl font-bold text-red-600 mb-2">
                    Success!
                  </h3>
                  <p className="text-red-500 font-medium">
                    Your post has been published
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {/* Title Field */}
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6"
                  >
                    <label className="block text-red-700 font-medium mb-2">
                      Title
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Give your post a title"
                        value={postData.title}
                        onChange={(e) =>
                          setPostData({ ...postData, title: e.target.value })
                        }
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300 shadow-sm"
                        required
                      />
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="absolute right-3 top-3 text-red-400"
                      >
                        ✏️
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Content Field */}
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mb-6"
                  >
                    <label className="block text-red-700 font-medium mb-2">
                      Content
                    </label>
                    <textarea
                      placeholder="What's on your mind?"
                      rows="4"
                      value={postData.content}
                      onChange={(e) =>
                        setPostData({ ...postData, content: e.target.value })
                      }
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300 shadow-sm resize-none"
                      required
                    />
                  </motion.div>

                  {/* Image Upload */}
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mb-8"
                  >
                    <label className="block text-red-700 font-medium mb-2">
                      Add Image (Optional)
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="flex items-center justify-center w-full py-4 px-4 border-2 border-dashed border-red-300 rounded-xl bg-red-50 hover:bg-red-100 transition-all duration-300 shadow-inner"
                    >
                      <motion.div 
                        animate={{ 
                          y: [0, -5, 0],
                          transition: { repeat: Infinity, duration: 2 }
                        }}
                        className="text-2xl"
                      >
                        📷
                      </motion.div>
                      <span className="ml-3 text-red-600 font-medium">
                        {preview ? "Change Image" : "Upload an Image"}
                      </span>
                    </motion.button>

                    {preview && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-4 relative group overflow-hidden rounded-xl shadow-lg"
                      >
                        <img
                          src={preview}
                          alt="Preview"
                          className="w-full object-cover max-h-64 transition-transform duration-500 group-hover:scale-105"
                        />
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          type="button"
                          onClick={() => {
                            setPreview(null);
                            setPostData({ ...postData, image: null });
                          }}
                          className="absolute top-3 right-3 bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 transition-all"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </motion.button>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex justify-end space-x-4"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05, backgroundColor: "#f3f4f6" }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={onClose}
                      className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium shadow-sm transition-all duration-300"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isSubmitting}
                      className={`px-6 py-2.5 text-white rounded-lg font-medium shadow-lg transition-all duration-300 flex items-center justify-center min-w-28 ${
                        isSubmitting 
                          ? 'bg-red-400' 
                          : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ 
                              repeat: Infinity, 
                              duration: 1,
                              ease: "linear"
                            }}
                            className="inline-block mr-2"
                          >
                            ⏳
                          </motion.span>
                          Posting...
                        </>
                      ) : (
                        <>
                          <motion.span 
                            animate={{ 
                              x: [0, 5, 0],
                              transition: { repeat: Infinity, duration: 1.5 }
                            }}
                            className="mr-2"
                          >
                            ✨
                          </motion.span>
                          Create Post
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                </form>
              )}
            </div>

            {/* Decorative Footer */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="h-2 bg-gradient-to-r from-red-500 via-red-400 to-red-500"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreatePostModal;