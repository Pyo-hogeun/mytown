'use client'

import Link from "next/link"
import styled from "styled-components"
import Profile from "./Profile"
const Container = styled.div`
  ul{
    display: flex;
    gap: 20px;
  }
`
const Item = styled.li`
  list-style: none;
`
const Nav = () => {
  return (
    <Container>
      <ul>
        <Item><Link href="/products">상품 목록</Link></Item>
        <Item><Link href="/products/new">상품 등록</Link></Item>
        <Item><Link href="/stores/new">매장 등록</Link></Item>
        <Item><Link href="/login">로그인</Link></Item>
        <Item><Link href="/register">회원가입</Link></Item>
      </ul>

      <Profile />
    </Container>
  )
}
export default Nav