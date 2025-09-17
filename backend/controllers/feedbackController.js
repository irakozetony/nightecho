const storage = require('../storage');

const getFeedback = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      sortBy = 'recent',
      search
    } = req.query;

    // Validate parameters
    const validatedPage = Math.max(1, parseInt(page) || 1);
    const validatedLimit = Math.min(50, Math.max(1, parseInt(limit) || 10));
    const validSortBy = ['recent', 'upvotes'].includes(sortBy) ? sortBy : 'recent';
    const validCategory = ['bug', 'feature', 'improvement'].includes(category) ? category : null;

    const result = storage.getFeedback({
      page: validatedPage,
      limit: validatedLimit,
      category: validCategory,
      sortBy: validSortBy,
      search: search?.trim()
    });

    res.json({
      data: result.feedback,
      pagination: {
        currentPage: result.page,
        totalPages: result.totalPages,
        totalItems: result.total,
        itemsPerPage: result.limit,
        hasNext: result.page < result.totalPages,
        hasPrev: result.page > 1
      },
      filters: {
        category: validCategory,
        sortBy: validSortBy,
        search: search || null
      }
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      error: 'Failed to fetch feedback'
    });
  }
};

const getFeedbackById = async (req, res) => {
  try {
    const { id } = req.params;
    const feedback = storage.getFeedbackById(parseInt(id));
    
    if (!feedback) {
      return res.status(404).json({ 
        error: 'Feedback not found',
        message: `No feedback found with ID ${id}`
      });
    }
    
    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback by ID:', error);
    res.status(500).json({
      error: 'Failed to fetch feedback'
    });
  }
};

const createFeedback = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    
    // Basic validation
    if (!title || !description || !category) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Title, description, and category are required'
      });
    }
    
    if (!['bug', 'feature', 'improvement'].includes(category)) {
      return res.status(400).json({
        error: 'Invalid category',
        message: 'Category must be one of: bug, feature, improvement'
      });
    }
    
    const newFeedback = storage.createFeedback({
      title: title.trim(),
      description: description.trim(),
      category
    });
    
    res.status(201).json({
      message: 'Feedback created successfully',
      data: newFeedback
    });
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({
      error: 'Failed to create feedback'
    });
  }
};

const upvoteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const sessionId = req.headers['x-session-id'] || 'anonymous';
    
    const updatedFeedback = storage.upvoteFeedback(parseInt(id), sessionId);
    
    if (!updatedFeedback) {
      return res.status(404).json({ 
        error: 'Feedback not found',
        message: `No feedback found with ID ${id}`
      });
    }
    
    res.json({
      message: 'Feedback upvoted successfully',
      data: updatedFeedback
    });
  } catch (error) {
    console.error('Error upvoting feedback:', error);
    res.status(500).json({
      error: 'Failed to upvote feedback'
    });
  }
};

const getHealthStatus = async (req, res) => {
  try {
    const stats = storage.getStats();
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      storage: 'connected',
      stats
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(),
      storage: 'disconnected',
      error: error.message
    });
  }
};

const getUserVoteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const sessionId = req.headers['x-session-id'] || 'anonymous';
    
    const voteType = storage.getUserVote(sessionId, parseInt(id));
    
    res.json({
      hasVoted: !!voteType,
      voteType: voteType || null
    });
  } catch (error) {
    console.error('Error getting vote status:', error);
    res.status(500).json({
      error: 'Failed to get vote status'
    });
  }
};

module.exports = {
  getFeedback,
  getFeedbackById,
  createFeedback,
  upvoteFeedback,
  getUserVoteStatus,
  getHealthStatus
};
