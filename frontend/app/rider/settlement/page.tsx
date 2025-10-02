"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchRiderSettlements } from "@/redux/slices/riderSettlementSlice";
import styled from "styled-components";
import Container from "@/app/component/Container";
import { useRouter } from "next/navigation";
// ✅ styled-components

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;

  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: center;
  }

  th {
    background-color: #f5f5f5;
  }
`;

const Status = styled.span<{ status: string }>`
  font-weight: bold;
  color: ${({ status }) => (status === "paid" ? "green" : "red")};
`;
const Page = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { items, loading, error } = useSelector(
    (state: RootState) => state.riderSettlement
  );

  useEffect(() => {
    dispatch(fetchRiderSettlements());
  }, [dispatch]);

  if (loading) return <p>불러오는 중...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <Container>
      <h2>정산 내역</h2>
      <Table>
        <thead>
          <tr>
            <th>기간</th>
            <th>주문건수</th>
            <th>수수료</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={4}>정산 내역이 없습니다.</td>
            </tr>
          ) : (
            items.map((s) => (
              <tr key={s._id} onClick={() => router.push(`/rider/settlement/${s._id}`)}>
                <td>
                  {new Date(s.weekStart).toLocaleDateString()} ~{" "}
                  {new Date(s.weekEnd).toLocaleDateString()}
                </td>
                <td>{s.totalLength}</td>
                <td>{s.commission.toLocaleString()} 원</td>
                <td>
                  <Status status={s.status}>
                    {s.status === "pending" ? "미지급" : "지급완료"}
                  </Status>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default Page;


