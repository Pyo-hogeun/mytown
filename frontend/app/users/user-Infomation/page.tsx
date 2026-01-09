'use client'

import { Suspense, useEffect, useState } from "react";
import axios from "@/utils/axiosInstance";
import { useSearchParams } from "next/navigation";
import Container from "@/app/component/Container";
import { Card } from "@/app/component/Card";
import ProfileImage from "@/app/component/ProfileImage";
import styled from "styled-components";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { updateRiderLocation } from "@/redux/slices/authSlice";

const Title = styled.h2`
  margin: 0 0 1em 0;
`;

const List = styled.ul`
  padding: 0;
  li{
    height: 2em;
    margin-bottom: 0.5em;
  }
`;
const Label = styled.span`
  margin-right: 0.3em;
`;
const Value = styled.span`
  font-weight: 700;
`;
const StyledLink = styled(Link)`
  display: flex;
  gap: 1em;
  height: 2em;
  align-items: center;
  &:after{
    content: '>';
  }
`;
const LocationButton = styled.button`
  border: 1px solid #666;
  background: #fff;
  color: #333;
  padding: 0.3em 0.6em;
  font-size: 0.85em;
  border-radius: 4px;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;
const LocationStatus = styled.span`
  font-size: 0.85em;
  color: #666;
`;

interface User {
  _id?: string;
  name?: string;
  phone?: string;
  email: string;
  snsId?: string;
  snsProvider?: string;
  role: string;
  profile_image?: string;
}

const UserInfomationContent = () => {

  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [userInfo, setUserInfo] = useState<User>();
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const riderLocation = authUser?.riderInfo?.location;
  const isRiderSelf = authUser?.role === "rider" && authUser?.id === id;

  useEffect(() => {
    if (!id) return;
    axios.get(`/users/${id}`)
      .then((res) => {
        setUserInfo(res.data);
        console.log('userInfo', res.data);
      })
      .catch(err => console.log(err));
  }, [id])

  const handleUpdateLocation = () => {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("현재 브라우저에서는 위치 정보를 사용할 수 없습니다.");
      return;
    }

    setIsUpdatingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await dispatch(updateRiderLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })).unwrap();
        } catch (error) {
          setLocationError(typeof error === "string" ? error : "위치 업데이트에 실패했습니다.");
        } finally {
          setIsUpdatingLocation(false);
        }
      },
      () => {
        setLocationError("위치 권한을 확인해주세요.");
        setIsUpdatingLocation(false);
      }
    );
  };
  return (
    <Container>
      <Card>
        <Title>사용자 정보</Title>
        <ProfileImage>
          <img src={userInfo?.profile_image} alt={userInfo?.name} />
        </ProfileImage>
        <h3>기본정보</h3>
        <List>
          <li>
            <Label>사용자이름:</Label> <Value>{userInfo?.name}</Value>
          </li>
          {/* sns가입자일 경우 이메일 항목 x */}
          {userInfo?.snsProvider ?
            <li>
              <Label>sns가입:</Label> <Value>{userInfo?.snsProvider} {userInfo?.snsId}</Value>
            </li> :
            <li>
              <Label>이메일:</Label> <Value>{userInfo?.email}</Value>
            </li>
          }
          <li>
            <Label>권한:</Label> <Value>{userInfo?.role}</Value>
          </li>
        </List>
        <h3>기타 정보 설정</h3>
        <List>
          <li>
            <StyledLink href="/">배송지 관리</StyledLink>
          </li>
          <li>
            <StyledLink href="/">연락처 관리</StyledLink>
          </li>
          {
            !userInfo?.snsProvider &&
            <li>
              <StyledLink href="/users/change-password">비밀번호 변경</StyledLink>
            </li>
          }
        </List>
        {isRiderSelf && (
          <>
            <h3>라이더 위치</h3>
            <List>
              <li>
                <Label>현재 위치:</Label>
                <Value>
                  {riderLocation
                    ? `${riderLocation.lat?.toFixed(5)}, ${riderLocation.lng?.toFixed(5)}`
                    : "위치 정보 없음"}
                </Value>
              </li>
              <li>
                <LocationButton onClick={handleUpdateLocation} disabled={isUpdatingLocation}>
                  {isUpdatingLocation ? "업데이트 중..." : "위치 업데이트"}
                </LocationButton>
                {riderLocation?.updatedAt && (
                  <LocationStatus>
                    {" "}
                    (마지막 업데이트: {new Date(riderLocation.updatedAt).toLocaleString()})
                  </LocationStatus>
                )}
              </li>
              {locationError && (
                <li>
                  <LocationStatus>{locationError}</LocationStatus>
                </li>
              )}
            </List>
          </>
        )}
      </Card>

    </Container>

  )
}
export default function UserInfomation(){
  return(
    <Suspense fallback={<div>로딩중...</div>}>
      <UserInfomationContent />
    </Suspense>
  )
}
