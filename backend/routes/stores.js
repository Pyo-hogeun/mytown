const express = require('express');
const Store = require('../models/store');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  const { name, address } = req.body;
  const userId = req.user.id; // ✅ 토큰에서 추출된 사용자 ID

  try {
    // 동일한 사용자가 이미 마트를 등록했는지 확인
    const existingStore = await Store.findOne({ owner: userId });
    if (existingStore) {
      return res.status(400).json({ message: '이미 마트를 등록했습니다.' });
    }

    const store = new Store({ name, address, owner: userId });
    await store.save();

    res.status(201).json(store);
  } catch (err) {
    res.status(500).json({ message: '마트 등록 실패', error: err.message });
  }
});

module.exports = router;
