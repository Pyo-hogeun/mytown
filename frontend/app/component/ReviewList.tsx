import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "@/utils/axiosInstance";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
  };
  rating: number;
  content: string;
  createdAt: string;
}

interface ReviewListProps {
  productId: string;
}

// ✅ styled-components
const ReviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 0;
  background-color: #FFF;
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
`;

const ReviewCard = styled.div`
  border-bottom: 1px solid #eee;
  padding-bottom: 12px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const UserName = styled.span`
  font-weight: 600;
  color: #333;
`;

const Rating = styled.span`
  color: #f1b10f;
  font-size: 16px;
`;

const Comment = styled.p`
  margin: 8px 0 4px;
  color: #555;
  font-size: 15px;
  line-height: 1.4;
`;

const DateText = styled.span`
  font-size: 12px;
  color: #999;
`;

const EmptyMsg = styled.div`
  text-align: center;
  color: #777;
  font-size: 14px;
  margin: 20px 0;
`;

const ReviewList: React.FC<ReviewListProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`/reviews/product/${productId}`);
        setReviews(res.data);
      } catch (err) {
        console.error("리뷰 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [productId]);

  if (loading) return <p>리뷰를 불러오는 중입니다...</p>;

  if (reviews.length === 0) return <EmptyMsg>아직 작성된 리뷰가 없습니다.</EmptyMsg>;

  return (
    <ReviewContainer className="column-1-3">
      <h3>구매자 리뷰</h3>
      {reviews.map((r) => (
        <ReviewCard key={r._id}>
          <Header>
            <UserName>{r.user?.name || "익명"}</UserName>
            <Rating>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</Rating>
          </Header>
          <Comment>{r.content}</Comment>
          <DateText>{format(new Date(r.createdAt), "yyyy.MM.dd HH:mm", { locale: ko })}</DateText>
        </ReviewCard>
      ))}
    </ReviewContainer>
  );
};

export default ReviewList;


