import { useRef } from 'react';
import { useCallback } from 'react';
import { DEBOUNCE_TIME } from '@constants/index';

const useDebounce = (delay = DEBOUNCE_TIME) => {
  const timeout = useRef<any>(null);
  return useCallback(
    (callback: () => void, overideDelay?: number) => {
      clearTimeout(timeout.current);
      timeout.current = setTimeout(callback, overideDelay || delay);
    },
    [delay]
  );
};

export default useDebounce;
