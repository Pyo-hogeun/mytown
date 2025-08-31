const express = require('express');
const Store = require('../models/store');
const {authMiddleware, adminOnly} = require('../middlewares/authMiddleware');

const router = express.Router();
// [관리자용] 마트 등록
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  const { name, address, phone } = req.body;
  const userId = req.user.id; // ✅ 토큰에서 추출된 사용자 ID

  try {
    // 동일한 사용자가 이미 마트를 등록했는지 확인
    // const existingStore = await Store.findOne({ owner: userId });
    // if (existingStore) {
    //   return res.status(400).json({ message: '이미 마트를 등록했습니다.' });
    // }

    const store = new Store({ name, address, owner: userId, phone });
    await store.save();

    res.status(201).json(store);
  } catch (err) {
    res.status(500).json({ message: '마트 등록 실패', error: err.message });
  }
});

// 전체 마트 목록 조회
router.get('/', async (req, res) => {
  try {
    const stores = await Store.find();
    res.json(stores);
  } catch (err) {
    res.status(500).json({ message: '마트 조회 실패', error: err.message });
  }
});

module.exports = router;
