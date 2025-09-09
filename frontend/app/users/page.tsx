"use client";

import React from "react";
import UserList from "@/app/component/UserList";
import Container from "../component/Container";

const UsersPage = () => {
  return (
    <Container>
      <h1>사용자 관리</h1>
      <UserList />
    </Container>
  );
};

export default UsersPage;
