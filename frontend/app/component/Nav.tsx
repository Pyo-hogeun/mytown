'use client'

import Link from "next/link"
import styled, { css, keyframes } from "styled-components"
import Profile from "./Profile"
import { useSelector } from "react-redux"
import { RootState } from "@/redux/store"
import { User } from "@/redux/slices/authSlice"

type Role = User["role"];
const Container = styled.div`
  ul{
    display: flex;
    gap: 20px;
  }
`;
const Item = styled.li`
  list-style: none;
`;
interface Menu {
  path: string;
  label: string;
  roles: Role[]; // 접근 가능한 권한 목록
}
const menus: Menu[] = [
  { path: "/products", label: "상품 목록", roles: ["master", "admin", "manager", "user", null] },
  { path: "/products/new", label: "상품 등록", roles: ["master", "admin", "manager"] },
  { path: "/stores/new", label: "매장 등록", roles: ["master", "admin"] },
  { path: "/stores", label: "매장 목록", roles: ["master", "admin", "manager", "user", null] },
  { path: "/users", label: "사용자관리", roles: ["master", "admin", "manager"] },
  { path: "/orders/manage", label: "주문관리", roles: ["master", "admin", "manager"] },
  { path: "/login", label: "로그인", roles: [null] },
  { path: "/register", label: "회원가입", roles: [null] },
  { path: "/orders", label: "주문조회", roles: ["user"] },
];

const Nav = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const role = user?.role ?? null;
  return (
    <Container>
      <ul>
        {menus
          .filter((menu) => menu.roles.includes(role))
          .map((menu) => (
            <Item key={menu.path}>
              <Link href={menu.path}>{menu.label}</Link>
            </Item>
          ))}
      </ul>
      <Profile role={role}/>
    </Container>
  );
};
export default Nav