const express = require('express');
const cors = require('cors');
require('dotenv').config();

const feedbackRoutes = require('./routes/feedbackRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');
const { sessionMiddleware } = require('./middleware/sessionMiddleware');
const { specs, swaggerUi, swaggerUiOptions } = require('./swagger');

const app = express();
const PORT = process.env.PORT || 3001;

// Global middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Get allowed origins from environment variable, fallback to default
    const allowedOriginsString = process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:5173';
    const allowedOrigins = allowedOriginsString.split(',').map(origin => origin.trim());
    
    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      // Handle regex patterns (for vercel app domains)
      if (allowedOrigin.includes('*') || allowedOrigin.includes('\\')) {
        try {
          const regex = new RegExp(allowedOrigin.replace(/\*/g, '.*'));
          return regex.test(origin);
        } catch (e) {
          return false;
        }
      }
      // Handle exact matches
      return origin === allowedOrigin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(sessionMiddleware);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));

// Routes
app.use('/api/feedback', feedbackRoutes);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the current status of the API service
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy and running
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *             example:
 *               status: "OK"
 *               timestamp: "2024-01-15T10:30:00.000Z"
 *               service: "feedback-board-api"
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'feedback-board-api'
  });
});

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Feedback Board API Server running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}/api/docs`);
  console.log('\n📋 Available endpoints:');
  console.log('  GET    /api/feedback           - List feedback (with pagination, search, filtering)');
  console.log('  GET    /api/feedback/:id       - Get single feedback item');
  console.log('  POST   /api/feedback           - Create new feedback');
  console.log('  POST   /api/feedback/:id/upvote - Upvote feedback');
  console.log('  GET    /api/health             - Health check');
  console.log('  GET    /api/docs               - Interactive API documentation (Swagger UI)');
  console.log('\n🔧 Query parameters for GET /api/feedback:');
  console.log('  - page: Page number (default: 1)');
  console.log('  - limit: Items per page (default: 10, max: 50)');
  console.log('  - category: Filter by category (bug|feature|improvement)');
  console.log('  - sortBy: Sort order (recent|upvotes, default: recent)');
  console.log('  - search: Search in title and description');
  
  console.log('\n💡 Pro tip: Visit /api/docs for interactive API testing!');
  console.log('💾 Database initialized and ready');
});
