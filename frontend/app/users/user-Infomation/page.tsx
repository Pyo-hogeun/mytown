'use client'

import { useEffect, useState } from "react";
import axios from "@/utils/axiosInstance";
import { useSearchParams } from "next/navigation";
import Container from "@/app/component/Container";
import { Card } from "@/app/component/Card";
import ProfileImage from "@/app/component/ProfileImage";
import styled from "styled-components";
import Link from "next/link";

const UserInfomation = () => {
  interface User {
    name?: string;
    phone?: string;
    email: string;
    snsId?: string;
    snsProvider?: string;
    role: string;
    profile_image?: string;
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
      </Card>

    </Container>

  )
}
export default UserInfomation