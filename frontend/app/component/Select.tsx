import styled from "styled-components";

const Select = styled.select`
  width: 100%;
  padding: 12px 14px;
  margin-bottom: 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
  &:focus {
    border-color: #0070f3;
  }
`;
export default Select