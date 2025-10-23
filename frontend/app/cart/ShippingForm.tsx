'use client';

import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { AppDispatch, RootState } from "@/redux/store";
import { setReceiver, setPhone, setAddress } from "@/redux/slices/orderSlice";
import Input from "../component/Input";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { fetchSavedDeliveryInfo, saveDeliveryInfoToUser } from "@/redux/slices/authSlice";

const FormContainer = styled.div`
  margin: 20px 0;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fafafa;
`;
export interface ShippingFormRef {
  saveDeliveryIfRemembered: () => void;
  remember: boolean;
}
const ShippingForm = forwardRef<ShippingFormRef>((_, ref) => {
  const dispatch = useDispatch<AppDispatch>();
  const { receiver, phone, address, orders } = useSelector((s: RootState) => s.order);
  const { user } = useSelector((state: RootState) => state.auth);
  const [remember, setRemember] = useState(true);

  // ✅ 배송지 저장 (체크된 경우만)
  const handleSaveDelivery = () => {
    if (!remember) return;
    dispatch(saveDeliveryInfoToUser({ receiver, phone, address }));
    alert("배송지가 저장되었습니다.");
  };

  // ✅ 외부에서 접근할 수 있게 노출
  useImperativeHandle(ref, () => ({
    saveDeliveryIfRemembered: handleSaveDelivery,
    remember
  }));


  // ✅ 로그인 시 유저의 저장된 배송지 불러오기
  useEffect(() => {
    if (user?.id) {
      console.log('user! ', user.id);
      dispatch(fetchSavedDeliveryInfo());
    }
  }, [dispatch, user?.id]);

  // ✅ savedDeliveryInfo가 불러와지면 orderSlice에 반영
  useEffect(() => {
    if (user?.savedDeliveryInfo) {
      const { receiver, phone, address } = user.savedDeliveryInfo;
      if (receiver) dispatch(setReceiver(receiver));
      if (phone) dispatch(setPhone(phone));
      if (address) dispatch(setAddress(address));
    }
  }, [dispatch, user?.savedDeliveryInfo]);


  return (
    <FormContainer>
      <h3>배송지 입력</h3>
      <Input
        type="text"
        placeholder="수령인 이름"
        value={receiver}
        onChange={(e) => dispatch(setReceiver(e.target.value))}
      />
      <Input
        type="text"
        placeholder="연락처"
        value={phone}
        onChange={(e) => dispatch(setPhone(e.target.value))}
      />
      <Input
        type="text"
        placeholder="배송지 주소"
        value={address}
        onChange={(e) => dispatch(setAddress(e.target.value))}
      />
      <div className="save-delievery-info">
        <label htmlFor="save">
          <input
            type="checkbox"
            id="save"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          배송지 기억하기
        </label>
      </div>
      <button onClick={handleSaveDelivery}>배송지 저장</button>
    </FormContainer>
  );
});
ShippingForm.displayName = "ShippingForm";
export default ShippingForm;
