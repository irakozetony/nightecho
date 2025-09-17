import { createContext, useContext, useReducer, useCallback } from 'react';
import { feedbackApi } from '../utils/api';

const FeedbackContext = createContext();

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_FEEDBACK: 'SET_FEEDBACK',
  SET_ERROR: 'SET_ERROR',
  SET_FILTERS: 'SET_FILTERS',
  ADD_FEEDBACK: 'ADD_FEEDBACK',
  UPDATE_FEEDBACK: 'UPDATE_FEEDBACK',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Initial state
const initialState = {
  feedback: [],
  pagination: null,
  filters: {
    category: null,
    sortBy: 'recent',
    search: '',
    page: 1,
    limit: 10,
    myUpvotes: false
  },
  loading: false,
  error: null,
  submitting: false
};

// Reducer
const feedbackReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload, error: null };
    
    case ACTIONS.SET_FEEDBACK:
      return {
        ...state,
        feedback: action.payload.data,
        pagination: action.payload.pagination,
        filters: { ...state.filters, ...action.payload.filters },
        loading: false,
        error: null
      };
    
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false, submitting: false };
    
    case ACTIONS.SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload, page: 1 } };
    
    case ACTIONS.ADD_FEEDBACK:
      return {
        ...state,
        feedback: [action.payload, ...state.feedback],
        submitting: false,
        error: null
      };
    
    case ACTIONS.UPDATE_FEEDBACK:
      return {
        ...state,
        feedback: state.feedback.map(item =>
          item.id === action.payload.id ? action.payload : item
        )
      };
    
    case ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    
    default:
      return state;
  }
};

// Context provider component
export const FeedbackProvider = ({ children }) => {
  const [state, dispatch] = useReducer(feedbackReducer, initialState);

  // Fetch feedback with current filters
  const fetchFeedback = useCallback(async (customFilters = {}) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    
    try {
      const filters = { ...state.filters, ...customFilters };
      const params = {};
      
      // Only include non-null/empty values
      if (filters.category) params.category = filters.category;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.search?.trim()) params.search = filters.search.trim();
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;
      if (filters.myUpvotes) params.myUpvotes = filters.myUpvotes;
      
      const result = await feedbackApi.getFeedback(params);
      dispatch({ type: ACTIONS.SET_FEEDBACK, payload: result });
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    }
  }, [state.filters]);

  // Create new feedback
  const createFeedback = useCallback(async (feedbackData) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    
    try {
      const result = await feedbackApi.createFeedback(feedbackData);
      dispatch({ type: ACTIONS.ADD_FEEDBACK, payload: result.data });
      
      // Refresh to get updated pagination
      await fetchFeedback();
      return result;
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  }, [fetchFeedback]);

  // Upvote feedback
  const upvoteFeedback = useCallback(async (id) => {
    try {
      const result = await feedbackApi.upvoteFeedback(id);
      dispatch({ type: ACTIONS.UPDATE_FEEDBACK, payload: result.data });
      return result;
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    dispatch({ type: ACTIONS.SET_FILTERS, payload: newFilters });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_ERROR });
  }, []);

  // Update individual feedback item
  const updateFeedback = useCallback((updatedFeedback) => {
    dispatch({ type: ACTIONS.UPDATE_FEEDBACK, payload: updatedFeedback });
  }, []);

  // Go to specific page
  const goToPage = useCallback((page) => {
    const newFilters = { ...state.filters, page };
    dispatch({ type: ACTIONS.SET_FILTERS, payload: { page } });
    fetchFeedback({ page });
  }, [state.filters, fetchFeedback]);

  const value = {
    // State
    feedback: state.feedback,
    pagination: state.pagination,
    filters: state.filters,
    loading: state.loading,
    error: state.error,
    submitting: state.submitting,
    
    // Actions
    fetchFeedback,
    createFeedback,
    upvoteFeedback,
    updateFeedback,
    updateFilters,
    clearError,
    goToPage
  };

  return (
    <FeedbackContext.Provider value={value}>
      {children}
    </FeedbackContext.Provider>
  );
};

// Custom hook to use feedback context
export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
};