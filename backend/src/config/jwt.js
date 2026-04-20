module.exports = {
  secret: process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-prod',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
};
