//인증미들웨어
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ message: '인증이 필요합니다.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // userId, name 포함
    next();
  } catch (err) {
    res.status(403).json({ message: '토큰이 유효하지 않습니다.' });
  }
};

module.exports = authMiddleware;
