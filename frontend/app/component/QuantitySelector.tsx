// components/QuantitySelector.tsx
'use client';
import React from 'react';
import styled from 'styled-components';

const QtyWrap = styled.div`
  display:flex;
  align-items:center;
  gap:8px;
  margin: 12px 0;
`;

const QtyButton = styled.button`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
  cursor: pointer;
  background: #f8f8f8;
  &:hover { background: #eee; }
`;

interface QuantitySelectorProps {
  quantity: number;
  remaining: number;
  onChange: (val: number) => void;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({ quantity, remaining, onChange }) => {
  const increment = () => onChange(Math.min(quantity + 1, remaining));
  const decrement = () => onChange(Math.max(1, quantity - 1));

  return (
    <QtyWrap>
      <div>수량</div>
      <QtyButton onClick={decrement}>-</QtyButton>
      <div>{quantity}</div>
      <QtyButton onClick={increment}>+</QtyButton>
      <div style={{ marginLeft: 'auto', fontSize: 14, color: '#888' }}>재고: {remaining}</div>
    </QtyWrap>
  );
};

export default QuantitySelector;
