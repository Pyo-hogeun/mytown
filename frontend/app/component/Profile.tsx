// Profile.tsx
import { RootState } from "@/redux/store";
import { useSelector, useDispatch } from "react-redux";
import { clearToken, clearUser } from "@/redux/slices/authSlice";
import styled from "styled-components"

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

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state:RootState)=>state.auth);

  const handleLogout = () => {
    dispatch(clearToken());
    dispatch(clearUser());
    window.location.href = "/login"; // 로그아웃 후 로그인 페이지로 이동
  };

  return (
    <ProfileWrapper>
      {user ? (
        <>
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
