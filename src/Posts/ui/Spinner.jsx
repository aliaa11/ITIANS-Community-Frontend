const Spinner = ({ fullScreen = false, small = false }) => {
  const sizeClasses = small ? 'h-5 w-5' : 'h-8 w-8';
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-20 z-50">
        <div className={`animate-spin rounded-full ${sizeClasses} border-t-2 border-b-2 border-red-500`}></div>
      </div>
    );
  }

  return (
    <div className={`animate-spin rounded-full ${sizeClasses} border-t-2 border-b-2 border-red-500`}></div>
  );
};

export default Spinner;