//상품라우터
const express = require('express');
const Product = require('../models/product');
const router = express.Router();

// [관리자용] 상품 등록
router.post('/', async (req, res) => {
  try {
    const { storeId, name, price, stockQty, imageUrl } = req.body;

    const product = new Product({
      store: storeId,
      name,
      price,
      stockQty,
      imageUrl
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: '상품 등록 실패', error: err.message });
  }
});

// 특정 마트의 상품 목록 조회
router.get('/store/:storeId', async (req, res) => {
  try {
    const products = await Product.find({ store: req.params.storeId });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: '상품 조회 실패', error: err.message });
  }
});

module.exports = router;
