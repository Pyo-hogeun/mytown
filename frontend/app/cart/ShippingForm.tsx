'use client';

import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { AppDispatch, RootState } from "@/redux/store";
import { setReceiver, setPhone, setAddress, setDetailAddress } from "@/redux/slices/orderSlice";
import Input from "../component/Input";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { fetchSavedDeliveryInfo, saveDeliveryInfoToUser } from "@/redux/slices/authSlice";
import PhoneInput from "../component/PhoneInput";
import Button from "../component/Button";

const FormContainer = styled.div`
  margin: 20px 0;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fafafa;
`;
const AddressRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-start;
`;
const SearchButton = styled.button`
  border:1px solid #ccc;
  background:#fff;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  height: 42px;
`;
const SaveDelieveryInfoWrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
`
export interface ShippingFormRef {
  saveDeliveryIfRemembered: () => void;
  remember: boolean;
}
const ShippingForm = forwardRef<ShippingFormRef>((_, ref) => {
  const dispatch = useDispatch<AppDispatch>();
  const { receiver, phone, address, detailAddress } = useSelector((s: RootState) => s.order);
  const { user } = useSelector((state: RootState) => state.auth);
  const [remember, setRemember] = useState(true);


  // ✅ 배송지 저장 (체크된 경우만)
  const handleSaveDelivery = () => {
    if (!remember) return;
    dispatch(saveDeliveryInfoToUser({ receiver, phone, address, detailAddress }));
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
      dispatch(fetchSavedDeliveryInfo());
    }
  }, [dispatch, user?.id]);

  // ✅ savedDeliveryInfo가 불러와지면 orderSlice에 반영
  useEffect(() => {
    if (user?.savedDeliveryInfo) {
      const { receiver, phone, address, detailAddress } = user.savedDeliveryInfo;
      if (receiver) dispatch(setReceiver(receiver));
      if (phone) dispatch(setPhone(phone));
      if (address) dispatch(setAddress(address));
      if (detailAddress) dispatch(setDetailAddress(detailAddress));
    }
  }, [dispatch, user?.savedDeliveryInfo]);

  // ✅ 카카오 주소 검색
  const handleAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: (data: any) => {
        const fullAddress = data.address; // 선택한 전체 주소
        dispatch(setAddress(fullAddress));
      },
    }).open();
  };

  return (
    <FormContainer>
      <h3>배송지 입력</h3>
      <Input
        type="text"
        placeholder="수령인 이름"
        value={receiver}
        onChange={(e) => dispatch(setReceiver(e.target.value))}
      />

      <PhoneInput
        value={phone}
        onChange={(val) => dispatch(setPhone(val))}
      />
      <AddressRow>
        <Input
          type="text"
          placeholder="배송지 주소"
          value={address}
          onChange={(e) => dispatch(setAddress(e.target.value))}
          disabled={true}
        />
        <SearchButton type="button" onClick={handleAddressSearch}>
          주소 검색
        </SearchButton>
      </AddressRow>
      <Input
        type="text"
        placeholder="주소 상세"
        value={detailAddress}
        onChange={(e) => dispatch(setDetailAddress(e.target.value))}
      />
      <SaveDelieveryInfoWrapper>
        <label htmlFor="save">
          <input
            type="checkbox"
            id="save"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          배송지 기억하기
        </label>
        <Button onClick={handleSaveDelivery}>배송지 저장</Button>
      </SaveDelieveryInfoWrapper>
    </FormContainer>
  );
});
ShippingForm.displayName = "ShippingForm";
export default ShippingForm;
