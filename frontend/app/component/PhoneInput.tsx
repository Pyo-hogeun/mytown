'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import Input from './Input';

const Container = styled.div`
  margin-bottom: 16px;
`
const Wrapper = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-start;
`;

const Select = styled.select`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #fff;
  height: 42px;
`;

const StyledInput = styled(Input)<{ $error?: boolean }>`
  border: 1px solid ${({ $error }) => ($error ? 'red' : '#ccc')};
  margin-bottom: 0;
  &:focus {
    border-color: ${({ $error }) => ($error ? 'red' : '#0070f3')};
  }
`;

const ErrorMsg = styled.div`
  color: red;
  font-size: 0.8em;
  margin-top: 4px;
`;

export interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  carrier: string;
  onCarrierChange: (carrier: string) => void;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  carrier,
  onCarrierChange,
}) => {
  const [error, setError] = useState('');

  // 숫자만 입력
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyNumbers = e.target.value.replace(/\D/g, '');
    onChange(onlyNumbers);
  };

  // blur 시 유효성 검사
  const handleBlur = () => {
    if (!value) {
      setError('전화번호를 입력해주세요.');
      return;
    }
    const phoneRegex = /^01[0-9]{8,9}$/; // 010, 011, 016, 017, 018, 019
    if (!phoneRegex.test(value)) {
      setError('올바른 휴대폰 번호를 입력해주세요.');
      return;
    }
    setError('');
  };

  return (
    <Container>
      <Wrapper>
        <Select value={carrier} onChange={(e) => onCarrierChange(e.target.value)}>
          <option value="">통신사 선택</option>
          <option value="SKT">SKT</option>
          <option value="KT">KT</option>
          <option value="LGU+">LGU+</option>
          <option value="알뜰폰">알뜰폰</option>
        </Select>

        <StyledInput
          type="text"
          placeholder="숫자만 입력"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          $error={!!error}
        />
      </Wrapper>
      {error && <ErrorMsg>{error}</ErrorMsg>}
    </Container>
  );
};

export default PhoneInput;
