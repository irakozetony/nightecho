# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a full-stack feedback collection application built with React (frontend) and Express.js (backend), featuring real-time feedback submission, upvoting system, advanced search, and comprehensive API documentation. The project follows clean architecture principles with separated concerns for controllers, middleware, and validation layers.

## Common Commands

### Development Setup
```bash
# Initial setup - install dependencies for both frontend and backend
cd backend && npm install
cd ../frontend && npm install

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

### Development Workflow
```bash
# Start backend development server (runs on port 3001)
cd backend && npm run dev

# Start frontend development server (runs on port 5173)
cd frontend && npm run dev

# View API documentation (after starting backend)
# Visit: http://localhost:3001/api/docs
```

### Build and Production
```bash
# Build frontend for production
cd frontend && npm run build

# Start backend in production mode
cd backend && npm start

# Preview production build locally
cd frontend && npm run preview
```

### Linting and Code Quality
```bash
# Lint frontend code
cd frontend && npm run lint

# Note: Backend uses basic Node.js without additional linting configured
```

### Testing and Debugging
```bash
# Health check API endpoint
curl http://localhost:3001/api/health

# Test feedback creation
curl -X POST http://localhost:3001/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"title":"Test feedback","description":"Testing API","category":"improvement"}'

# Get feedback with search
curl "http://localhost:3001/api/feedback?search=test&limit=5"
```

### Database Management
```bash
# Check if database exists
ls -la backend/feedback.db

# Reset database (will be recreated automatically on next server start)
rm backend/feedback.db
```

## Architecture Overview

### Backend Architecture (Express.js)
The backend follows a clean layered architecture with clear separation of concerns:

```
backend/
├── controllers/         # Business logic layer
├── middleware/          # Request processing (validation, error handling)
├── validation/          # Input validation schemas and logic  
├── routes/              # Route definitions with Swagger documentation
├── database.js          # Database setup and prepared statements
├── swagger.js           # OpenAPI specification
└── server.js           # Express server configuration
```

**Key Architectural Patterns:**
- **Separation of Concerns**: Controllers handle business logic, middleware handles cross-cutting concerns
- **Input Validation**: Comprehensive validation with sanitization using custom validation layer
- **Database Optimization**: Uses better-sqlite3 with prepared statements and FTS5 for full-text search
- **Error Handling**: Centralized error middleware with consistent response formats
- **API Documentation**: Auto-generated Swagger docs from JSDoc comments

**Database Schema:**
- Uses SQLite with FTS5 for full-text search
- Optimized indexes on category, upvotes, and created_at columns
- Triggers maintain search index consistency
- Prepared statements prevent SQL injection

### Frontend Architecture (React)
Component-based architecture with global state management and custom hooks:

```
frontend/src/
├── components/
│   ├── feedback/        # Feedback-specific components (Card, Form)
│   ├── filters/         # Filter and search components  
│   ├── layout/          # Layout components
│   └── ui/             # Reusable UI components
├── context/            # Global state management (FeedbackContext)
├── hooks/              # Custom React hooks (useUpvotes for localStorage)
├── utils/              # Utility functions (API client with interceptors)
└── App.jsx            # Main application component
```

**Key Architectural Patterns:**
- **Context API + useReducer**: Global state management without Redux, with actions-based state updates
- **Custom Hooks**: Encapsulated logic (e.g., localStorage upvote tracking in `useUpvotes`)
- **Component Composition**: Reusable components with clear prop interfaces
- **Error Boundaries**: Graceful error handling at component level
- **API Layer**: Centralized HTTP client with axios interceptors for logging and error handling

### State Management Pattern
The application uses React Context with useReducer for predictable state management:
- Actions are defined as constants to prevent typos
- State updates are immutable using the reducer pattern
- Business logic is encapsulated in the context provider
- Components consume state via custom hook (`useFeedback`)

### Validation Architecture
Input validation follows a three-layer approach:
1. **Frontend**: Client-side validation for immediate user feedback
2. **Backend Middleware**: Server-side validation with detailed error messages
3. **Database**: Schema constraints and prepared statements for data integrity

## Development Guidelines

### Adding New Features

**Backend:**
1. Add validation schema in `validation/feedbackValidation.js`
2. Create middleware function in `middleware/validationMiddleware.js`
3. Implement business logic in `controllers/feedbackController.js`
4. Define routes with Swagger docs in `routes/feedbackRoutes.js`
5. Update database schema in `database.js` if needed

**Frontend:**
1. Add action types to `context/FeedbackContext.jsx`
2. Implement reducer logic for state updates
3. Create new components in appropriate directories
4. Add API methods to `utils/api.js`
5. Update context provider with new business logic

### Testing Strategy
- **Backend**: Use Swagger UI at `/api/docs` for interactive testing
- **Frontend**: Test user flows in development mode
- **API**: Use curl commands or Postman for endpoint testing
- **Database**: Check data integrity with SQLite browser tools

### Performance Considerations
- **Backend**: Uses prepared statements and database indexes
- **Frontend**: Uses React.memo and useCallback for optimized re-renders
- **API**: Implements pagination to limit response sizes
- **Search**: FTS5 virtual tables for efficient full-text search

## Deployment

### Vercel (Recommended)
The project is configured for Vercel deployment with `vercel.json`:
- Frontend build is served statically
- Backend runs as serverless functions
- API routes are proxied correctly
- Environment variables are injected automatically

### Environment Variables
**Backend (.env):**
- `PORT`: Server port (default: 3001)
- `FRONTEND_URL`: Frontend URL for CORS
- `NODE_ENV`: Environment mode

**Frontend (.env.local for dev, .env.production for prod):**
- `VITE_API_URL`: Backend API URL

## Troubleshooting

### Common Issues
- **CORS Issues**: Verify `FRONTEND_URL` in backend environment
- **Database Issues**: Check if `backend/feedback.db` exists and has correct permissions
- **Port Conflicts**: Backend uses 3001, frontend uses 5173 - change in env vars if needed
- **Build Issues**: Clear node_modules and reinstall if encountering dependency issues

### Database Reset
If you need to reset the database, simply delete `backend/feedback.db` - it will be recreated with proper schema on next server start.