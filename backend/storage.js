// Simple storage implementation for Vercel serverless environment
const fs = require('fs');
const path = require('path');

class SimpleStorage {
  constructor() {
    this.data = {
      feedback: [],
      userVotes: [],
      nextId: 1
    };
    this.loadData();
  }

  loadData() {
    try {
      // Try to load from /tmp directory in serverless environment
      const dataPath = process.env.VERCEL ? '/tmp/data.json' : path.join(__dirname, 'data.json');
      if (fs.existsSync(dataPath)) {
        this.data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      }
    } catch (error) {
      console.log('Starting with fresh data store');
      // Add some sample data for testing
      this.addSampleData();
    }
  }

  saveData() {
    try {
      const dataPath = process.env.VERCEL ? '/tmp/data.json' : path.join(__dirname, 'data.json');
      fs.writeFileSync(dataPath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }

  addSampleData() {
    const sampleFeedback = [
      {
        id: 1,
        title: "Add dark mode support",
        description: "Would love to see a dark mode option for better user experience during night time usage.",
        category: "feature",
        upvotes: 15,
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 2,
        title: "Search functionality is slow",
        description: "The search feature takes too long to return results, especially with large datasets.",
        category: "bug",
        upvotes: 8,
        created_at: new Date(Date.now() - 43200000).toISOString()
      },
      {
        id: 3,
        title: "Improve mobile responsiveness",
        description: "Some elements don't display properly on mobile devices. The layout needs optimization for smaller screens.",
        category: "improvement",
        upvotes: 12,
        created_at: new Date(Date.now() - 21600000).toISOString()
      }
    ];
    
    this.data.feedback = sampleFeedback;
    this.data.nextId = 4;
    this.saveData();
  }

  // Feedback operations
  getFeedback(options = {}) {
    const { category, sortBy = 'recent', page = 1, limit = 10, search } = options;
    let feedback = [...this.data.feedback];

    // Filter by category
    if (category) {
      feedback = feedback.filter(item => item.category === category);
    }

    // Search functionality
    if (search) {
      const searchLower = search.toLowerCase();
      feedback = feedback.filter(item => 
        item.title.toLowerCase().includes(searchLower) || 
        item.description.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    if (sortBy === 'upvotes') {
      feedback.sort((a, b) => b.upvotes - a.upvotes);
    } else {
      feedback.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    // Pagination
    const offset = (page - 1) * limit;
    const paginatedFeedback = feedback.slice(offset, offset + limit);

    return {
      feedback: paginatedFeedback,
      total: feedback.length,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(feedback.length / limit)
    };
  }

  getFeedbackById(id) {
    return this.data.feedback.find(item => item.id === parseInt(id));
  }

  createFeedback(feedbackData) {
    const newFeedback = {
      id: this.data.nextId++,
      ...feedbackData,
      upvotes: 0,
      created_at: new Date().toISOString()
    };
    
    this.data.feedback.push(newFeedback);
    this.saveData();
    return newFeedback;
  }

  upvoteFeedback(id, sessionId) {
    const feedback = this.data.feedback.find(item => item.id === parseInt(id));
    if (!feedback) return null;

    // Check if user already voted
    const existingVote = this.data.userVotes.find(
      vote => vote.sessionId === sessionId && vote.feedbackId === parseInt(id)
    );

    if (existingVote) {
      if (existingVote.voteType === 'upvote') {
        // Remove upvote
        feedback.upvotes = Math.max(0, feedback.upvotes - 1);
        this.data.userVotes = this.data.userVotes.filter(
          vote => !(vote.sessionId === sessionId && vote.feedbackId === parseInt(id))
        );
      } else {
        // Change from downvote to upvote
        feedback.upvotes += 2;
        existingVote.voteType = 'upvote';
        existingVote.created_at = new Date().toISOString();
      }
    } else {
      // New upvote
      feedback.upvotes += 1;
      this.data.userVotes.push({
        sessionId,
        feedbackId: parseInt(id),
        voteType: 'upvote',
        created_at: new Date().toISOString()
      });
    }

    this.saveData();
    return feedback;
  }

  getUserVote(sessionId, feedbackId) {
    const vote = this.data.userVotes.find(
      vote => vote.sessionId === sessionId && vote.feedbackId === parseInt(feedbackId)
    );
    return vote ? vote.voteType : null;
  }

  // Get statistics
  getStats() {
    const totalFeedback = this.data.feedback.length;
    const totalUpvotes = this.data.feedback.reduce((sum, item) => sum + item.upvotes, 0);
    const categories = this.data.feedback.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    return {
      totalFeedback,
      totalUpvotes,
      categories
    };
  }
}

module.exports = new SimpleStorage();