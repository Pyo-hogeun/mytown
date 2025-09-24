// 파일: models/product.js
// 설명: 상품 모델 (옵션 유지 + 전시/노출 제어 필드 추가)
// 변경사항 요약:
//  - optionSchema 유지 (옵션별 extraPrice, stockQty)
//  - 상품 전시 제어 필드 추가: status, featured, priority, visibleFrom, visibleTo, channels
//  - createdAt / updatedAt, pre-save 유효성 검사 추가
//  - 빠른 조회를 위한 인덱스 추가

import mongoose from "mongoose";

const { Schema } = mongoose;

// 옵션 스키마: 각 옵션엔 _id가 자동 생성됩니다.
const optionSchema = new Schema(
  {
    name: { type: String, required: true },
    extraPrice: { type: Number, default: 0 },
    stockQty: { type: Number, default: 0 },
  },
  { _id: true }
);

const ProductSchema = new Schema(
  {
    // 어떤 마트(스토어)에 속한 상품인지 (필수)
    store: { type: Schema.Types.ObjectId, ref: "Store", required: true },
    // 화면에 표시할 때 빠르게 사용할 수 있도록 storeName을 중복 저장
    storeName: { type: String, required: true },

    // 기본 상품 정보
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stockQty: { type: Number, default: 0, min: 0 },
    imageUrl: { type: String, default: "" },

    // 옵션 목록
    options: { type: [optionSchema], default: [] },

    // ----------------------- 전시(노출) 제어 필드 -----------------------
    // status: draft(임시저장), published(노출), hidden(숨김)
    status: {
      type: String,
      enum: ["draft", "published", "hidden"],
      default: "published",
      description: "상품 전시 상태",
    },

    // 추천상품 여부 (예: 메인 배너/추천섹션 노출)
    featured: { type: Boolean, default: false },

    // 정렬 우선순위 (높을수록 상단에 노출)
    priority: { type: Number, default: 0 },

    // 특정 기간 동안에만 노출시키고 싶을 때 사용
    visibleFrom: { type: Date, default: null },
    visibleTo: { type: Date, default: null },

    // 노출 채널(필요시) - 예: ['web', 'mobile', 'app']
    channels: { type: [String], default: ["web", "mobile"] },

    // ------------------------------------------------------------------

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

// 저장 전(updatedAt 갱신 및 visibleFrom/visibleTo 유효성 검사)
ProductSchema.pre("save", function (next) {
  // @ts-ignore - mongoose document
  this.updatedAt = new Date();
  if (this.visibleFrom && this.visibleTo && this.visibleFrom > this.visibleTo) {
    return next(new Error("visibleFrom은 visibleTo 이전이어야 합니다."));
  }
  next();
});

// 빠른 조회에 도움이 되는 인덱스 (상태/추천/우선순위/작성일 기준)
ProductSchema.index({ status: 1, featured: -1, priority: -1, createdAt: -1 });

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
