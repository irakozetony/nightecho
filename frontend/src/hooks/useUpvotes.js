import { useState, useEffect } from 'react';
import { feedbackApi } from '../utils/api';

// This hook now works with backend vote tracking
export const useUpvotes = () => {
  const [upvotedIds, setUpvotedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // Check if a feedback item is upvoted by the current user
  const isUpvoted = (id) => {
    return upvotedIds.has(id);
  };

  // Load vote status for a specific feedback item
  const loadVoteStatus = async (id) => {
    try {
      const status = await feedbackApi.getUserVoteStatus(id);
      if (status.hasVoted && status.voteType === 'upvote') {
        setUpvotedIds(prev => new Set([...prev, id]));
      } else {
        setUpvotedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
      return status;
    } catch (error) {
      console.error('Error loading vote status:', error);
      return { hasVoted: false, voteType: null };
    }
  };

  // Toggle upvote for a feedback item
  const toggleUpvote = async (id, onSuccess) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const result = await feedbackApi.upvoteFeedback(id);
      
      // Update local state based on server response
      if (result.action === 'added') {
        setUpvotedIds(prev => new Set([...prev, id]));
      } else if (result.action === 'removed') {
        setUpvotedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
      
      // Call success callback with updated feedback data
      onSuccess?.(result.data, result.action);
      return result;
    } catch (error) {
      console.error('Error toggling upvote:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearAllUpvotes = () => {
    setUpvotedIds(new Set());
  };

  return {
    isUpvoted,
    toggleUpvote,
    loadVoteStatus,
    clearAllUpvotes,
    upvotedCount: upvotedIds.size,
    loading
  };
};
