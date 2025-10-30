import styled from "styled-components";

const Container = styled.div`
  margin: 0 auto;
  padding: 2rem;
  ${(props) => props.theme.breakpoints.mobile} {
    padding: 0.5rem;
  }
`;
export default Container