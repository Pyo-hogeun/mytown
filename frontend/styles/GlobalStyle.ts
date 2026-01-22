import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: sans-serif;
    background: #f9f9f9;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  ul{
    margin: 0;
    padding: 0;
    li{
      list-style: none;
    }
  }
`;
export default GlobalStyle;
