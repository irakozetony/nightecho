const express = require('express');
const router = express.Router();

const {
  getFeedback,
  getFeedbackById,
  createFeedback,
  upvoteFeedback,
  getUserVoteStatus,
  getHealthStatus
} = require('../controllers/feedbackController');

const {
  validateFeedbackCreation,
  validateFeedbackQuery,
  validateFeedbackId
} = require('../middleware/validationMiddleware');

const { asyncWrapper } = require('../middleware/errorMiddleware');

/**
 * @swagger
 * /feedback:
 *   get:
 *     summary: Get paginated feedback with optional filtering and search
 *     description: Retrieve a paginated list of feedback items with support for category filtering, sorting, and full-text search
 *     tags: [Feedback]
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/CategoryParam'
 *       - $ref: '#/components/parameters/SortParam'
 *       - $ref: '#/components/parameters/SearchParam'
 *       - $ref: '#/components/parameters/MyUpvotesParam'
 *     responses:
 *       200:
 *         description: Successfully retrieved feedback list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedFeedbackResponse'
 *             examples:
 *               default:
 *                 value:
 *                   data:
 *                     - id: 1
 *                       title: "Login issue on mobile"
 *                       description: "Cannot access account using mobile browser"
 *                       category: "bug"
 *                       upvotes: 5
 *                       created_at: "2024-01-15T10:30:00.000Z"
 *                   pagination:
 *                     currentPage: 1
 *                     totalPages: 3
 *                     totalItems: 25
 *                     itemsPerPage: 10
 *                     hasNext: true
 *                     hasPrev: false
 *                   filters:
 *                     category: null
 *                     sortBy: "recent"
 *                     search: null
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/', 
  validateFeedbackQuery,
  asyncWrapper(getFeedback)
);

/**
 * @swagger
 * /feedback/{id}:
 *   get:
 *     summary: Get a single feedback item by ID
 *     description: Retrieve detailed information about a specific feedback item
 *     tags: [Feedback]
 *     parameters:
 *       - $ref: '#/components/parameters/FeedbackIdParam'
 *     responses:
 *       200:
 *         description: Successfully retrieved feedback item
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Feedback'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/:id', 
  validateFeedbackId,
  asyncWrapper(getFeedbackById)
);

/**
 * @swagger
 * /feedback:
 *   post:
 *     summary: Create new feedback
 *     description: Submit new feedback with title, description, and category
 *     tags: [Feedback]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFeedbackRequest'
 *           examples:
 *             bug-report:
 *               summary: Bug report example
 *               value:
 *                 title: "Login button not responding"
 *                 description: "When I click the login button on the homepage, nothing happens. This occurs in both Chrome and Firefox browsers."
 *                 category: "bug"
 *             feature-request:
 *               summary: Feature request example  
 *               value:
 *                 title: "Add dark mode theme"
 *                 description: "It would be great to have a dark mode option for users who prefer darker interfaces, especially for night-time usage."
 *                 category: "feature"
 *             improvement:
 *               summary: Improvement suggestion
 *               value:
 *                 title: "Improve loading speed"
 *                 description: "The dashboard takes too long to load. Consider implementing lazy loading or caching to improve performance."
 *                 category: "improvement"
 *     responses:
 *       201:
 *         description: Feedback created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateFeedbackResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post('/', 
  validateFeedbackCreation,
  asyncWrapper(createFeedback)
);

/**
 * @swagger
 * /feedback/{id}/upvote:
 *   post:
 *     summary: Upvote a feedback item
 *     description: Increment the upvote count for a specific feedback item
 *     tags: [Feedback]
 *     parameters:
 *       - $ref: '#/components/parameters/FeedbackIdParam'
 *     responses:
 *       200:
 *         description: Feedback upvoted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpvoteResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post('/:id/upvote', 
  validateFeedbackId,
  asyncWrapper(upvoteFeedback)
);

/**
 * @swagger
 * /feedback/{id}/vote-status:
 *   get:
 *     summary: Get user's vote status for a feedback item
 *     description: Check if the current user has voted on a specific feedback item
 *     tags: [Feedback]
 *     parameters:
 *       - $ref: '#/components/parameters/FeedbackIdParam'
 *     responses:
 *       200:
 *         description: Successfully retrieved vote status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hasVoted:
 *                   type: boolean
 *                   example: true
 *                 voteType:
 *                   type: string
 *                   enum: [upvote, downvote]
 *                   nullable: true
 *                   example: upvote
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/:id/vote-status', 
  validateFeedbackId,
  asyncWrapper(getUserVoteStatus)
);

// Health check is handled in main server.js to avoid conflicts

module.exports = router;