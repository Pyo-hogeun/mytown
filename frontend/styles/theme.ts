// theme.js

declare module 'styled-components' {
  export interface DefaultTheme {   
    breakpoints: {
      mobile: string;
      tablet: string;
    }
  }
}
const size = {
  mobile: '768px',
  tablet: '1024px',
};

const theme = {
  breakpoints: {
    mobile: `@media (max-width: ${size.mobile})`,
    tablet: `@media (max-width: ${size.tablet})`,
  },
};

export default theme;
