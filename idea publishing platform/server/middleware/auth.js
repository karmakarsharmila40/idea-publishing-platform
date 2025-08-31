const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Check JWT_SECRET
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ msg: 'JWT_SECRET not configured' });
  }

  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};