import { useEffect } from 'react';

export function useCustomEvent<T>(
  eventName: string,
  handler?: (data: T) => void
) {
  useEffect(() => {
    const listener = (event: Event) => {
      if(typeof handler === 'function') 
        handler((event as CustomEvent<T>).detail);
    };

    window.addEventListener(eventName, listener);
    return () => window.removeEventListener(eventName, listener);
  }, [eventName, handler]);
}