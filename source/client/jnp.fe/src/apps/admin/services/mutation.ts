import { useMutation } from 'react-query';
import { login } from './api';

export const useLogin = () => {
  return useMutation(login);
};