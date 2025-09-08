// Profile.tsx
import { RootState } from "@/redux/store";
import { useSelector, useDispatch } from "react-redux";
import { clearToken, clearUser } from "@/redux/slices/authSlice";
import styled, { css, keyframes } from "styled-components"
import Link from "next/link";
import { useEffect, useState } from "react";

const ProfileWrapper = styled.div`
  position: absolute;
  right: 10px;
  top: 10px;
`
const Name = styled.span`
  color: #000;
  font-size: 12px;
`;
const Role = styled.span`
  display: inline-block;
  border: 1px solid #666;
  padding: 5px;
  vertical-align: middle;
  margin-left: 5px;
  color: #666;
  font-size: 12px;
`;
const Store = styled.span`
  margin-right: 10px;
  color: #666;
  font-size: 11px;
`
const LogoutButton = styled.button`
  margin-left: 10px;
  background: transparent;
  border: none;
  color: #0070f3;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;
// 🎨 뱃지 애니메이션 (장바구니 아이템 추가 시 scale 효과)
const bounce = keyframes`
  0% { transform: scale(1); }
  30% { transform: scale(1.3); }
  60% { transform: scale(0.9); }
  100% { transform: scale(1); }
`
// 📌 장바구니 갯수 뱃지 스타일
const CartBadge = styled.span.withConfig({ shouldForwardProp: (props) => props !== 'animate' }) <{ animate: boolean }>`
  position: absolute;
  top: -8px;
  right: 10px;
  background: #ff4d4f;
  color: white;
  font-size: 12px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 20px;
  min-width: 15px;
  text-align: center;

  ${({ animate }) =>
    animate &&
    css`
      animation: ${bounce} 0.5s ease;
    `}
`;
const CartButton = styled.div`
  position: relative;
  display: inline-block;
  padding: 0 40px 0 10px;
`
const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  // ✅ 애니메이션 트리거 상태
  const [animate, setAnimate] = useState(false);
  // 🛒 Redux에서 장바구니 아이템 개수 가져오기
  const cartCount = useSelector((state: RootState) => state.cart.items.length);
  const [mounted, setMounted] = useState(false) // SSR hydration 대응

  const handleLogout = () => {
    dispatch(clearToken());
    dispatch(clearUser());
    window.location.href = "/login"; // 로그아웃 후 로그인 페이지로 이동
  };

  useEffect(() => {
    setMounted(true)
  }, [])
  useEffect(() => {
    if (cartCount > 0) {
      setAnimate(true)
      const timeout = setTimeout(() => setAnimate(false), 500)
      return () => clearTimeout(timeout)
    }
  }, [cartCount])
  if (!mounted) return null // 서버에서는 렌더 안 함 → hydration mismatch 방지

  return (
    <ProfileWrapper>
      <Link href="/orders">주문조회</Link>
      <CartButton>
        <Link href="/cart">장바구니</Link>
        {cartCount > 0 ? <CartBadge animate={animate}>{cartCount}</CartBadge> : false}
      </CartButton>
      {user ? (
        <>
        { user.store?<Store>{user.store?.name} 🛒</Store>:false}
          
          <Name>{user.name}</Name>
          <Role>{user.role}</Role>
          <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
        </>
      ) : (
        <Name>로그인 필요</Name>
      )}
    </ProfileWrapper>
  )
}
export default Profile;
