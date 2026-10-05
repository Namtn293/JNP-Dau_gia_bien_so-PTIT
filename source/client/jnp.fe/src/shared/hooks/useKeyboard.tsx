import { useCallback, useEffect } from 'react';

type IUserKeyboard = {
  [key in string]: () => void;
};

const useKeyboard = (keys: IUserKeyboard) => {
  const handleKeydown = useCallback(
    (e: KeyboardEvent) => {
      if (keys.hasOwnProperty(e.key)) {
        keys[e.key]();
      }
    },
    [keys]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [handleKeydown]);

  return null;
};

export default useKeyboard;
