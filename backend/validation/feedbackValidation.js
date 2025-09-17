const VALID_CATEGORIES = ['bug', 'feature', 'improvement'];
const VALID_SORT_OPTIONS = ['recent', 'upvotes'];

const validateCreateFeedback = (data) => {
  const errors = [];
  
  if (!data.title || typeof data.title !== 'string') {
    errors.push('Title is required and must be a string');
  } else if (data.title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long');
  } else if (data.title.trim().length > 200) {
    errors.push('Title must be less than 200 characters');
  }
  
  if (!data.description || typeof data.description !== 'string') {
    errors.push('Description is required and must be a string');
  } else if (data.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters long');
  } else if (data.description.trim().length > 2000) {
    errors.push('Description must be less than 2000 characters');
  }
  
  if (!data.category || typeof data.category !== 'string') {
    errors.push('Category is required and must be a string');
  } else if (!VALID_CATEGORIES.includes(data.category)) {
    errors.push(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? {
      title: data.title.trim(),
      description: data.description.trim(),
      category: data.category
    } : null
  };
};

const validateQueryParams = (query) => {
  const errors = [];
  const sanitized = {};
  
  // Validate page
  if (query.page) {
    const page = parseInt(query.page);
    if (isNaN(page) || page < 1) {
      errors.push('Page must be a positive integer');
    } else {
      sanitized.page = page;
    }
  } else {
    sanitized.page = 1;
  }
  
  // Validate limit
  if (query.limit) {
    const limit = parseInt(query.limit);
    if (isNaN(limit) || limit < 1 || limit > 50) {
      errors.push('Limit must be between 1 and 50');
    } else {
      sanitized.limit = limit;
    }
  } else {
    sanitized.limit = 10;
  }
  
  // Validate category
  if (query.category) {
    if (!VALID_CATEGORIES.includes(query.category)) {
      errors.push(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`);
    } else {
      sanitized.category = query.category;
    }
  } else {
    sanitized.category = null;
  }
  
  // Validate sortBy
  if (query.sortBy) {
    if (!VALID_SORT_OPTIONS.includes(query.sortBy)) {
      errors.push(`SortBy must be one of: ${VALID_SORT_OPTIONS.join(', ')}`);
    } else {
      sanitized.sortBy = query.sortBy;
    }
  } else {
    sanitized.sortBy = 'recent';
  }
  
  // Validate search
  if (query.search) {
    if (typeof query.search !== 'string') {
      errors.push('Search must be a string');
    } else if (query.search.trim().length > 100) {
      errors.push('Search query must be less than 100 characters');
    } else {
      sanitized.search = query.search.trim() || null;
    }
  } else {
    sanitized.search = null;
  }
  
  // Validate myUpvotes
  if (query.myUpvotes) {
    const myUpvotesStr = query.myUpvotes.toString().toLowerCase();
    if (!['true', 'false'].includes(myUpvotesStr)) {
      errors.push('myUpvotes must be true or false');
    } else {
      sanitized.myUpvotes = myUpvotesStr;
    }
  } else {
    sanitized.myUpvotes = 'false';
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? sanitized : null
  };
};

const validateId = (id) => {
  const errors = [];
  const numId = parseInt(id);
  
  if (isNaN(numId) || numId < 1) {
    errors.push('ID must be a positive integer');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? numId : null
  };
};

module.exports = {
  validateCreateFeedback,
  validateQueryParams,
  validateId,
  VALID_CATEGORIES,
  VALID_SORT_OPTIONS
};