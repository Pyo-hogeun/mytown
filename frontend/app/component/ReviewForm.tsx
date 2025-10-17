import { useState } from 'react';
import styled from 'styled-components';
import axios from '@/utils/axiosInstance';

interface ReviewFormProps {
  orderId: string;
  productId: string;
  onClose: () => void;
  onSubmitted: (review: any) => void; // ✅ 추가
}
const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const OrderCard = styled.div`
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 16px;
  background: #fff;

  .info {
    margin-bottom: 8px;
  }
`;

const ReviewButton = styled.button`
  background: #007aff;
  color: #fff;
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  cursor: pointer;

  &:hover {
    background: #0059c9;
  }
`;

const FormWrapper = styled.div`
  margin-top: 12px;
  border-top: 1px solid #eee;
  padding-top: 10px;
`;

const RatingWrapper = styled.div`
  margin-bottom: 10px;
`;

const Star = styled.span<{ $active: boolean }>`
  font-size: 22px;
  color: ${({ $active }) => ($active ? '#FFD700' : '#ccc')};
  cursor: pointer;
  transition: color 0.2s;
`;

const Textarea = styled.textarea`
  box-sizing: border-box;
  width: 100%;
  min-height: 80px;
  resize: none;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 8px;
  font-size: 14px;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
`;

const CancelButton = styled.button`
  background: #ccc;
  color: #fff;
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
`;

const SubmitButton = styled.button`
  background: #007aff;
  color: #fff;
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  cursor: pointer;

  &:disabled {
    background: #aaa;
    cursor: default;
  }
`;

export default function ReviewForm({ orderId, productId, onClose, onSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return alert('리뷰 내용을 입력하세요.');
    if (rating === 0) return alert('별점을 선택하세요.');

    try {
      setLoading(true);
      const res = await axios.post('/reviews', {
        orderId,
        rating,
        content,
        product: productId, // ✅ productId 전달
      });
      alert('리뷰가 등록되었습니다.');
      onSubmitted(res.data); // ✅ 등록된 리뷰 반환
      onClose();
    } catch (err) {
      alert('리뷰 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormWrapper>
      <RatingWrapper>
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            $active={star <= rating}
            onClick={() => setRating(star)}
          >
            ★
          </Star>
        ))}
      </RatingWrapper>

      <Textarea
        placeholder="리뷰를 작성해주세요."
        value={content}
        onChange={e => setContent(e.target.value)}
      />

      <ButtonWrapper>
        <CancelButton onClick={onClose}>취소</CancelButton>
        <SubmitButton onClick={handleSubmit} disabled={loading}>
          {loading ? '등록 중...' : '등록'}
        </SubmitButton>
      </ButtonWrapper>
    </FormWrapper>
  );
}
