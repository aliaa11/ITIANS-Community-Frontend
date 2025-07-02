import { useState, useRef } from 'react';
import { updatePost } from '../../services/api';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const EditPostModal = ({ post, onClose, onUpdate }) => {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(post.image ? `http://localhost:8000/storage/${post.image}` : null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const updatedPost = await updatePost(post.id, { title, content, image });
      onUpdate(updatedPost);
      toast.success('Post updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      >
        {/* Backdrop with blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal container */}
        <motion.div
          ref={modalRef}
          initial={{ y: 20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col border-4 border-red-500/20"
        >
          {/* Header with gradient */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-red-600 to-red-700 p-6 shadow-inner"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    transition: { repeat: Infinity, duration: 2 }
                  }}
                  className="text-2xl"
                >
                  ✏️
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold text-white">Edit Post</h2>
                  <p className="text-red-100/90 text-sm">Make changes to your post</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </motion.button>
            </div>
          </motion.div>

          {/* Form content */}
          <div className="p-6 overflow-y-auto flex-grow bg-gradient-to-b from-white to-red-50">
            <form onSubmit={handleSubmit}>
              {/* Title field */}
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
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300 shadow-sm"
                    required
                  />
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="absolute right-3 top-3 text-red-400"
                  >
                    📝
                  </motion.div>
                </div>
              </motion.div>

              {/* Content field */}
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
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300 shadow-sm resize-none"
                  rows="4"
                  required
                />
              </motion.div>

              {/* Image upload */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-8"
              >
                <label className="block text-red-700 font-medium mb-2">
                  Update Image
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
                      y: [0, -3, 0],
                      transition: { repeat: Infinity, duration: 2 }
                    }}
                    className="text-2xl"
                  >
                    {preview ? '🖼️' : '📷'}
                  </motion.div>
                  <span className="ml-3 text-red-600 font-medium">
                    {preview ? 'Change Image' : 'Upload an Image'}
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
                        setImage(null);
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

              {/* Action buttons */}
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
                  disabled={isLoading}
                  className={`px-6 py-2.5 text-white rounded-lg font-medium shadow-lg transition-all duration-300 flex items-center justify-center min-w-28 ${
                    isLoading 
                      ? 'bg-red-400' 
                      : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                  }`}
                >
                  {isLoading ? (
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
                      Saving...
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
                        💾
                      </motion.span>
                      Update
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>
          </div>

          {/* Decorative footer */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="h-2 bg-gradient-to-r from-red-500 via-red-400 to-red-500"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditPostModal;