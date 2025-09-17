const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Feedback Board API',
      version: '1.0.0',
      description: `
        A comprehensive feedback collection API with advanced features including:
        - Full-text search using SQLite FTS5
        - Pagination for efficient data loading  
        - Category filtering and sorting
        - Upvoting system with validation
        - Clean architecture with separated concerns
        
        ## Features
        - ✅ RESTful API design
        - ✅ Input validation and sanitization
        - ✅ Error handling with consistent responses
        - ✅ Pagination support
        - ✅ Full-text search capabilities
        - ✅ Category filtering
        - ✅ Sorting options (recent/upvotes)
        - ✅ SQLite database with optimized queries
      `,
      contact: {
        name: 'API Support',
        email: 'support@feedbackboard.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: 'Development server'
      },
      {
        url: '/api',
        description: 'Production server'
      }
    ],
    tags: [
      {
        name: 'Feedback',
        description: 'Feedback management operations'
      },
      {
        name: 'Health',
        description: 'System health monitoring'
      }
    ],
    components: {
      schemas: {
        Feedback: {
          type: 'object',
          required: ['id', 'title', 'description', 'category', 'upvotes', 'created_at'],
          properties: {
            id: {
              type: 'integer',
              description: 'Unique identifier for the feedback',
              example: 1
            },
            title: {
              type: 'string',
              minLength: 3,
              maxLength: 200,
              description: 'Brief summary of the feedback',
              example: 'Login issue on mobile devices'
            },
            description: {
              type: 'string',
              minLength: 10,
              maxLength: 2000,
              description: 'Detailed description of the feedback',
              example: 'Users are experiencing difficulties logging in when using mobile browsers. The login form appears to be unresponsive on smaller screens.'
            },
            category: {
              type: 'string',
              enum: ['bug', 'feature', 'improvement'],
              description: 'Category of the feedback',
              example: 'bug'
            },
            upvotes: {
              type: 'integer',
              minimum: 0,
              description: 'Number of upvotes received',
              example: 5
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the feedback was created',
              example: '2024-01-15T10:30:00.000Z'
            }
          }
        },
        CreateFeedbackRequest: {
          type: 'object',
          required: ['title', 'description', 'category'],
          properties: {
            title: {
              type: 'string',
              minLength: 3,
              maxLength: 200,
              description: 'Brief summary of the feedback',
              example: 'Add dark mode theme'
            },
            description: {
              type: 'string',
              minLength: 10,
              maxLength: 2000,
              description: 'Detailed description of the feedback',
              example: 'It would be great to have a dark mode option for users who prefer darker interfaces, especially for night-time usage.'
            },
            category: {
              type: 'string',
              enum: ['bug', 'feature', 'improvement'],
              description: 'Category of the feedback',
              example: 'feature'
            }
          }
        },
        PaginatedFeedbackResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Feedback'
              },
              description: 'Array of feedback items'
            },
            pagination: {
              type: 'object',
              properties: {
                currentPage: {
                  type: 'integer',
                  example: 1
                },
                totalPages: {
                  type: 'integer',
                  example: 5
                },
                totalItems: {
                  type: 'integer',
                  example: 48
                },
                itemsPerPage: {
                  type: 'integer',
                  example: 10
                },
                hasNext: {
                  type: 'boolean',
                  example: true
                },
                hasPrev: {
                  type: 'boolean',
                  example: false
                }
              }
            },
            filters: {
              type: 'object',
              properties: {
                category: {
                  type: 'string',
                  nullable: true,
                  example: 'bug'
                },
                sortBy: {
                  type: 'string',
                  example: 'recent'
                },
                search: {
                  type: 'string',
                  nullable: true,
                  example: 'login'
                }
              }
            }
          }
        },
        CreateFeedbackResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Feedback created successfully'
            },
            data: {
              $ref: '#/components/schemas/Feedback'
            }
          }
        },
        UpvoteResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Feedback upvoted successfully'
            },
            data: {
              $ref: '#/components/schemas/Feedback'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error type',
              example: 'Validation failed'
            },
            message: {
              type: 'string',
              description: 'Human-readable error message',
              example: 'The request contains invalid data'
            },
            details: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Detailed validation errors (optional)',
              example: ['Title is required', 'Category must be one of: bug, feature, improvement']
            }
          }
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'OK'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00.000Z'
            },
            service: {
              type: 'string',
              example: 'feedback-board-api'
            }
          }
        }
      },
      parameters: {
        PageParam: {
          name: 'page',
          in: 'query',
          description: 'Page number for pagination',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1
          }
        },
        LimitParam: {
          name: 'limit',
          in: 'query',
          description: 'Number of items per page',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 50,
            default: 10
          }
        },
        CategoryParam: {
          name: 'category',
          in: 'query',
          description: 'Filter by feedback category',
          required: false,
          schema: {
            type: 'string',
            enum: ['bug', 'feature', 'improvement']
          }
        },
        SortParam: {
          name: 'sortBy',
          in: 'query',
          description: 'Sort feedback by criteria',
          required: false,
          schema: {
            type: 'string',
            enum: ['recent', 'upvotes'],
            default: 'recent'
          }
        },
        SearchParam: {
          name: 'search',
          in: 'query',
          description: 'Search in title and description using full-text search',
          required: false,
          schema: {
            type: 'string',
            maxLength: 100
          }
        },
        FeedbackIdParam: {
          name: 'id',
          in: 'path',
          description: 'Feedback ID',
          required: true,
          schema: {
            type: 'integer',
            minimum: 1
          }
        },
        MyUpvotesParam: {
          name: 'myUpvotes',
          in: 'query',
          description: 'Filter to show only feedback items upvoted by the current user',
          required: false,
          schema: {
            type: 'boolean',
            default: false
          }
        }
      },
      responses: {
        BadRequest: {
          description: 'Bad request - Invalid input data',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        InternalError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js', './server.js'], // Path to the API files
};

const specs = swaggerJSDoc(options);

const swaggerUiOptions = {
  customCss: `
    .topbar-wrapper img { content: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTcgOGgxMG0wIDBWNmEyIDIgMCAwIDAtMi0ySDlhMiAyIDAgMCAwLTIgMnYybTEwIDB2MTBhMiAyIDAgMCAxLTIgMkg5YTIgMiAwIDAgMS0yLTJWOG0xMCAwSDciIHN0cm9rZT0iIzM5NzNkYyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHN2Zz4='); height: 40px; width: auto; }
    .topbar-wrapper .link { display: none; }
    .swagger-ui .topbar { background-color: #3973dc; }
  `,
  customSiteTitle: 'Feedback Board API Documentation',
  customfavIcon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTcgOGgxMG0wIDBWNmEyIDIgMCAwIDAtMi0ySDlhMiAyIDAgMCAwLTIgMnYybTEwIDB2MTBhMiAyIDAgMCAxLTIgMkg5YTIgMiAwIDAgMS0yLTJWOG0xMCAwSDciIHN0cm9rZT0iIzM5NzNkYyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHN2Zz4='
};

module.exports = {
  specs,
  swaggerUi,
  swaggerUiOptions
};