// components/common/Tabs.tsx
'use client';

import React from 'react';
import styled from 'styled-components';

interface Tab {
  key: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeKey: string;
  onChange: (key: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeKey, onChange }) => {
  return (
    <TabWrapper>
      {tabs.map((tab) => (
        <TabButton
          key={tab.key}
          $active={tab.key === activeKey}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </TabButton>
      ))}
    </TabWrapper>
  );
};

export default Tabs;

// 스타일 정의
const TabWrapper = styled.div`
  display: flex;
  border-bottom: 2px solid #eee;
  margin-bottom: 16px;
`;

const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? 'bold' : 'normal')};
  color: ${({ $active }) => ($active ? '#0070f3' : '#666')};
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: ${({ $active }) => ($active ? '2px solid #0070f3' : '2px solid transparent')};

  &:hover {
    color: #0070f3;
  }
`;
