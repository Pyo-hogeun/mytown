// app/stores/new/page.tsx
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import StoreForm from './StoreForm';

const Page = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  if (!user || user.role !== 'admin') {
    return <p>권한이 없습니다.</p>;
  }

  return <StoreForm />;
}
export default Page