'use client'

import { Suspense, useEffect, useState } from "react";
import axios from "@/utils/axiosInstance";
import { useSearchParams } from "next/navigation";
import Container from "@/app/component/Container";
import { Card } from "@/app/component/Card";
import ProfileImage from "@/app/component/ProfileImage";
import styled from "styled-components";
import Link from "next/link";

const UserInfomationContent = () => {
  interface User {
    name?: string;
    phone?: string;
    email: string;
    snsId?: string;
    snsProvider?: string;
    role: string;
    profile_image?: string;
    riderInfo?: {
      location?: {
        lat: number;
        lng: number;
        updatedAt?: string;
      };
    };
  }

  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [userInfo, setUserInfo] = useState<User>();

  const Title = styled.h2`
    margin: 0 0 1em 0;
  `

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
  const ActionButton = styled.button`
    border: 1px solid #ddd;
    background: #fff;
    padding: 0.4em 0.8em;
    border-radius: 6px;
    cursor: pointer;
  `;
  const StyledLink = styled(Link)`
    display: flex;
    gap: 1em;
    height: 2em;
    align-items: center;
    &:after{
      content: '>';
    }
  `

  useEffect(() => {
    axios.get(`/users/${id}`)
      .then((res) => {
        setUserInfo(res.data);
        console.log('userInfo', res.data);
      })
      .catch(err => console.log(err));
  }, [])

  const handleUpdateLocation = () => {
    const seoulLocations = [
      { lat: 37.5665, lng: 126.9780 },
      { lat: 37.5172, lng: 127.0473 },
      { lat: 37.5796, lng: 126.9770 },
      { lat: 37.5446, lng: 127.0562 },
    ];
    const randomLocation = seoulLocations[Math.floor(Math.random() * seoulLocations.length)];

    setUserInfo((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        riderInfo: {
          ...prev.riderInfo,
          location: {
            ...randomLocation,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    });
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
        {userInfo?.role === 'rider' && (
          <>
            <h3>라이더 정보</h3>
            <List>
              <li>
                <Label>현재위치:</Label>
                <Value>
                  {userInfo?.riderInfo?.location
                    ? `${userInfo.riderInfo.location.lat}, ${userInfo.riderInfo.location.lng}`
                    : '미설정'}
                </Value>
              </li>
              <li>
                <ActionButton type="button" onClick={handleUpdateLocation}>
                  현재위치 업데이트
                </ActionButton>
              </li>
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
