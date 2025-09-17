const { statements } = require('../database');

const getFeedback = async (req, res) => {
  const {
    page,
    limit,
    category,
    sortBy,
    search,
    myUpvotes
  } = req.validatedQuery;

  const offset = (page - 1) * limit;
  const sessionId = req.sessionId;
  let feedback, totalCount;

  if (myUpvotes === 'true') {
    // Filter for user's upvoted feedback
    if (search) {
      const searchQuery = search.split(' ')
        .filter(term => term.length > 0)
        .map(term => `"${term}"`)
        .join(' OR ');
      
      feedback = statements.searchMyUpvotedFeedback.all(
        searchQuery,
        sessionId,
        category,
        category,
        sortBy,
        sortBy,
        limit,
        offset
      );

      totalCount = statements.getMyUpvotedSearchCount.get(
        searchQuery,
        sessionId,
        category,
        category
      ).total;
    } else {
      feedback = statements.getMyUpvotedFeedback.all(
        sessionId,
        category,
        category,
        sortBy,
        sortBy,
        limit,
        offset
      );

      totalCount = statements.getMyUpvotedFeedbackCount.get(
        sessionId,
        category,
        category
      ).total;
    }
  } else {
    // Regular query (all feedback)
    if (search) {
      // Search with FTS5
      const searchQuery = search.split(' ')
        .filter(term => term.length > 0)
        .map(term => `"${term}"`)
        .join(' OR ');
      
      feedback = statements.searchFeedback.all(
        searchQuery,
        category,
        category,
        sortBy,
        sortBy,
        limit,
        offset
      );

      totalCount = statements.getSearchCount.get(
        searchQuery,
        category,
        category
      ).total;
    } else {
      // Regular query with filtering
      feedback = statements.getFeedback.all(
        category,
        category,
        sortBy,
        sortBy,
        limit,
        offset
      );

      totalCount = statements.getFeedbackCount.get(
        category,
        category
      ).total;
    }
  }

  const totalPages = Math.ceil(totalCount / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  res.json({
    data: feedback,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: totalCount,
      itemsPerPage: limit,
      hasNext,
      hasPrev
    },
    filters: {
      category,
      sortBy,
      search
    }
  });
};

const getFeedbackById = async (req, res) => {
  const id = req.validatedId;
  const feedback = statements.getFeedbackById.get(id);
  
  if (!feedback) {
    return res.status(404).json({ 
      error: 'Feedback not found',
      message: `No feedback found with ID ${id}`
    });
  }
  
  res.json(feedback);
};

const createFeedback = async (req, res) => {
  const { title, description, category } = req.validatedData;
  
  const result = statements.createFeedback.run(title, description, category);
  const newFeedback = statements.getFeedbackById.get(result.lastInsertRowid);
  
  res.status(201).json({
    message: 'Feedback created successfully',
    data: newFeedback
  });
};

const upvoteFeedback = async (req, res) => {
  const id = req.validatedId;
  const sessionId = req.sessionId;
  
  // Check if feedback exists
  const feedback = statements.getFeedbackById.get(id);
  if (!feedback) {
    return res.status(404).json({ 
      error: 'Feedback not found',
      message: `No feedback found with ID ${id}`
    });
  }
  
  // Check if user has already voted
  const existingVote = statements.getUserVote.get(sessionId, id);
  
  let message;
  let action;
  
  if (existingVote && existingVote.vote_type === 'upvote') {
    // User is removing their upvote
    statements.downvoteFeedback.run(id);
    statements.removeUserVote.run(sessionId, id);
    message = 'Upvote removed successfully';
    action = 'removed';
  } else {
    // User is adding an upvote (or switching from downvote)
    statements.upvoteFeedback.run(id);
    statements.addUserVote.run(sessionId, id, 'upvote');
    message = 'Feedback upvoted successfully';
    action = 'added';
  }
  
  const updatedFeedback = statements.getFeedbackById.get(id);
  
  res.json({
    message,
    action,
    data: updatedFeedback
  });
};

const getHealthStatus = async (req, res) => {
  // Basic health check - could be expanded to check database connectivity
  try {
    // Test database connection
    statements.getFeedbackCount.get(null, null);
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
};

const getUserVoteStatus = async (req, res) => {
  const id = req.validatedId;
  const sessionId = req.sessionId;
  
  const vote = statements.getUserVote.get(sessionId, id);
  
  res.json({
    hasVoted: !!vote,
    voteType: vote?.vote_type || null
  });
};

module.exports = {
  getFeedback,
  getFeedbackById,
  createFeedback,
  upvoteFeedback,
  getUserVoteStatus,
  getHealthStatus
};
