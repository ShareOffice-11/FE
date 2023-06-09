import authKakaoLogin from 'apis/auth/kakao';
import LoadingSpinner from 'components/LoadingSpinner';
import { useContext, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

function RedirectKakaoPage() {
  const navigate = useNavigate();
  const { updateLoginStatus } = useContext(AuthContext);
  const redirectCode = new URL(window.location.href).searchParams.get('code');

  const { data, isError } = useQuery('kakaoAuth', async () => {
    const result = await authKakaoLogin(redirectCode);
    return result;
  });

  const kakaoLoginResultHandler = () => {
    if (data) {
      alert('로그인 성공');
      updateLoginStatus();
      navigate('/main');
    } else if (isError) {
      alert('로그인 실패');
      navigate('/login');
    }
    return false;
  };

  useEffect(() => {
    kakaoLoginResultHandler();
  }, [data]);

  return <LoadingSpinner />;
}

export default RedirectKakaoPage;
