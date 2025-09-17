const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const db = new Database(path.join(__dirname, 'feedback.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('bug', 'feature', 'improvement')),
    upvotes INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_feedback_category ON feedback(category);
  CREATE INDEX IF NOT EXISTS idx_feedback_upvotes ON feedback(upvotes);
  CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);
  
  -- User votes tracking table
  CREATE TABLE IF NOT EXISTS user_votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    feedback_id INTEGER NOT NULL,
    vote_type TEXT NOT NULL CHECK(vote_type IN ('upvote', 'downvote')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (feedback_id) REFERENCES feedback(id) ON DELETE CASCADE,
    UNIQUE(session_id, feedback_id)
  );
  
  CREATE INDEX IF NOT EXISTS idx_user_votes_session ON user_votes(session_id);
  CREATE INDEX IF NOT EXISTS idx_user_votes_feedback ON user_votes(feedback_id);
  
  -- Full-text search index for title and description
  CREATE VIRTUAL TABLE IF NOT EXISTS feedback_search USING fts5(
    title, description, content='feedback', content_rowid='id'
  );

  -- Trigger to keep search index in sync
  CREATE TRIGGER IF NOT EXISTS feedback_search_insert AFTER INSERT ON feedback BEGIN
    INSERT INTO feedback_search(rowid, title, description) 
    VALUES (new.id, new.title, new.description);
  END;

  CREATE TRIGGER IF NOT EXISTS feedback_search_delete AFTER DELETE ON feedback BEGIN
    INSERT INTO feedback_search(feedback_search, rowid, title, description) 
    VALUES('delete', old.id, old.title, old.description);
  END;

  CREATE TRIGGER IF NOT EXISTS feedback_search_update AFTER UPDATE ON feedback BEGIN
    INSERT INTO feedback_search(feedback_search, rowid, title, description) 
    VALUES('delete', old.id, old.title, old.description);
    INSERT INTO feedback_search(rowid, title, description) 
    VALUES (new.id, new.title, new.description);
  END;
`);

// Prepare statements for better performance
const statements = {
  // Get feedback with pagination and filtering
  getFeedback: db.prepare(`
    SELECT * FROM feedback 
    WHERE 
      CASE 
        WHEN ? IS NOT NULL THEN category = ?
        ELSE 1 = 1
      END
    ORDER BY 
      CASE WHEN ? = 'upvotes' THEN upvotes END DESC,
      CASE WHEN ? = 'recent' THEN created_at END DESC,
      created_at DESC
    LIMIT ? OFFSET ?
  `),
  
  // Get total count for pagination
  getFeedbackCount: db.prepare(`
    SELECT COUNT(*) as total FROM feedback 
    WHERE 
      CASE 
        WHEN ? IS NOT NULL THEN category = ?
        ELSE 1 = 1
      END
  `),
  
  // Search feedback with pagination
  searchFeedback: db.prepare(`
    SELECT f.*, rank FROM feedback f
    JOIN feedback_search fs ON f.id = fs.rowid
    WHERE feedback_search MATCH ?
    AND (? IS NULL OR f.category = ?)
    ORDER BY 
      CASE WHEN ? = 'upvotes' THEN f.upvotes END DESC,
      CASE WHEN ? = 'recent' THEN f.created_at END DESC,
      rank
    LIMIT ? OFFSET ?
  `),
  
  // Get search count for pagination
  getSearchCount: db.prepare(`
    SELECT COUNT(*) as total FROM feedback f
    JOIN feedback_search fs ON f.id = fs.rowid
    WHERE feedback_search MATCH ?
    AND (? IS NULL OR f.category = ?)
  `),
  
  createFeedback: db.prepare(`
    INSERT INTO feedback (title, description, category)
    VALUES (?, ?, ?)
  `),
  
  upvoteFeedback: db.prepare(`
    UPDATE feedback 
    SET upvotes = upvotes + 1 
    WHERE id = ?
  `),
  
  downvoteFeedback: db.prepare(`
    UPDATE feedback 
    SET upvotes = upvotes - 1 
    WHERE id = ? AND upvotes > 0
  `),
  
  getUserVote: db.prepare(`
    SELECT vote_type FROM user_votes 
    WHERE session_id = ? AND feedback_id = ?
  `),
  
  addUserVote: db.prepare(`
    INSERT OR REPLACE INTO user_votes (session_id, feedback_id, vote_type)
    VALUES (?, ?, ?)
  `),
  
  removeUserVote: db.prepare(`
    DELETE FROM user_votes 
    WHERE session_id = ? AND feedback_id = ?
  `),
  
  // Get feedback filtered by user votes
  getMyUpvotedFeedback: db.prepare(`
    SELECT f.* FROM feedback f
    JOIN user_votes uv ON f.id = uv.feedback_id
    WHERE uv.session_id = ? AND uv.vote_type = 'upvote'
    AND (
      CASE 
        WHEN ? IS NOT NULL THEN f.category = ?
        ELSE 1 = 1
      END
    )
    ORDER BY 
      CASE WHEN ? = 'upvotes' THEN f.upvotes END DESC,
      CASE WHEN ? = 'recent' THEN f.created_at END DESC,
      f.created_at DESC
    LIMIT ? OFFSET ?
  `),
  
  // Get count of user upvoted feedback
  getMyUpvotedFeedbackCount: db.prepare(`
    SELECT COUNT(*) as total FROM feedback f
    JOIN user_votes uv ON f.id = uv.feedback_id
    WHERE uv.session_id = ? AND uv.vote_type = 'upvote'
    AND (
      CASE 
        WHEN ? IS NOT NULL THEN f.category = ?
        ELSE 1 = 1
      END
    )
  `),
  
  // Search within user upvoted feedback
  searchMyUpvotedFeedback: db.prepare(`
    SELECT f.*, rank FROM feedback f
    JOIN feedback_search fs ON f.id = fs.rowid
    JOIN user_votes uv ON f.id = uv.feedback_id
    WHERE feedback_search MATCH ?
    AND uv.session_id = ? AND uv.vote_type = 'upvote'
    AND (? IS NULL OR f.category = ?)
    ORDER BY 
      CASE WHEN ? = 'upvotes' THEN f.upvotes END DESC,
      CASE WHEN ? = 'recent' THEN f.created_at END DESC,
      rank
    LIMIT ? OFFSET ?
  `),
  
  // Get search count for user upvoted feedback
  getMyUpvotedSearchCount: db.prepare(`
    SELECT COUNT(*) as total FROM feedback f
    JOIN feedback_search fs ON f.id = fs.rowid
    JOIN user_votes uv ON f.id = uv.feedback_id
    WHERE feedback_search MATCH ?
    AND uv.session_id = ? AND uv.vote_type = 'upvote'
    AND (? IS NULL OR f.category = ?)
  `),
  
  getFeedbackById: db.prepare('SELECT * FROM feedback WHERE id = ?')
};

module.exports = {
  db,
  statements
};