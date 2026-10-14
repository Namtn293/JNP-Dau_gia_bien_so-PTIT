import tokenManager from '@utils/tokenManager';

export const useCheckLogin = () => {
  const accessToken = tokenManager.getAccessToken();
  const isLogin = !!accessToken;
  return {
    isLogin
  }
}
export default useCheckLogin;