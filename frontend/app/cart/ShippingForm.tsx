'use client';

import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { RootState } from "@/redux/store";
import { setReceiver, setPhone, setAddress } from "@/redux/slices/orderSlice";
import Input from "../component/Input";

const FormContainer = styled.div`
  margin: 20px 0;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fafafa;
`;

const ShippingForm = () => {
  const dispatch = useDispatch();
  const { receiver, phone, address } = useSelector((s: RootState) => s.order);

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
    </FormContainer>
  );
};

export default ShippingForm;
