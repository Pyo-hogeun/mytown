'use client';

import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { setDeliveryTime } from '@/redux/slices/orderSlice';
import { generateTimeSlots } from '@/utils/generateTimeSlots';

const Container = styled.div`
  margin: 20px 0;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fafafa;
`;

const SelectBox = styled.select`
  padding: 8px;
  margin-right: 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background: #fff;
  font-size: 15px;
`;

const SummaryText = styled.p`
  margin-top: 12px;
  color: #333;
  font-weight: 500;
`;

const DeliveryTimeSelector: React.FC = () => {
  const dispatch = useDispatch();
  const selected = useSelector((state: RootState) => state.order.deliveryTime);

  // 오늘 기준 7일치 요일+날짜 생성
  const weekOptions = useMemo(() => {
    const today = new Date();
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const label = `${days[date.getDay()]}요일 (${date.getMonth() + 1}/${date.getDate()})`;
      return {
        value: date.toISOString(),
        label,
      };
    });
  }, []);

  const [selectedDay, setSelectedDay] = useState(weekOptions[0].value);
  const [selectedTime, setSelectedTime] = useState('');

  // 선택한 날짜에 따라 시간대 갱신
  const timeSlots = useMemo(() => generateTimeSlots(selectedDay), [selectedDay]);

  // 초기값 설정
  useEffect(() => {
    if (timeSlots.length > 0 && !selectedTime) {
      setSelectedTime(timeSlots[0]);
    }
  }, [timeSlots, selectedTime]);

  useEffect(() => {
    if (selectedDay && selectedTime) {
      const dayLabel = weekOptions.find((d) => d.value === selectedDay)?.label ?? '';
      dispatch(setDeliveryTime({ day: dayLabel, time: selectedTime }));
    }
  }, [selectedDay, selectedTime, dispatch, weekOptions]);

  // 자연스러운 문장 변환
  const friendlyMessage = useMemo(() => {
    if (!selected?.day || !selected?.time) return '';
    return `${selected.day} ${selected.time}에 받아볼게요.`;
  }, [selected]);

  return (
    <Container>
      <h3>희망 배송 시간 선택</h3>
      <div>
        <SelectBox
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
        >
          {weekOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </SelectBox>

        {timeSlots.length > 0 ?(
          <SelectBox
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
        >
          {timeSlots.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </SelectBox>
        ):(<p>오늘은 배송 종료입니다.</p>)}

        
      </div>

      {timeSlots.length > 0 && friendlyMessage ? <SummaryText>{friendlyMessage}</SummaryText>: false}
    </Container>
  );
};

export default DeliveryTimeSelector;
