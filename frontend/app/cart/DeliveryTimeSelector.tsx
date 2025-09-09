'use client';

import React from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { setDeliveryTime } from '@/redux/slices/orderSlice';

const days = ['월', '화', '수', '목', '금', '토', '일'];
const timeSlots = Array.from({ length: 20 }, (_, i) => {
  const hour = Math.floor(i / 2) + 9; // 09:00 ~ 18:30
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour.toString().padStart(2, '0')}:${minute}`;
});

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 80px repeat(${days.length}, 1fr);
  border-left: 1px solid #ddd;
  border-top: 1px solid #ddd;
  // border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
`;

const HeaderCell = styled.div`
  background: #f5f5f5;
  padding: 8px;
  font-weight: bold;
  text-align: center;
  border-bottom: 1px solid #ddd;
  border-right: 1px solid #ddd;
`;

const TimeCell = styled.div`
  padding: 8px;
  text-align: center;
  border-bottom: 1px solid #ddd;
  border-right: 1px solid #ddd;
  background: #fafafa;
`;

const SlotButton = styled.button<{ selected: boolean }>`
  width: 100%;
  height: 100%;
  padding: 6px;
  border: none;
  cursor: pointer;
  background-color: ${({ selected }) => (selected ? '#0070f3' : 'white')};
  color: ${({ selected }) => (selected ? 'white' : '#333')};
  border-radius: 4px;

  &:hover {
    background-color: ${({ selected }) => (selected ? '#005bb5' : '#f0f0f0')};
  }
`;
const Cell = styled.div`
  padding: 8px;
  border-right: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
`
const DeliveryTimeSelector: React.FC = () => {
  const dispatch = useDispatch();
  const selected = useSelector((state: RootState) => state.order.deliveryTime);

  const handleSelect = (day: string, time: string) => {
    dispatch(setDeliveryTime({ day, time }));
  };

  return (
    <div>
      <h3>희망 배송 시간 선택</h3>
      <GridContainer>
        <div></div>
        {days.map((day) => (
          <HeaderCell key={day}>{day}</HeaderCell>
        ))}

        {timeSlots.map((time) => (
          <React.Fragment key={time}>
            <TimeCell>{time}</TimeCell>
            {days.map((day) => {
              const isSelected =
                selected?.day === day && selected?.time === time;
              return (
                <Cell
                  key={`${day}-${time}`}
                >
                  <SlotButton
                    selected={isSelected}
                    onClick={() => handleSelect(day, time)}
                  >
                    {isSelected ? '✓' : ''}
                  </SlotButton>
                </Cell>
              );
            })}
          </React.Fragment>
        ))}
      </GridContainer>

      {selected && (
        <p>
          선택한 시간: {selected.day}요일 {selected.time}
        </p>
      )}
    </div>
  );
};

export default DeliveryTimeSelector;
