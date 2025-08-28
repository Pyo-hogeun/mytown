// middleware/authMiddleware.js
// 인증/인가 미들웨어
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ✅ 인증 미들웨어: Bearer 토큰을 검증하고 req.user에 payload 할당
const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization'); // 형식: "Bearer <token>"
  if (!authHeader) {
    return res.status(401).json({ message: '인증 토큰이 없습니다.' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role? }
    next();
  } catch (err) {
    res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};

/**
 * ✅ 관리자 권한 확인 미들웨어
 * - 새 토큰은 req.user.role === 'admin' 이면 통과
 * - 구 토큰( role 없음 ) 대응: DB에서 role 조회 후 판단
 */
const adminOnly = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: '인증이 필요합니다.' });
  }

  if (req.user.role === 'admin') {
    return next();
  }

  try {
    // 토큰에 role이 없거나 user.role이 admin이 아닐 때 DB 재확인
    const user = await User.findById(req.user.id).select('role');
    if (user && user.role === 'admin') {
      return next();
    }
    return res.status(403).json({ message: '관리자 권한이 필요합니다.' });
  } catch (err) {
    return res.status(500).json({ message: '권한 확인 실패', error: err.message });
  }
};

module.exports = { authMiddleware, adminOnly };
