import { useFeedback } from '../../context/FeedbackContext';
import Button from '../ui/Button';

const CATEGORIES = [
  { value: null, label: 'All Categories', count: 'all' },
  { value: 'bug', label: '🐛 Bug', count: 0 },
  { value: 'feature', label: '✨ Feature', count: 0 },
  { value: 'improvement', label: '🚀 Improvement', count: 0 },
];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent', icon: '🕐' },
  { value: 'upvotes', label: 'Most Upvoted', icon: '👍' },
];

const FilterSidebar = ({ isOpen, onClose }) => {
  const { filters, updateFilters, pagination, fetchFeedback } = useFeedback();

  const handleCategoryChange = (category) => {
    updateFilters({ category });
    fetchFeedback({ category, page: 1 });
    if (window.innerWidth < 768) onClose?.();
  };

  const handleSortChange = (sortBy) => {
    updateFilters({ sortBy });
    fetchFeedback({ sortBy, page: 1 });
    if (window.innerWidth < 768) onClose?.();
  };

  const clearFilters = () => {
    updateFilters({ category: null, sortBy: 'recent', search: '' });
    fetchFeedback({ category: null, sortBy: 'recent', search: '', page: 1 });
    if (window.innerWidth < 768) onClose?.();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed md:sticky top-0 left-0 h-screen md:h-auto
        w-80 md:w-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 md:border-r-0
        z-50 md:z-auto transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        md:transform-none overflow-y-auto
      `}>
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 transition-colors">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">Filter Feedback</h2>
            <button 
              onClick={onClose}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {pagination && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 transition-colors">
              {pagination.totalItems} total feedback items
            </p>
          )}
        </div>

        <div className="p-6 space-y-8">
          {/* Category Filter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 transition-colors">Category</h3>
            <div className="space-y-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category.value || 'all'}
                  onClick={() => handleCategoryChange(category.value)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                    filters.category === category.value
                      ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <span>{category.label}</span>
                  {/* You could add counts here if you track them */}
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    filters.category === category.value
                      ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300'
                      : 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-300'
                  }`}>
                    {category.count === 'all' ? pagination?.totalItems || 0 : category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* My Upvotes Toggle */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 transition-colors">Filter Options</h3>
            <button
              onClick={() => {
                const newMyUpvotes = !filters.myUpvotes;
                updateFilters({ myUpvotes: newMyUpvotes });
                fetchFeedback({ myUpvotes: newMyUpvotes, page: 1 });
                if (window.innerWidth < 768) onClose?.();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                filters.myUpvotes
                  ? 'bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <span className="flex items-center">
                <span className="mr-2">💜</span>
                My Upvotes
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                filters.myUpvotes
                  ? 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-300'
                  : 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-300'
              }`}>
                {filters.myUpvotes ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>

          {/* Sort Options */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 transition-colors">Sort By</h3>
            <div className="space-y-2">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                    filters.sortBy === option.value
                      ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-2">{option.icon}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Filters Summary */}
          {(filters.category || filters.sortBy !== 'recent' || filters.search) && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 transition-colors">Active Filters</h3>
              <div className="space-y-2">
                {filters.category && (
                  <div className="flex items-center justify-between px-3 py-2 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm rounded-lg transition-colors">
                    <span>Category: {CATEGORIES.find(c => c.value === filters.category)?.label}</span>
                    <button
                      onClick={() => handleCategoryChange(null)}
                      className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-200 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                
                {filters.sortBy !== 'recent' && (
                  <div className="flex items-center justify-between px-3 py-2 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm rounded-lg transition-colors">
                    <span>Sort: {SORT_OPTIONS.find(s => s.value === filters.sortBy)?.label}</span>
                    <button
                      onClick={() => handleSortChange('recent')}
                      className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-200 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                
                {filters.search && (
                  <div className="flex items-center justify-between px-3 py-2 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm rounded-lg transition-colors">
                    <span className="truncate">Search: "{filters.search}"</span>
                    <button
                      onClick={() => {
                        updateFilters({ search: '' });
                        fetchFeedback({ search: '', page: 1 });
                      }}
                      className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-200 ml-2 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="w-full mt-4"
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;