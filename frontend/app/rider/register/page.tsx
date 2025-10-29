// rider/register/page.tsx
"use client";

import { useState } from "react";
import axios from "@/utils/axiosInstance";
import { useRouter } from "next/navigation";
import Container from "@/app/component/Container";
import Input from "@/app/component/Input";
import { Card } from "@/app/component/Card";
import styled from "styled-components";
import Select from "@/app/component/Select";
import Button from "@/app/component/Button";
import { fetchCurrentUser } from "@/redux/slices/authSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
const CenterContainer = styled(Container)`
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 0;
  left: 0;
  min-height: 100vh;
  width: 100vw;
  background: #f5f6f8;
  z-index: -1;
`;
const StyledButton = styled(Button)`
  width: 100%;
  margin-top: 16px;
  padding: 12px;
  font-weight: bold;
  background-color: #1e90ff;
  color: white;
  border: none;
  border-radius: 8px;
`;
const RiderRegisterPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [form, setForm] = useState({
    deliveryArea: "",
    bankName: "",
    accountNumber: "",
    vehicleType: "motorcycle",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await axios.post(
        "/rider/register",
        {
          deliveryArea: form.deliveryArea,
          settlementAccount: {
            bankName: form.bankName,
            accountNumber: form.accountNumber,
          },
          vehicleType: form.vehicleType,
        }
      );
      alert("라이더 등록이 완료되었습니다!");
      await dispatch(fetchCurrentUser());

      // ✅ 사용자 정보 다시 불러오기
      router.push("/rider");
    } catch (error) {
      console.error("라이더 등록 실패:", error);
      alert("라이더 등록 중 오류가 발생했습니다.");
    }
  };


  return (
    <CenterContainer>
      <Card>
        <h2>라이더 추가 정보 등록</h2>
        <Input
          name="deliveryArea"
          placeholder="배달 구역 (예: 강남구 역삼동)"
          value={form.deliveryArea}
          onChange={handleChange}
        />
        <Input
          name="bankName"
          placeholder="은행명"
          value={form.bankName}
          onChange={handleChange}
        />
        <Input
          name="accountNumber"
          placeholder="계좌번호"
          value={form.accountNumber}
          onChange={handleChange}
        />
        <Select name="vehicleType" value={form.vehicleType} onChange={handleChange}>
          <option value="motorcycle">오토바이 (4kg 미만)</option>
          <option value="car">차량 (4kg 이상)</option>
        </Select>
        <StyledButton onClick={handleSubmit}>저장</StyledButton>
      </Card>
    </CenterContainer>
  );
}

export default RiderRegisterPage;