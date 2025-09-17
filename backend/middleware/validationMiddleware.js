const { validateCreateFeedback, validateQueryParams, validateId } = require('../validation/feedbackValidation');

const validateFeedbackCreation = (req, res, next) => {
  const validation = validateCreateFeedback(req.body);
  
  if (!validation.isValid) {
    return res.status(400).json({
      error: 'Validation failed',
      details: validation.errors
    });
  }
  
  // Attach sanitized data to request for use in controller
  req.validatedData = validation.sanitized;
  next();
};

const validateFeedbackQuery = (req, res, next) => {
  const validation = validateQueryParams(req.query);
  
  if (!validation.isValid) {
    return res.status(400).json({
      error: 'Invalid query parameters',
      details: validation.errors
    });
  }
  
  // Attach sanitized query params to request
  req.validatedQuery = validation.sanitized;
  next();
};

const validateFeedbackId = (req, res, next) => {
  const validation = validateId(req.params.id);
  
  if (!validation.isValid) {
    return res.status(400).json({
      error: 'Invalid ID parameter',
      details: validation.errors
    });
  }
  
  // Attach sanitized ID to request
  req.validatedId = validation.sanitized;
  next();
};

module.exports = {
  validateFeedbackCreation,
  validateFeedbackQuery,
  validateFeedbackId
};