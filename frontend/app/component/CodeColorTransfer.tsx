import styled from "styled-components";

// 주문번호 강조 컴포넌트
const OrderCode = styled.span`
  text-transform: uppercase;
  font-size: 1.5em;
`;
const Suffix = styled.span`
  color: #0070f3;
  font-weight: bold;
`
const CodeColorTransfer = ({ id }: { id: string }) => {
  const prefix = id.slice(0, -4).toUpperCase();   // 앞부분
  const suffix = id.slice(-4).toUpperCase();      // 마지막 4자리


  return (
    <OrderCode>
      {prefix}
      <Suffix>{suffix}</Suffix>
    </OrderCode>
  );
};
export default CodeColorTransfer