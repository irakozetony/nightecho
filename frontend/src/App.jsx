import { useState, useEffect } from 'react';
import { FeedbackProvider, useFeedback } from './context/FeedbackContext';
import { useUpvotes } from './hooks/useUpvotes';
import FilterSidebar from './components/filters/FilterSidebar';
import FeedbackCard from './components/feedback/FeedbackCard';
import FeedbackForm from './components/feedback/FeedbackForm';
import Button from './components/ui/Button';
import ThemeSwitcher from './components/ui/ThemeSwitcher';

const FeedbackApp = () => {
  const { 
    feedback, 
    pagination, 
    loading, 
    error, 
    filters, 
    fetchFeedback, 
    createFeedback, 
    updateFilters,
    clearError,
    goToPage 
  } = useFeedback();
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search || '');

  // Load initial data
  useEffect(() => {
    fetchFeedback();
  }, []);

  // Search handler
  const handleSearch = (e) => {
    e.preventDefault();
    updateFilters({ search: searchValue });
    fetchFeedback({ search: searchValue, page: 1 });
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    // Feedback is automatically added to the list via context
  };

  const handleFormError = (errorMessage) => {
    console.error('Form error:', errorMessage);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-2 bg-blue-600 rounded-lg flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0v10a2 2 0 01-2 2H9a2 2 0 01-2-2V8m10 0H7" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white transition-colors truncate">
                    <span className="sm:hidden">Feedback</span>
                    <span className="hidden sm:inline">Feedback Board</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 transition-colors hidden sm:block">Share your thoughts and ideas</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              {/* Theme Switcher */}
              <ThemeSwitcher className="flex-shrink-0" />
              
              {/* Search - Hidden on mobile */}
              <form onSubmit={handleSearch} className="hidden lg:flex items-center">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search feedback..."
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                  />
                </div>
              </form>

              <Button 
                onClick={() => setShowForm(!showForm)}
                size="sm"
                className="flex-shrink-0"
              >
                <svg className="w-4 h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Add Feedback</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="lg:hidden pb-4">
            <form onSubmit={handleSearch} className="flex items-center">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search feedback..."
                  className="pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors text-base"
                />
              </div>
            </form>
          </div>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700">{error}</span>
            </div>
            <button onClick={clearError} className="text-red-500 hover:text-red-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex md:gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-80 shrink-0">
            <FilterSidebar isOpen={true} onClose={() => setIsFilterOpen(false)} />
          </aside>

          {/* Mobile Sidebar Overlay */}
          <div className="md:hidden">
            <FilterSidebar isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
          </div>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {/* Feedback Form */}
            {showForm && (
              <div className="mb-6">
                <FeedbackForm onSuccess={handleFormSuccess} onError={handleFormError} />
              </div>
            )}

            {/* Results Summary */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">
                  {filters.search ? `Search results for "${filters.search}"` : 'Feedback'}
                </h2>
                {pagination && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors">
                    {pagination.totalItems} total items • Page {pagination.currentPage} of {pagination.totalPages}
                  </p>
                )}
              </div>

              {/* Quick Sort Toggle */}
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant={filters.sortBy === 'recent' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    updateFilters({ sortBy: 'recent' });
                    fetchFeedback({ sortBy: 'recent', page: 1 });
                  }}
                >
                  Recent
                </Button>
                <Button
                  variant={filters.sortBy === 'upvotes' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    updateFilters({ sortBy: 'upvotes' });
                    fetchFeedback({ sortBy: 'upvotes', page: 1 });
                  }}
                >
                  Top Voted
                </Button>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center py-12">
                <div className="flex items-center space-x-2 text-gray-500">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Loading feedback...</span>
                </div>
              </div>
            )}

            {/* Feedback List */}
            {!loading && (
              <div className="space-y-4">
                {feedback.length > 0 ? (
                  feedback.map((item) => (
                    <FeedbackCard key={item.id} feedback={item} />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0v10a2 2 0 01-2 2H9a2 2 0 01-2-2V8m10 0H7" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback found</h3>
                    <p className="text-gray-500 mb-6">
                      {filters.search || filters.category 
                        ? 'Try adjusting your search or filters to find what you\'re looking for.'
                        : 'Be the first to share your feedback!'}
                    </p>
                    <Button onClick={() => setShowForm(true)}>
                      Add Feedback
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                >
                  Previous
                </Button>
                
                <span className="px-4 py-2 text-sm text-gray-600">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <FeedbackProvider>
      <FeedbackApp />
    </FeedbackProvider>
  );
}

export default App;
