import { useState } from 'react';

const reactionOptions = [
  { value: 'like', label: '👍 Like' },
  { value: 'love', label: '❤️ Love' },
  { value: 'haha', label: '😂 Haha' },
  { value: 'wow', label: '😮 Wow' },
  { value: 'sad', label: '😢 Sad' },
  { value: 'angry', label: '😠 Angry' },
  { value: 'support', label: '💪 Support' }
];

const FilterPosts = ({ filters, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleSortChange = (e) => {
    onChange({ ...filters, sort: e.target.value });
  };
  
  const handleSearchChange = (e) => {
    onChange({ ...filters, search: e.target.value });
  };
  
  const toggleReaction = (reaction) => {
    const newReactions = filters.reactions.includes(reaction)
      ? filters.reactions.filter(r => r !== reaction)
      : [...filters.reactions, reaction];
    onChange({ ...filters, reactions: newReactions });
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span>Filters</span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl z-10 p-4 border border-gray-200">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
            <select
              value={filters.sort}
              onChange={handleSortChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most_reactions">Most Reactions</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={handleSearchChange}
              placeholder="Search posts..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reactions</label>
            <div className="flex flex-wrap gap-2">
              {reactionOptions.map((reaction) => (
                <button
                  key={reaction.value}
                  onClick={() => toggleReaction(reaction.value)}
                  className={`px-3 py-1 rounded-full text-sm flex items-center ${filters.reactions.includes(reaction.value) ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}
                >
                  {reaction.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={() => onChange({ sort: 'newest', search: '', reactions: [] })}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPosts;