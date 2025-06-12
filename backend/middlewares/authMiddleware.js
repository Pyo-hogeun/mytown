//인증미들웨어
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Authorization: Bearer <token> 형식으로 전달되었다고 가정
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ message: '인증 토큰이 없습니다.' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // decoded에 사용자 정보가 들어있음 (id, email 등)
    next();
  } catch (err) {
    res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};

module.exports = authMiddleware;
