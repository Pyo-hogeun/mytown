//상품라우터
import express from 'express';
import Product from '../models/product.js';
const router = express.Router();

/**
 * @openapi
 * /products:
 *   post:
 *     summary: (관리자용) 상품 등록
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               storeId:
 *                 type: string
 *                 description: 마트 ID
 *               name:
 *                 type: string
 *                 description: 상품명
 *               price:
 *                 type: number
 *               stockQty:
 *                 type: number
 *               imageUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: 등록 성공
 *       500:
 *         description: 상품 등록 실패
 */
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

/**
 * @openapi
 * /products/store/{storeId}:
 *   get:
 *     summary: 특정 마트의 상품 목록 조회
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: storeId
 *         schema:
 *           type: string
 *         required: true
 *         description: 마트 ID
 *     responses:
 *       200:
 *         description: 조회 성공
 *       500:
 *         description: 상품 조회 실패
 */
router.get('/store/:storeId', async (req, res) => {
  try {
    const products = await Product.find({ store: req.params.storeId });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: '상품 조회 실패', error: err.message });
  }
});

/**
 * @openapi
 * /products:
 *   get:
 *     summary: 모든 상품 조회
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: 상품 목록 반환
 *       500:
 *         description: 전체 상품 조회 실패
 */
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: '전체 상품 조회 실패', error: err.message });
  }
});

export default router;
