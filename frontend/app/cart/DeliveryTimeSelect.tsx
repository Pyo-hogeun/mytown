'use client';

import React, { useState } from 'react';
import styled from 'styled-components';

const days = ['월', '화', '수', '목', '금', '토', '일'];
const timeSlots = Array.from({ length: 20 }, (_, i) => {
  const hour = Math.floor(i / 2) + 9; // 09:00 ~ 18:30
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour.toString().padStart(2, '0')}:${minute}`;
});

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 80px repeat(${days.length}, 1fr);
  border: 1px solid #ddd;
  border-radius: 8px;
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

interface DeliveryTime {
  day: string;
  time: string;
}

const DeliveryTimeSelector: React.FC = () => {
  const [selected, setSelected] = useState<DeliveryTime | null>(null);

  const handleSelect = (day: string, time: string) => {
    setSelected({ day, time });
  };

  return (
    <div>
      <h2>희망 배송 시간 선택</h2>
      <GridContainer>
        {/* 첫 줄: 요일 */}
        <div></div>
        {days.map((day) => (
          <HeaderCell key={day}>{day}</HeaderCell>
        ))}

        {/* 시간 × 요일 */}
        {timeSlots.map((time) => (
          <React.Fragment key={time}>
            <TimeCell>{time}</TimeCell>
            {days.map((day) => {
              const isSelected =
                selected?.day === day && selected?.time === time;
              return (
                <div key={`${day}-${time}`} style={{ borderRight: '1px solid #ddd', borderBottom: '1px solid #ddd' }}>
                  <SlotButton
                    selected={isSelected}
                    onClick={() => handleSelect(day, time)}
                  >
                    {isSelected ? '✓' : ''}
                  </SlotButton>
                </div>
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
