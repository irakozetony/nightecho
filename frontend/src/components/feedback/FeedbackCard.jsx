import { useState, useEffect } from 'react';
import { useUpvotes } from '../../hooks/useUpvotes';
import { useFeedback } from '../../context/FeedbackContext';
import Button from '../ui/Button';

// Category styling and icons
const CATEGORY_STYLES = {
  bug: {
    bg: 'bg-red-100 text-red-800',
    icon: '🐛',
    label: 'Bug'
  },
  feature: {
    bg: 'bg-green-100 text-green-800',
    icon: '✨',
    label: 'Feature'
  },
  improvement: {
    bg: 'bg-blue-100 text-blue-800',
    icon: '🚀',
    label: 'Improvement'
  }
};

// Time formatting utility
const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffHours < 1) {
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return diffMins < 1 ? 'Just now' : `${diffMins} minutes ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
};

const FeedbackCard = ({ feedback }) => {
  const { updateFeedback } = useFeedback();
  const { isUpvoted, toggleUpvote, loadVoteStatus, loading } = useUpvotes();
  const [localFeedback, setLocalFeedback] = useState(feedback);

  const categoryStyle = CATEGORY_STYLES[feedback.category];
  const hasUpvoted = isUpvoted(feedback.id);

  // Load vote status when component mounts
  useEffect(() => {
    loadVoteStatus(feedback.id);
  }, [feedback.id]); // Remove loadVoteStatus from dependencies to avoid infinite re-renders

  const handleUpvote = async () => {
    if (loading) return;

    try {
      await toggleUpvote(feedback.id, (updatedFeedback, action) => {
        // Update local feedback data with new upvote count
        setLocalFeedback(updatedFeedback);
        
        // Update the feedback in the global context if available
        if (updateFeedback) {
          updateFeedback(updatedFeedback);
        }
      });
    } catch (error) {
      console.error('Failed to toggle upvote:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 p-6">
      {/* Header with user info and time */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar placeholder - you could add real user avatars later */}
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {feedback.title.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white transition-colors">Anonymous User</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">{formatTimeAgo(feedback.created_at)}</p>
          </div>
        </div>
        
        {/* Category badge */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${categoryStyle.bg}`}>
            <span>{categoryStyle.icon}</span>
            {categoryStyle.label}
          </span>
        </div>
      </div>

      {/* Feedback content */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 transition-colors">
          {feedback.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-3 transition-colors">
          {feedback.description}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-700 transition-colors">
        <div className="flex items-center gap-4">
          {/* Upvote button */}
          <Button
            variant={hasUpvoted ? 'primary' : 'ghost'}
            size="sm"
            onClick={handleUpvote}
            disabled={loading}
            loading={loading}
            className={`transition-all duration-200 ${
              hasUpvoted 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'hover:bg-green-50 hover:text-green-700'
            }`}
          >
            <svg 
              className={`w-4 h-4 mr-1 ${hasUpvoted ? 'fill-current' : 'stroke-current fill-none'}`} 
              viewBox="0 0 24 24" 
              strokeWidth="2"
            >
              <path d="M7 10v12l8-8V4L7 10z"/>
            </svg>
            {localFeedback.upvotes}
          </Button>
          
          {/* Reply placeholder - for future feature */}
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Reply
          </Button>
        </div>

        {/* Share button */}
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
        </Button>
      </div>
    </div>
  );
};

export default FeedbackCard;