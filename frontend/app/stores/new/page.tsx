'use client'
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import StoreForm from './StoreForm';
import Container from '@/app/component/Container';

const Page = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  // ✅ 권한이 있는 역할들을 배열로 정의
  const allowedRoles = ['admin'];

  return(
    <Container>
      {
        !user || !allowedRoles.includes(user.role || '')?(
          <p>권한이 없습니다.</p>
        ):(
          <StoreForm />
        )
      }
    </Container>
  )
}
export default Page