import { createContext, useEffect, useMemo, useState } from 'react';
import { getCookie } from '../utils/cookies';

const AuthContext = createContext();

function AuthContextProvider({ children }) {
  const [isLogin, setIsLogin] = useState(false);

  const updateLoginStatus = () => {
    const token = getCookie('access_token');
    if (token) {
      setIsLogin(true);
    } else {
      setIsLogin(false);
    }
  };

  const isLoginValue = useMemo(
    () => ({
      isLogin,
      updateLoginStatus,
    }),
    [isLogin, updateLoginStatus],
  );

  // 웹이 로드되면 바로 로그인 상태 업데이트
  useEffect(() => {
    updateLoginStatus();
  }, []);

  return (
    <AuthContext.Provider value={isLoginValue}>{children}</AuthContext.Provider>
  );
}

export { AuthContext, AuthContextProvider };