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
 *               storeName:
 *                 type: string
 *                 description: 마트 이름
 *               name:
 *                 type: string
 *                 description: 상품명
 *               price:
 *                 type: number
 *                 description: 기본 가격
 *               stockQty:
 *                 type: number
 *                 description: 기본 재고 수량
 *               imageUrl:
 *                 type: string
 *                 description: 상품 이미지 URL
 *               options:
 *                 type: array
 *                 description: 상품 옵션 목록
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: 옵션 이름
 *                     extraPrice:
 *                       type: number
 *                       description: 옵션 추가금액
 *                     stockQty:
 *                       type: number
 *                       description: 옵션 재고 수량
 *               status:
 *                 type: string
 *                 enum: [draft, published, hidden]
 *                 description: 상품 노출 상태
 *               featured:
 *                 type: boolean
 *                 description: 추천 상품 여부
 *               priority:
 *                 type: number
 *                 description: 정렬 우선순위 (클수록 먼저 노출)
 *               visibleFrom:
 *                 type: string
 *                 format: date-time
 *                 description: 노출 시작 시각
 *               visibleTo:
 *                 type: string
 *                 format: date-time
 *                 description: 노출 종료 시각
 *               channels:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 노출 채널
 *     responses:
 *       201:
 *         description: 등록 성공
 *       500:
 *         description: 상품 등록 실패
 */
router.post('/', async (req, res) => {
  try {
    const {
      storeId, storeName, name, price, stockQty, imageUrl, options,
      status, featured, priority, visibleFrom, visibleTo, channels,
      description // ✅ 추가
    } = req.body;

    const product = new Product({
      store: storeId,
      storeName,
      name,
      price,
      stockQty,
      imageUrl,
      options,
      status,
      featured,
      priority,
      visibleFrom,
      visibleTo,
      channels,
      description, // ✅ 추가
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
    const products = await Product.find({status: 'published'});
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: '전체 상품 조회 실패', error: err.message });
  }
});
/**
 * @openapi
 * /products/{id}:
 *   get:
 *     summary: 특정 상품 조회
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 조회할 상품의 ID
 *     responses:
 *       200:
 *         description: 상품 상세 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "64d1234abc5678ef90123456"
 *                 store:
 *                   type: string
 *                   example: "64c1234abc1234def5678901"
 *                 storeName:
 *                   type: string
 *                   example: "우리마트"
 *                 name:
 *                   type: string
 *                   example: "우유 1L"
 *                 price:
 *                   type: number
 *                   example: 2800
 *                 stockQty:
 *                   type: number
 *                   example: 120
 *                 imageUrl:
 *                   type: string
 *                   example: "https://cdn.example.com/products/abc.jpg"
 *                 options:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       extraPrice:
 *                         type: number
 *                       stockQty:
 *                         type: number
 *                 status:
 *                   type: string
 *                   enum: [draft, published, hidden]
 *                 featured:
 *                   type: boolean
 *                 priority:
 *                   type: number
 *                 visibleFrom:
 *                   type: string
 *                   format: date-time
 *                 visibleTo:
 *                   type: string
 *                   format: date-time
 *                 channels:
 *                   type: array
 *                   items:
 *                     type: string
 *       404:
 *         description: 상품을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류
 */


// 특정 상품 조회
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: '상품 조회 실패', error: err.message });
  }
});

// 특정 상품 수정
/**
 * @openapi
 * /products/{id}:
 *   put:
 *     summary: (관리자용) 상품 수정
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: 상품 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               storeId:
 *                 type: string
 *               storeName:
 *                 type: string
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               stockQty:
 *                 type: number
 *               imageUrl:
 *                 type: string
 *               options:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     extraPrice:
 *                       type: number
 *                     stockQty:
 *                       type: number
 *               status:
 *                 type: string
 *                 enum: [draft, published, hidden]
 *               featured:
 *                 type: boolean
 *               priority:
 *                 type: number
 *               visibleFrom:
 *                 type: string
 *                 format: date-time
 *               visibleTo:
 *                 type: string
 *                 format: date-time
 *               channels:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: 수정 성공
 *       404:
 *         description: 상품을 찾을 수 없음
 *       500:
 *         description: 상품 수정 실패
 */
router.put('/:id', async (req, res) => {
  try {
    const {
      storeId, storeName, name, price, stockQty, imageUrl, options,
      status, featured, priority, visibleFrom, visibleTo, channels
    } = req.body;

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        store: storeId,
        storeName,
        name,
        price,
        stockQty,
        imageUrl,
        options,
        status,
        featured,
        priority,
        visibleFrom,
        visibleTo,
        channels,
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: '상품 수정 실패', error: err.message });
  }
});

export default router;
