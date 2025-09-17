# 📋 Feedback Board

A modern, full-stack feedback collection application built with React, Express, and SQLite. Features real-time feedback submission, upvoting system, advanced search, pagination, responsive design, and comprehensive API documentation with Swagger.

## ✨ Features

- **📝 Feedback Submission**: Easy-to-use form with client-side validation
- **👍 Upvoting System**: localStorage-based voting prevention per session
- **🔍 Advanced Search**: Full-text search with SQLite FTS5
- **📄 Pagination**: Efficient data loading with pagination support
- **🏷️ Category Filtering**: Filter by bug reports, feature requests, or improvements
- **🔄 Sorting**: Sort by most recent or most upvoted
- **📱 Responsive Design**: Mobile-first design with Tailwind CSS v3.4.0
- **🌙 Dark Mode**: Built-in theme switching with smooth transitions
- **📚 API Documentation**: Interactive Swagger UI documentation
- **🏗️ Clean Architecture**: Separated controllers, middleware, and validation layers
- **🚀 Production Ready**: Optimized for Vercel deployment

## 🛠️ Tech Stack

### Frontend
- **React** - UI library with hooks and context
- **Vite** - Build tool and development server
- **Tailwind CSS v3.4.0** - Modern styling framework with dark mode support
- **Axios** - HTTP client with interceptors
- **Context API** - Global state management

### Backend
- **Express.js** - Web framework with middleware
- **better-sqlite3** - High-performance SQLite database
- **Swagger** - OpenAPI documentation with interactive UI
- **CORS** - Cross-origin resource sharing
- **Clean Architecture** - Controllers, middleware, validation layers

### Database
- **SQLite** with full-text search (FTS5)
- **Prepared statements** for optimal performance
- **Database triggers** for search index maintenance
- **Indexed columns** for efficient querying

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd feedback-board
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables:**
   ```bash
   # Backend
   cd ../backend
   cp .env.example .env
   
   # Frontend (for development)
   cd ../frontend
   cp .env.example .env.local
   ```

### Development

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```
   Server runs on `http://localhost:3001`
   
   **📚 API Documentation available at `http://localhost:3001/api/docs`**

2. **Start the frontend development server:**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

### Production Build

```bash
# Build frontend
cd frontend
npm run build

# Start backend in production mode
cd ../backend
npm start
```

## 📚 API Documentation

### Interactive Documentation
Visit `http://localhost:3001/api/docs` for interactive Swagger UI documentation where you can:
- View all API endpoints with detailed descriptions
- See request/response schemas and examples
- Test API endpoints directly in the browser
- Download OpenAPI specification

### Base URL
- Development: `http://localhost:3001/api`
- Production: `/api`

### Quick Reference

#### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/feedback` | Get paginated feedback with filtering |
| `GET` | `/feedback/:id` | Get single feedback item |
| `POST` | `/feedback` | Create new feedback |
| `POST` | `/feedback/:id/upvote` | Upvote feedback item |
| `GET` | `/health` | Health check endpoint |
| `GET` | `/docs` | Interactive API documentation |

#### Query Parameters for GET /feedback

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | integer | Page number (default: 1) | `?page=2` |
| `limit` | integer | Items per page (1-50, default: 10) | `?limit=20` |
| `category` | string | Filter by category | `?category=bug` |
| `sortBy` | string | Sort by `recent` or `upvotes` | `?sortBy=upvotes` |
| `search` | string | Full-text search query | `?search=login` |

#### Example API Calls

```bash
# Get recent feedback
curl "http://localhost:3001/api/feedback?sortBy=recent&limit=5"

# Search for login-related feedback
curl "http://localhost:3001/api/feedback?search=login"

# Get bug reports sorted by upvotes
curl "http://localhost:3001/api/feedback?category=bug&sortBy=upvotes"

# Create new feedback
curl -X POST http://localhost:3001/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Add dark mode theme",
    "description": "Users would benefit from a dark mode option for better night-time viewing",
    "category": "feature"
  }'

# Upvote feedback
curl -X POST http://localhost:3001/api/feedback/1/upvote
```

### Response Format

All API responses follow consistent patterns:

**Success Response:**
```json
{
  "data": { /* response data */ },
  "message": "Success message", // For create/update operations
  "pagination": { /* pagination info */ }, // For list endpoints
  "filters": { /* applied filters */ } // For filtered endpoints
}
```

**Error Response:**
```json
{
  "error": "Error type",
  "message": "Human-readable error message",
  "details": ["Detailed validation errors"] // Optional
}
```

## 🏗️ Architecture

### Backend Architecture

```
backend/
├── controllers/          # Business logic
│   └── feedbackController.js
├── middleware/           # Request processing
│   ├── validationMiddleware.js
│   └── errorMiddleware.js
├── validation/          # Input validation schemas
│   └── feedbackValidation.js
├── routes/              # Route definitions with Swagger docs
│   └── feedbackRoutes.js
├── database.js          # Database setup and prepared queries
├── swagger.js           # OpenAPI specification
└── server.js           # Express server configuration
```

**Key Features:**
- **Separation of Concerns**: Controllers handle business logic, middleware handles cross-cutting concerns
- **Input Validation**: Comprehensive validation with detailed error messages
- **Error Handling**: Centralized error handling with consistent response format
- **Database Optimization**: Prepared statements and indexed queries
- **API Documentation**: Auto-generated from JSDoc comments

### Frontend Architecture

```
frontend/src/
├── components/
│   ├── feedback/        # Feedback-related components
│   │   ├── FeedbackCard.jsx
│   │   └── FeedbackForm.jsx
│   ├── filters/         # Filter and search components
│   │   └── FilterSidebar.jsx
│   ├── layout/          # Layout components
│   └── ui/             # Reusable UI components
│       ├── Button.jsx
│       └── ThemeSwitcher.jsx
├── context/            # Global state management
│   ├── FeedbackContext.jsx
│   └── ThemeContext.jsx
├── hooks/              # Custom React hooks
│   └── useUpvotes.js
├── utils/              # Utility functions
│   └── api.js
└── App.jsx            # Main application component
```

**Key Features:**
- **Component-Based**: Modular, reusable components
- **Context API**: Global state management without Redux
- **Custom Hooks**: Encapsulated logic (e.g., localStorage upvote tracking)
- **Dark Mode Theme**: System preference detection with manual toggle
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Error Boundaries**: Graceful error handling

## 🚀 Deployment

### Vercel Deployment (Recommended)

This project is configured for easy Vercel deployment:

1. **Connect your repository to Vercel**
2. **Configure environment variables in Vercel dashboard:**
   ```
   NODE_ENV=production
   ```
3. **Deploy** - Vercel will automatically build and deploy both frontend and backend

The `vercel.json` configuration handles:
- Static frontend build serving
- Serverless backend functions
- API route proxying
- Environment variable injection

### Manual Deployment

For other platforms:

1. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Set up environment variables**
3. **Deploy backend and frontend** to your platform of choice

## 🔧 Configuration

### Environment Variables

#### Backend (`.env`)
```bash
PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

#### Frontend (`.env.local`)
```bash
VITE_API_URL=http://localhost:3001/api
```

#### Production Frontend (`.env.production`)
```bash
VITE_API_URL=/api
```

### Database Configuration

The SQLite database is automatically created on first run with:
- **Feedback table** with optimized indexes
- **Full-text search table** using SQLite FTS5
- **Automatic triggers** to maintain search index consistency
- **Prepared statements** for all database operations

## 🧪 Testing

### Manual Testing Checklist

#### Backend API
- [ ] Health check endpoint responds
- [ ] Can create new feedback
- [ ] Can retrieve feedback with pagination
- [ ] Search functionality works
- [ ] Category filtering works
- [ ] Sorting by recent/upvotes works
- [ ] Upvoting increments count
- [ ] Swagger documentation loads
- [ ] Error handling returns proper status codes

#### Frontend
- [ ] Feedback form validates input
- [ ] Can submit new feedback
- [ ] Feedback list loads with pagination
- [ ] Search functionality works
- [ ] Filtering by category works
- [ ] Sorting toggle works
- [ ] Upvoting works (localStorage prevents duplicate votes)
- [ ] Dark mode theme toggle works properly
- [ ] Theme persists across browser sessions
- [ ] Responsive design works on mobile
- [ ] Error states display properly

### API Testing

Use the interactive Swagger UI at `/api/docs` or tools like Postman/curl:

```bash
# Health check
curl http://localhost:3001/api/health

# Test pagination
curl "http://localhost:3001/api/feedback?page=1&limit=5"

# Test search
curl "http://localhost:3001/api/feedback?search=test"

# Test feedback creation
curl -X POST http://localhost:3001/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"title":"Test feedback","description":"This is a test feedback for the API","category":"improvement"}'
```

## 📊 Performance Considerations

### Database
- **Indexed columns** for fast queries on category, upvotes, and created_at
- **Prepared statements** for optimal query performance
- **FTS5 virtual tables** for efficient full-text search
- **Connection pooling** via better-sqlite3

### Frontend
- **Code splitting** with Vite's automatic chunking
- **Lazy loading** of components when needed
- **Optimized re-renders** with React.memo and useCallback
- **Efficient state updates** with useReducer

### API
- **Pagination** to limit response sizes
- **Input validation** to prevent malformed requests
- **Error handling** to prevent crashes
- **CORS configuration** for secure cross-origin requests

## 🔒 Security Features

- **Input sanitization** and validation on all endpoints
- **SQL injection prevention** via prepared statements
- **XSS protection** via React's built-in escaping
- **CORS configuration** to control cross-origin access
- **Error message sanitization** to prevent information leakage

## 📋 Future Enhancements

- [ ] **User Authentication** - JWT-based user system
- [ ] **Real User Profiles** - User avatars and profiles
- [ ] **Comments System** - Threaded comments on feedback
- [ ] **Email Notifications** - Notify users of updates
- [ ] **Admin Dashboard** - Moderation and analytics
- [ ] **Status Tracking** - Open/in-progress/closed status
- [ ] **File Attachments** - Image and document uploads
- [ ] **Rate Limiting** - API rate limiting and throttling
- [ ] **Caching** - Redis caching for improved performance
- [ ] **Real-time Updates** - WebSocket support for live updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the existing architecture
4. Test thoroughly (both backend API and frontend)
5. Update documentation if needed
6. Submit a pull request

### Development Guidelines

- Follow the existing clean architecture patterns
- Add JSDoc comments for new API endpoints
- Update Swagger documentation for API changes
- Ensure responsive design for frontend changes
- Add proper error handling
- Write meaningful commit messages

## 🆘 Troubleshooting

### Common Issues

**Database Connection Issues:**
```bash
# Check if database file is created
ls -la backend/feedback.db

# Check database permissions
chmod 644 backend/feedback.db
```

**CORS Issues:**
- Verify `FRONTEND_URL` environment variable in backend
- Check browser developer console for CORS errors

**Build Issues:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Port Conflicts:**
- Backend default: 3001
- Frontend default: 5173
- Change ports in environment variables if needed

## 📄 License

This project is open source and available under the MIT License.

## 🎉 Acknowledgments

- **Inspired by** modern feedback collection systems like GitHub Issues and ProductHunt
- **Built with** clean architecture principles for maintainability
- **Designed for** scalability and production deployment
- **Documented with** comprehensive API documentation using OpenAPI/Swagger

---

**🚀 Ready to collect feedback? Start the servers and visit the app!**

- **Frontend:** http://localhost:5173
- **API Documentation:** http://localhost:3001/api/docs
- **Health Check:** http://localhost:3001/api/health