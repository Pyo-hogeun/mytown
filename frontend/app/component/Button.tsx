import styled from "styled-components";

const Button = styled.button`
  padding:4px 8px;
  border:1px solid #ccc;
  background:#fff;
  cursor:pointer;
  white-space: nowrap;
  &:not(:disabled):hover{
    background:#f5f5f5;
  }
`;
export default Button