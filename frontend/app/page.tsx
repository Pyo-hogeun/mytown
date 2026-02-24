'use client'

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import Container from "./component/Container";
import { RootState } from "@/redux/store";

export default function Home() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (user?.role === "rider") {
      router.replace("/rider");
    }
  }, [router, user?.role]);

  return (
    <Container>
      HOME
    </Container>
  );
}
