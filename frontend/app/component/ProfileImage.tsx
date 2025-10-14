import { ReactNode } from "react"
import styled from "styled-components"

const Wrapper = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  background-color: lightpink;
  img{
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`
interface ProfileImageProps {
  children: ReactNode;
}
const ProfileImage = ({ children }:ProfileImageProps) => {
  return (
    <Wrapper>
      {children}
    </Wrapper>
  )
}
export default ProfileImage