// rider/register/page.tsx
"use client";

import { useState } from "react";
import axios from "@/utils/axiosInstance";
import { useRouter } from "next/navigation";

const RiderRegisterPage = () => {
  const router = useRouter();
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
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("라이더 등록이 완료되었습니다!");
      router.push("/");
    } catch (error) {
      console.error("라이더 등록 실패:", error);
      alert("라이더 등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", padding: 20 }}>
      <h2>라이더 추가 정보 등록</h2>
      <input
        name="deliveryArea"
        placeholder="배달 구역 (예: 강남구 역삼동)"
        value={form.deliveryArea}
        onChange={handleChange}
      />
      <input
        name="bankName"
        placeholder="은행명"
        value={form.bankName}
        onChange={handleChange}
      />
      <input
        name="accountNumber"
        placeholder="계좌번호"
        value={form.accountNumber}
        onChange={handleChange}
      />
      <select name="vehicleType" value={form.vehicleType} onChange={handleChange}>
        <option value="motorcycle">오토바이 (4kg 미만)</option>
        <option value="car">차량 (4kg 이상)</option>
      </select>
      <button onClick={handleSubmit}>등록</button>
    </div>
  );
}

export default RiderRegisterPage;