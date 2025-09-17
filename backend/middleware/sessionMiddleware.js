const crypto = require('crypto');

const sessionMiddleware = (req, res, next) => {
  // Get session ID from cookie or create new one
  let sessionId = req.headers['x-session-id'] || req.headers['cookie']?.match(/sessionId=([^;]+)/)?.[1];
  
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    // Set session cookie that expires in 30 days
    res.setHeader('Set-Cookie', `sessionId=${sessionId}; Max-Age=${30 * 24 * 60 * 60}; HttpOnly; SameSite=Strict; Path=/`);
  }
  
  // Attach session ID to request
  req.sessionId = sessionId;
  next();
};

module.exports = { sessionMiddleware };