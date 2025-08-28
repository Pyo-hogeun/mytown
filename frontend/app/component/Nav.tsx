'use client'

import Link from "next/link"
import styled from "styled-components"
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
    <Container className="p-4 bg-gray-100 flex gap-4">
      <ul>
        <Item><Link href="/products" className="text-blue-600">상품 목록</Link></Item>
        <Item><Link href="/products/new" className="text-green-600">상품 등록</Link></Item>
        <Item><Link href="/login" className="text-green-600">로그인</Link></Item>
        <Item><Link href="/register" className="text-green-600">회원가입</Link></Item>
      </ul>
    </Container>
  )
}
export default Nav